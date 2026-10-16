// Builds config/profiles.json from public Falcon 9 webcast telemetry.
// Run by hand: `node scripts/build-profiles.js`. The engine and the tests
// read only the file this script writes.
//
// Source: https://github.com/shahar603/Telemetry-Data (Unlicense), pinned
// to one commit. Each mission folder has JSON/analysed.json: values at 1 s
// steps that the repository author calculated from the altitude and
// velocity shown on the SpaceX webcast. Downrange distance is therefore a
// derived value, not a tracked position.
//
// Second source (since 2026-10-15): R4yGM/SpaceXTelemetry-Api, commit
// d1f8621, no licence file, vendored with Ben's approval in
// reference/vendor/r4ygm-spacextelemetry/. Each file gives time, altitude
// and speed. We derive downrange with scripts/lib/webcast-telemetry.js and
// end each member at the highest speed between 400 and 750 s (SECO-1).
// Every R4yGM flight to low orbit with second-stage data is used; none is
// chosen for how well it fits a sighting.
import { readFile, writeFile } from 'node:fs/promises';
import { parseR4ygmCsv, deriveDownrangeKm, burnEndS } from './lib/webcast-telemetry.js';

const REPO = 'shahar603/Telemetry-Data';
const COMMIT = 'b245d3b81aa36b7941ec10f3f4b508999d106a6d';
const BASE = `https://raw.githubusercontent.com/${REPO}/${COMMIT}`;
const STEP_S = 10;

// Missions to use. Each must have second-stage telemetry that runs to about
// second-stage cutoff, and a README that states the orbit and the block.
// Block 4 and Block 5 only. Missions with no README table (for example
// DM-1) are left out because their block and orbit are not stated.
// Vendored R4yGM files: file name -> member name and the LL2 snapshot record.
const R4YGM = {
  'starlink-5': { name: 'Starlink 5', ll2: 'Falcon 9 Block 5 | Starlink 5' },
  'starlink-6': { name: 'Starlink 6', ll2: 'Falcon 9 Block 5 | Starlink 6' },
  'starlink-7': { name: 'Starlink 7', ll2: 'Falcon 9 Block 5 | Starlink 7' },
  'starlink-8': { name: 'Starlink 8', ll2: 'Falcon 9 Block 5 | Starlink 8' },
  'dm-2': { name: 'SpX-DM2', ll2: 'Falcon 9 Block 5 | SpX-DM2 (Demonstration Mission 2)' },
};
const R4YGM_SOURCE = {
  repository: 'https://github.com/R4yGM/SpaceXTelemetry-Api',
  commit: 'd1f86217fd81e8cbf0655e1a946e53fc542e3b9a',
  license: 'none stated; vendored with the owner\'s approval (FINDINGS)',
  file: 'reference/vendor/r4ygm-spacextelemetry/<file>.csv (copy of <project>/<mission>/api/telemetry.csv)',
  note: 'Altitude and speed read by the repository author from SpaceX webcasts. Downrange derived by scripts/lib/webcast-telemetry.js; the member ends at SECO-1 (highest speed between 400 and 750 s).',
};

const PROFILES = {
  'falcon9-leo': ['SpaceX CRS-16', 'SpaceX CRS-14', ...Object.values(R4YGM).map((r) => r.name)],
  'falcon9-gto': ['Bangabandhu-1', 'SES-12', 'Hispasat 30W-6'],
};

async function getText(path) {
  const url = `${BASE}/${path.split('/').map(encodeURIComponent).join('/')}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.text();
}

function readmeField(readme, name) {
  const m = readme.match(new RegExp(`\\|\\s*${name}\\s*\\|\\s*([^|\\n]*)\\|`));
  if (!m) throw new Error(`README has no "${name}" row`);
  return m[1].trim();
}

const round2 = (x) => Math.round(x * 100) / 100;

const members = {};
const r4ygmNames = new Set(Object.values(R4YGM).map((r) => r.name));
for (const mission of new Set(Object.values(PROFILES).flat())) {
  if (r4ygmNames.has(mission)) continue;
  const readme = await getText(`${mission}/README.md`);
  const stage = readmeField(readme, 'Analysed Telemetry');
  if (stage !== 'Stage 2') throw new Error(`${mission}: analysed telemetry is "${stage}"`);
  const data = JSON.parse(await getText(`${mission}/JSON/analysed.json`));
  const points = [];
  for (let i = 0; i < data.time.length; i++) {
    const t = data.time[i];
    if (t % STEP_S === 0 || i === data.time.length - 1) {
      points.push([t, round2(data.altitude[i]), round2(data.downrange_distance[i])]);
    }
  }
  members[mission] = {
    orbit: readmeField(readme, 'Orbit'),
    block: readmeField(readme, 'Block'),
    landing: readmeField(readme, 'Landing'),
    endS: data.time.at(-1),
    points,
  };
}

const snapshot = JSON.parse(await readFile(new URL('../data/ll2-snapshot.json', import.meta.url), 'utf8'));
for (const [file, { name, ll2 }] of Object.entries(R4YGM)) {
  const launch = snapshot.launches.find((l) => l.name === ll2);
  if (!launch) throw new Error(`${name}: no launch named "${ll2}" in data/ll2-snapshot.json`);
  const text = await readFile(new URL(`../reference/vendor/r4ygm-spacextelemetry/${file}.csv`, import.meta.url), 'utf8');
  const tel = parseR4ygmCsv(text);
  const endS = burnEndS(tel);
  const dr = deriveDownrangeKm(tel);
  // The engine samples from liftoff. Some files start a few seconds after
  // liftoff (DM-2 at 16 s), so each member starts with the rocket on the
  // pad: 0 s, 0 km, 0 km.
  const points = tel.t[0] > 0 ? [[0, 0, 0]] : [];
  for (let i = 0; i < tel.t.length && tel.t[i] <= endS; i++) {
    if (tel.t[i] % STEP_S === 0 || tel.t[i] === endS) points.push([tel.t[i], round2(tel.alt[i]), round2(dr[i])]);
  }
  members[name] = {
    orbit: launch.orbit,
    block: '5',
    landing: 'not stated',
    endS,
    source: 'r4ygm',
    ll2Id: launch.id,
    net: launch.net,
    points,
  };
}

const out = {
  extraSources: { r4ygm: R4YGM_SOURCE },
  source: {
    repository: `https://github.com/${REPO}`,
    commit: COMMIT,
    license: 'Unlicense',
    file: '<mission>/JSON/analysed.json',
    built: new Date().toISOString().slice(0, 10),
    note: 'Values calculated by the repository author from SpaceX webcast telemetry. Downrange distance is derived, not tracked.',
  },
  stepS: STEP_S,
  pointFormat: ['time since liftoff, s', 'altitude, km', 'downrange distance, km'],
  profiles: PROFILES,
  members,
};

// One member per line keeps the file small and the diff readable.
const json = JSON.stringify(out, null, 2).replace(
  /\[\s+(-?[\d.]+),\s+(-?[\d.]+),\s+(-?[\d.]+)\s+\]/g,
  '[$1, $2, $3]',
);
await writeFile(new URL('../config/profiles.json', import.meta.url), json + '\n');
for (const [name, m] of Object.entries(members)) {
  const last = m.points.at(-1);
  console.log(`${name}: ${m.orbit}, block ${m.block}, landing ${m.landing}, ${m.points.length} points, ends ${last.join(' / ')}`);
}
