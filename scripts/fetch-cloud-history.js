// Fetches the raw data for the cloud forecast test and pins it under
// data/clouds/raw/. Run by hand from a machine with normal internet access:
//
//   node scripts/fetch-cloud-history.js
//
// Then commit data/clouds/ and push. scripts/score-clouds.js reads only
// these pinned files. Report: clouds/README.md.
//
// Three sources, one set of files per station:
//   <ID>-iem.csv.gz         airport reports (sky cover and base of each layer)
//                           from the Iowa Environmental Mesonet ASOS archive
//   <ID>-previous.json.gz   forecasts made 1 to 7 days before each hour, total
//                           cloud cover, from the Open-Meteo Previous Model Runs API
//   <ID>-historical.json.gz short-lead forecasts with low, mid and high cloud,
//                           from the Open-Meteo Historical Forecast API
// data/clouds/manifest.json records each URL, the fetch time, the byte count
// and the SHA-256 of the uncompressed answer.
//
// Limits respected (read 2026-10-15 and 16):
// - Open-Meteo free tier: 10,000 calls a day, 5,000 an hour, 600 a minute;
//   a request counts as more than one call above 10 variables or 2 weeks.
//   This script is about 2,000 calls in all. Non-commercial use only; data
//   under CC BY 4.0.
// - IEM: up to 1,000 station-years per request. One request per station
//   here (under 2 station-years each).
// Requests run one at a time with a pause between them.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('config/cloud-stations.json', root)));
const outDir = new URL('data/clouds/raw/', root);
const PAUSE_MS = 2000;
const UA = 'spacejellyfish cloud test (github.com/neely/spaceJellyfish)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { start, end } = config.period;
const [y1, m1, d1] = start.split('-').map(Number);
const [y2, m2, d2] = end.split('-').map(Number);

function iemUrl(id) {
  const q = new URLSearchParams({
    station: id, tz: 'Etc/UTC', format: 'onlycomma', latlon: 'no', missing: 'M', trace: 'T', direct: 'no',
    // report_type 3 returned only the routine report near :56 in tests (2026-10-16).
    report_type: '3',
    year1: y1, month1: m1, day1: d1,
    // The end date is exclusive in IEM requests, so ask for the next day.
    ...(() => { const e = new Date(Date.UTC(y2, m2 - 1, d2 + 1)); return { year2: e.getUTCFullYear(), month2: e.getUTCMonth() + 1, day2: e.getUTCDate() }; })(),
  });
  for (const k of [1, 2, 3, 4]) { q.append('data', `skyc${k}`); }
  for (const k of [1, 2, 3, 4]) { q.append('data', `skyl${k}`); }
  return `https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py?${q}`;
}

function previousUrl(st, model, leads) {
  const hourly = leads.map((d) => `cloud_cover_previous_day${d}`).join(',');
  return `https://previous-runs-api.open-meteo.com/v1/forecast?latitude=${st.latitudeDeg}&longitude=${st.longitudeDeg}` +
    `&hourly=${hourly}&models=${model}&start_date=${start}&end_date=${end}&timezone=GMT`;
}

function historicalUrl(st, models) {
  return `https://historical-forecast-api.open-meteo.com/v1/forecast?latitude=${st.latitudeDeg}&longitude=${st.longitudeDeg}` +
    `&hourly=cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high&models=${models.join(',')}` +
    `&start_date=${start}&end_date=${end}&timezone=GMT`;
}

async function get(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    const text = await res.text();
    if (res.ok) return text;
    console.error(`  ${res.status} on attempt ${attempt}: ${text.slice(0, 200)}`);
    await sleep(30000 * attempt);
  }
  throw new Error(`Failed after 3 attempts: ${url}`);
}

await mkdir(outDir, { recursive: true });
const manifest = { fetchedStart: new Date().toISOString(), period: config.period, files: {} };
const save = async (name, url, text) => {
  await writeFile(new URL(name, outDir), gzipSync(text, { level: 9 }));
  manifest.files[name] = { url, bytes: Buffer.byteLength(text), sha256: createHash('sha256').update(text).digest('hex') };
  console.log(`  ${name}: ${Buffer.byteLength(text)} bytes`);
};

for (const [id, st] of Object.entries(config.stations)) {
  console.log(id);
  let url = iemUrl(id);
  const csv = await get(url);
  if (!csv.startsWith('station,valid,skyc1')) throw new Error(`${id}: unexpected IEM answer: ${csv.slice(0, 200)}`);
  await save(`${id}-iem.csv.gz`, url, csv);
  await sleep(PAUSE_MS);

  // One request per model, merged into one file per station.
  const merged = { requests: [], hourly: {} };
  for (const [model, m] of Object.entries(config.models)) {
    url = previousUrl(st, model, m.leadDays);
    const j = JSON.parse(await get(url));
    if (j.error) throw new Error(`${id} ${model}: ${j.reason}`);
    merged.requests.push({ model, url, latitude: j.latitude, longitude: j.longitude, elevation: j.elevation });
    merged.hourly.time ??= j.hourly.time;
    if (j.hourly.time.length !== merged.hourly.time.length || j.hourly.time[0] !== merged.hourly.time[0]) {
      throw new Error(`${id} ${model}: hours do not match the first model`);
    }
    for (const [k, v] of Object.entries(j.hourly)) if (k !== 'time') merged.hourly[`${k}_${model}`] = v;
    await sleep(PAUSE_MS);
  }
  await save(`${id}-previous.json.gz`, 'see requests inside the file', JSON.stringify(merged));

  url = historicalUrl(st, Object.keys(config.models));
  const hist = await get(url);
  const hj = JSON.parse(hist);
  if (hj.error) throw new Error(`${id} historical: ${hj.reason}`);
  await save(`${id}-historical.json.gz`, url, hist);
  await sleep(PAUSE_MS);
}

manifest.fetchedEnd = new Date().toISOString();
await writeFile(new URL('data/clouds/manifest.json', root), JSON.stringify(manifest, null, 2) + '\n');
console.log('Done. Commit data/clouds/ and push.');
