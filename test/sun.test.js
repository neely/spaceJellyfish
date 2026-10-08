import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { julianDate, sunCoordinates, sunGhaDec, sunDirectionEcef } from '../engine/sun.js';
import { directionAngles } from '../engine/geo.js';

// Pinned values from the USNO celestial navigation API. Refresh them only
// with scripts/fetch-reference-fixtures.js.
const fixture = JSON.parse(
  readFileSync(new URL('./fixtures/usno-celnav-sun.json', import.meta.url)),
);

// The USNO algorithm states an accuracy of about 1 arcminute.
const TOLERANCE_DEG = 1 / 60;

const angleDiff = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

test('julianDate: J2000.0 is 2000-01-01 12:00 UT', () => {
  assert.equal(julianDate(new Date('2000-01-01T12:00:00Z')), 2451545.0);
});

test('sunCoordinates: distance stays between 0.98 and 1.02 AU', () => {
  for (const { utc } of fixture.cases) {
    const { distanceAu } = sunCoordinates(new Date(utc));
    assert.ok(distanceAu > 0.98 && distanceAu < 1.02, `${utc}: ${distanceAu}`);
  }
});

test('fixture has the expected number of cases', () => {
  assert.equal(fixture.cases.length, 12);
});

for (const c of fixture.cases) {
  test(`sun position matches USNO at ${c.utc}`, () => {
    const date = new Date(c.utc);
    const { ghaDeg, declinationDeg } = sunGhaDec(date);
    assert.ok(angleDiff(ghaDeg, c.ghaDeg) < TOLERANCE_DEG, `GHA ${ghaDeg} vs ${c.ghaDeg}`);
    assert.ok(
      Math.abs(declinationDeg - c.decDeg) < TOLERANCE_DEG,
      `declination ${declinationDeg} vs ${c.decDeg}`,
    );

    const { elevationDeg, azimuthDeg } = directionAngles(fixture.observer, sunDirectionEcef(date));
    assert.ok(
      Math.abs(elevationDeg - c.altitudeDeg) < TOLERANCE_DEG,
      `altitude ${elevationDeg} vs ${c.altitudeDeg}`,
    );
    // An azimuth error grows as 1 / cos(altitude) for the same sky error.
    const azTolerance = TOLERANCE_DEG / Math.cos((c.altitudeDeg * Math.PI) / 180);
    assert.ok(angleDiff(azimuthDeg, c.azimuthDeg) < azTolerance, `azimuth ${azimuthDeg} vs ${c.azimuthDeg}`);
  });
}
