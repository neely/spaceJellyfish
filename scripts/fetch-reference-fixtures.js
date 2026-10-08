// Fetches the pinned reference values the engine tests compare against.
// Run by hand: `node scripts/fetch-reference-fixtures.js`. The tests never
// call the network; they read the files this script writes.
//
//   test/fixtures/usno-celnav-sun.json  Sun GHA, declination, altitude (hc)
//     and azimuth (zn) at the observer, from the USNO celestial navigation
//     API (https://aa.usno.navy.mil/data/api).
//   test/fixtures/ngs-ecef.json         Geodetic to ECEF conversions from
//     the NOAA NGS NCAT API (https://geodesy.noaa.gov/api/ncat/llh).
import { readFile, writeFile } from 'node:fs/promises';

const observer = JSON.parse(await readFile(new URL('../config/observer.json', import.meta.url)));

// UTC instants: a spread of years, seasons and times of day, weighted
// toward Charleston twilight because that is where the model is used.
const INSTANTS = [
  '2020-03-20T11:00:00Z',
  '2021-12-21T22:30:00Z',
  '2022-06-21T00:45:00Z',
  '2023-09-23T10:40:00Z',
  '2024-01-15T12:00:00Z',
  '2024-06-21T16:00:00Z',
  '2025-04-10T23:55:00Z',
  '2025-11-02T11:15:00Z',
  '2026-02-28T11:20:00Z',
  '2026-10-13T10:33:00Z',
  '2027-07-04T01:10:00Z',
  '2027-12-21T17:00:00Z',
];

// Geodetic points: the observer, a Cape Canaveral pad position with a high
// ellipsoid height, and two awkward cases (equator, high latitude).
const POINTS = [
  { latitudeDeg: observer.latitudeDeg, longitudeDeg: observer.longitudeDeg, heightM: 0 },
  { latitudeDeg: 28.56194122, longitudeDeg: -80.57735736, heightM: 150000 },
  { latitudeDeg: 0, longitudeDeg: -75, heightM: 0 },
  { latitudeDeg: 64.5, longitudeDeg: -147.5, heightM: 2500 },
];

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

const sun = [];
for (const utc of INSTANTS) {
  const [date, time] = utc.replace('Z', '').split('T');
  const url = `https://aa.usno.navy.mil/api/celnav?date=${date}&time=${time}&coords=${observer.latitudeDeg},${observer.longitudeDeg}`;
  const body = await getJson(url);
  const entry = body.properties.data.find((o) => o.object === 'Sun');
  if (!entry) throw new Error(`No Sun entry for ${utc}`);
  const { gha, dec, hc, zn } = entry.almanac_data;
  sun.push({ utc, ghaDeg: gha, decDeg: dec, altitudeDeg: hc, azimuthDeg: zn });
}

const ecef = [];
for (const p of POINTS) {
  const url = `https://geodesy.noaa.gov/api/ncat/llh?lat=${p.latitudeDeg}&lon=${p.longitudeDeg}&eht=${p.heightM}&inDatum=nad83(2011)&outDatum=nad83(2011)`;
  const body = await getJson(url);
  const num = (s) => Number(String(s).replaceAll(',', ''));
  ecef.push({ ...p, xM: num(body.x), yM: num(body.y), zM: num(body.z) });
}

const fetched = new Date().toISOString().slice(0, 10);
await writeFile(
  new URL('../test/fixtures/usno-celnav-sun.json', import.meta.url),
  JSON.stringify({ source: 'https://aa.usno.navy.mil/api/celnav', fetched, observer, cases: sun }, null, 2) + '\n',
);
await writeFile(
  new URL('../test/fixtures/ngs-ecef.json', import.meta.url),
  JSON.stringify({ source: 'https://geodesy.noaa.gov/api/ncat/llh (NAD83(2011), GRS 80 ellipsoid)', fetched, cases: ecef }, null, 2) + '\n',
);
console.log(`Wrote ${sun.length} sun cases and ${ecef.length} ECEF cases.`);
