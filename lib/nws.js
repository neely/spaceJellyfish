// Sky cover from the NWS API (api.weather.gov), asked from the browser.
// Access rules and live checks: reference/data-sources.md.
//
// Each place needs two requests: /points gives the grid forecast URL, then
// the grid forecast gives the skyCover layer. Both answers are kept in
// localStorage for as long as the API's own cache header allows (24 h and
// 1 h, read 2026-10-15). A browser cannot set the User-Agent header that
// the API docs ask for; it sends its own.

const BASE = 'https://api.weather.gov';
const POINTS_MS = 24 * 3600e3;
const GRID_MS = 3600e3;
const KEY = 'spacejellyfish.nws.v1.';
const PARALLEL = 4;

const load = (key, maxAgeMs) => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY + key));
    return v && Date.now() - v.at < maxAgeMs ? v.data : undefined;
  } catch {
    return undefined;
  }
};
const save = (key, data) => {
  try {
    localStorage.setItem(KEY + key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Storage can be off or full. The page still works without it.
  }
};

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/geo+json' } });
  if (!res.ok) throw new Error(`api.weather.gov answered ${res.status}`);
  return res.json();
}

/** The grid forecast URL for a place, or null where the API gives no grid (far offshore). */
async function gridUrl(latitudeDeg, longitudeDeg) {
  const key = `p:${latitudeDeg.toFixed(4)},${longitudeDeg.toFixed(4)}`;
  const cached = load(key, POINTS_MS);
  if (cached !== undefined) return cached;
  const body = await getJson(`${BASE}/points/${latitudeDeg.toFixed(4)},${longitudeDeg.toFixed(4)}`);
  const url = body.properties?.forecastGridData ?? null;
  save(key, url);
  return url;
}

/** The skyCover values of one grid forecast, as given by the API. */
async function skyCoverSeries(url) {
  const key = `g:${url}`;
  const cached = load(key, GRID_MS);
  if (cached !== undefined) return cached;
  const body = await getJson(url);
  const values = body.properties?.skyCover?.values ?? [];
  save(key, values);
  return values;
}

/**
 * skyCover values for one place. Returns { values } or { values: null,
 * reason } when the place has no grid or a request failed.
 */
export async function skyCoverAt({ latitudeDeg, longitudeDeg }) {
  try {
    const url = await gridUrl(latitudeDeg, longitudeDeg);
    if (!url) return { values: null, reason: 'no forecast grid here' };
    return { values: await skyCoverSeries(url) };
  } catch (error) {
    return { values: null, reason: error.message };
  }
}

/** skyCoverAt for many places, a few at a time. onProgress(done, total). */
export async function skyCoverMany(places, onProgress = () => {}) {
  const out = new Array(places.length);
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < places.length) {
      const i = next++;
      out[i] = await skyCoverAt(places[i]);
      onProgress(++done, places.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(PARALLEL, places.length) }, worker));
  return out;
}
