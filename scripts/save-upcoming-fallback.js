// Saves the current LL2 answer as data/upcoming-fallback.json. The page shows
// this copy, with its date, only when every live source fails.
// Run by hand: `node scripts/save-upcoming-fallback.js`. One LL2 request.
import { writeFile } from 'node:fs/promises';
import { LL2_UPCOMING_URL, reduceLaunch } from '../lib/ll2.js';

const res = await fetch(LL2_UPCOMING_URL);
if (!res.ok) throw new Error(`Launch Library 2 answered ${res.status}`);
const body = await res.json();
const out = { fetched: Date.now(), results: body.results.map(reduceLaunch) };
await writeFile(new URL('../data/upcoming-fallback.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
console.log(`Saved ${out.results.length} launches.`);
