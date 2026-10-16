// Cloud forecasts from Open-Meteo, asked from the browser. Which models and
// why: clouds/README.md (the cloud forecast test). Access facts:
// reference/data-sources.md.
//
// One request covers every place: Open-Meteo takes comma-separated
// latitudes and longitudes and answers with one object per place. Answers
// are kept in localStorage for an hour. Open-Meteo is free for
// non-commercial use and its data is CC BY 4.0; the page credits it.

const BASE = 'https://api.open-meteo.com/v1/forecast';
const KEEP_MS = 3600e3;
const KEY = 'spacejellyfish.openmeteo.v1.';

/** The request URL for one model and one hourly variable at many places. */
export function forecastUrl({ places, model, variable, days }) {
  const lat = places.map((p) => p.latitudeDeg.toFixed(4)).join(',');
  const lon = places.map((p) => p.longitudeDeg.toFixed(4)).join(',');
  return `${BASE}?latitude=${lat}&longitude=${lon}&hourly=${variable}&models=${model}` +
    `&forecast_days=${days}&timezone=GMT&cell_selection=nearest`;
}

/**
 * The value of `variable` nearest to `timeMs` (to the nearest whole hour)
 * for each place, from an Open-Meteo answer (one object, or an array with
 * one object per place). null where the model has no value for that hour.
 */
export function valuesAt(answer, variable, timeMs) {
  const hourMs = Math.round(timeMs / 3600e3) * 3600e3;
  return [].concat(answer).map((place) => {
    const i = place.hourly?.time?.findIndex((t) => Date.parse(t + ':00Z') === hourMs) ?? -1;
    const v = i >= 0 ? place.hourly[variable]?.[i] : null;
    return v ?? null;
  });
}

/** Fetch with a one-hour cache in localStorage. Throws on an error answer. */
export async function fetchForecast(url) {
  try {
    const kept = JSON.parse(localStorage.getItem(KEY + url));
    if (kept && Date.now() - kept.at < KEEP_MS) return kept.data;
  } catch { /* storage off: fetch */ }
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.reason ?? `Open-Meteo answered ${res.status}`);
  try {
    localStorage.setItem(KEY + url, JSON.stringify({ at: Date.now(), data }));
  } catch { /* storage full or off */ }
  return data;
}
