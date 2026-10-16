// Read webcast telemetry (time, altitude, speed) and derive downrange.
// Used by scripts/build-profiles.js and scripts/compare-ascent-sources.js.
// Build-time only; the engine never imports this file.
//
// Downrange method: horizontal speed = sqrt(v^2 - vz^2), with vz from a
// centred altitude difference over +/-5 s, integrated by the trapezoid
// rule on 1 s steps. On 2026-10-15 this method, run on the velocity and
// altitude of SpaceX CRS-14 and CRS-16 in shahar603/Telemetry-Data (commit
// b245d3b), reproduced that author's downrange within 1 km at 254, 277,
// 300 and 400 s. See reference/topics/falcon9-starlink-2020-telemetry.md.

const HALF_WINDOW_S = 5;

/**
 * Parse an R4yGM telemetry.csv (header row, then hh:mm:ss, altitude km,
 * speed km/h) and resample it to 1 s steps by linear interpolation.
 * Returns { t: [s], v: [m/s], alt: [km] }.
 */
export function parseR4ygmCsv(text) {
  const bySecond = new Map();
  for (const row of text.trim().split(/\r?\n/).slice(1)) {
    const [clock, alt, speed] = row.split(',').map((s) => s.trim());
    if (!speed) continue;
    const [h, m, s] = clock.split(':').map(Number);
    bySecond.set(h * 3600 + m * 60 + s, [Number(speed) / 3.6, Number(alt)]);
  }
  const keys = [...bySecond.keys()].sort((a, b) => a - b);
  const t = [];
  const v = [];
  const alt = [];
  for (let k = 0, s = keys[0]; s <= keys[keys.length - 1]; s++) {
    while (keys[k + 1] <= s) k++;
    const t0 = keys[k];
    const t1 = keys[Math.min(k + 1, keys.length - 1)];
    const f = t1 === t0 ? 0 : (s - t0) / (t1 - t0);
    const [v0, a0] = bySecond.get(t0);
    const [v1, a1] = bySecond.get(t1);
    t.push(s);
    v.push(v0 + f * (v1 - v0));
    alt.push(a0 + f * (a1 - a0));
  }
  return { t, v, alt };
}

/** Downrange distance (km) at each sample of { t, v, alt }. */
export function deriveDownrangeKm({ t, v, alt }) {
  const n = t.length;
  const vz = (i) => {
    const a = Math.max(0, i - HALF_WINDOW_S);
    const b = Math.min(n - 1, i + HALF_WINDOW_S);
    return ((alt[b] - alt[a]) * 1000) / (t[b] - t[a]);
  };
  const vx = (i) => Math.sqrt(Math.max(v[i] ** 2 - vz(i) ** 2, 0));
  const dr = [0];
  for (let i = 1; i < n; i++) {
    dr.push(dr[i - 1] + (0.5 * (vx(i) + vx(i - 1)) * (t[i] - t[i - 1])) / 1000);
  }
  return dr;
}

/**
 * The time of the highest speed between fromS and toS: the end of the
 * second-stage burn (SECO-1) for an ascent to low orbit.
 */
export function burnEndS({ t, v }, fromS = 400, toS = 750) {
  let best = null;
  for (let i = 0; i < t.length; i++) {
    if (t[i] < fromS || t[i] > toS) continue;
    if (best === null || v[i] > v[best]) best = i;
  }
  return best === null ? null : t[best];
}
