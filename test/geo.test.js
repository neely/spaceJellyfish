import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  WGS84_A_M,
  directionAngles,
  geodeticToEcef,
  lookAngles,
  surfaceDistanceM,
} from '../engine/geo.js';

// Pinned values from the NOAA NGS NCAT API. Refresh them only with
// scripts/fetch-reference-fixtures.js.
const fixture = JSON.parse(readFileSync(new URL('./fixtures/ngs-ecef.json', import.meta.url)));
const observer = JSON.parse(readFileSync(new URL('../config/observer.json', import.meta.url)));

// NGS reports millimetres on GRS 80; WGS 84 differs by less than 1 mm.
const ECEF_TOLERANCE_M = 0.002;

test('fixture has the expected number of cases', () => {
  assert.equal(fixture.cases.length, 4);
});

for (const c of fixture.cases) {
  test(`geodeticToEcef matches NGS at ${c.latitudeDeg}, ${c.longitudeDeg}, ${c.heightM} m`, () => {
    const [x, y, z] = geodeticToEcef(c);
    assert.ok(Math.abs(x - c.xM) < ECEF_TOLERANCE_M, `x ${x} vs ${c.xM}`);
    assert.ok(Math.abs(y - c.yM) < ECEF_TOLERANCE_M, `y ${y} vs ${c.yM}`);
    assert.ok(Math.abs(z - c.zM) < ECEF_TOLERANCE_M, `z ${z} vs ${c.zM}`);
  });
}

test('lookAngles: a point straight overhead is at 90 degrees and its height away', () => {
  const { elevationDeg, rangeM } = lookAngles(observer, { ...observer, heightM: 100000 });
  // asin loses precision near 90 degrees, so the bound is loose.
  assert.ok(Math.abs(elevationDeg - 90) < 1e-4, `${elevationDeg}`);
  assert.ok(Math.abs(rangeM - 100000) < 1e-3, `${rangeM}`);
});

test('lookAngles: cardinal directions', () => {
  const at = (dLat, dLon) =>
    lookAngles(observer, {
      latitudeDeg: observer.latitudeDeg + dLat,
      longitudeDeg: observer.longitudeDeg + dLon,
      heightM: 0,
    }).azimuthDeg;
  assert.ok(Math.abs(at(0.01, 0) - 0) < 0.01 || Math.abs(at(0.01, 0) - 360) < 0.01);
  assert.ok(Math.abs(at(0, 0.01) - 90) < 0.01);
  assert.ok(Math.abs(at(-0.01, 0) - 180) < 0.01);
  assert.ok(Math.abs(at(0, -0.01) - 270) < 0.01);
});

test('lookAngles: a distant point on the surface is below the horizon', () => {
  const pad = { latitudeDeg: 28.56194122, longitudeDeg: -80.57735736, heightM: 0 };
  assert.ok(lookAngles(observer, pad).elevationDeg < 0);
});

test('directionAngles: the local vertical is at 90 degrees', () => {
  const lat = (observer.latitudeDeg * Math.PI) / 180;
  const lon = (observer.longitudeDeg * Math.PI) / 180;
  const up = [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
  assert.ok(Math.abs(directionAngles(observer, up).elevationDeg - 90) < 1e-6);
});

test('surfaceDistanceM: one degree of longitude on the equator', () => {
  const d = surfaceDistanceM(
    { latitudeDeg: 0, longitudeDeg: 0 },
    { latitudeDeg: 0, longitudeDeg: 1 },
  );
  // Within 0.5 percent of the equatorial arc, a * pi / 180.
  const arc = (WGS84_A_M * Math.PI) / 180;
  assert.ok(Math.abs(d - arc) / arc < 0.005, `${d} vs ${arc}`);
});

test('surfaceDistanceM: SLC-40 to the observer is 466 km (tripwire)', () => {
  const pad = { latitudeDeg: 28.56194122, longitudeDeg: -80.57735736 };
  const km = surfaceDistanceM(observer, pad) / 1000;
  assert.ok(Math.abs(km - 466.0) < 0.5, `${km}`);
});
