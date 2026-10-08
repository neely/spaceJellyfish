// Rocket position against time. Pure: no DOM, no network.
//
// The model is simple on purpose. The rocket flies along one great circle
// from the pad at a fixed launch azimuth. An ascent profile member gives its
// altitude and its downrange distance against time since liftoff. See
// config/profiles.json for the profile data and its source.
//
// Not modelled: the turn of the ground track caused by Earth rotation, any
// dogleg, and anything after the end of the profile (about second-stage
// cutoff).

import { MEAN_RADIUS_M } from './geo.js';

const RAD = Math.PI / 180;
const mod = (x, n) => ((x % n) + n) % n;

/**
 * The point reached from `start` after `distanceM` along the surface on an
 * initial azimuth (degrees clockwise from true north), on a sphere of the
 * mean radius.
 */
export function destinationPoint(start, azimuthDeg, distanceM) {
  const lat1 = start.latitudeDeg * RAD;
  const lon1 = start.longitudeDeg * RAD;
  const az = azimuthDeg * RAD;
  const d = distanceM / MEAN_RADIUS_M;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(az),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(az) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
    );
  return { latitudeDeg: lat2 / RAD, longitudeDeg: mod(lon2 / RAD + 180, 360) - 180 };
}

/**
 * The two launch azimuths that put a great circle from the pad at a given
 * orbit inclination: one to the northeast and one to the southeast. This is
 * the spherical relation sin(azimuth) = cos(inclination) / cos(latitude).
 * An inclination at or below the pad latitude cannot be reached directly;
 * both azimuths are then due east (90 degrees).
 */
export function launchAzimuthsDeg(inclinationDeg, padLatitudeDeg) {
  const ratio = Math.cos(inclinationDeg * RAD) / Math.cos(padLatitudeDeg * RAD);
  if (ratio >= 1) return { northeastDeg: 90, southeastDeg: 90 };
  const northeastDeg = Math.asin(ratio) / RAD;
  return { northeastDeg, southeastDeg: 180 - northeastDeg };
}

/**
 * Altitude and downrange distance of a profile member at `tS` seconds after
 * liftoff, by linear interpolation. Returns null outside the member's data.
 */
export function profilePointAt(member, tS) {
  const pts = member.points;
  if (tS < pts[0][0] || tS > pts[pts.length - 1][0]) return null;
  let i = 1;
  while (pts[i][0] < tS) i++;
  const [t0, alt0, dr0] = pts[i - 1];
  const [t1, alt1, dr1] = pts[i];
  const f = t1 === t0 ? 0 : (tS - t0) / (t1 - t0);
  return {
    altitudeKm: alt0 + f * (alt1 - alt0),
    downrangeKm: dr0 + f * (dr1 - dr0),
  };
}

/**
 * Geodetic position { latitudeDeg, longitudeDeg, heightM } of the rocket at
 * `tS` seconds after liftoff. Returns null outside the member's data.
 */
export function rocketPosition(pad, azimuthDeg, member, tS) {
  const point = profilePointAt(member, tS);
  if (!point) return null;
  // The telemetry has small negative downrange values near liftoff.
  const downrangeM = Math.max(0, point.downrangeKm) * 1000;
  return {
    ...destinationPoint(pad, azimuthDeg, downrangeM),
    heightM: point.altitudeKm * 1000,
  };
}
