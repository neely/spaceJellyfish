// Pure math for the camera sky view: phone orientation to camera axes, and
// sky direction (azimuth, elevation) to a point on the screen. No DOM.
//
// Frames follow the W3C DeviceOrientation spec. Earth frame: x east, y
// north, z up. Device frame: x to the right of the screen, y to the top of
// the screen, z out of the screen toward the viewer. The rotation from
// device to earth is R = Rz(alpha) * Rx(beta) * Ry(gamma). The back camera
// looks along device -z.

const RAD = Math.PI / 180;
const mod360 = (d) => ((d % 360) + 360) % 360;

/** Rotation matrix (rows) from device frame to earth frame, angles in degrees. */
export function deviceToEarth(alphaDeg, betaDeg, gammaDeg) {
  const [a, b, g] = [alphaDeg * RAD, betaDeg * RAD, gammaDeg * RAD];
  const [ca, sa, cb, sb, cg, sg] = [Math.cos(a), Math.sin(a), Math.cos(b), Math.sin(b), Math.cos(g), Math.sin(g)];
  return [
    [ca * cg - sa * sb * sg, -sa * cb, ca * sg + sa * sb * cg],
    [sa * cg + ca * sb * sg, ca * cb, sa * sg - ca * sb * cg],
    [-cb * sg, sb, cb * cg],
  ];
}

const apply = (m, v) => m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Unit vector (east, north, up) for an azimuth clockwise from north and an elevation. */
export function skyVector(azimuthDeg, elevationDeg) {
  const az = azimuthDeg * RAD;
  const el = elevationDeg * RAD;
  return [Math.cos(el) * Math.sin(az), Math.cos(el) * Math.cos(az), Math.sin(el)];
}

/** Azimuth (clockwise from north) and elevation of an earth-frame vector. */
export function vectorAngles(v) {
  const h = Math.hypot(v[0], v[1]);
  return { azimuthDeg: mod360(Math.atan2(v[0], v[1]) / RAD), elevationDeg: Math.atan2(v[2], h) / RAD, horizontal: h };
}

/**
 * Camera axes in the earth frame. `screenAngleDeg` is the screen rotation
 * (0 portrait, 90 when the top of the phone points left). `headingCorrectionDeg`
 * turns the whole picture about the vertical: it is added to every azimuth
 * the sensors give.
 */
export function cameraAxes({ alphaDeg, betaDeg, gammaDeg, screenAngleDeg = 0, headingCorrectionDeg = 0 }) {
  const m = deviceToEarth(alphaDeg - headingCorrectionDeg, betaDeg, gammaDeg);
  // alpha turns counter-clockwise seen from above, and azimuth turns
  // clockwise, so subtracting from alpha adds to azimuth.
  const t = screenAngleDeg * RAD;
  const right = apply(m, [Math.cos(t), -Math.sin(t), 0]);
  const up = apply(m, [Math.sin(t), Math.cos(t), 0]);
  const forward = apply(m, [0, 0, -1]);
  const top = apply(m, [0, 1, 0]);
  return { right, up, forward, top };
}

/**
 * Screen position of a sky direction. `focalPx` is the focal length in
 * screen pixels; (cx, cy) is the screen centre. Returns null when the
 * direction is behind the camera.
 */
export function project(axes, azimuthDeg, elevationDeg, focalPx, cx, cy) {
  const d = skyVector(azimuthDeg, elevationDeg);
  const z = dot(d, axes.forward);
  if (z <= 0.02) return null;
  return { x: cx + (focalPx * dot(d, axes.right)) / z, y: cy - (focalPx * dot(d, axes.up)) / z };
}

/**
 * The azimuth a compass reading should be compared with. iOS gives one
 * heading; we take it as the heading of whichever device axis is closer to
 * level: the camera axis when the phone is held up, the top edge when it
 * lies flat. Returns the raw (uncorrected) azimuth of that axis.
 */
export function compassReferenceAzimuth(axes) {
  const back = vectorAngles(axes.forward);
  const top = vectorAngles(axes.top);
  return back.horizontal >= top.horizontal ? back.azimuthDeg : top.azimuthDeg;
}

/** Smallest signed difference a - b in degrees, in (-180, 180]. */
export function angleDiff(a, b) {
  const d = mod360(a - b);
  return d > 180 ? d - 360 : d;
}

/**
 * Focal length in screen pixels for a video shown with object-fit: cover.
 * `fovLongDeg` is the camera's field of view across the long side of the
 * video frame.
 */
export function focalLengthPx({ videoW, videoH, screenW, screenH, fovLongDeg }) {
  const scale = Math.max(screenW / videoW, screenH / videoH);
  const longPx = Math.max(videoW, videoH) * scale;
  return longPx / 2 / Math.tan((fovLongDeg / 2) * RAD);
}

/**
 * Side-to-side roll of the phone in portrait, in degrees: the angle of the
 * device x axis (the short edge) above the horizon. 0 when the phone is held
 * level, whether it points at the horizon or up.
 */
export function portraitRollDeg(alphaDeg, betaDeg, gammaDeg) {
  const x = deviceToEarth(alphaDeg, betaDeg, gammaDeg).map((row) => row[0]);
  return Math.asin(Math.max(-1, Math.min(1, x[2]))) / RAD;
}
