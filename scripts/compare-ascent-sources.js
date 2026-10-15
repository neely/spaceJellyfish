// Compare ascent data sources against the SpX-35 sighting.
//
// Reads the vendored 2020 webcast telemetry in
// reference/vendor/r4ygm-spacextelemetry/ (time, altitude km, speed km/h),
// derives downrange distance, and flies each flight on the 51.6 degree
// northeast azimuth from the SpX-35 pad. Prints the predicted sky position
// next to the measured points in data/observations.json, with the two
// falcon9-leo members from config/profiles.json for reference.
// Changes nothing. Reads only files in this repo.
//
//   node scripts/compare-ascent-sources.js
//
// Downrange method: horizontal speed = sqrt(v^2 - vz^2), with vz from a
// centred altitude difference over +/-5 s, integrated by the trapezoid
// rule on 1 s steps. On 2026-10-15 the same method, run on the velocity
// and altitude of SpaceX CRS-14 and CRS-16 in Telemetry-Data (commit
// b245d3b), reproduced that author's downrange within 1 km at 254, 277,
// 300 and 400 s. See reference/topics/falcon9-starlink-2020-telemetry.md.
import { readFileSync } from 'node:fs';
import { rocketPosition, launchAzimuthsDeg, profilePointAt, destinationPoint } from '../engine/trajectory.js';
import { lookAngles } from '../engine/geo.js';

const url = (p) => new URL(p, import.meta.url);
const read = (p) => JSON.parse(readFileSync(url(p)));
const observer = read('../config/observer.json');
const profiles = read('../config/profiles.json');
const observation = read('../data/observations.json').observations.find((o) => /SpX-35/.test(o.launch));
const pad = read('../data/upcoming-fallback.json').results.find((l) => l.id === observation.llId).pad;
const VENDOR = '../reference/vendor/r4ygm-spacextelemetry/';
const FLIGHTS = ['starlink-5', 'starlink-6', 'starlink-7', 'starlink-8', 'dm-2'];
const HALF_WINDOW_S = 5;

function readTelemetry(name) {
  const rows = readFileSync(url(VENDOR + name + '.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
  const bySecond = new Map();
  for (const row of rows) {
    const [clock, alt, speed] = row.split(',').map((s) => s.trim());
    if (!speed) continue;
    const [h, m, s] = clock.split(':').map(Number);
    bySecond.set(h * 3600 + m * 60 + s, [Number(speed) / 3.6, Number(alt)]);
  }
  // Resample to 1 s steps by linear interpolation.
  const keys = [...bySecond.keys()].sort((a, b) => a - b);
  const t = [], v = [], alt = [];
  for (let k = 0, s = keys[0]; s <= keys[keys.length - 1]; s++) {
    while (keys[k + 1] <= s) k++;
    const [t0, t1] = [keys[k], keys[Math.min(k + 1, keys.length - 1)]];
    const f = t1 === t0 ? 0 : (s - t0) / (t1 - t0);
    const [v0, a0] = bySecond.get(t0);
    const [v1, a1] = bySecond.get(t1);
    t.push(s); v.push(v0 + f * (v1 - v0)); alt.push(a0 + f * (a1 - a0));
  }
  return { t, v, alt };
}

function toMember({ t, v, alt }) {
  const n = t.length;
  const vz = (i) => {
    const a = Math.max(0, i - HALF_WINDOW_S), b = Math.min(n - 1, i + HALF_WINDOW_S);
    return ((alt[b] - alt[a]) * 1000) / (t[b] - t[a]);
  };
  const vx = (i) => Math.sqrt(Math.max(v[i] ** 2 - vz(i) ** 2, 0));
  const points = [[t[0], alt[0], 0]];
  let dr = 0;
  for (let i = 1; i < n; i++) {
    dr += (0.5 * (vx(i) + vx(i - 1)) * (t[i] - t[i - 1])) / 1000;
    points.push([t[i], alt[i], dr]);
  }
  return { points };
}

const members = {
  'SpaceX CRS-16 (2018)': profiles.members['SpaceX CRS-16'],
  'SpaceX CRS-14 (2018)': profiles.members['SpaceX CRS-14'],
  ...Object.fromEntries(FLIGHTS.map((f) => [`${f} (2020)`, toMember(readTelemetry(f))])),
};
const azimuthDeg = launchAzimuthsDeg(51.6, pad.latitudeDeg).northeastDeg;
console.log(`${observation.launch}, launch azimuth ${azimuthDeg.toFixed(1)} deg (51.6 deg northeast).`);
for (const p of observation.points) {
  console.log(`\nT+${p.tS} s, seen at azimuth ${p.azimuthDeg}, elevation ${p.elevationDeg}`);
  console.log('member                  alt km  downrange km  azimuth  elevation  miss az  miss el');
  for (const [name, m] of Object.entries(members)) {
    const pos = rocketPosition(pad, azimuthDeg, m, p.tS);
    const la = lookAngles(observer, pos);
    const { altitudeKm: a, downrangeKm: d } = profilePointAt(m, p.tS);
    console.log(
      `${name.padEnd(22)} ${a.toFixed(1).padStart(7)} ${d.toFixed(0).padStart(13)} ${la.azimuthDeg.toFixed(1).padStart(8)} ${la.elevationDeg.toFixed(1).padStart(10)} ${(la.azimuthDeg - p.azimuthDeg).toFixed(1).padStart(8)} ${(la.elevationDeg - p.elevationDeg).toFixed(1).padStart(8)}`,
    );
  }
}

// What the sighting needs: the downrange distance and altitude along the
// same azimuth that put the rocket exactly at each measured point.
const angDiff = (a, b) => ((a - b + 540) % 360) - 180;
console.log('\nDownrange and altitude that match each measured point on this azimuth:');
for (const p of observation.points) {
  let best = null;
  for (let d = 0; d <= 1000; d += 1) {
    for (let h = 50; h <= 260; h += 0.5) {
      const pos = { ...destinationPoint(pad, azimuthDeg, d * 1000), heightM: h * 1000 };
      const la = lookAngles(observer, pos);
      const e = Math.hypot(
        angDiff(la.azimuthDeg, p.azimuthDeg) * Math.cos((p.elevationDeg * Math.PI) / 180),
        la.elevationDeg - p.elevationDeg,
      );
      if (!best || e < best.e) best = { d, h, e };
    }
  }
  console.log(`T+${p.tS} s: downrange ${best.d} km, altitude ${best.h} km (residual ${best.e.toFixed(2)} deg)`);
}
