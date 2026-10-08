---
key: usno-sun-and-sidereal-time
title: "Sun position and sidereal time (USNO formulas)"
type: topic-note
sources_summary: "Two U.S. Naval Observatory pages, read 2026-10-08 (URLs in the body). Formulas implemented by engine/sun.js."
distilled: 2026-10-08
topics: [sun-position, sidereal-time, illumination]
relevance: high
answers: "Which formulas give the Sun's coordinates and Greenwich mean sidereal time, how accurate are they, and what does engine/sun.js add on top?"
key_points:
  - "The USNO Sun formula is stated to be good to about 1 arcminute within two centuries of 2000."
  - "Sun inputs: D = JD - 2451545.0. Mean anomaly g and mean longitude q are linear in D."
  - "GMST uses JD0 (previous 0h UT) and H. The engine skips the equation of the equinoxes (at most about 1.1 s)."
  - "Derived in the engine, not on the USNO pages: GHA = 15 GMST - RA, and JD = ms / 86400000 + 2440587.5."
  - "Tests compare the engine with test/fixtures/usno-celnav-sun.json (12 cases)."
related_papers: []
---

# Sun position and sidereal time (USNO)

Distilled from two U.S. Naval Observatory pages, read 2026-10-08:

- https://aa.usno.navy.mil/faq/sun_approx ("Computing Approximate Solar
  Coordinates")
- https://aa.usno.navy.mil/faq/GAST ("Computing Approximate Sidereal Time")

`engine/sun.js` implements these formulas. All angles are in degrees unless
stated.

## Sun coordinates

Stated accuracy: "about 1 arcminute within two centuries of 2000".

    D  = JD - 2451545.0                      days from J2000.0
    g  = 357.529 + 0.98560028 D              mean anomaly
    q  = 280.459 + 0.98564736 D              mean longitude
    L  = q + 1.915 sin g + 0.020 sin 2g      apparent ecliptic longitude
    b  = 0                                   ecliptic latitude
    R  = 1.00014 - 0.01671 cos g - 0.00014 cos 2g     distance, AU
    e  = 23.439 - 0.00000036 D               mean obliquity
    tan RA = cos e sin L / cos L             use atan2; RA is in the quadrant of L
    sin d  = sin e sin L                     declination

## Greenwich mean sidereal time

JD0 is the Julian date of the previous 0h UT (it ends in .5). H is the hours
of UT since then. The page gives this form for the case JD(TT) = JD(UT),
which it says holds "for most applications":

    DUT  = JD0 - 2451545.0
    T    = (JD - 2451545.0) / 36525
    GMST = mod(6.697375 + 0.065709824279 DUT + 1.0027379 H + 0.0000258 T^2, 24)   hours

The page says the equation of the equinoxes is at most about 1.1 seconds, and
that it can be skipped "if an error of ~1 second is unimportant". The engine
skips it: 1.1 seconds of time is about 0.005 degrees.

## Derived in the engine (not on the USNO pages)

- Greenwich hour angle of the Sun: GHA = 15 GMST - RA.
- The Sun is overhead at latitude d and east longitude -GHA.
- Julian date from Unix time: JD = ms / 86400000 + 2440587.5.

The engine tests check these against the USNO celestial navigation API
values in `test/fixtures/usno-celnav-sun.json`.
