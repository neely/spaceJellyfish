// Helpers for the GOES Clear Sky Mask check (config/goes-acm.json).
// h5wasm (a devDependency, `npm install`) loads only when a file is opened,
// so the tests and the scorer run without it.
let h5 = null;
/** Open a netCDF4 (HDF5) file read-only with h5wasm. */
export async function openH5(path) {
  h5 ??= import('h5wasm/node').then(async (m) => { await m.default.ready; return m.default; });
  const h5wasm = await h5;
  return new h5wasm.File(path, 'r');
}

/**
 * The scan start, end and middle times from an ABI file name, for example
 * OR_ABI-L2-ACMC-M6_G19_s20261001101179_e20261001103553_c....nc
 * (sYYYYDDDHHMMSSt, day of year, tenths of a second).
 */
export function scanTimes(name) {
  const t = (code) => {
    const m = /^(\d{4})(\d{3})(\d{2})(\d{2})(\d{2})(\d)$/.exec(code);
    if (!m) throw new Error(`bad time code ${code}`);
    const [, y, doy, hh, mm, ss, tenth] = m.map(Number);
    return Date.UTC(y, 0, doy, hh, mm, ss) + tenth * 100;
  };
  const s = /_s(\d{14})_/.exec(name)?.[1];
  const e = /_e(\d{14})_/.exec(name)?.[1];
  if (!s || !e) throw new Error(`no scan times in ${name}`);
  const startMs = t(s), endMs = t(e);
  return { startMs, endMs, midMs: (startMs + endMs) / 2 };
}

/** Great-circle distance in km on a sphere of mean radius (for pixel lookup only). */
export function distanceKm(lat1, lon1, lat2, lon2) {
  const r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 2 * 6371.0088 * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Percent cloudy in a box from BCM and DQF strings (one character per
 * pixel, as stored in data/goes/acm-stations.json). Pixels whose DQF is not
 * in goodDqf are left out. Returns { pct, good } or { pct: null, good }.
 */
export function boxCloudyPct(bcm, dqf, goodDqf, minGood) {
  let good = 0, cloudy = 0;
  for (let i = 0; i < bcm.length; i++) {
    if (!goodDqf.includes(Number(dqf[i]))) continue;
    if (bcm[i] !== '0' && bcm[i] !== '1') continue;
    good++;
    if (bcm[i] === '1') cloudy++;
  }
  return { pct: good >= minGood ? (100 * cloudy) / good : null, good };
}

/**
 * The pixel nearest a place in a precomputed latitude and longitude grid
 * (flat arrays, row-major). Returns { row, col, km, i } or null if no
 * pixel lies within 0.1 degrees.
 */
export function nearestPixel(lat, lon, cols, latDeg, lonDeg) {
  let best = null;
  for (let i = 0; i < lat.length; i++) {
    if (!(lat[i] >= -90 && lat[i] <= 90)) continue;
    // Cheap filter before the exact distance.
    if (Math.abs(lat[i] - latDeg) > 0.1 || Math.abs(lon[i] - lonDeg) > 0.1) continue;
    const km = distanceKm(latDeg, lonDeg, lat[i], lon[i]);
    if (!best || km < best.km) best = { km, i };
  }
  return best && { row: Math.floor(best.i / cols), col: best.i % cols, km: best.km, i: best.i };
}

