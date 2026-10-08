// Builds config/profiles.json from public Falcon 9 webcast telemetry.
// Run by hand: `node scripts/build-profiles.js`. The engine and the tests
// read only the file this script writes.
//
// Source: https://github.com/shahar603/Telemetry-Data (Unlicense), pinned
// to one commit. Each mission folder has JSON/analysed.json: values at 1 s
// steps that the repository author calculated from the altitude and
// velocity shown on the SpaceX webcast. Downrange distance is therefore a
// derived value, not a tracked position.
import { writeFile } from 'node:fs/promises';

const REPO = 'shahar603/Telemetry-Data';
const COMMIT = 'b245d3b81aa36b7941ec10f3f4b508999d106a6d';
const BASE = `https://raw.githubusercontent.com/${REPO}/${COMMIT}`;
const STEP_S = 10;

// Missions to use. Each must have second-stage telemetry that runs to about
// second-stage cutoff, and a README that states the orbit and the block.
// Block 4 and Block 5 only. Missions with no README table (for example
// DM-1) are left out because their block and orbit are not stated.
const PROFILES = {
  'falcon9-leo': ['SpaceX CRS-16', 'SpaceX CRS-14'],
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
for (const mission of new Set(Object.values(PROFILES).flat())) {
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

const out = {
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
