// Satellite check, test 2: fetches the GOES Cloud Cover Layers (CCLC) file
// that matches each pinned Clear Sky Mask scan in data/goes/acm-stations.json
// (same satellite and scan start), and pins the values of the CCL cell at
// each station in data/goes/ccl-stations.json. Whole files are not kept.
// Rules: config/goes-ccl.json. Scoring: scripts/score-goes-ccl.js.
//
//   node scripts/fetch-goes-ccl.js <scratch dir>
//   node scripts/fetch-goes-ccl.js <scratch dir> --recheck 5
//
// About 0.42 MB a file, four downloads at a time.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { openH5 } from './lib/goes.js';

const root = new URL('../', import.meta.url);
const ccl = JSON.parse(await readFile(new URL('config/goes-ccl.json', root)));
const acm = JSON.parse(await readFile(new URL('data/goes/acm-stations.json', root)));
const pixels = JSON.parse(await readFile(new URL('data/goes/station-pixels.json', root)));
const OUT = new URL('data/goes/ccl-stations.json', root);
const WORKERS = 4;
const VARS = ['TCF', 'CF1', 'CF2', 'CF3', 'CF4', 'CF5', 'CL', 'DQF'];

const scratch = process.argv[2];
if (!scratch) throw new Error('usage: node scripts/fetch-goes-ccl.js <scratch dir> [--recheck N]');
const at = process.argv.indexOf('--recheck');
const recheck = at > 0 ? Number(process.argv[at + 1]) : 0;
await mkdir(scratch, { recursive: true });

// The CCL cell holding each station's 2 km pixel (config/goes-ccl.json, cell).
const cells = Object.fromEntries(Object.entries(pixels.stations).map(([id, p]) => [id, { row: Math.floor(p.row / 5), col: Math.floor(p.col / 5) }]));

const listings = new Map();
async function list(bucket, prefix) {
  const k = `${bucket}/${prefix}`;
  if (!listings.has(k)) {
    const res = await fetch(`https://${bucket}.s3.amazonaws.com/?list-type=2&prefix=${encodeURIComponent(prefix)}`);
    if (!res.ok) throw new Error(`listing ${k}: HTTP ${res.status}`);
    const xml = await res.text();
    listings.set(k, [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map(([, c]) => ({
      bucket,
      key: /<Key>([^<]+)<\/Key>/.exec(c)[1],
      etag: /<ETag>([^<]+)<\/ETag>/.exec(c)[1].replace(/&quot;|"/g, ''),
      bytes: Number(/<Size>([^<]+)<\/Size>/.exec(c)[1]),
    })));
  }
  return listings.get(k);
}

async function download(item, w) {
  const res = await fetch(`https://${item.bucket}.s3.amazonaws.com/${item.key}`);
  if (!res.ok) throw new Error(`${item.key}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length !== item.bytes) throw new Error(`${item.key}: ${buf.length} bytes, listing says ${item.bytes}`);
  const path = join(scratch, `ccl${w}.nc`);
  await writeFile(path, buf);
  try {
    const f = await openH5(path);
    const cols = f.get('x').shape[0];
    const data = Object.fromEntries(VARS.map((v) => [v, f.get(v).value]));
    const scale = f.get('TCF').attrs.scale_factor.value[0];
    const stations = {};
    for (const [id, c] of Object.entries(cells)) {
      const i = c.row * cols + c.col;
      stations[id] = Object.fromEntries(VARS.map((v) => [v, Number(data[v][i])]));
    }
    f.close();
    return { sha256: createHash('sha256').update(buf).digest('hex'), tcfScale: scale, stations };
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

// Match each pinned mask scan to the CCL file with the same scan start.
const todo = [];
let unmatched = 0;
for (const s of acm.scans) {
  const prefix = s.key.replace(/^ABI-L2-ACMC/, ccl.product).replace(/[^/]+$/, '');
  const stime = /_s(\d{14})_/.exec(s.key)[1];
  const hit = (await list(s.bucket, prefix)).find((x) => x.key.includes(`_s${stime}_`));
  if (hit) todo.push({ ...hit, acmKey: s.key, midMs: s.midMs }); else unmatched++;
}
console.log(`mask scans: ${acm.scans.length}; CCL files found: ${todo.length}; not found: ${unmatched}`);

const done = {};
let count = 0;
await pool(todo, async (it, w) => {
  const got = await download(it, w);
  done[it.key] = { bucket: it.bucket, key: it.key, etag: it.etag, bytes: it.bytes, sha256: got.sha256, acmKey: it.acmKey, midMs: it.midMs, tcfScale: got.tcfScale, stations: got.stations };
  if (++count % 100 === 0) console.log(`${count} of ${todo.length}`);
});

await writeFile(OUT, JSON.stringify({
  about: 'Generated by scripts/fetch-goes-ccl.js. Per CCL file: the S3 object, its SHA-256, the matching mask scan (acmKey) and its middle time, and per station the raw values of the CCL cell (TCF unscaled; multiply by tcfScale). Do not edit by hand.',
  fetched: new Date().toISOString(),
  cells,
  unmatchedMaskScans: unmatched,
  scans: Object.keys(done).sort().map((k) => done[k]),
}, null, 1) + '\n');
console.log(`wrote ${count} scans`);
