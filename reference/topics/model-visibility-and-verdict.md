---
key: topics/model-visibility-and-verdict
title: "How our model works: Earth shadow, visibility and the verdict"
type: topic-note
sources_summary: "Documents our own code as of 2026-10-08. Read: engine/visibility.js, config/visibility.json, scripts/backtest.js, test/visibility.test.js, FINDINGS.md, PLAN.md (Open questions), data/ll2-snapshot.json. The worked example and the sensitivity numbers come from read-only node commands run on 2026-10-08. No outside source was added."
distilled: 2026-10-08
topics: [visibility, illumination, twilight, plume, sun-position, sightings]
relevance: high
answers: "How does the engine decide that a rocket is sunlit and visible, how are many tracks combined into likely, possible or no, what do prime and confidence mean, and what are the known weak points?"
key_points:
  - "Sunlit test: the Earth's shadow is a cylinder of radius R_mean + screening height (10 km in use); no penumbra."
  - "A sample is visible when sunlit, Sun at or below 0 degrees, rocket 5 degrees or more up, and 65 km or more high."
  - "Verdict: 'likely' when every track has 60 s or more visible, 'possible' when some do, 'no' when none do."
  - "Prime means the lowest Sun elevation among visible tracks is at or below -6 degrees. Confidence is 'medium' only for due-east Falcon launches."
  - "Starlink 10-42 (2026-07-09): Sun at -10.5 degrees at liftoff; likely, prime, confidence low, 16 of 16 tracks."
related_papers: []
---

# How our model works: Earth shadow, visibility and the verdict

This note explains engine/visibility.js and config/visibility.json. The Sun and Earth maths is in topics/model-sun-and-earth-geometry. The rocket path is in topics/model-trajectory.

Source of every statement about the code: the files in sources_summary, read on 2026-10-08. All thresholds named here are read from config/visibility.json. The code holds no threshold of its own (header comment of visibility.js).

## The cylindrical Earth-shadow test with a screening height

Function: `isSunlit(position, sunDirection, screeningHeightM)`.

    r      = geodeticToEcef(position)               metres, ECEF
    along  = r . s                                  s is the Sun unit vector
    if along >= 0:  sunlit
    else:           perp^2 = |r|^2 - along^2
                    sunlit  if  perp^2 > (R_mean + h_s)^2

- r: position of the point (rocket) from the Earth's centre, metres.
- s: unit vector from the Earth's centre toward the Sun (ECEF).
- along: component of r toward the Sun, metres. Positive means the point is on the Sun's side of the plane through the Earth's centre.
- perp: distance of the point from the line through the Earth's centre along s (the shadow axis), metres.
- R_mean: 6371008.771415 m. h_s: screening height, metres. In use: 10000 m (config params.screeningHeightM, "provisional").

Inequality, in words: a point on the night side is sunlit only when it is farther from the shadow axis than R_mean + h_s.

Short derivation (ours, from the code):
1. Sunlight comes in parallel rays along s (the Sun is a point at infinity: the `isSunlit` comment).
2. The Earth, widened by the screening height h_s, blocks a cylinder of radius R_mean + h_s that extends behind the Earth along minus s. h_s stands for the lowest layer of air that blocks light (definition in reference/topics/twilight-definitions-and-earth-shadow.md, Source 4).
3. A point behind the Earth's centre plane (along < 0) is in the cylinder when its distance from the axis is at most R_mean + h_s. The squared distance is |r|^2 - along^2.

Notes on this test:
- The test compares an ellipsoid-based position (geodeticToEcef) with a sphere of mean radius. At height 0 the geocentric radius is 6371926.6 m at the observer and 6373280.3 m at the pad, which is 917.9 m and 2271.5 m above R_mean (command, 2026-10-08). This mixing is not corrected. Its effect is like moving the screening height by up to about 2.3 km near the pad. Sensitivity run (command, 2026-10-08, whole snapshot, likely/possible/no): 10 km gives 41/18/447; 8 km gives 43/16/447; 12 km gives 41/17/448. test/visibility.test.js allows 25 km for this kind of difference in a coarse check.
- There is no penumbra: the edge is hard (comment in `isSunlit`).
- No refraction is applied.

## Shadow height above an observer

Function: `shadowHeightAboveM(observer, sunDirection, screeningHeightM)`. Returns the lowest height above the mean sphere at which a point straight above the observer is sunlit.

    el = elevation of the Sun at the observer, degrees
    if el >= 0:  0
    else:        D = -el
                 H = (R_mean + h_s) / cos(D) - R_mean            metres

Derivation: a point at height H straight above the observer is at distance R_mean + H from the centre. The vertical is taken as the radial direction. The angle between the vertical and the Sun is 90 degrees + D. Then along = -(R_mean + H) sin(D) and perp = (R_mean + H) cos(D). The boundary is perp = R_mean + h_s, which gives the formula.

- With h_s = 0 this is R (1 - cos D) / cos D, the Patat 2006 form recorded in reference/topics/twilight-definitions-and-earth-shadow.md (35.1 km at 6 degrees, 142.5 km at 12 degrees).
- test/visibility.test.js checks that the height is in 40 to 50 km for the Sun at -6.8 degrees and in 115 to 130 km for -11.2 degrees, with h_s = 0.
- This function is a helper. evaluateTrack and evaluateLaunch do not call it. They use `isSunlit` at the rocket's own position, which is a 3-D test and is right for a rocket far from the observer.

## The three conditions for one sample

Function: `evaluateTrack`, for each time tS from 0 in steps of stepS (10 s) up to the member's last time. A sample is `visible` only when all three hold:

    1. sunlit:      isSunlit(rocket, sun(t), h_s)
       Sun dark:    sunElevation(observer) <= maxSunElevationDeg     (config: 0)
    2. clear:       rocket elevation >= minElevationDeg              (config: 5)
    3. high enough: rocket height >= minAltitudeM                    (config: 65000)

- The Sun direction is recomputed for each sample time (t0 + tS x 1000 ms).
- Condition 1 has two parts: the rocket is lit, and the observer's sky is dark (Sun on or below the horizon).
- minElevationDeg stands for trees, buildings and haze near the horizon (config source: provisional).
- minAltitudeM is the stage separation height of about 65 km (config source; reference/topics/falcon9-ascent-timeline.md). The comment in the config says the wide plume belongs to the second-stage burn.
- Each sample also records height, elevation, bearing, range and Sun elevation.

## The track summary

A track is one profile member flown on one azimuth. Its summary:

    visibleS        = (number of visible samples) x stepS             seconds
    firstVisibleS, lastVisibleS = first and last visible sample time   seconds
    peak sample     = the visible sample with the largest rocket elevation
    peakElevationDeg, peakBearingDeg, sunElevationDeg = values at the peak sample
    firstBearingDeg, lastBearingDeg = bearings at the first and last visible sample

If no sample is visible, the summary holds only azimuthDeg and visibleS = 0.

## The verdict, the prime flag and the confidence

Function: `evaluateLaunch`. It builds all tracks (every member of the class profile on every azimuth of the class; topics/model-trajectory), then:

    seen    = tracks with visibleS >= minVisibleS                    (config: 60 s)
    verdict = 'no'        if seen is empty
              'likely'    if every track is in seen
              'possible'  otherwise

- When seen is not empty, the result also holds: `sunElevationDeg` = the lowest of the tracks' peak Sun elevations; `prime` = (that lowest value <= primeSunElevationDeg, config: -6); and the min and max over seen tracks of peak elevation, peak bearing and visibleS, plus the earliest firstVisibleS and the latest lastVisibleS. Tracks outside `seen` do not enter these ranges.
- For 'no' the result has no `prime` and no ranges.
- The prime flag is a quality grade. The value -6 is the end of civil twilight (config source); its use as a grade is our interpretation (config text).
- Confidence: `'medium'` when the class is 'east' and the vehicle name starts with 'Falcon'; otherwise `'low'`. It is set for all verdicts, including 'no'.
- FINDINGS.md (locked): the three levels reflect the spread over tracks, which stands for trajectory uncertainty.

Backtest numbers (FINDINGS.md tripwires; reproduced by `node scripts/backtest.js` on 2026-10-08): 41 likely, 18 possible, 447 no of 506; 32 of the 59 are prime; 11 of the 12 labels are not 'no'.

## Worked example: Falcon 9 Block 5 | Starlink Group 10-42

Input from data/ll2-snapshot.json: net 2026-07-09T09:25:43Z, vehicle Falcon 9, orbit "LEO", pad Space Launch Complex 40 (28.56194122, -80.57735736). Observer: config/observer.json (32.718, -79.9537, height 0). Parameters as in config/visibility.json. All numbers below are from a read-only node run on 2026-10-08.

Class: orbit "LEO" is not in the east list, so the class is 'fan': 2 members x 8 azimuths = 16 tracks.

Sun at the observer (sunDirectionEcef and directionAngles):

| Time after liftoff | Sun elevation, degrees | Sun azimuth, degrees |
|---|---|---|
| 0 s | -10.48 | 54.7 |
| 300 s | -9.62 | 55.5 |
| 600 s | -8.75 | 56.2 |

Intermediate values at liftoff: JD 2461230.8929, GMST 4.5843 h, Sun RA 108.648 degrees, declination 22.329 degrees, GHA 320.116 degrees. The shadow height above the observer at liftoff (h_s = 10 km) is 118.2 km.

Result of evaluateLaunch:

    verdict likely; trajectory fan; 16 of 16 tracks visible; prime true
    lowest Sun elevation at a track peak: -9.70 degrees
    peak elevation 10.6 to 38.9 degrees; peak bearing 117 to 167 degrees
    first visible 230 s; last visible 530 s; visible time 190 to 310 s per track
    confidence low (class 'fan')

One track: member SpaceX CRS-16, azimuth 76 degrees. Summary: visible 290 s, first 230 s, last 510 s, peak elevation 19.7 degrees at bearing 146.1, bearing 167.5 at first sight and 99.2 at last sight.

| t, s | Rocket height, km | Elevation, deg | Bearing, deg | Sunlit |
|---|---|---|---|---|
| 0 | 0.0 | -2.1 | 187.6 | no |
| 60 | 8.8 | -1.0 | 187.4 | no |
| 120 | 42.0 | 3.2 | 185.4 | no |
| 180 | 102.5 | 11.0 | 177.4 | no |
| 220 | 136.3 | 15.3 | 169.7 | no |
| 230 | 143.5 | 16.2 | 167.5 | yes |
| 260 | 162.8 | 18.3 | 160.1 | yes |
| 310 | 186.8 | 19.7 | 146.1 | yes |
| 360 | 201.4 | 18.2 | 131.4 | yes |
| 420 | 208.5 | 13.7 | 115.8 | yes |
| 480 | 208.5 | 8.2 | 103.8 | yes |
| 510 | 207.6 | 5.5 | 99.2 | yes |
| 520 | 207.3 | 4.7 | 97.9 | yes |

Reading the table: the rocket first leaves the shadow between 220 s and 230 s, at about 140 km height. At that time it is above 65 km, above 5 degrees, and the Sun is below the horizon, so the sample at 230 s is visible. At 520 s the rocket is still sunlit but the elevation 4.7 degrees is below 5, so that sample is not visible. The last sample of this track is 520 s, because the member's data end at 528 s.

This matches a sighting in the labels: the Post and Courier report for this launch is the only one that uses the word "jellyfish" (FINDINGS.md; reference/topics/charleston-sighting-reports.md). The model has no information about the true azimuth of this launch, which is why 16 tracks are shown.

## Known weaknesses and ideas to test

Facts first.
- The one miss in the labels is recorded in PLAN.md "Open questions": Atlas V 551 Amazon Leo (LA-06), 2026-04-27, 20:53 local, label seen-plume, verdict 'no'. The Sun was 11.6 to 13.2 degrees below the horizon. The engine finds no sunlit sample at screening heights of 5, 10 and 30 km. On azimuth 37 the profile is 34 to 36 km below sunlight at 300 to 400 s. PLAN lists three possible causes and chooses none: the photo shows the engine flame (label should be seen); an Atlas V flies higher than the Falcon 9 profile; the model is wrong. The owner decides the label. FINDINGS.md (locked): no threshold changes to remove a missed label.
- In the backtest output of 2026-10-08 an Atlas V 531 (NROL-101, 2020-11-13) is verdict 'likely' with the Sun at -4.5 degrees. So the model is not wrong for every Atlas V.

Ideas to test. These are ideas, not facts. None is sourced; each needs a source or a test before it is used.
1. Penumbra or gradual dimming. Replace the hard shadow edge by a smooth fall in brightness over a range of heights. The current test is sunlit or not.
2. Plume persistence after engine cutoff. The model scores a sample by the rocket's position only. A plume may stay lit after the engine stops. The profile ends at second-stage cutoff, so the data cannot show it. 177 of 713 visible tracks in the backtest are still visible at the last sample (command, 2026-10-08).
3. Plume expansion with altitude. The conditions use a fixed 65 km minimum height and no size or brightness of the plume.
4. Sky brightness as a continuous function of the Sun's depression. The model uses a step: the Sun at or below 0 degrees. Prime (-6) is a grade, not a brightness model.
5. Extinction near the horizon. The 5 degree minimum elevation is one step. A smooth loss with elevation could replace it.
6. Vehicle-specific profiles. An Atlas V flies a different ascent from the Falcon 9 shapes; so do other vehicles. Compare the two Falcon 9 shapes: the base run gives 41/18/447, all-LEO gives 42/18/446 and all-GTO gives 38/11/457 (likely/possible/no; command, 2026-10-08). Size for other vehicles not estimated.
7. The open Atlas V miss (2026-04-27, 'no'): test cause (2) by a higher profile, only after the owner decides the label. Do not tune a threshold to remove the miss.
8. Screening height. Values 8 to 12 km change the 'likely' count by at most 2 and the 'no' count by at most 1 (see above); 5 km gives 59 not 'no' and 30 km gives 52 (FINDINGS.md).
9. Fix or document the mix of ellipsoid positions and a mean-sphere shadow cylinder (see above).

## Ideas, not sourced

- A smooth brightness model could use published twilight sky-brightness curves. No such source is in reference/ yet; it would need to be added with a note.
