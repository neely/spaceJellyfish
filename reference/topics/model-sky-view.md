---
key: topics/model-sky-view
title: "How our model works: the camera sky view"
type: topic-note
sources_summary: "Documents our own code as of 2026-10-12: sky.js, lib/skyproject.js, config/skyview.json, test/skyproject.test.js. Browser API behaviour comes from the W3C DeviceOrientation spec frames as used in the code and from tests on Ben's iPhone (Safari) on 2026-10-12; claims not tested on a device are marked unverified."
distilled: 2026-10-12
topics: [sky-view, geodesy, visibility]
relevance: medium
answers: "How does sky.html turn the phone's orientation into camera axes, project a sky direction (azimuth, elevation) onto the screen, correct the compass, and set the field of view, and what is verified on a real phone?"
key_points:
  - "Device to earth: R = Rz(alpha) Rx(beta) Ry(gamma); earth x east, y north, z up; back camera looks along device -z."
  - "Screen point = centre + f * (d.right, -d.up) / (d.forward); f comes from the long-side field of view of the video."
  - "iOS alpha has no fixed reference; webkitCompassHeading plus declination sets a heading correction, smoothed with gain 0.08 per event."
  - "Sun calibration stores the total compass error in localStorage; field of view is a user setting, default 70 degrees from one iPhone test."
  - "Verified 2026-10-12 on one iPhone: drawn Sun on the real Sun at azimuth 172, elevation 49."
related_papers: []
---

# How our model works: the camera sky view

The sky view is an add-on page. It reuses the engine without change:
`evaluateLaunch(..., withSamples: true)` gives each track's samples with
`bearingDeg`, `elevationDeg` and `visible`. The page only draws them. All
math is in `lib/skyproject.js`, which is pure and tested in
`test/skyproject.test.js`.

## Frames

- Earth frame: x east, y north, z up.
- Device frame (W3C DeviceOrientation): x to the right of the screen, y to
  the top of the screen, z out of the screen toward the viewer.
- Rotation device to earth: R = Rz(alpha) · Rx(beta) · Ry(gamma). Alpha turns
  counter-clockwise seen from above, so a larger alpha means a smaller
  azimuth. Check in the tests: alpha 0, beta 90 looks north at the horizon;
  alpha 90 looks west; beta 120 looks 30 degrees up.
- Camera axes in earth frame: forward = R·(0,0,-1). For a screen rotation t
  (0 portrait, 90 when the top of the phone points left): right =
  R·(cos t, -sin t, 0), up = R·(sin t, cos t, 0).

## Projection

A sky direction is the unit vector d = (cos el · sin az, cos el · cos az,
sin el). With z = d·forward, the screen point is
x = cx + f·(d·right)/z, y = cy − f·(d·up)/z. Points with z ≤ 0.02 are behind
the camera and are not drawn. This is a pinhole model; lens distortion is
ignored.

f is the focal length in screen pixels. The video is shown with
`object-fit: cover`, so scale = max(screenW/videoW, screenH/videoH), and
f = (long side of the video · scale) / 2 / tan(fovLong / 2). The centre of
the screen does not depend on f, so a wrong field of view moves only
off-centre points.

## Heading (compass)

- iOS Safari: `alpha` has an arbitrary reference. `webkitCompassHeading` is
  a magnetic heading. The code takes it as the heading of whichever device
  axis is closer to level: the camera axis when the phone is held up, the
  top edge when it lies flat (unverified for flat use; held up it agreed
  with the Sun on 2026-10-12).
- Correction = (compass heading + declination) − raw azimuth of that axis.
  It is updated only while the phone is level in portrait (roll under 5
  degrees), because the iOS heading slides with roll (FINDINGS, 2026-10-15).
  Note: at beta 90 the W3C Euler angles are gimbal-locked; a sideways roll of
  an upright phone shows as beta = 90 - r, gamma = -90, not as gamma = r.
  It is added to every azimuth. Gyro alpha gives fast motion; the
  correction follows the compass slowly (gain 0.02 per event).
- Android: listens for `deviceorientationabsolute` and then ignores plain
  `deviceorientation`. Not tested on a device.
- Declination −8 degrees in `config/skyview.json` is not verified.
- Sun calibration: the user puts the Sun in the centre circle and taps. The
  page adds angleDiff(sun azimuth, camera azimuth) to a stored compass
  error. The stored error covers declination error, compass error near
  metal, and any heading-axis mistake. The ◀ ▶ buttons change it by 1
  degree.
- Permissions: iOS needs `DeviceOrientationEvent.requestPermission()` and
  `getUserMedia` called from one tap, over HTTPS. The page asks for both in
  the Start tap.

## Field of view

The browser camera API gives resolution but no focal length or field of
view. A photo's EXIF gives a 35 mm equivalent focal length, but the video
stream is cropped differently, so it is not used. The field of view is a
setting (default 70, long side). On 2026-10-12, 65 put the drawn Sun about
20 percent too far from the centre near the screen edge; 70 kept it on the
Sun.

Idea, not built: measure the field of view from the Sun. Calibrate with
the Sun at the centre, then turn until the Sun is at a marker near the
edge and tap. The sensors give the angle turned; the screen gives the pixel
distance; f = pixels / tan(angle).

## Field test 2026-10-12 (Ben, iPhone, Safari, James Island)

- 12:46 EDT: engine Sun azimuth 172.3, elevation 49.4. Page with the Sun
  in the centre: "Facing 172° S, 49° up", drawn Sun on the real Sun.
- Tilt agreed without calibration. Sun calibration was tapped; the stored
  compass error was -3.4 degrees (raw compass plus -8 declination read 3.4
  degrees too far clockwise). Uncalibrated, the drawn path would be about
  3 degrees off, which matters little for checking trees.
- SpX-35 path seen over the trees: sunlit part starts at 6:36 about 12 to
  13 degrees up, above the trees; the dashed part before it is behind them.

## Instructions and launch data (2026-10-13)

- The setup steps live in one `<template id="help-steps">` in sky.html. The
  page shows it on the start screen and behind the Help button.
- Advice given there: calibrate the day before, at the watching spot, with
  a low Sun (phone held upright, as at launch); set the field of view by
  watching the Sun ring near the screen edge (ring farther out than the Sun
  means make the field of view larger).
- Calibration only corrects azimuth. A vertical gap between the ring and
  the Sun is a tilt error, which the page cannot correct.
- sky.js loads launches like the main page: the saved list if under 20
  minutes old, then LL2, then the saved list of any age, then
  data/upcoming-fallback.json.

## Not modelled

Lens distortion; refraction near the horizon; magnetic disturbance that
changes as the user walks; phone roll in the compass-axis choice when the
phone is between upright and flat.
