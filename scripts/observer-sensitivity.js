// How much does the answer change if the observer is somewhere else in the
// Charleston area, or farther away? Runs the engine for each place over the
// pinned LL2 snapshot and compares it with the configured observer
// (James Island). Reads only files in this repo.
//
//   node scripts/observer-sensitivity.js
import { readFileSync } from 'node:fs';
import { evaluateLaunch } from '../engine/visibility.js';
import { surfaceDistanceM } from '../engine/geo.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const home = read('../config/observer.json');
const profiles = read('../config/profiles.json');
const config = read('../config/visibility.json');
const snapshot = read('../data/ll2-snapshot.json');
const upcoming = read('../data/upcoming-fallback.json');

// ZCTA internal points from the Census TIGERweb ZCTA layer
// (PUMA_TAD_TAZ_UGA_ZCTA/MapServer/1, fields INTPTLAT and INTPTLON), read
// 2026-10-15. Until 2026-10-15 these came from api.zippopotam.us; four of
// those points were 4.3 to 10.1 km from the Census points, and the one for
// 29455 (Johns Island) was 30 km off, so it was left out. See
// reference/source-audit.md.
const PLACES = [
  ['Folly Beach 29439', 32.6626912, -79.9316597],
  ['Johns Island 29455', 32.6851849, -80.0910082],
  ['Downtown Charleston 29401', 32.77718, -79.9320004],
  ['Sullivans Island 29482', 32.7709494, -79.8311365],
  ['Mount Pleasant 29464', 32.8174212, -79.8550653],
  ['Isle of Palms 29451', 32.8280093, -79.750481],
  ['Summerville 29483', 33.0302971, -80.2338068],
  ['Beaufort 29902', 32.3175972, -80.6822133],
  ['Myrtle Beach 29577', 33.6976385, -78.906484],
  ['Columbia 29201', 33.9823292, -81.0286589],
];

const run = (observer, launch) => evaluateLaunch({ launch, observer, profiles, config });
const base = snapshot.launches.map((l) => run(home, l));
const spx = upcoming.results.find((l) => /SpX-35/.test(l.name));
const spxHome = spx ? run(home, spx) : null;

const r1 = (x) => x.toFixed(1);
const median = (xs) => { const v = [...xs].sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
console.log(`Reference: ${home.name}. Snapshot: ${base.length} launches.`);
console.log('place | km | same verdict | of home likely/possible: same | peak el diff deg | peak bearing diff deg | window shift s (median, max over launches seen at both)');
for (const [name, lat, lon] of PLACES) {
  const obs = { name, latitudeDeg: lat, longitudeDeg: lon, heightM: 0 };
  const km = surfaceDistanceM(home, obs) / 1000;
  let same = 0;
  let homeSeen = 0;
  let homeSeenSame = 0;
  const dEls = [];
  const dAzs = [];
  const dWins = [];
  snapshot.launches.forEach((l, i) => {
    const a = base[i];
    const b = run(obs, l);
    if (a.verdict === b.verdict) same++;
    if (a.verdict !== 'no') {
      homeSeen++;
      if (b.verdict === a.verdict) homeSeenSame++;
      if (b.verdict !== 'no') {
        dEls.push(Math.abs(a.peakElevationDeg.max - b.peakElevationDeg.max));
        dAzs.push(Math.abs(((a.peakBearingDeg.max - b.peakBearingDeg.max + 540) % 360) - 180));
        dWins.push(Math.max(Math.abs(a.firstVisibleS - b.firstVisibleS), Math.abs(a.lastVisibleS - b.lastVisibleS)));
      }
    }
  });
  const mm = (xs, f = r1) => `${f(median(xs))} (max ${f(Math.max(...xs))})`;
  console.log(`${name} | ${km.toFixed(0)} | ${same}/${base.length} | ${homeSeenSame}/${homeSeen} | ${mm(dEls)} | ${mm(dAzs)} | ${mm(dWins, String)}`);
  if (spxHome) {
    const s = run(obs, spx);
    console.log(`   SpX-35: ${s.verdict}; peak ${s.peakElevationDeg ? `${r1(s.peakElevationDeg.max)} deg at ${r1(s.peakBearingDeg.max)}` : '-'} (home ${r1(spxHome.peakElevationDeg.max)} at ${r1(spxHome.peakBearingDeg.max)})`);
  }
}
