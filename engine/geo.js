// Earth geometry: geodetic to Earth-fixed coordinates, and the look angles
// from an observer to a point or a direction. Pure: no DOM, no network.
//
// Angles are geometric. No atmospheric refraction is applied.

const RAD = Math.PI / 180;

// WGS 84 ellipsoid. test/geo.test.js checks these against NOAA NGS
// conversions (GRS 80, which differs from WGS 84 by less than 1 mm).
export const WGS84_A_M = 6378137;
export const WGS84_F = 1 / 298.257223563;
const E2 = WGS84_F * (2 - WGS84_F);
const WGS84_B_M = WGS84_A_M * (1 - WGS84_F);

/** Mean radius of the ellipsoid, (2a + b) / 3, in metres. */
export const MEAN_RADIUS_M = (2 * WGS84_A_M + WGS84_B_M) / 3;

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mod = (x, n) => ((x % n) + n) % n;

/** ECEF [x, y, z] in metres of a point { latitudeDeg, longitudeDeg, heightM }. */
export function geodeticToEcef({ latitudeDeg, longitudeDeg, heightM = 0 }) {
  const lat = latitudeDeg * RAD;
  const lon = longitudeDeg * RAD;
  const n = WGS84_A_M / Math.sqrt(1 - E2 * Math.sin(lat) ** 2);
  return [
    (n + heightM) * Math.cos(lat) * Math.cos(lon),
    (n + heightM) * Math.cos(lat) * Math.sin(lon),
    (n * (1 - E2) + heightM) * Math.sin(lat),
  ];
}

// Local east, north, up unit vectors at a geodetic position, in ECEF axes.
function enuBasis({ latitudeDeg, longitudeDeg }) {
  const lat = latitudeDeg * RAD;
  const lon = longitudeDeg * RAD;
  return {
    east: [-Math.sin(lon), Math.cos(lon), 0],
    north: [-Math.sin(lat) * Math.cos(lon), -Math.sin(lat) * Math.sin(lon), Math.cos(lat)],
    up: [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)],
  };
}

/**
 * Elevation above the observer's horizon and azimuth (degrees clockwise
 * from true north) of a direction given as an ECEF vector. Use this for the
 * Sun, which is far enough away that its direction is the same from the
 * Earth's centre and from the observer.
 */
export function directionAngles(observer, directionEcef) {
  const { east, north, up } = enuBasis(observer);
  const length = Math.hypot(...directionEcef);
  const e = dot(directionEcef, east);
  const n = dot(directionEcef, north);
  const u = dot(directionEcef, up);
  return {
    // Clamp: rounding can push the ratio just past 1 for a point overhead.
    elevationDeg: Math.asin(Math.max(-1, Math.min(1, u / length))) / RAD,
    azimuthDeg: mod(Math.atan2(e, n) / RAD, 360),
  };
}

/** Elevation, azimuth and straight-line range from an observer to a geodetic point. */
export function lookAngles(observer, target) {
  const line = sub(geodeticToEcef(target), geodeticToEcef(observer));
  return { ...directionAngles(observer, line), rangeM: Math.hypot(...line) };
}

/**
 * Distance along the surface between two points, in metres, on a sphere of
 * the mean radius. Good to about 0.5 percent; heights are ignored.
 */
export function surfaceDistanceM(a, b) {
  const lat1 = a.latitudeDeg * RAD;
  const lat2 = b.latitudeDeg * RAD;
  const dLat = lat2 - lat1;
  const dLon = (b.longitudeDeg - a.longitudeDeg) * RAD;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * MEAN_RADIUS_M * Math.asin(Math.sqrt(h));
}
