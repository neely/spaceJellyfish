// Sun position for a UTC instant. Pure: no DOM, no network, no clock.
//
// Formulas are the USNO approximate solar coordinates and sidereal time
// algorithms, distilled in reference/usno-sun-and-sidereal-time.md. Stated
// accuracy is about 1 arcminute. Do not change a constant here without
// changing that file and re-running the fixture tests.

const RAD = Math.PI / 180;
const J2000 = 2451545.0;
const UNIX_EPOCH_JD = 2440587.5;
const MS_PER_DAY = 86400000;

const mod = (x, n) => ((x % n) + n) % n;

/** Julian date (UT) of a Date or a Unix time in milliseconds. */
export function julianDate(date) {
  return Number(date) / MS_PER_DAY + UNIX_EPOCH_JD;
}

/** Apparent geocentric coordinates of the Sun. Angles in degrees. */
export function sunCoordinates(date) {
  const d = julianDate(date) - J2000;
  const g = mod(357.529 + 0.98560028 * d, 360) * RAD;
  const q = mod(280.459 + 0.98564736 * d, 360);
  const lambda = mod(q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g), 360) * RAD;
  const distanceAu = 1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g);
  const e = (23.439 - 0.00000036 * d) * RAD;
  const rightAscensionDeg = mod(
    Math.atan2(Math.cos(e) * Math.sin(lambda), Math.cos(lambda)) / RAD,
    360,
  );
  const declinationDeg = Math.asin(Math.sin(e) * Math.sin(lambda)) / RAD;
  return { rightAscensionDeg, declinationDeg, distanceAu };
}

/** Greenwich mean sidereal time, in hours. */
export function gmstHours(date) {
  const jd = julianDate(date);
  const jd0 = Math.floor(jd - 0.5) + 0.5;
  const h = (jd - jd0) * 24;
  const dut = jd0 - J2000;
  const t = (jd - J2000) / 36525;
  return mod(6.697375 + 0.065709824279 * dut + 1.0027379 * h + 0.0000258 * t * t, 24);
}

/** Greenwich hour angle and declination of the Sun, in degrees. */
export function sunGhaDec(date) {
  const { rightAscensionDeg, declinationDeg } = sunCoordinates(date);
  const ghaDeg = mod(gmstHours(date) * 15 - rightAscensionDeg, 360);
  return { ghaDeg, declinationDeg };
}

/**
 * Unit vector from the Earth's centre toward the Sun, in Earth-fixed (ECEF)
 * axes: x through 0 N 0 E, z through the north pole.
 */
export function sunDirectionEcef(date) {
  const { ghaDeg, declinationDeg } = sunGhaDec(date);
  const lon = -ghaDeg * RAD;
  const dec = declinationDeg * RAD;
  return [Math.cos(dec) * Math.cos(lon), Math.cos(dec) * Math.sin(lon), Math.sin(dec)];
}
