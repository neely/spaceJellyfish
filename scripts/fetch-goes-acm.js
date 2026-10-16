// Satellite check, step 1: fetches GOES Clear Sky Mask scans for a sample
// of hours and pins a small extract in data/goes/acm-stations.json: the
// BCM and DQF values in a box around each station, with the file name,
// S3 ETag, size and SHA-256 of each scan. Whole files are not kept.
// Rules: config/goes-acm.json. Scoring: scripts/score-goes.js.
//
//   node scripts/fetch-goes-acm.js <scratch dir>          fetch the sample
//   node scripts/fetch-goes-acm.js <scratch dir> --recheck 3
//                                     fetch 3 pinned scans again and compare
//
// The scratch dir holds one file at a time per worker, deleted after use,
// and a partial extract so a stopped run can resume.
// Sources: public NOAA buckets on AWS (noaa-goes16, noaa-goes19), about
// 5 MB a file. Four downloads at a time.
import { readFile, writeFile, mkdir, rm, access } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { parseIemCsv, reportsByHour, sunElevationDeg } from './lib/clouds.js';
import { openH5, scanTimes } from './lib/goes.js';

const root = new URL('../', import.meta.url);
const clouds = JSON.parse(await readFile(new URL('config/cloud-stations.json', root)));
const goes = JSON.parse(await readFile(new URL('config/goes-acm.json', root)));
const pixels = JSON.parse(await readFile(new URL('data/goes/station-pixels.json', root)));
const manifest = JSON.parse(await readFile(new URL('data/clouds/manifest.json', root)));
const OUT = new URL('data/goes/acm-stations.json', root);
const WORKERS = 4;

const scratch = process.argv[2];
if (!scratch) throw new Error('usage: node scripts/fetch-goes-acm.js <scratch dir> [--recheck N]');
const recheckAt = process.argv.indexOf('--recheck');
const recheck = recheckAt > 0 ? Number(process.argv[recheckAt + 1]) : 0;
await mkdir(scratch, { recursive: true });

const raw = async (name) => {
  const buf = gunzipSync(await readFile(new URL(`data/clouds/raw/${name}`, root)));
  const sha = createHash('sha256').update(buf).digest('hex');
  if (sha !== manifest.files[name].sha256) throw new Error(`${name}: SHA-256 does not match the manifest`);
  return buf.toString('utf8');
};

const satelliteFor = (ms) => {
  const day = new Date(ms).toISOString().slice(0, 10);
  const s = goes.satellites.find((x) => day >= x.from && day <= x.to);
  if (!s) throw new Error(`no satellite for ${day}`);
  return s;
};

// S3 listing of one hour folder, cached.
const listings = new Map();
async function listHour(bucket, ms) {
  const d = new Date(ms);
  const doy = Math.floor((ms - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400e3) + 1;
  const prefix = `${goes.product}/${d.getUTCFullYear()}/${String(doy).padStart(3, '0')}/${String(d.getUTCHours()).padStart(2, '0')}/`;
  const key = `${bucket}/${prefix}`;
  if (listings.has(key)) return listings.get(key);
  const res = await fetch(`https://${bucket}.s3.amazonaws.com/?list-type=2&prefix=${encodeURIComponent(prefix)}`);
  if (!res.ok) throw new Error(`listing ${key}: HTTP ${res.status}`);
  const xml = await res.text();
  const items = [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map(([, c]) => ({
    bucket,
    key: /<Key>([^<]+)<\/Key>/.exec(c)[1],
    etag: /<ETag>([^<]+)<\/ETag>/.exec(c)[1].replace(/&quot;|"/g, ''),
    bytes: Number(/<Size>([^<]+)<\/Size>/.exec(c)[1]),
  }));
  for (const it of items) Object.assign(it, scanTimes(it.key));
  listings.set(key, items);
  return items;
}

// Extract the box around every station from one downloaded file.
async function extract(path) {
  const f = await openH5(path);
  const half = Math.floor(goes.boxPixels / 2);
  const out = {};
  for (const [id, p] of Object.entries(pixels.stations)) {
    const sel = [[p.row - half, p.row + half + 1], [p.col - half, p.col + half + 1]];
    out[id] = {
      [goes.variable.toLowerCase()]: Array.from(f.get(goes.variable).slice(sel), (v) => (v === 255 ? 'F' : String(v))).join(''),
      dqf: Array.from(f.get('DQF').slice(sel), (v) => (v === 255 ? 'F' : String(v))).join(''),
    };
  }
  f.close();
  return out;
}

async function download(scan, workerId) {
  const res = await fetch(`https://${scan.bucket}.s3.amazonaws.com/${scan.key}`);
  if (!res.ok) throw new Error(`${scan.key}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length !== scan.bytes) throw new Error(`${scan.key}: ${buf.length} bytes, listing says ${scan.bytes}`);
  const path = join(scratch, `worker${workerId}.nc`);
  await writeFile(path, buf);
  try {
    return { sha256: createHash('sha256').update(buf).digest('hex'), stations: await extract(path) };
  } finally {
    await rm(path, { force: true });
  }
}

async function pool(items, fn) {
  let next = 0;
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    while (next < items.length) { const i = next++; await fn(items[i], w); }
  }));
}

// --recheck: download pinned scans again and compare.
if (recheck > 0) {
  const pinned = JSON.parse(await readFile(OUT));
  const step = Math.max(1, Math.floor(pinned.scans.length / recheck));
  const pick = pinned.scans.filter((_, i) => i % step === 0).slice(0, recheck);
  let same = 0;
  await pool(pick, async (s, w) => {
    const got = await download(s, w);
    const ok = got.sha256 === s.sha256 && JSON.stringify(got.stations) === JSON.stringify(s.stations);
    console.log(ok ? 'same' : 'DIFFERENT', s.key);
    if (ok) same++;
  });
  console.log(`${same} of ${pick.length} rechecked scans are identical`);
  process.exit(same === pick.length ? 0 : 1);
}

// Pick the sample hours by the Sun at the anchor station.
const anchor = clouds.stations[goes.sample.anchorStation];
const reports = {};
for (const id of Object.keys(clouds.stations)) reports[id] = reportsByHour(parseIemCsv(await raw(`${id}-iem.csv.gz`)));
const tw = [], day = [];
for (const hourMs of [...reports[goes.sample.anchorStation].keys()].sort((a, b) => a - b)) {
  const sun = sunElevationDeg(anchor, hourMs);
  if (sun >= clouds.twilightSunDeg.min && sun <= clouds.twilightSunDeg.max) tw.push(hourMs);
  else if (sun >= goes.sample.daySunMinDeg) day.push(hourMs);
}
const even = (list, n) => Array.from({ length: Math.min(n, list.length) }, (_, k) => list[Math.floor(((k + 0.5) * list.length) / Math.min(n, list.length))]);
const hours = [...even(tw, goes.sample.twilightHours).map((h) => ['twilight', h]), ...even(day, goes.sample.dayHours).map((h) => ['day', h])];
console.log(`candidates: ${tw.length} twilight, ${day.length} day hours at ${goes.sample.anchorStation}; picked ${hours.length}`);

// For each picked hour and station, the scan nearest the report time.
const needed = new Map();
for (const [, hourMs] of hours) {
  const sat = satelliteFor(hourMs);
  for (const id of Object.keys(clouds.stations)) {
    const r = reports[id].get(hourMs);
    if (!r) continue;
    const scans = [
      ...(await listHour(sat.bucket, r.timeMs - 10 * 60e3)),
      ...(await listHour(sat.bucket, r.timeMs + 10 * 60e3)),
    ];
    let best = null;
    for (const s of scans) if (!best || Math.abs(s.midMs - r.timeMs) < Math.abs(best.midMs - r.timeMs)) best = s;
    if (best && Math.abs(best.midMs - r.timeMs) <= goes.maxMatchMinutes * 60e3) needed.set(best.key, best);
  }
}
console.log(`scans needed: ${needed.size}`);

// Fetch, resuming from a partial extract in the scratch dir.
const partialPath = join(scratch, 'partial.json');
const done = await access(partialPath).then(async () => JSON.parse(await readFile(partialPath)), () => ({}));
const todo = [...needed.values()].filter((s) => !done[s.key]);
console.log(`to fetch: ${todo.length} (${(todo.reduce((a, s) => a + s.bytes, 0) / 1e9).toFixed(2)} GB)`);
let count = 0;
await pool(todo, async (s, w) => {
  const got = await download(s, w);
  done[s.key] = { bucket: s.bucket, key: s.key, etag: s.etag, bytes: s.bytes, sha256: got.sha256, midMs: s.midMs, stations: got.stations };
  if (++count % 20 === 0) { await writeFile(partialPath, JSON.stringify(done)); console.log(`${count} of ${todo.length}`); }
});
await writeFile(partialPath, JSON.stringify(done));

const scans = [...needed.keys()].sort().map((k) => done[k]);
await writeFile(OUT, JSON.stringify({
  about: 'Generated by scripts/fetch-goes-acm.js. Per scan: the S3 object, its SHA-256, the scan middle time, and per station the BCM and DQF values of the box (row by row, north first; F is fill). Do not edit by hand.',
  fetched: new Date().toISOString(),
  rules: { product: goes.product, variable: goes.variable, boxPixels: goes.boxPixels, sample: goes.sample },
  hours: hours.map(([kind, h]) => ({ kind, hourMs: h })),
  scans,
}, null, 1) + '\n');
console.log(`wrote ${scans.length} scans`);
