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
// The downrange method and its check are in scripts/lib/webcast-telemetry.js.
import { readFileSync } from 'node:fs';
import { rocketPosition, launchAzimuthsDeg, profilePointAt, destinationPoint } from '../engine/trajectory.js';
import { lookAngles } from '../engine/geo.js';
import { parseR4ygmCsv, deriveDownrangeKm } from './lib/webcast-telemetry.js';

const url = (p) => new URL(p, import.meta.url);
const read = (p) => JSON.parse(readFileSync(url(p)));
const observer = read('../config/observer.json');
const profiles = read('../config/profiles.json');
const observation = read('../data/observations.json').observations.find((o) => /SpX-35/.test(o.launch));
const pad = read('../data/upcoming-fallback.json').results.find((l) => l.id === observation.llId).pad;
const VENDOR = '../reference/vendor/r4ygm-spacextelemetry/';
const FLIGHTS = ['starlink-5', 'starlink-6', 'starlink-7', 'starlink-8', 'dm-2'];
const readTelemetry = (name) => parseR4ygmCsv(readFileSync(url(VENDOR + name + '.csv'), 'utf8'));
function toMember(tel) {
  const dr = deriveDownrangeKm(tel);
  return { points: tel.t.map((t, i) => [t, tel.alt[i], dr[i]]) };
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
