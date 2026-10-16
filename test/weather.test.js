import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  sightLineGroundDistanceM,
  subRocketGroundDistanceM,
  directionalPoints,
  isoDurationMs,
  layerValueAt,
  skySummary,
} from '../engine/weather.js';
import { MEAN_RADIUS_M, surfaceDistanceM } from '../engine/geo.js';

const observer = JSON.parse(readFileSync(new URL('../config/observer.json', import.meta.url)));

test('sightLineGroundDistanceM: near flat-Earth value for a steep, short sight line', () => {
  // At 30 degrees and 2 km the curvature is small: d is close to H / tan(E).
  const flat = 2000 / Math.tan((30 * Math.PI) / 180);
  const d = sightLineGroundDistanceM(30, 2000);
  assert.ok(Math.abs(d - flat) < 5, `${d} vs ${flat}`);
});

test('sightLineGroundDistanceM: straight up reaches the height at distance 0', () => {
  assert.ok(Math.abs(sightLineGroundDistanceM(90, 12000)) < 1e-6);
});

test('sightLineGroundDistanceM: curvature makes a low sight line climb faster than flat', () => {
  // At 5 degrees and 12 km, the flat value is 137 km; the sphere lifts the line.
  const flat = 12000 / Math.tan((5 * Math.PI) / 180);
  const d = sightLineGroundDistanceM(5, 12000);
  assert.ok(d < flat && d > 0.85 * flat, `${d} vs ${flat}`);
});

test('sightLineGroundDistanceM: the horizontal line reaches H at the horizon distance', () => {
  // E = 0: the central angle is acos(R / (R + H)).
  const H = 12000;
  const expected = MEAN_RADIUS_M * Math.acos(MEAN_RADIUS_M / (MEAN_RADIUS_M + H));
  assert.ok(Math.abs(sightLineGroundDistanceM(0, H) - expected) < 1);
});

test('subRocketGroundDistanceM: inverts the sight line geometry', () => {
  // A point at height H where the sight line at E reaches it lies over the
  // ground distance that sightLineGroundDistanceM gives.
  const E = 20, H = 150000;
  const e = (E * Math.PI) / 180, R = MEAN_RADIUS_M;
  const s = -R * Math.sin(e) + Math.sqrt(R * R * Math.sin(e) ** 2 + 2 * R * H + H * H);
  const d = subRocketGroundDistanceM({ rangeM: s, elevationDeg: E, heightM: H });
  assert.ok(Math.abs(d - sightLineGroundDistanceM(E, H)) < 1);
});

// Synthetic samples: one visible sample high in the sky, one low, and one
// not visible. Range and height are set so the rocket is far away.
const sample = (bearingDeg, elevationDeg, visible) => ({
  bearingDeg,
  elevationDeg,
  heightM: 160000,
  rangeM: 600000,
  visible,
});
// Test values only. The values in use are in config/weather.json. The cap
// and the top-arc filter are off here unless a test sets them.
const params = { cloudTopM: 12000, topArcFraction: 0, maxReachM: Infinity, bearingStepDeg: 10, spacingM: 15000 };

test('directionalPoints: no visible sample gives no rays and no points', () => {
  const out = directionalPoints({ observer, tracks: [{ samples: [sample(120, 20, false)] }], params });
  assert.deepEqual(out, { rays: [], points: [] });
});

test('directionalPoints: no point lies beyond the sight-line reach or the point under the rocket', () => {
  const tracks = [{ samples: [sample(118, 30, true), sample(152, 8, true), sample(90, 40, false)] }];
  const { rays, points } = directionalPoints({ observer, tracks, params });
  assert.deepEqual(rays.map((r) => r.bearingDeg), [120, 150]);
  for (const r of rays) {
    const s = tracks[0].samples.find((x) => Math.round(x.bearingDeg / 10) * 10 === r.bearingDeg);
    const limit = Math.min(sightLineGroundDistanceM(s.elevationDeg, 12000), subRocketGroundDistanceM(s));
    assert.ok(Math.abs(r.reachM - limit) < 1e-6);
  }
  for (const p of points) {
    const ray = rays.find((r) => r.bearingDeg === p.bearingDeg);
    assert.ok(p.distanceM <= ray.reachM + 1e-6);
    // The point is where it says it is.
    assert.ok(Math.abs(surfaceDistanceM(observer, p) - p.distanceM) < 1);
  }
  // 30 degrees: about 21 km reach, so one point at 15 km. 8 degrees: about 80 km, so 5 points.
  assert.equal(points.filter((p) => p.bearingDeg === 120).length, 1);
  assert.equal(points.filter((p) => p.bearingDeg === 150).length, 5);
});

test('directionalPoints: a bin keeps the longest reach and the lowest elevation', () => {
  const tracks = [{ samples: [sample(121, 30, true)] }, { samples: [sample(119, 10, true)] }];
  const { rays } = directionalPoints({ observer, tracks, params });
  assert.equal(rays.length, 1);
  assert.equal(rays[0].minElevationDeg, 10);
  assert.ok(Math.abs(rays[0].reachM - sightLineGroundDistanceM(10, 12000)) < 1e-6);
});

test('directionalPoints: a ray shorter than the spacing still gets one point', () => {
  const tracks = [{ samples: [sample(120, 60, true)] }];
  const { rays, points } = directionalPoints({ observer, tracks, params });
  assert.equal(points.length, 1);
  assert.ok(Math.abs(points[0].distanceM - rays[0].reachM) < 1e-6);
});

test('isoDurationMs: the forms seen in the skyCover layer and a day form', () => {
  assert.equal(isoDurationMs('PT1H'), 3600e3);
  assert.equal(isoDurationMs('PT3H'), 3 * 3600e3);
  assert.equal(isoDurationMs('PT6H'), 6 * 3600e3);
  assert.equal(isoDurationMs('P1DT2H'), 26 * 3600e3);
  assert.equal(isoDurationMs('PT30M'), 1800e3);
  assert.throws(() => isoDurationMs('P1W'));
  assert.throws(() => isoDurationMs('P'));
});

// Shape copied from the live response of 2026-10-15 (reference/data-sources.md).
const skyCover = [
  { validTime: '2026-10-15T18:00:00+00:00/PT1H', value: 8 },
  { validTime: '2026-10-15T19:00:00+00:00/PT3H', value: 7 },
  { validTime: '2026-10-15T22:00:00+00:00/PT1H', value: 5 },
];

test('layerValueAt: start is inside, end is outside, gaps give null', () => {
  assert.equal(layerValueAt(skyCover, Date.parse('2026-10-15T19:00:00Z')), 7);
  assert.equal(layerValueAt(skyCover, Date.parse('2026-10-15T21:59:59Z')), 7);
  assert.equal(layerValueAt(skyCover, Date.parse('2026-10-15T22:00:00Z')), 5);
  assert.equal(layerValueAt(skyCover, Date.parse('2026-10-15T23:00:00Z')), null);
  assert.equal(layerValueAt(skyCover, Date.parse('2026-10-15T17:59:59Z')), null);
  assert.equal(layerValueAt([], 0), null);
  assert.equal(layerValueAt([{ validTime: '2026-10-15T18:00:00+00:00/PT1H', value: null }], Date.parse('2026-10-15T18:30:00Z')), null);
});

test('skySummary: reports missing points and does not fill them', () => {
  assert.deepEqual(skySummary({ local: 20, directional: [10, null, 70] }), {
    localPct: 20,
    directional: { points: 3, missing: 1, maxPct: 70, meanPct: 40 },
  });
  assert.deepEqual(skySummary({ local: null, directional: [null] }), {
    localPct: null,
    directional: { points: 1, missing: 1, maxPct: null, meanPct: null },
  });
});

test('directionalPoints: only the top of each track\'s arc sets a ray', () => {
  // Peak 30 degrees, fraction 0.8: the limit is 24 degrees for this track.
  const tracks = [
    { samples: [sample(100, 10, true), sample(120, 30, true), sample(130, 25, true), sample(160, 20, true)] },
    // A low track keeps its own top: peak 9, limit 7.2.
    { samples: [sample(170, 9, true), sample(175, 6, true)] },
  ];
  const { rays } = directionalPoints({ observer, tracks, params: { ...params, topArcFraction: 0.8 } });
  assert.deepEqual(rays.map((r) => r.bearingDeg), [120, 130, 170]);
});

test('directionalPoints: no point lies beyond maxReachM', () => {
  // 5 degrees reaches 12 km of height at about 123 km; the cap is 60 km.
  const tracks = [{ samples: [sample(140, 5, true)] }];
  const { rays, points } = directionalPoints({ observer, tracks, params: { ...params, maxReachM: 60000 } });
  assert.equal(rays[0].reachM, 60000);
  assert.equal(Math.max(...points.map((p) => p.distanceM)), 60000);
  assert.equal(points.length, 4);
});
