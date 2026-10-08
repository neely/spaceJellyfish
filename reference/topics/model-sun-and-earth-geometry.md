---
key: topics/model-sun-and-earth-geometry
title: "How our model works: Sun position and Earth geometry"
type: topic-note
sources_summary: "Documents our own code as of 2026-10-08. Read: engine/sun.js, engine/geo.js, test/sun.test.js, test/geo.test.js, FINDINGS.md (tripwires and limitations), reference/usno-sun-and-sidereal-time.md. Two numbers come from commands run on 2026-10-08 (marked in the text). No outside source was added."
distilled: 2026-10-08
topics: [sun-position, sidereal-time, geodesy, illumination]
relevance: high
answers: "Which formulas turn a Unix time and a place into the Sun's direction, the Sun's elevation and azimuth, and the look angles and range to a point, which functions implement them, how accurate are they, and what is left out?"
key_points:
  - "Chain: Unix ms to Julian date, Sun RA and declination, GMST, Sun GHA, Sun unit vector in ECEF axes. All in engine/sun.js."
  - "Elevation, azimuth and range come from dot products with the local east, north and up unit vectors (engine/geo.js)."
  - "Sun angles agree with USNO within 0.0070 degrees on 12 cases (limit 1/60 degree); ECEF agrees with NOAA NGS within 0.4 mm."
  - "Not modelled: refraction, parallax, equation of the equinoxes, Sun disc size, leap seconds, geoid height."
  - "surfaceDistanceM uses a sphere of mean radius 6371008.77 m and is good to about 0.5 percent; look angles use the WGS 84 ellipsoid."
related_papers: []
---

# How our model works: Sun position and Earth geometry

This note explains the maths in engine/sun.js and engine/geo.js. It is written so that a reader can follow it without opening the code.
The two other notes continue the chain: topics/model-trajectory (the rocket) and topics/model-visibility-and-verdict (light and verdict).

Source of every statement: the code files named above, read on 2026-10-08. Numbers are from FINDINGS.md or from a command that is named. The formulas for the Sun and sidereal time are the USNO formulas. Their constants and accuracy statement are in reference/usno-sun-and-sidereal-time.md. This note does not repeat them in full.

## Overview of the chain

    Unix time (ms)
      -> Julian date JD                         julianDate
      -> Sun right ascension RA, declination d   sunCoordinates
      -> Greenwich mean sidereal time GMST       gmstHours
      -> Sun Greenwich hour angle GHA            sunGhaDec
      -> Sun unit vector s in ECEF axes          sunDirectionEcef
      -> Sun elevation and azimuth at a place    directionAngles (geo.js)

    Place (latitude, longitude, height)
      -> ECEF position r                         geodeticToEcef
      -> look angles and range to a target       lookAngles

## Time scales

Function: `julianDate(date)` in engine/sun.js. It accepts a Date or a number of milliseconds.

    JD = ms / 86400000 + 2440587.5

- ms: milliseconds since 1970-01-01T00:00:00Z (the Unix epoch). Unit: ms.
- 86400000: milliseconds in one day.
- 2440587.5: the Julian date of the Unix epoch (constant UNIX_EPOCH_JD).
- JD: Julian date, in days.

The engine treats the Unix time as UT. It applies no leap second and no TT or UT1 correction. This follows from the code: there is no such term. The USNO page allows JD(TT) = JD(UT) for most uses (see reference/usno-sun-and-sidereal-time.md).

The test `julianDate: J2000.0 is 2000-01-01 12:00 UT` checks that 2000-01-01T12:00:00Z gives JD 2451545.0.

Days since J2000.0 (used below):

    D = JD - 2451545.0

D is in days. J2000 is the constant `J2000 = 2451545.0`.

## The Sun's coordinates

Function: `sunCoordinates(date)`. All angles are in degrees inside the formulas; the code converts to radians for sin and cos.

    g      = mod(357.529 + 0.98560028 D, 360)            mean anomaly, degrees
    q      = mod(280.459 + 0.98564736 D, 360)            mean longitude, degrees
    L      = mod(q + 1.915 sin g + 0.020 sin 2g, 360)    ecliptic longitude, degrees
    R      = 1.00014 - 0.01671 cos g - 0.00014 cos 2g    distance, AU
    e      = 23.439 - 0.00000036 D                       obliquity of the ecliptic, degrees
    RA     = mod(atan2(cos e sin L, cos L), 360)         right ascension, degrees
    dec    = asin(sin e sin L)                           declination, degrees

- mod(x, n) is the non-negative remainder, in the range 0 to n.
- atan2 gives the quadrant of RA directly.
- The function returns { rightAscensionDeg, declinationDeg, distanceAu }.
- The distance R is returned but no other engine function uses it.

The constants are the USNO constants (reference/usno-sun-and-sidereal-time.md, section "Sun coordinates"). The code header says not to change a constant without changing that file and re-running the fixture tests.

## Greenwich mean sidereal time

Function: `gmstHours(date)`. Result in hours, range 0 to 24.

    JD0  = floor(JD - 0.5) + 0.5          Julian date of the previous 0h UT
    H    = (JD - JD0) * 24                hours of UT since 0h
    DUT  = JD0 - 2451545.0                days
    T    = (JD - 2451545.0) / 36525       Julian centuries
    GMST = mod(6.697375 + 0.065709824279 DUT + 1.0027379 H + 0.0000258 T^2, 24)

This is the USNO form. See reference/usno-sun-and-sidereal-time.md, section "Greenwich mean sidereal time". GMST is mean sidereal time. The equation of the equinoxes is not added (see "Not modelled").

## Sun Greenwich hour angle

Function: `sunGhaDec(date)`. It returns { ghaDeg, declinationDeg }.

    GHA = mod(15 * GMST - RA, 360)

- GMST in hours; 15 degrees per hour converts it to degrees.
- RA in degrees from `sunCoordinates`.
- GHA: the angle from the Greenwich meridian westward to the Sun's meridian, in degrees, range 0 to 360.

The declination is passed through unchanged.

## The Sun unit vector in ECEF axes

Function: `sunDirectionEcef(date)`. ECEF axes: x through latitude 0, longitude 0; z through the north pole; y completes a right-handed set (east at longitude 90 E). This is the axis definition in the code comment and in geodeticToEcef.

    lon_s = -GHA                  east longitude below the Sun, degrees
    s     = [ cos(dec) cos(lon_s),
              cos(dec) sin(lon_s),
              sin(dec) ]

- The Sun is overhead at latitude dec and east longitude -GHA (reference/usno-sun-and-sidereal-time.md, section "Derived in the engine").
- s is a unit vector from the Earth's centre toward the Sun. It has no unit; its length is 1.
- The Sun is treated as infinitely far away. The same vector s is used for every point on or near the Earth. This is the "parallel rays" assumption.

## WGS 84 geodetic to ECEF

Function: `geodeticToEcef({ latitudeDeg, longitudeDeg, heightM })` in engine/geo.js. Result [x, y, z] in metres. heightM defaults to 0.

Constants in geo.js:

    a   = 6378137 m                   semi-major axis (WGS84_A_M)
    f   = 1 / 298.257223563           flattening (WGS84_F)
    e2  = f (2 - f)                   first eccentricity squared
    b   = a (1 - f)                   semi-minor axis, m

Formula:

    N = a / sqrt(1 - e2 sin^2(phi))                  prime vertical radius, m
    x = (N + h) cos(phi) cos(lambda)
    y = (N + h) cos(phi) sin(lambda)
    z = (N (1 - e2) + h) sin(phi)

- phi: geodetic latitude, lambda: east longitude, h: height above the ellipsoid, in metres.
- Height is ellipsoid height. The engine does not use a geoid.

Mean radius of the ellipsoid (constant MEAN_RADIUS_M):

    R_mean = (2 a + b) / 3

Value: 6371008.771415 m (command: node import of engine/geo.js, 2026-10-08). The shadow test and the great-circle formulas use this one radius.

## Local east, north, up basis

Internal function `enuBasis(observer)`. The three unit vectors are in ECEF axes, at geodetic latitude phi and longitude lambda:

    east  = [ -sin(lambda),              cos(lambda),              0        ]
    north = [ -sin(phi) cos(lambda),    -sin(phi) sin(lambda),     cos(phi) ]
    up    = [  cos(phi) cos(lambda),     cos(phi) sin(lambda),     sin(phi) ]

"up" is along the ellipsoid normal (geodetic vertical), not along the line to the Earth's centre.

## Elevation, azimuth and range

Function `directionAngles(observer, d)` takes a direction vector d in ECEF axes. Function `lookAngles(observer, target)` builds d from two positions.

    d      = r_target - r_observer              metres (lookAngles only)
    e, n, u = d . east, d . north, d . up       dot products
    elevation = asin( u / |d| )                 degrees above the horizon plane
    azimuth   = mod( atan2(e, n), 360 )         degrees clockwise from true north
    range     = |d|                             metres (lookAngles only)

- The ratio u / |d| is clamped to the range -1 to 1 before asin, because rounding can push it past 1 for a point overhead.
- Elevation is positive above the horizontal plane of the observer. It is geometric.
- The horizon is the plane perpendicular to "up". There is no horizon dip for the observer's height or for the Earth's curvature beyond what this plane gives.
- For the Sun, the engine calls `directionAngles(observer, s)`. The text in geo.js says the Sun is far enough away that its direction is the same from the Earth's centre and from the observer.

## Mean-sphere surface distance

Function: `surfaceDistanceM(a, b)`. Haversine formula on a sphere of radius R_mean. Heights are ignored.

    hav = sin^2(dphi / 2) + cos(phi1) cos(phi2) sin^2(dlambda / 2)
    distance = 2 R_mean asin( sqrt(hav) )                metres

- phi1, phi2: latitudes; dphi = phi2 - phi1; dlambda: longitude difference. Radians inside the code.
- The code comment and FINDINGS.md say it is good to about 0.5 percent.
- Use: the test that checks the pad to observer distance, and the test of `destinationPoint` in test/trajectory.test.js. The visibility engine does not call it.

## Measured accuracy (tripwires in FINDINGS.md)

- Sun position: the USNO algorithm states about 1 arcminute. test/fixtures/usno-celnav-sun.json holds 12 cases. The engine must agree within 1/60 degree in GHA, declination, altitude and azimuth (azimuth tolerance is scaled by 1 / cos(altitude); test/sun.test.js). Largest difference observed: 0.0070 degrees (altitude, 2026-10-13 case). Source: FINDINGS.md.
- The lowest Sun altitude in that fixture is -11.2 degrees. The USNO API returns no Sun entry when the Sun is far below the horizon, so deeper Sun angles are not tested against an outside value (FINDINGS.md).
- ECEF conversion: test/fixtures/ngs-ecef.json holds 4 cases from NOAA NGS. The engine must agree within 2 mm. Largest difference observed: 0.4 mm (FINDINGS.md). NGS uses GRS 80, which differs from WGS 84 by less than 1 mm (comment in test/geo.test.js).
- Pad to observer along the surface: 466.0 km (289.5 statute miles), tolerance 0.5 km (FINDINGS.md; test/geo.test.js).
- `npm test`: 40 tests, 40 pass, 0 fail (run on 2026-10-08 with `node --test`).

## What is NOT modelled

Each item is a statement about the code or about FINDINGS.md.

- Atmospheric refraction. Angles are geometric (geo.js header; FINDINGS.md "Known permanent limitations"). The size of its effect for this project is not estimated here. reference/topics/twilight-definitions-and-earth-shadow.md records that USNO uses 34 arcminutes at the horizon and that no value for a rocket at 60 to 100 km was found.
- Parallax of the Sun. One vector s is used for all points (see "The Sun unit vector"). Size not estimated.
- Equation of the equinoxes and nutation. The engine uses mean sidereal time. FINDINGS.md (Decisions, locked) gives about 1.1 seconds of time, about 0.005 degrees.
- The Sun's disc. The Sun is a point (comment in `isSunlit`). See the visibility note.
- Leap seconds, UT1 minus UTC and TT. See "Time scales". Size not estimated.
- The geoid. Heights are ellipsoid heights. The observer height is set to 0 m in config/observer.json.
- Sun position beyond the USNO range of validity (about two centuries around 2000, from the USNO note). The backtest uses 2017 to 2026.

## Ideas, not sourced

- Compare the Sun elevation with a second source (for example another ephemeris) at depression angles deeper than 11.2 degrees. The twilight launches in the backtest reach -15.8 degrees (Sun at peak, label 2025-07-26 in the backtest output). This idea needs a source for the reference values.

## Where to improve

- Add a test that links the Sun GHA to a second source at deeper depression angles (see above).
- Record the size of each "Size not estimated" item with a script, if one of them starts to matter for a verdict.
