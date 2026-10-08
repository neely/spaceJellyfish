import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  destinationPoint,
  launchAzimuthsDeg,
  profilePointAt,
  rocketPosition,
} from '../engine/trajectory.js';
import { lookAngles, surfaceDistanceM } from '../engine/geo.js';

const profiles = JSON.parse(readFileSync(new URL('../config/profiles.json', import.meta.url)));
const pad = { latitudeDeg: 28.56194122, longitudeDeg: -80.57735736, heightM: 0 };

test('destinationPoint: distance and direction round trip', () => {
  for (const az of [0, 45, 90, 135, 200, 315]) {
    for (const d of [1000, 250000, 1500000]) {
      const p = destinationPoint(pad, az, d);
      assert.ok(Math.abs(surfaceDistanceM(pad, p) - d) < 1e-6 * d + 0.01, `distance az ${az} d ${d}`);
    }
    // Over a short step the ellipsoid look azimuth agrees with the sphere.
    const near = destinationPoint(pad, az, 1000);
    const seen = lookAngles(pad, { ...near, heightM: 0 }).azimuthDeg;
    assert.ok(Math.abs(((seen - az + 540) % 360) - 180) < 0.2, `azimuth ${az} seen ${seen}`);
  }
});

test('launchAzimuthsDeg: the great circle reaches the inclination as its top latitude', () => {
  for (const inclination of [35, 43, 51.6, 53, 70]) {
    const { northeastDeg, southeastDeg } = launchAzimuthsDeg(inclination, pad.latitudeDeg);
    assert.ok(Math.abs(northeastDeg + southeastDeg - 180) < 1e-9);
    let top = -90;
    for (let d = 0; d <= 12000e3; d += 20e3) {
      top = Math.max(top, destinationPoint(pad, northeastDeg, d).latitudeDeg);
    }
    assert.ok(Math.abs(top - inclination) < 0.05, `inclination ${inclination}: top ${top}`);
  }
});

test('launchAzimuthsDeg: an inclination at or below the pad latitude gives due east', () => {
  assert.deepEqual(launchAzimuthsDeg(20, pad.latitudeDeg), { northeastDeg: 90, southeastDeg: 90 });
  assert.deepEqual(launchAzimuthsDeg(pad.latitudeDeg, pad.latitudeDeg), {
    northeastDeg: 90,
    southeastDeg: 90,
  });
});

test('profiles.json: expected members and profiles (tripwire)', () => {
  assert.deepEqual(Object.keys(profiles.members).sort(), [
    'Bangabandhu-1',
    'Hispasat 30W-6',
    'SES-12',
    'SpaceX CRS-14',
    'SpaceX CRS-16',
  ]);
  assert.deepEqual(Object.keys(profiles.profiles).sort(), ['falcon9-gto', 'falcon9-leo']);
  for (const names of Object.values(profiles.profiles)) {
    for (const name of names) assert.ok(profiles.members[name], name);
  }
});

test('profiles.json: altitude at 300 s is inside the expected band (tripwire)', () => {
  const at300 = (name) => profilePointAt(profiles.members[name], 300).altitudeKm;
  for (const name of profiles.profiles['falcon9-leo']) {
    assert.ok(at300(name) > 170 && at300(name) < 190, `${name}: ${at300(name)}`);
  }
  for (const name of profiles.profiles['falcon9-gto']) {
    assert.ok(at300(name) > 145 && at300(name) < 165, `${name}: ${at300(name)}`);
  }
});

test('profilePointAt: interpolates, and returns null outside the data', () => {
  const member = { points: [[0, 0, 0], [10, 2, 1], [20, 6, 5]] };
  assert.deepEqual(profilePointAt(member, 5), { altitudeKm: 1, downrangeKm: 0.5 });
  assert.deepEqual(profilePointAt(member, 10), { altitudeKm: 2, downrangeKm: 1 });
  assert.deepEqual(profilePointAt(member, 20), { altitudeKm: 6, downrangeKm: 5 });
  assert.equal(profilePointAt(member, -1), null);
  assert.equal(profilePointAt(member, 21), null);
});

test('rocketPosition: starts at the pad and moves along the azimuth', () => {
  const member = profiles.members['SpaceX CRS-16'];
  const start = rocketPosition(pad, 45, member, 0);
  assert.ok(surfaceDistanceM(pad, start) < 1);
  const later = rocketPosition(pad, 45, member, 400);
  const { downrangeKm, altitudeKm } = profilePointAt(member, 400);
  assert.ok(Math.abs(surfaceDistanceM(pad, later) / 1000 - downrangeKm) < 0.01);
  assert.equal(later.heightM, altitudeKm * 1000);
  assert.ok(later.latitudeDeg > pad.latitudeDeg && later.longitudeDeg > pad.longitudeDeg);
  assert.equal(rocketPosition(pad, 45, member, 100000), null);
});
