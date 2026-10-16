// Weather modifier inputs. Pure: no DOM, no network.
//
// Only cloud under the line of sight from the observer to the sunlit rocket
// can block the view. The sight line climbs as it goes out, so the cloud
// that matters is near the observer. This module gives:
//   1. the ground points along the sight lines where cloud can block the
//      view (directional points), and
//   2. the sky cover at a time from an api.weather.gov skyCover series.
// It does not combine local and directional sky cover into one score. No
// source gives the weights (PLAN, Open questions). Decision: FINDINGS,
// "Weather: local and directional sky cover".
//
// Geometry is on a sphere of the mean radius with no refraction, as in
// engine/geo.js surfaceDistanceM.

import { MEAN_RADIUS_M as R } from './geo.js';
import { destinationPoint } from './trajectory.js';

const RAD = Math.PI / 180;

/**
 * Ground distance from the observer (at sea level) to the point under the
 * place where a sight line at `elevationDeg` reaches `heightM`.
 * From (R + H)^2 = R^2 + s^2 + 2 R s sin(E) for slant range s, then the
 * central angle asin(s cos(E) / (R + H)).
 */
export function sightLineGroundDistanceM(elevationDeg, heightM) {
  const e = elevationDeg * RAD;
  const s = -R * Math.sin(e) + Math.sqrt(R * R * Math.sin(e) ** 2 + 2 * R * heightM + heightM * heightM);
  return R * Math.asin((s * Math.cos(e)) / (R + heightM));
}

/**
 * Ground distance from the observer to the point under the rocket, from one
 * engine sample (rangeM, elevationDeg, heightM). Same sphere as above.
 */
export function subRocketGroundDistanceM({ rangeM, elevationDeg, heightM }) {
  return R * Math.asin((rangeM * Math.cos(elevationDeg * RAD)) / (R + heightM));
}

/**
 * The ground points where cloud can block the view of a launch.
 *
 * tracks: engine tracks with samples (evaluateLaunch withSamples: true).
 * params (config/weather.json):
 *   cloudTopM        a sight line above this height cannot be blocked
 *   topArcFraction   use only the visible samples of a track at or above
 *                    this fraction of that track's highest visible
 *                    elevation (the top of the arc)
 *   maxReachM        no point lies farther than this from the observer
 *   bearingStepDeg   visible bearings are grouped in bins of this width
 *   spacingM         distance between points along one bearing
 *
 * For each bin of bearing, the reach is the largest distance over the
 * top-arc samples in that bin of min(sight line reaches cloudTopM, point
 * under the rocket, maxReachM). No point lies beyond the reach. The
 * observer point itself is not included; it is the local value.
 *
 * Returns { rays: [{ bearingDeg, reachM, minElevationDeg }],
 *           points: [{ bearingDeg, distanceM, latitudeDeg, longitudeDeg }] }.
 * Both are empty when no sample is visible.
 */
export function directionalPoints({ observer, tracks, params }) {
  const { cloudTopM, topArcFraction, maxReachM, bearingStepDeg, spacingM } = params;
  const bins = new Map();
  for (const track of tracks) {
    const visible = (track.samples ?? []).filter((s) => s.visible);
    if (visible.length === 0) continue;
    const peakDeg = Math.max(...visible.map((s) => s.elevationDeg));
    for (const s of visible) {
      if (s.elevationDeg < topArcFraction * peakDeg) continue;
      const reachM = Math.min(
        sightLineGroundDistanceM(s.elevationDeg, cloudTopM),
        subRocketGroundDistanceM(s),
        maxReachM,
      );
      const bin = Math.round(s.bearingDeg / bearingStepDeg) % Math.round(360 / bearingStepDeg);
      const prev = bins.get(bin);
      if (!prev) bins.set(bin, { reachM, minElevationDeg: s.elevationDeg });
      else {
        prev.reachM = Math.max(prev.reachM, reachM);
        prev.minElevationDeg = Math.min(prev.minElevationDeg, s.elevationDeg);
      }
    }
  }
  const rays = [...bins.entries()]
    .map(([bin, v]) => ({ bearingDeg: bin * bearingStepDeg, ...v }))
    .sort((a, b) => a.bearingDeg - b.bearingDeg);
  const points = [];
  for (const ray of rays) {
    for (let d = spacingM; d <= ray.reachM + 1e-6; d += spacingM) {
      points.push({ bearingDeg: ray.bearingDeg, distanceM: d, ...destinationPoint(observer, ray.bearingDeg, d) });
    }
    // A short ray still gets one point at its reach.
    if (ray.reachM < spacingM) {
      points.push({ bearingDeg: ray.bearingDeg, distanceM: ray.reachM, ...destinationPoint(observer, ray.bearingDeg, ray.reachM) });
    }
  }
  return { rays, points };
}

/** Length of an ISO 8601 duration of the form PnDTnHnM, in milliseconds. */
export function isoDurationMs(text) {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/.exec(text);
  if (!m || text === 'P' || text.endsWith('T')) throw new Error(`Unsupported ISO 8601 duration: ${text}`);
  const [, d = 0, h = 0, min = 0] = m.map((x) => (x === undefined ? undefined : Number(x)));
  return ((Number(d) * 24 + Number(h)) * 60 + Number(min)) * 60e3;
}

/**
 * The value of an api.weather.gov grid layer (for example skyCover) at a
 * time. values: [{ validTime: 'start/duration', value }]. The interval
 * includes its start and excludes its end. Returns null when no interval
 * covers the time or the value is null.
 */
export function layerValueAt(values, timeMs) {
  for (const { validTime, value } of values ?? []) {
    const [start, duration] = validTime.split('/');
    const t0 = Date.parse(start);
    if (timeMs >= t0 && timeMs < t0 + isoDurationMs(duration)) return value ?? null;
  }
  return null;
}

/**
 * Local and directional sky cover for one launch, without a combined score.
 * local: percent or null. directional: array of percent or null, one per
 * directional point. Returns the raw values the page shows.
 */
export function skySummary({ local, directional }) {
  const known = directional.filter((v) => v != null);
  return {
    localPct: local ?? null,
    directional: {
      points: directional.length,
      missing: directional.length - known.length,
      maxPct: known.length ? Math.max(...known) : null,
      meanPct: known.length ? known.reduce((a, b) => a + b, 0) / known.length : null,
    },
  };
}
