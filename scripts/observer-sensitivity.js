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

// ZIP centroids from https://api.zippopotam.us/us/<zip>, read 2026-10-13.
// 29455 (Johns Island) was left out: the API gave 32.8357, -79.8217, which
// is in Mount Pleasant, so the value is not trusted.
const PLACES = [
  ['Folly Beach 29439', 32.663, -79.927],
  ['Downtown Charleston 29401', 32.7795, -79.9371],
  ['Sullivans Island 29482', 32.7637, -79.8399],
  ['Mount Pleasant 29464', 32.8473, -79.8206],
  ['Isle of Palms 29451', 32.7943, -79.7729],
  ['Summerville 29483', 33.028, -80.1739],
  ['Beaufort 29902', 32.4047, -80.6531],
  ['Myrtle Beach 29577', 33.6994, -78.9137],
  ['Columbia 29201', 34.0004, -81.0334],
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
