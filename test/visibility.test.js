import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluateTrack, isSunlit, shadowHeightAboveM } from '../engine/visibility.js';
import { MEAN_RADIUS_M, directionAngles } from '../engine/geo.js';
import { sunDirectionEcef } from '../engine/sun.js';

const profiles = JSON.parse(readFileSync(new URL('../config/profiles.json', import.meta.url)));
const observer = JSON.parse(readFileSync(new URL('../config/observer.json', import.meta.url)));
const pad = { latitudeDeg: 28.56194122, longitudeDeg: -80.57735736, heightM: 0 };

// Test values only. The values in use are in config/visibility.json.
const params = { screeningHeightM: 0, maxSunElevationDeg: -6, minElevationDeg: 5, minAltitudeM: 0 };

// A Sun direction on the equator at longitude 0 keeps the geometry simple.
const sunAtLon0 = [1, 0, 0];

test('isSunlit: the day side is lit at any height', () => {
  assert.equal(isSunlit({ latitudeDeg: 0, longitudeDeg: 0, heightM: 0 }, sunAtLon0, 0), true);
  assert.equal(isSunlit({ latitudeDeg: 0, longitudeDeg: 80, heightM: 0 }, sunAtLon0, 0), true);
});

test('isSunlit: the night side is lit only above the shadow', () => {
  // 10 degrees past the terminator on the equator, the shadow top is at
  // R / cos(10 deg) - R above the surface: about 98 km on the mean sphere.
  const top = MEAN_RADIUS_M / Math.cos((10 * Math.PI) / 180) - MEAN_RADIUS_M;
  assert.ok(top > 97e3 && top < 99e3, `${top}`);
  // The equatorial radius is larger than the mean radius, so allow 25 km.
  const at = (heightM) => isSunlit({ latitudeDeg: 0, longitudeDeg: 100, heightM }, sunAtLon0, 0);
  assert.equal(at(top - 25e3), false);
  assert.equal(at(top + 25e3), true);
  assert.equal(isSunlit({ latitudeDeg: 0, longitudeDeg: 180, heightM: 400e3 }, sunAtLon0, 0), false);
});

test('isSunlit: a screening height raises the shadow', () => {
  const p = { latitudeDeg: 0, longitudeDeg: 100, heightM: 110e3 };
  assert.equal(isSunlit(p, sunAtLon0, 0), true);
  assert.equal(isSunlit(p, sunAtLon0, 30e3), false);
});

test('shadowHeightAboveM: zero in daylight, rises as the Sun goes down', () => {
  const noon = sunDirectionEcef(new Date('2024-06-21T16:00:00Z'));
  assert.equal(shadowHeightAboveM(observer, noon, 0), 0);
  const h6 = shadowHeightAboveM(observer, sunDirectionEcef(new Date('2023-09-23T10:40:00Z')), 0);
  const h11 = shadowHeightAboveM(observer, sunDirectionEcef(new Date('2026-10-13T10:33:00Z')), 0);
  // Sun at -6.8 and -11.2 degrees: R / cos(d) - R is about 45 km and 123 km.
  assert.ok(h6 > 40e3 && h6 < 50e3, `${h6}`);
  assert.ok(h11 > 115e3 && h11 < 130e3, `${h11}`);
});

test('evaluateTrack: a midday launch is never visible as a lit object in a dark sky', () => {
  const { summary, samples } = evaluateTrack({
    liftoff: new Date('2024-06-21T16:00:00Z'),
    pad,
    observer,
    member: profiles.members['SpaceX CRS-16'],
    azimuthDeg: 45,
    params,
  });
  assert.equal(summary.visibleS, 0);
  assert.ok(samples.every((s) => s.sunlit));
});

test('evaluateTrack: a launch in the middle of the night is never sunlit', () => {
  const liftoff = new Date('2024-12-21T06:00:00Z');
  const sunElevation = directionAngles(observer, sunDirectionEcef(liftoff)).elevationDeg;
  assert.ok(sunElevation < -60, `${sunElevation}`);
  const { summary, samples } = evaluateTrack({
    liftoff,
    pad,
    observer,
    member: profiles.members['SpaceX CRS-16'],
    azimuthDeg: 45,
    params,
  });
  assert.equal(summary.visibleS, 0);
  assert.ok(samples.every((s) => !s.sunlit));
});

test('evaluateTrack: a northeast launch in morning twilight is visible', () => {
  // 2026-10-13 10:33 UTC: the Sun is 11.2 degrees below the observer horizon.
  const { summary } = evaluateTrack({
    liftoff: new Date('2026-10-13T10:33:00Z'),
    pad,
    observer,
    member: profiles.members['SpaceX CRS-16'],
    azimuthDeg: 45,
    params,
  });
  assert.ok(summary.visibleS > 60, `${summary.visibleS}`);
  assert.ok(summary.peakElevationDeg > 20 && summary.peakElevationDeg < 40);
  assert.ok(summary.firstVisibleS < summary.lastVisibleS);
});
