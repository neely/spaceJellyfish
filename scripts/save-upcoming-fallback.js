// Saves the current LL2 answer as data/upcoming-fallback.json. The page shows
// this copy, with its date, only when every live source fails.
// Runs once a day in .github/workflows/update-fallback.yml, or by hand:
// `node scripts/save-upcoming-fallback.js`. One LL2 request.
// It writes nothing when the launch list is the same as the saved one, so
// the daily run makes a commit only when something changed. The `fetched`
// date then stays at the last change.
import { readFile, writeFile } from 'node:fs/promises';
import { LL2_UPCOMING_URL, reduceLaunch } from '../lib/ll2.js';

const res = await fetch(LL2_UPCOMING_URL);
if (!res.ok) throw new Error(`Launch Library 2 answered ${res.status}`);
const body = await res.json();
const results = body.results.map(reduceLaunch);
const file = new URL('../data/upcoming-fallback.json', import.meta.url);
const saved = await readFile(file, 'utf8').then(JSON.parse).catch(() => null);
if (saved && JSON.stringify(saved.results) === JSON.stringify(results)) {
  console.log(`No change in ${results.length} launches.`);
} else {
  const out = { fetched: Date.now(), results };
  await writeFile(file, JSON.stringify(out, null, 1) + '\n');
  console.log(`Saved ${results.length} launches.`);
}
