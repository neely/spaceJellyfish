// Satellite check, test 3: NBM skill against the GOES Clear Sky Mask over
// land (the 11 airports) and over water (12 points off Charleston), and
// their ratio Q = skill(water) / skill(land) with a bootstrap interval.
// Reads only pinned files: data/goes/relative-acm.json, data/goes/water-nbm.json.gz,
// data/clouds/raw/*-previous.json.gz. Rules: config/goes-relative.json.
// Writes clouds/goes-relative-results.json and clouds/goes-relative-results.md.
//
//   node scripts/score-goes-relative.js
import { readFile, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { openMeteoSeries, sunElevationDeg, score } from './lib/clouds.js';
import { boxCloudyPct } from './lib/goes.js';

const root = new URL('../', import.meta.url);
const json = async (p) => JSON.parse(await readFile(new URL(p, root)));
const rel = await json('config/goes-relative.json');
const acmRules = await json('config/goes-acm.json');
const clouds = await json('config/cloud-stations.json');
const manifest = await json('data/clouds/manifest.json');
const extract = await json('data/goes/relative-acm.json');
const sha256 = (b) => createHash('sha256').update(b).digest('hex');

const waterText = gunzipSync(await readFile(new URL('data/goes/water-nbm.json.gz', root))).toString('utf8');
if (sha256(waterText) !== (await json('data/goes/water-nbm.manifest.json')).sha256) throw new Error('water-nbm.json.gz: SHA-256 does not match');
const water = openMeteoSeries(JSON.parse(waterText));
const land = {};
for (const id of Object.keys(clouds.stations)) {
  const buf = gunzipSync(await readFile(new URL(`data/clouds/raw/${id}-previous.json.gz`, root)));
  if (sha256(buf) !== manifest.files[`${id}-previous.json.gz`].sha256) throw new Error(`${id}-previous.json.gz: SHA-256 does not match`);
  land[id] = openMeteoSeries(JSON.parse(buf.toString('utf8')));
}

const CLOUDY = clouds.cloudyPct;
const M = rel.forecast.model;
const leads = rel.forecast.reportedLeadDays;
const points = {
  land: Object.entries(clouds.stations).map(([id, s]) => ({ id, lat: s.latitudeDeg, lon: s.longitudeDeg, series: (L) => land[id].get(`cloud_cover_previous_day${L}_${M}`) })),
  water: Object.entries(rel.waterPoints.places).map(([id, [lat, lon]]) => ({ id, lat, lon, series: (L) => water.get(`cloud_cover_previous_day${L}_${id}`) })),
};
points.landNearCharleston = points.land.filter((p) => clouds.nearCharleston.includes(p.id));

// A twilight event: one local date and morning or evening (local time is UTC-5 here, for grouping only).
const eventOf = (h) => { const t = new Date(h - 5 * 3600e3); return t.toISOString().slice(0, 10) + (t.getUTCHours() < 12 ? 'am' : 'pm'); };

// counts[set][lead][event] = [hits, cloudy, falseAlarms, clear]; pairs kept for score().
const counts = {}, pairs = {}, dropped = { noForecast: 0, fewGoodPixels: 0, notTwilight: 0 };
for (const s of extract.scans) {
  const ev = eventOf(s.hourMs);
  for (const [set, list] of Object.entries(points)) for (const p of list) {
    const sun = sunElevationDeg({ latitudeDeg: p.lat, longitudeDeg: p.lon }, s.hourMs);
    if (sun < clouds.twilightSunDeg.min || sun > clouds.twilightSunDeg.max) { if (set !== 'landNearCharleston') dropped.notTwilight++; continue; }
    const box = s.boxes[p.id];
    const { pct: sat } = boxCloudyPct(box.bcm, box.dqf, acmRules.goodDqf, acmRules.minGoodPixels);
    if (sat == null) { if (set !== 'landNearCharleston') dropped.fewGoodPixels++; continue; }
    for (const L of leads) {
      const f = p.series(L)?.get(s.hourMs);
      if (f == null) { if (set !== 'landNearCharleston' && L === 1) dropped.noForecast++; continue; }
      const c = (((counts[set] ??= {})[L] ??= {})[ev] ??= [0, 0, 0, 0]);
      if (sat >= CLOUDY) { c[1]++; if (f >= CLOUDY) c[0]++; } else { c[3]++; if (f >= CLOUDY) c[2]++; }
      ((pairs[set] ??= {})[L] ??= []).push([f, sat]);
    }
  }
}

const skillOf = (evs, keys) => { const t = [0, 0, 0, 0]; for (const k of keys) { const c = evs[k]; if (c) for (let i = 0; i < 4; i++) t[i] += c[i]; } return t[0] / t[1] - t[2] / t[3]; };
function bootstrap(landSet, L) {
  const W = counts.water[L], Lc = counts[landSet][L];
  const events = [...new Set([...Object.keys(W), ...Object.keys(Lc)])].sort();
  let seed = 20261016;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const qs = [], ds = [];
  for (let b = 0; b < 2000; b++) {
    const pick = Array.from({ length: events.length }, () => events[Math.floor(rnd() * events.length)]);
    const sw = skillOf(W, pick), sl = skillOf(Lc, pick);
    qs.push(sw / sl); ds.push(sw - sl);
  }
  qs.sort((a, b) => a - b); ds.sort((a, b) => a - b);
  const sw = skillOf(W, events), sl = skillOf(Lc, events);
  const r3 = (x) => Math.round(x * 1000) / 1000;
  return {
    events: events.length, skillWaterPct: Math.round(100 * sw), skillLandPct: Math.round(100 * sl),
    q: r3(sw / sl), qCi95: [r3(qs[50]), r3(qs[1949])],
    dPct: Math.round(100 * (sw - sl)), dCi95Pct: [Math.round(100 * ds[50]), Math.round(100 * ds[1949])],
  };
}

const results = {
  about: 'Generated by scripts/score-goes-relative.js from data/goes/relative-acm.json, data/goes/water-nbm.json.gz and data/clouds/raw. Do not edit by hand.',
  inputs: { scans: extract.scans.length, twilightHours: extract.twilightHours, hoursWithNoScan: extract.hoursWithNoScan, fetched: extract.fetched },
  cloudyPct: CLOUDY,
  dropped,
  scores: {},
  ratio: {},
};
for (const [set, byLead] of Object.entries(pairs)) {
  results.scores[set] = {};
  for (const [L, p] of Object.entries(byLead)) { const sc = score(p, CLOUDY); results.scores[set][L] = { n: sc.n, cloudy: sc.cloudy, skillPct: Math.round(100 * sc.skill), hitPct: Math.round(100 * sc.hitRate), falsePct: Math.round(100 * sc.falseRate) }; }
}
for (const landSet of ['land', 'landNearCharleston']) { results.ratio[landSet] = {}; for (const L of leads) results.ratio[landSet][L] = bootstrap(landSet, L); }
const d = results.ratio.land[rel.forecast.decisiveLeadDay];
const bar = 0.85; // config/goes-relative.json, verdict (approved 2026-10-16)
results.verdict = {
  rule: `NBM day ${rel.forecast.decisiveLeadDay}, twilight: Q = skill(water)/skill(land); holds if the lower 95% bound is ${bar} or more, degrades if the upper bound is below ${bar}`,
  q: d.q, qCi95: d.qCi95,
  verdict: d.qCi95[0] >= bar ? 'holds' : d.qCi95[1] < bar ? 'degrades' : 'inconclusive',
};
await writeFile(new URL('clouds/goes-relative-results.json', root), JSON.stringify(results, null, 1) + '\n');

let md = `# NBM over land and over water, scored against GOES (satellite check, test 3)\n\nGenerated by \`scripts/score-goes-relative.js\`. Do not edit by hand. Method and reading: [README.md](README.md#satellite-check-test-3).\n\n`;
md += `${extract.scans.length} GOES scans, one per twilight hour at JZI (${extract.twilightHours} hours; ${extract.hoursWithNoScan} with no scan). Land: the 11 airports. Water: 12 points off Charleston. Reference: percent cloudy in the 5 by 5 mask box at each point. Cloudy means ${CLOUDY} percent or more for both. Skill is hit rate minus false-alarm rate. Pairs dropped: ${Object.entries(dropped).map(([k, n]) => `${k} ${n}`).join(', ')}.\n\n`;
md += `**Verdict** (${results.verdict.rule}): Q = ${d.q}, 95 percent interval ${d.qCi95[0]} to ${d.qCi95[1]}, so **${results.verdict.verdict}**.\n\n`;
md += `## Ratio by lead day\n\n| Land set | Day | Events | Skill water | Skill land | Q | Q 95% interval | D | D 95% interval |\n|---|---|---|---|---|---|---|---|---|\n`;
for (const [set, byLead] of Object.entries(results.ratio)) for (const [L, r] of Object.entries(byLead)) md += `| ${set} | ${L} | ${r.events} | ${r.skillWaterPct} | ${r.skillLandPct} | ${r.q} | ${r.qCi95[0]} to ${r.qCi95[1]} | ${r.dPct} | ${r.dCi95Pct[0]} to ${r.dCi95Pct[1]} |\n`;
md += `\n## Scores\n\n| Set | Day | Pairs | GOES cloudy | Skill | Hit rate | False-alarm rate |\n|---|---|---|---|---|---|---|\n`;
for (const [set, byLead] of Object.entries(results.scores)) for (const [L, s] of Object.entries(byLead)) md += `| ${set} | ${L} | ${s.n} | ${s.cloudy} | ${s.skillPct} | ${s.hitPct} | ${s.falsePct} |\n`;
await writeFile(new URL('clouds/goes-relative-results.md', root), md);
console.log(md);
