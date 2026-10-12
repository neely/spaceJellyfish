import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cameraAxes, project, vectorAngles, compassReferenceAzimuth, angleDiff, focalLengthPx } from '../lib/skyproject.js';

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

test('phone held up in portrait with alpha 0 looks north at the horizon', () => {
  const axes = cameraAxes({ alphaDeg: 0, betaDeg: 90, gammaDeg: 0 });
  const f = vectorAngles(axes.forward);
  near(f.azimuthDeg, 0, 1e-9);
  near(f.elevationDeg, 0, 1e-9);
  near(vectorAngles(axes.up).elevationDeg, 90, 1e-9);
  near(vectorAngles(axes.right).azimuthDeg, 90, 1e-9);
});

test('alpha turns counter-clockwise: alpha 90 looks west', () => {
  const axes = cameraAxes({ alphaDeg: 90, betaDeg: 90, gammaDeg: 0 });
  near(vectorAngles(axes.forward).azimuthDeg, 270, 1e-9);
});

test('tilting the phone back raises the view', () => {
  const axes = cameraAxes({ alphaDeg: 0, betaDeg: 120, gammaDeg: 0 });
  near(vectorAngles(axes.forward).elevationDeg, 30, 1e-9);
});

test('heading correction adds to every azimuth', () => {
  const axes = cameraAxes({ alphaDeg: 0, betaDeg: 90, gammaDeg: 0, headingCorrectionDeg: 10 });
  near(vectorAngles(axes.forward).azimuthDeg, 10, 1e-9);
  near(compassReferenceAzimuth(axes), 10, 1e-9);
});

test('landscape with the top to the left keeps screen up pointing at the sky', () => {
  const axes = cameraAxes({ alphaDeg: 0, betaDeg: 0, gammaDeg: -90, screenAngleDeg: 90 });
  near(vectorAngles(axes.up).elevationDeg, 90, 1e-9);
  near(vectorAngles(axes.forward).elevationDeg, 0, 1e-9);
});

test('projection: centre, above, right, and behind', () => {
  const axes = cameraAxes({ alphaDeg: 0, betaDeg: 90, gammaDeg: 0 });
  const f = 1000;
  const c = project(axes, 0, 0, f, 200, 400);
  near(c.x, 200, 1e-9);
  near(c.y, 400, 1e-9);
  const up = project(axes, 0, 10, f, 200, 400);
  near(up.x, 200, 1e-9);
  near(up.y, 400 - f * Math.tan((10 * Math.PI) / 180), 1e-9);
  const right = project(axes, 10, 0, f, 200, 400);
  near(right.x, 200 + f * Math.tan((10 * Math.PI) / 180), 1e-9);
  assert.equal(project(axes, 180, 0, f, 200, 400), null);
});

test('angleDiff wraps across north', () => {
  near(angleDiff(5, 355), 10);
  near(angleDiff(355, 5), -10);
});

test('focal length for a cover-fitted video', () => {
  // A 1920x1080 frame shown on a 390x844 portrait screen: the height sets
  // the scale, so the 1920 side spans 1920 * 844/1080 screen pixels.
  const fPx = focalLengthPx({ videoW: 1920, videoH: 1080, screenW: 390, screenH: 844, fovLongDeg: 60 });
  near(fPx, (1920 * (844 / 1080)) / 2 / Math.tan(Math.PI / 6), 1e-9);
});
