// Pure functions for the cloud forecast test: parse airport reports and
// Open-Meteo answers, line them up by hour, and score them. No network.
// Method and sources: clouds/README.md.

import { sunDirectionEcef } from '../../engine/sun.js';
import { directionAngles } from '../../engine/geo.js';

/**
 * Sky cover in percent for one METAR cover code: the middle of its range
 * in eighths. FEW is 1 to 2 eighths, SCT 3 to 4, BKN 5 to 7, OVC 8 (NWS
 * TAF training, lesson 3). CLR and SKC are no cloud. VV (sky hidden by
 * fog or the like) counts as covered. Returns null for a code we do not
 * know, so it is never read as clear.
 */
export const COVER_PCT = { SKC: 0, CLR: 0, NCD: 0, NSC: 0, FEW: 18.75, SCT: 43.75, BKN: 75, OVC: 100, VV: 100 };

/** ASOS reports sky condition only up to 12,000 ft (NWS CL31 implementation plan, 2008). */
export const ASOS_LIMIT_FT = 12000;

/**
 * Parse an Iowa Environmental Mesonet ASOS CSV with columns station, valid,
 * skyc1..skyc4 and skyl1..skyl4 ('M' for missing, heights in feet).
 * Returns one entry per report: { timeMs, layers: [{ code, baseFt }] }.
 * A report with no cover code at all is dropped.
 */
export function parseIemCsv(text) {
  const lines = text.trim().split('\n');
  const head = lines[0].split(',');
  const col = (name) => head.indexOf(name);
  const iValid = col('valid');
  const reports = [];
  for (const line of lines.slice(1)) {
    const f = line.split(',');
    const layers = [];
    for (let k = 1; k <= 4; k++) {
      const code = f[col(`skyc${k}`)];
      if (!code || code === 'M' || code.trim() === '') continue;
      const base = f[col(`skyl${k}`)];
      layers.push({ code: code.trim(), baseFt: base && base !== 'M' ? Number(base) : null });
    }
    if (layers.length === 0) continue;
    reports.push({ timeMs: Date.parse(f[iValid].replace(' ', 'T') + ':00Z'), layers });
  }
  return reports;
}

/**
 * Sky cover of one report, in percent: the largest cover of any layer.
 * belowFt limits the layers to bases at or below that height (a layer with
 * no base, such as CLR, always counts). Returns null if a layer code is
 * unknown.
 */
export function reportCoverPct(layers, belowFt = Infinity) {
  let cover = 0;
  for (const { code, baseFt } of layers) {
    if (!(code in COVER_PCT)) return null;
    if (baseFt != null && baseFt > belowFt) continue;
    cover = Math.max(cover, COVER_PCT[code]);
  }
  return cover;
}

/** The top of the highest layer base in a report, in feet, or null. */
export const highestBaseFt = (layers) => {
  const bases = layers.map((l) => l.baseFt).filter((b) => b != null);
  return bases.length ? Math.max(...bases) : null;
};

/**
 * Map reports to whole UTC hours: a report belongs to the nearest hour
 * (a report at 10:56 is the 11:00 hour). When two reports fall on one
 * hour, the one nearest to it is kept. Returns Map(hourMs -> report).
 */
export function reportsByHour(reports) {
  const byHour = new Map();
  for (const r of reports) {
    const hourMs = Math.round(r.timeMs / 3600e3) * 3600e3;
    const prev = byHour.get(hourMs);
    if (!prev || Math.abs(r.timeMs - hourMs) < Math.abs(prev.timeMs - hourMs)) byHour.set(hourMs, r);
  }
  return byHour;
}

/**
 * Read the hourly series of an Open-Meteo answer. Times are ISO strings in
 * GMT ('2025-06-01T10:00'). Returns Map(variableName -> Map(hourMs -> value)),
 * nulls left out.
 */
export function openMeteoSeries(json) {
  const times = json.hourly.time.map((t) => Date.parse(t + ':00Z'));
  const out = new Map();
  for (const [name, values] of Object.entries(json.hourly)) {
    if (name === 'time') continue;
    const m = new Map();
    values.forEach((v, i) => { if (v != null) m.set(times[i], v); });
    out.set(name, m);
  }
  return out;
}

/** Sun elevation in degrees at a place and time (engine/sun.js, engine/geo.js). */
export function sunElevationDeg(place, timeMs) {
  return directionAngles({ ...place, heightM: 0 }, sunDirectionEcef(timeMs)).elevationDeg;
}

/**
 * Scores for forecast/observed pairs of sky cover in percent.
 * cloudyPct sets the cloudy class (at or above it).
 *   n            pairs
 *   mae          mean absolute difference, percentage points
 *   maeClear     the same for a forecast of 0 percent every hour
 *   cloudy       observed cloudy hours
 *   hitRate      share of observed cloudy hours forecast cloudy
 *   falseRate    share of observed clear hours forecast cloudy
 *   skill        hitRate - falseRate (0 for no skill, 1 for perfect)
 */
export function score(pairs, cloudyPct) {
  const n = pairs.length;
  if (n === 0) return { n: 0 };
  let ae = 0, aeClear = 0, cloudy = 0, hits = 0, clear = 0, falses = 0;
  for (const [f, o] of pairs) {
    ae += Math.abs(f - o);
    aeClear += Math.abs(o);
    if (o >= cloudyPct) { cloudy++; if (f >= cloudyPct) hits++; } else { clear++; if (f >= cloudyPct) falses++; }
  }
  const hitRate = cloudy ? hits / cloudy : null;
  const falseRate = clear ? falses / clear : null;
  return {
    n, mae: ae / n, maeClear: aeClear / n, cloudy, hitRate, falseRate,
    skill: hitRate != null && falseRate != null ? hitRate - falseRate : null,
  };
}
