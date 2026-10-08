---
key: topics/model-trajectory
title: "How our model works: the rocket's path"
type: topic-note
sources_summary: "Documents our own code as of 2026-10-08. Read: engine/trajectory.js, engine/visibility.js (evaluateLaunch), config/visibility.json, config/profiles.json (structure and values), test/trajectory.test.js, FINDINGS.md. Numbers come from those files or from read-only node commands run on 2026-10-08 (named in the text)."
distilled: 2026-10-08
topics: [trajectory, ascent-profile, geodesy, launch-data, telemetry]
relevance: high
answers: "How does the engine turn a pad, a launch azimuth and an ascent profile member into the rocket's latitude, longitude and height against time, how are azimuths chosen, and what does the model leave out?"
key_points:
  - "Ground track: one great circle on a sphere of radius 6371008.77 m, started at the pad on a fixed azimuth."
  - "Altitude and downrange come from a profile member by linear interpolation; height is then used as an ellipsoid height."
  - "Azimuth relation: sin(az) = cos(i) / cos(latitude); the due-east class uses azimuth 90, the fan uses 8 azimuths from 37 to 124."
  - "The profile ends at 493 to 538 s; 177 of 713 visible tracks in the backtest are still visible at the last sample."
  - "Using the LEO profile for every launch gives 42/18/446 (likely/possible/no); the GTO profile gives 38/11/457; the base run gives 41/18/447."
related_papers: []
---

# How our model works: the rocket's path

This note explains engine/trajectory.js and the way engine/visibility.js uses it. The Earth maths it relies on is in topics/model-sun-and-earth-geometry. The light and verdict maths is in topics/model-visibility-and-verdict.

Source of every statement about the code: the files named in sources_summary, read on 2026-10-08. Where a number is computed, the note says so.

## The model in one paragraph

The rocket flies along one great circle from the pad. The launch azimuth is fixed. A profile member (real telemetry from one past flight) gives the height and the distance flown against time. The engine places the rocket on the circle at that distance and gives it that height.

## Great-circle destination

Function: `destinationPoint(start, azimuthDeg, distanceM)`.

    d    = distance / R_mean                              central angle, radians
    lat2 = asin( sin(lat1) cos(d) + cos(lat1) sin(d) cos(az) )
    lon2 = lon1 + atan2( sin(az) sin(d) cos(lat1),
                         cos(d) - sin(lat1) sin(lat2) )

- start: the pad, with latitude lat1 and longitude lon1. Radians inside the code.
- az: launch azimuth, degrees clockwise from true north, at the start.
- distance: distance along the surface, metres. R_mean = 6371008.771415 m (MEAN_RADIUS_M; command output, 2026-10-08).
- The result longitude is wrapped to the range -180 to 180 degrees.
- The Earth is a sphere in this formula. The test `destinationPoint: distance and direction round trip` checks that `surfaceDistanceM` returns the input distance (to 1e-6 relative) and that the ellipsoid look azimuth over 1 km agrees with the input azimuth within 0.2 degrees.
- Check run on 2026-10-08: 1300 km from the pad on azimuths 37, 90 and 124 degrees gives surfaceDistanceM = 1300000.0 m each time (node, read-only).

## Launch azimuth and orbit inclination

Function: `launchAzimuthsDeg(inclinationDeg, padLatitudeDeg)`.

    sin(az) = cos(i) / cos(lat)
    az_NE   = asin( cos(i) / cos(lat) )          northeast launch
    az_SE   = 180 - az_NE                        southeast launch

- i: orbit inclination, degrees. lat: pad latitude, degrees.
- If cos(i) / cos(lat) is 1 or more (inclination at or below the pad latitude), the function returns 90 for both. A direct launch to that orbit is not possible in this model, so the engine flies due east.
- The code comment calls this the spherical relation. reference/topics/cape-launch-azimuths-and-inclinations.md gives the same relation from a source (orbitalradar glossary) and the worked values for the Cape.

Derivation in three lines (ours, standard spherical geometry, checked numerically by the tests):
1. Along a great circle, cos(latitude) x sin(azimuth) has the same value at every point.
2. The northernmost point of the circle is at latitude = i, and there the track runs due east (azimuth 90), so the constant is cos(i).
3. At the pad, cos(lat) sin(az) = cos(i). Solve for az.

The test `launchAzimuthsDeg: the great circle reaches the inclination as its top latitude` flies the circle for i = 35, 43, 51.6, 53 and 70 degrees and checks that the top latitude is within 0.05 degrees of i. I ran the function on 2026-10-08 for the SLC-40 latitude 28.56194122 degrees: i = 51.6 gives 45.0 and 135.0 degrees; i = 43 gives 56.4 and 123.6; i = 53.2 gives 43.0 and 137.0.

The relation includes no Earth rotation. `launchAzimuthsDeg` is exported and tested, but evaluateLaunch does not call it: it reads the azimuths from config/visibility.json.

## Profile member: height and downrange against time

Function: `profilePointAt(member, tS)`. A member in config/profiles.json has `points`: rows of [time since liftoff in s, altitude in km, downrange distance in km] (the file's pointFormat field), plus orbit, block, landing and endS. The file's stepS is 10.

    find i with t_(i-1) <= t <= t_i
    f   = (t - t_(i-1)) / (t_i - t_(i-1))             0 when the two times are equal
    alt = alt_(i-1) + f (alt_i - alt_(i-1))           km
    dr  = dr_(i-1)  + f (dr_i  - dr_(i-1))            km

- It returns null when t is before the first point or after the last point.
- The profile data are rows at 10 s steps; the last step is shorter (8 s for CRS-16, CRS-14 and SES-12; 3 s for Bangabandhu-1; 9 s for Hispasat 30W-6; command output, 2026-10-08). The two end points are the member's `endS`.
- Origin of the data: reference/topics/falcon9-webcast-telemetry.md (shahar603/Telemetry-Data, derived from webcast speed and altitude). Downrange is derived, not tracked.

## The rocket's geodetic position

Function: `rocketPosition(pad, azimuthDeg, member, tS)`.

    point   = profilePointAt(member, tS)             null gives null
    s       = max(0, point.downrange) * 1000         metres
    (lat, lon) = destinationPoint(pad, az, s)
    height  = point.altitude * 1000                  metres

Result: { latitudeDeg, longitudeDeg, heightM }. The height is used as ellipsoid height by `geodeticToEcef` (topics/model-sun-and-earth-geometry). So the ground track is on the mean sphere while the height is added on the WGS 84 ellipsoid.

The clamp `max(0, ...)` is there because, as the code comment says, the telemetry has small negative downrange values near liftoff. In the current config/profiles.json the smallest downrange value of every member is 0 (command, 2026-10-08), so the clamp has no effect on today's data.

## The azimuth fan and the due-east class

evaluateLaunch (engine/visibility.js) picks a class from config/visibility.json:

    kind = 'east'   if launch.orbit is in trajectories.east.orbits
    kind = 'fan'    otherwise (including no orbit)

| Class | Profile | Azimuths (degrees) | Tracks per launch |
|---|---|---|---|
| east | falcon9-gto (Bangabandhu-1, SES-12, Hispasat 30W-6) | 90 | 3 x 1 = 3 |
| fan | falcon9-leo (SpaceX CRS-16, SpaceX CRS-14) | 37, 50, 63, 76, 89, 101, 114, 124 | 2 x 8 = 16 |

- The east class holds orbits GTO, Direct-GEO, GSO, Super-GTO, HEO, Elliptical, LO, Lunar flyby, L1-point, L2, Helio-N/A, Mars and Asteroid. The config gives the reason: an orbit at or below the pad latitude, or an escape orbit, is flown due east.
- The fan exists because LL2 gives no inclination or azimuth (config source text; reference/topics/cape-launch-azimuths-and-inclinations.md). It covers 37 to 114 degrees (a quoted Cape range) and adds 124 because a 43 degree Starlink flight on 2025-11-22 went southeast (the azimuth relation gives 123.6 degrees for i = 43). The fan decision is locked in FINDINGS.md.
- Count in the pinned snapshot (command, 2026-10-08): 111 launches in the east class and 395 in the fan class, of 506.
- The fan spacing is not uniform (arithmetic on the config values): steps of 13 degrees from 37 to 89, then 12, 13 and 10 degrees up to 124.
- A track is one member flown on one azimuth. The pad is the launch record's own latitude and longitude, with height 0.

## Simplifications and their size

Each size is computed from the repo or marked "size not estimated".

1. No Earth rotation. The ground track is one great circle at a fixed azimuth. FINDINGS.md says the bearing range must absorb this error. Size not estimated.
2. No dog-leg. A real flight may turn around land (reference/topics/cape-launch-azimuths-and-inclinations.md). The model has no turn. Size not estimated.
3. Spherical ground track with ellipsoidal heights. The destination formula uses a sphere of mean radius; look angles use the WGS 84 ellipsoid. Distance on the sphere is good to about 0.5 percent (FINDINGS.md). For a downrange of 1300 km that is up to about 6.5 km (arithmetic: 0.005 x 1300 km). The effect on the verdict is not estimated. A related effect is in the visibility note (geocentric radius against mean radius).
4. The profile ends at second-stage cutoff (endS 493 to 538 s; FINDINGS.md). The engine models nothing after. The sample loop also stops at the last multiple of stepS that is not above endS: for endS = 528 the last sample is 520 s, so the last 8 s are not used. Effect, from the backtest run (command, 2026-10-08): of 713 tracks with some visible time in launches that are not 'no', 177 are still visible at their last sample, in 42 launches. For these tracks the visible time may be cut short by the end of the profile. The size of the missing time is not estimated.
5. Falcon 9 2018 flights stand in for every vehicle (FINDINGS.md). The spread between the two profiles shows the scale of the vehicle choice. Altitude and downrange at 300 s from config/profiles.json (command, 2026-10-08):

| Member | Altitude, km | Downrange, km |
|---|---|---|
| SpaceX CRS-16 | 183 | 303 |
| SpaceX CRS-14 | 177 | 386 |
| Bangabandhu-1 | 151 | 465 |
| SES-12 | 158 | 494 |
| Hispasat 30W-6 | 151 | 451 |

Test run on the whole snapshot (read-only config copy in memory, 2026-10-08), screening height 10 km:

| All launches flown on | likely | possible | no |
|---|---|---|---|
| base configuration (east class on GTO, fan on LEO) | 41 | 18 | 447 |
| falcon9-leo profile everywhere | 42 | 18 | 446 |
| falcon9-gto profile everywhere | 38 | 11 | 457 |

This shows how much the verdicts depend on the profile choice for Falcon 9 shapes. It says nothing about an Atlas V, Vulcan or New Glenn ascent. Size not estimated for other vehicles.
6. Starlink and other launches use LEO or GTO shapes by orbit class only. The profile data have no Starlink flight (reference/topics/falcon9-webcast-telemetry.md).
7. Time step. Samples are taken every stepS = 10 s. Visible time is a count of samples times 10 s (evaluateTrack). Size not estimated.

## Ideas, not sourced

- A rotation correction to the azimuth could be tested against the bearing range the tracks give. It needs a source for the size of the effect.
- A profile for each vehicle could replace the two Falcon 9 shapes. It needs flight data for those vehicles; none is in the repo.
