// Is the rocket lit by the Sun, and can the observer see it against a dark
// sky? Pure: no DOM, no network, no clock.
//
// Every threshold is a parameter. The values in use are in
// config/visibility.json, each with its source. This file holds no
// threshold of its own.

import { MEAN_RADIUS_M, directionAngles, geodeticToEcef, lookAngles } from './geo.js';
import { sunDirectionEcef } from './sun.js';
import { launchAzimuthsDeg, rocketPosition } from './trajectory.js';

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * True when a point is in sunlight. The Earth's shadow is taken as a
 * cylinder along the anti-Sun direction. Its radius is the mean Earth radius
 * plus `screeningHeightM`: sunlight that passes lower than that through the
 * atmosphere is treated as blocked. The Sun is treated as a point at
 * infinity, so there is no penumbra.
 */
export function isSunlit(position, sunDirection, screeningHeightM) {
  const r = geodeticToEcef(position);
  const along = dot(r, sunDirection);
  if (along >= 0) return true;
  const perpSquared = dot(r, r) - along * along;
  const shadowRadius = MEAN_RADIUS_M + screeningHeightM;
  return perpSquared > shadowRadius * shadowRadius;
}

/**
 * Lowest height, in metres above the mean sphere, at which a point straight
 * above the observer is sunlit. Returns 0 when the Sun is up.
 */
export function shadowHeightAboveM(observer, sunDirection, screeningHeightM) {
  const { elevationDeg } = directionAngles(observer, sunDirection);
  if (elevationDeg >= 0) return 0;
  const shadowRadius = MEAN_RADIUS_M + screeningHeightM;
  return shadowRadius / Math.cos((elevationDeg * Math.PI) / 180) - MEAN_RADIUS_M;
}

/**
 * One possible flight: a profile member flown on one launch azimuth.
 * Returns a sample every `stepS` seconds and a summary of the part that the
 * observer can see as a sunlit object in a dark sky.
 *
 * params:
 *   screeningHeightM     see isSunlit
 *   maxSunElevationDeg   the sky is dark enough when the Sun is at or below this
 *   minElevationDeg      the rocket must be at or above this to clear the horizon
 *   minAltitudeM         the rocket must be at or above this height to count
 */
export function evaluateTrack({ liftoff, pad, observer, member, azimuthDeg, params, stepS = 10 }) {
  const t0 = Number(liftoff);
  const endS = member.points[member.points.length - 1][0];
  const samples = [];
  for (let tS = 0; tS <= endS; tS += stepS) {
    const position = rocketPosition(pad, azimuthDeg, member, tS);
    const sun = sunDirectionEcef(t0 + tS * 1000);
    const look = lookAngles(observer, position);
    const sunElevationDeg = directionAngles(observer, sun).elevationDeg;
    const sunlit = isSunlit(position, sun, params.screeningHeightM);
    const visible =
      sunlit &&
      sunElevationDeg <= params.maxSunElevationDeg &&
      look.elevationDeg >= params.minElevationDeg &&
      position.heightM >= params.minAltitudeM;
    samples.push({
      tS,
      heightM: position.heightM,
      elevationDeg: look.elevationDeg,
      bearingDeg: look.azimuthDeg,
      rangeM: look.rangeM,
      sunElevationDeg,
      sunlit,
      visible,
    });
  }

  const seen = samples.filter((s) => s.visible);
  const summary = { azimuthDeg, visibleS: seen.length * stepS };
  if (seen.length > 0) {
    const peak = seen.reduce((a, b) => (b.elevationDeg > a.elevationDeg ? b : a));
    summary.firstVisibleS = seen[0].tS;
    summary.lastVisibleS = seen[seen.length - 1].tS;
    summary.peakElevationDeg = peak.elevationDeg;
    summary.peakBearingDeg = peak.bearingDeg;
    summary.firstBearingDeg = seen[0].bearingDeg;
    summary.lastBearingDeg = seen[seen.length - 1].bearingDeg;
    summary.sunElevationDeg = peak.sunElevationDeg;
  }
  return { summary, samples };
}

/**
 * All the possible flights of one launch: every member of the profile on
 * every azimuth of the trajectory class that fits the launch orbit.
 *
 * launch: { net, orbit, vehicle, programs, pad: { latitudeDeg, longitudeDeg } }
 * `programs` is optional: the LL2 program names of the launch.
 * config: the contents of config/visibility.json
 * profiles: the contents of config/profiles.json
 *
 * Returns the track summaries and one verdict:
 *   'no'        no track has a visible part of at least config.minVisibleS
 *   'possible'  some tracks do, but not all
 *   'likely'    every track does
 * `prime` is true when the Sun is at or below config.primeSunElevationDeg
 * at the peak of at least one visible track.
 */
export function evaluateLaunch({ launch, observer, profiles, config, withSamples = false }) {
  const { trajectories } = config;
  const toStation = (launch.programs ?? []).some((p) => trajectories.iss.programs.includes(p));
  const kind = toStation ? 'iss' : trajectories.east.orbits.includes(launch.orbit) ? 'east' : 'fan';
  const { profile } = trajectories[kind];
  const pad = { ...launch.pad, heightM: 0 };
  // A station launch from Florida goes northeast on the azimuth that its
  // inclination gives. The other classes list their azimuths.
  const azimuthsDeg =
    kind === 'iss'
      ? [launchAzimuthsDeg(trajectories.iss.inclinationDeg, pad.latitudeDeg).northeastDeg]
      : trajectories[kind].azimuthsDeg;
  const liftoff = new Date(launch.net);

  const tracks = [];
  for (const name of profiles.profiles[profile]) {
    for (const azimuthDeg of azimuthsDeg) {
      const { summary, samples } = evaluateTrack({
        liftoff,
        pad,
        observer,
        member: profiles.members[name],
        azimuthDeg,
        params: config.params,
        stepS: profiles.stepS,
      });
      tracks.push({ member: name, ...summary, ...(withSamples ? { samples } : {}) });
    }
  }

  const seen = tracks.filter((t) => t.visibleS >= config.minVisibleS);
  const verdict = seen.length === 0 ? 'no' : seen.length === tracks.length ? 'likely' : 'possible';
  const result = { verdict, trajectory: kind, tracks, visibleTracks: seen.length };
  if (seen.length > 0) {
    const of = (key) => seen.map((t) => t[key]);
    result.prime = Math.min(...of('sunElevationDeg')) <= config.primeSunElevationDeg;
    result.sunElevationDeg = Math.min(...of('sunElevationDeg'));
    result.peakElevationDeg = { min: Math.min(...of('peakElevationDeg')), max: Math.max(...of('peakElevationDeg')) };
    result.peakBearingDeg = { min: Math.min(...of('peakBearingDeg')), max: Math.max(...of('peakBearingDeg')) };
    result.firstVisibleS = Math.min(...of('firstVisibleS'));
    result.lastVisibleS = Math.max(...of('lastVisibleS'));
    result.visibleS = { min: Math.min(...of('visibleS')), max: Math.max(...of('visibleS')) };
  }
  // Direction is known for the station and due-east classes, and the
  // profiles are Falcon 9 flights.
  const falcon = /^Falcon/.test(launch.vehicle ?? '');
  result.confidence = kind !== 'fan' && falcon ? 'medium' : 'low';
  return result;
}
