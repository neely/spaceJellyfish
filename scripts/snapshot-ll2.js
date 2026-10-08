// Fetches past Cape Canaveral and Kennedy Space Center launches from Launch
// Library 2 and writes the pinned snapshot data/ll2-snapshot.json.
// Run by hand: `node scripts/snapshot-ll2.js`. The backtest reads only the
// snapshot. It never calls LL2.
//
// LL2 allows 15 unauthenticated requests per hour. This script makes one
// request per 100 launches and waits between requests. If LL2 answers 429,
// wait an hour and run it again.
import { writeFile } from 'node:fs/promises';

const BASE = 'https://ll.thespacedevs.com/2.3.0/launches/previous/';
// 12 is Cape Canaveral SFS; 27 is Kennedy Space Center.
const LOCATION_IDS = '12,27';
const SINCE = '2017-01-01T00:00:00Z';
const PAGE = 100;
const PAUSE_MS = 5000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function reduce(l) {
  return {
    id: l.id,
    name: l.name,
    net: l.net,
    windowStart: l.window_start,
    windowEnd: l.window_end,
    status: l.status?.abbrev ?? null,
    vehicle: l.rocket?.configuration?.name ?? null,
    vehicleFamilies: (l.rocket?.configuration?.families ?? []).map((f) => f.name),
    provider: l.launch_service_provider?.name ?? null,
    mission: l.mission?.name ?? null,
    orbit: l.mission?.orbit?.abbrev ?? null,
    pad: {
      id: l.pad.id,
      name: l.pad.name,
      latitudeDeg: Number(l.pad.latitude),
      longitudeDeg: Number(l.pad.longitude),
      locationId: l.pad.location.id,
    },
  };
}

let url = `${BASE}?location__ids=${LOCATION_IDS}&net__gte=${SINCE}&limit=${PAGE}&ordering=net&mode=normal`;
let expected = null;
let requests = 0;
const launches = [];
while (url) {
  if (requests > 0) await sleep(PAUSE_MS);
  const res = await fetch(url);
  requests++;
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} after ${requests} requests, ${launches.length} launches read`);
  const body = await res.json();
  expected ??= body.count;
  launches.push(...body.results.map(reduce));
  url = body.next;
}
if (launches.length !== expected) {
  throw new Error(`LL2 reported ${expected} launches but ${launches.length} were read`);
}

const out = {
  source: BASE,
  query: { locationIds: LOCATION_IDS, since: SINCE, ordering: 'net' },
  fetched: new Date().toISOString(),
  count: launches.length,
  launches,
};
await writeFile(new URL('../data/ll2-snapshot.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
console.log(`Wrote ${launches.length} launches with ${requests} requests.`);
