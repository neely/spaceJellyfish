---
key: topics/twilight-definitions-and-earth-shadow
title: "Twilight definitions, Earth shadow height and screening height"
type: topic
sources_summary: "USNO and NWS pages (fetched raw 2026-10-08); Patat, Ugolnikov and Postylyakov 2006 (arXiv PDF read, Appendix A); Bertolin and Dominguez-Castro 2020 (full text of the reply); Taylor, Hapgood and Simmons 1984 (abstract page only); Wikipedia noctilucent cloud (plain text)."
distilled: 2026-10-08
topics: [twilight, illumination, sun-position, visibility, geodesy]
relevance: high
answers: "How are civil, nautical and astronomical twilight defined, how high above a point on Earth is an object still in sunlight when the Sun is D degrees below the horizon, what screening height does the literature use, and does 34 arcminutes of refraction matter?"
key_points:
  - "USNO and NWS: civil 6, nautical 12, astronomical 18 degrees of geometric Sun-centre depression."
  - "Overhead shadow height h = R (1 - cos D) / cos D (Patat 2006, App. A). Table: 6 deg 35.1 km, 9 deg 79.5 km, 12 deg 142.5 km, 18 deg 328.3 km."
  - "Screening height: 7 +/- 1 km on one night (Taylor 1984); about 30 km in older work (Taylor 1984); 5 km used as an input (Bertolin 2020)."
  - "USNO uses 34 arcminutes of refraction at the horizon; sunrise is at 50 arcminutes depression (16' radius + 34')."
  - "The Patat formula is for a point directly above the observer. A far rocket needs the Sun depression at the rocket sub-point."
related_papers: []
---

# Twilight definitions, Earth shadow height and screening height

Check date for every source below: 2026-10-08.

## Sources
1. USNO, "Definitions of rise, set and twilight times". https://aa.usno.navy.mil/faq/RST_defs (fetched raw with curl; text checked).
2. NWS Sioux Falls, "Twilight". https://www.weather.gov/fsd/twilight (fetched raw with curl).
3. Patat, F., Ugolnikov, O.S., Postylyakov, O.V., "UBVRI twilight sky brightness at ESO-Paranal", Astronomy and Astrophysics (2006), doi:10.1051/0004-6361:20064992, arXiv:astro-ph/0604128 (PDF fetched and read; Appendix A.2 and Table A.1, arXiv PDF p. 10).
4. Bertolin, C. and Dominguez-Castro, F., "Reply to the Critical review on the paper: The earliest datable noctilucent cloud observation (Parma, Italy AD 1840)", The Holocene (2020), doi:10.1177/0959683620913923. Full text read from https://zaguan.unizar.es/record/89655/files/texto_completo.pdf. It reproduces the geometry of Gadsden and Schroder (1989), Noctilucent Clouds, Springer (book, not read).
5. Taylor, M.J., Hapgood, M.A., Simmons, D.A.R., "The effect of atmospheric screening on the visible border of noctilucent clouds", J. Atmos. Terr. Phys. 46(4), 363-372 (1984), doi:10.1016/0021-9169(84)90121-1. Only the abstract page was read: https://digitalcommons.usu.edu/physics_facpub/1282
6. Wikipedia, "Noctilucent cloud" (plain text via API). Pointer only.

Snippet only: a posting on the ursa.fi meteoptic-l list about screening height (HTTP 403, not opened).

## Official twilight definitions
- Civil twilight begins in the morning and ends in the evening when the geometric centre of the Sun is 6 degrees below the horizon (Source 1, Source 2).
- Nautical twilight uses 12 degrees (Source 1, Source 2).
- Astronomical twilight uses 18 degrees (Source 1, Source 2).
- NWS says that in astronomical twilight most casual observers would see the sky as fully dark (Source 2).
- USNO says the horizon is still visible in nautical twilight on a moonless night (Source 1, as fetched).
- The angles refer to the geometric centre of the Sun. They do not include refraction (Source 2: "geometric center").

## Refraction
- USNO sunrise and sunset: the Sun's centre is 50 arcminutes (90.8333 degrees zenith distance) below a horizontal plane. This is the Sun's mean radius (16 arcminutes) plus mean refraction at the horizon (34 arcminutes) (Source 1).
- USNO uses 34 arcminutes (0.5666 degree) for the Moon as well (Source 1).
- Taylor et al. included refraction of the grazing sun rays and the Sun's disc size when they fitted the shadow edge for noctilucent clouds (Source 5).
- Not found: a number for how much refraction changes the sunlit height of a rocket plume at 60 to 100 km.

## Shadow geometry
- Patat et al. model the lower edge of Earth's shadow as a straight line tangent to the Earth. They assume a spherical Earth, parallel Sun rays and a flat horizon plane for the observer (Source 3, App. A.2). They state that they neglect the horizon depression. The shadow edge in their model is the geometric tangent line.
- Height of the lower shadow boundary directly above the observer (zenith direction): h_z = R0 (1 - cos phi) / cos phi, where phi is the Sun depression and R0 is the Earth radius (Source 3, App. A.2).
- Table A.1 of Source 3 (arXiv p. 10), height at zenith and at 60 degrees from zenith toward the Sun:

| Sun depression (deg) | h_z (km) | h at 60 deg from zenith (km) |
|---|---|---|
| 3 | 8.8 | 8.0 |
| 6 | 35.1 | 29.9 |
| 9 | 79.5 | 63.3 |
| 12 | 142.5 | 106.7 |
| 15 | 225.1 | 159.1 |
| 18 | 328.3 | 220.1 |

- Source 3 says the quick growth of this height as the Sun sinks, together with falling air density, explains the fast drop in twilight sky brightness.
- Noctilucent clouds are best seen when the Sun is between 6 and 16 degrees below the horizon (Source 6, Wikipedia). I did not verify this against a primary paper.

## Screening height
- Definition in Source 4 (Fig. 1 caption, reproducing Gadsden and Schroder 1989): the Earth casts a cylindrical shadow. Its radius is increased by the screening height h. The cloud at height H lies on the edge of this widened cylinder at the visible border.
- Value used in Source 4: h = 5 km, with H = 85 km and Earth radius 6378 km, for one case. This is an input choice, not a measurement.
- Measured in Source 5: for the 1979-07-10/11 display over Scotland, the screening layer was 7 +/- 1 km (troposphere, probably haze or cloud). The clouds were at 82 +/- 1 km.
- Conflict: Source 5 says earlier work this century found about 30 km, and that these values were probably wrong because of film dynamic range. Source 5 gives 7 km. Source 4 uses 5 km.
- Not found: a screening height measured for rocket plumes, for satellites on the US East Coast, or for different seasons and weather.

## Not found
- A sourced screening height for plume or satellite work (only noctilucent cloud values: 5, 7 and about 30 km).
- A source that gives the sunlit height for a target far from the observer, as a formula, in a form ready to code. Source 4 gives the NLC arc geometry; I did not reduce it to the rocket case.
- A measured refraction correction at 60 to 100 km height.

## Papers the owner could download
- Gadsden, M. and Schroder, W., Noctilucent Clouds, Springer, 1989 (book). Expected: the full shadow-cylinder geometry and screening height discussion.
- Taylor, M.J., Hapgood, M.A., Simmons, D.A.R., J. Atmos. Terr. Phys. 46, 363 (1984), doi:10.1016/0021-9169(84)90121-1 (publisher PDF; only the abstract was read). Expected: how the 7 km screening height and the refraction correction were derived.

## What this means for Space Jellyfish
This section is interpretation, not sourced fact. The numbers below are my own calculations from the formulas above.
- Test (a), "is the plume sunlit", must use the Sun depression at the rocket sub-point (the point on the ground below the rocket) or a full 3-D test against the shadow cylinder. Do not use the Sun depression at Charleston. The Cape pads are about 466 km away, so the depression differs by several degrees.
- Test (b), "is the observer sky dark enough", uses the Sun depression at Charleston.
- Rule for (a) with screening height s and rocket height H (Earth radius R): the rocket is sunlit when the sub-point Sun depression is less than arccos((R + s) / (R + H)). My calculation with R = 6371 km:

| Rocket height H (km) | s = 0 | s = 5 | s = 10 | s = 30 |
|---|---|---|---|---|
| 50 | 7.2 | 6.8 | 6.4 | 4.5 |
| 65 | 8.1 | 7.8 | 7.5 | 6.0 |
| 80 | 9.0 | 8.7 | 8.4 | 7.1 |
| 100 | 10.1 | 9.8 | 9.6 | 8.4 |
| 150 | 12.3 | 12.1 | 11.9 | 11.0 |

(values are maximum sub-point Sun depression in degrees)
- Suggested default: s = 7 km (Taylor 1984, single measured value), and carry a range of 5 to 30 km as an uncertainty band. Label s as an assumption in the code.
- Use the geometric Sun depression and the USNO convention (Sun centre) for the sub-point. The 34 arcminute refraction is about 0.57 degree. It is small next to the s uncertainty, so I propose to ignore refraction for (a) and say so in a code comment.
- Test (b) can use the official 6 degree (civil) and 12 degree (nautical) lines as named thresholds from USNO and NWS. No source gives the threshold for plume visibility. Pick one by backtest.
- Confidence: high for the definitions and the formula; low for the screening height (single measurement, different object, different atmosphere).
