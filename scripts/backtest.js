// Runs the engine over the pinned LL2 snapshot and compares it with the
// labelled sightings. Reads only files in this repo.
//
//   node scripts/backtest.js            summary
//   node scripts/backtest.js --list     also list every launch that is not 'no'
import { readFileSync } from 'node:fs';
import { evaluateLaunch } from '../engine/visibility.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const observer = read('../config/observer.json');
const profiles = read('../config/profiles.json');
const config = read('../config/visibility.json');
const snapshot = read('../data/ll2-snapshot.json');
const { labels } = read('../data/labels.json');

const override = process.argv.find((a) => a.startsWith('--screening='));
if (override) config.params.screeningHeightM = Number(override.split('=')[1]);

const localHour = (iso) =>
  Number(new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York', hour: '2-digit', hour12: false })) % 24;
const localStamp = (iso) =>
  new Date(iso).toLocaleString('sv-SE', { timeZone: 'America/New_York' }).slice(0, 16);

const results = snapshot.launches.map((launch) => ({
  launch,
  result: evaluateLaunch({ launch, observer, profiles, config }),
}));

const count = (list, key) => list.reduce((acc, x) => ((acc[key(x)] = (acc[key(x)] ?? 0) + 1), acc), {});
const pct = (n, d) => `${n} of ${d} (${((100 * n) / d).toFixed(1)}%)`;

console.log(`Snapshot: ${results.length} launches. Screening height ${config.params.screeningHeightM} m.`);
const verdicts = count(results, (r) => r.result.verdict);
for (const v of ['likely', 'possible', 'no']) console.log(`  ${v}: ${pct(verdicts[v] ?? 0, results.length)}`);
const notNo = results.filter((r) => r.result.verdict !== 'no');
console.log(`  prime (Sun at or below ${config.primeSunElevationDeg} deg) among likely and possible: ${pct(notNo.filter((r) => r.result.prime).length, notNo.length)}`);

console.log('\nLikely or possible, by year (prime in brackets):');
const years = [...new Set(results.map((r) => r.launch.net.slice(0, 4)))].sort();
for (const y of years) {
  const all = results.filter((r) => r.launch.net.startsWith(y));
  const hit = all.filter((r) => r.result.verdict !== 'no');
  console.log(`  ${y}: ${hit.length} of ${all.length} launches [${hit.filter((r) => r.result.prime).length}]`);
}

console.log('\nNegative classes (chosen by local clock time, not by the engine):');
const midday = results.filter((r) => localHour(r.launch.net) >= 10 && localHour(r.launch.net) < 15);
const night = results.filter((r) => localHour(r.launch.net) >= 23 || localHour(r.launch.net) < 2);
for (const [name, set] of [['10:00 to 15:00 local', midday], ['23:00 to 02:00 local', night]]) {
  const wrong = set.filter((r) => r.result.verdict !== 'no');
  console.log(`  ${name}: ${set.length} launches, ${wrong.length} not 'no'`);
  for (const r of wrong) console.log(`    WRONG ${localStamp(r.launch.net)} ${r.launch.name}`);
}

console.log('\nLabelled sightings:');
let missed = 0;
for (const label of labels) {
  const hit = results.find((r) => r.launch.id === label.launchId);
  if (!hit) throw new Error(`Label ${label.localDate} has no launch in the snapshot`);
  const { result: x, launch } = hit;
  if (x.verdict === 'no') missed++;
  const detail = x.verdict === 'no' ? '' :
    ` Sun ${x.sunElevationDeg.toFixed(1)}, peak ${x.peakElevationDeg.min.toFixed(0)}-${x.peakElevationDeg.max.toFixed(0)} deg, T+${x.firstVisibleS}-${x.lastVisibleS} s, ${x.visibleTracks}/${x.tracks.length} tracks${x.prime ? ', prime' : ''}`;
  console.log(`  ${x.verdict.padEnd(8)} ${localStamp(launch.net)} ${label.label.padEnd(10)} ${launch.name.slice(0, 40).padEnd(40)}${detail}`);
}
console.log(`  Missed: ${missed} of ${labels.length}`);

if (process.argv.includes('--list')) {
  console.log('\nEvery launch that is not "no":');
  for (const { launch, result: x } of notNo) {
    console.log(`  ${x.verdict.padEnd(8)} ${localStamp(launch.net)} ${x.prime ? 'prime' : '     '} Sun ${x.sunElevationDeg.toFixed(1).padStart(5)} peak ${x.peakElevationDeg.max.toFixed(0).padStart(2)} ${launch.orbit ?? '?'} ${launch.name}`);
  }
}
process.exitCode = missed === 0 ? 0 : 1;
