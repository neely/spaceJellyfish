---
key: topics/falcon9-starlink-2020-telemetry
title: "2020 Falcon 9 webcast telemetry (R4yGM): Starlink 5 to 8 and DM-2, and what it says about the SpX-35 miss"
type: topic-note
sources_summary: "GitHub repository R4yGM/SpaceXTelemetry-Api at commit d1f8621 (last commit 2021-06-12, no licence file). Five telemetry.csv files vendored on 2026-10-15 with Ben's approval. Mission names matched to the pinned LL2 snapshot. Downrange derived by us and checked against shahar603/Telemetry-Data."
distilled: 2026-10-15
topics: [telemetry, ascent-profile, trajectory, data-access]
relevance: high
answers: "What ascent data exists for Falcon 9 Starlink flights, where is it vendored, how is downrange derived from it, and does a Starlink-shaped ascent explain the SpX-35 position miss?"
key_points:
  - "Altitude and speed against time for Starlink 5 to 8 and DM-2 (all 2020), vendored in reference/vendor/r4ygm-spacextelemetry/."
  - "Our downrange method reproduces shahar603 CRS-14 and CRS-16 downrange within 1 km at 254 to 400 s."
  - "SpX-35 needs about 364 km downrange at 254 s and 389 km at 277 s (plus or minus 10 km)."
  - "2020 Starlink gives 294 to 297 and 354 to 357 km; CRS-14 gives 264 and 323. Azimuth miss falls to 13 and 7 degrees."
  - "No licence file. Vendored with Ben's approval. Since 2026-10-15 all five flights are members of falcon9-leo."
related_papers: []
---

# 2020 Falcon 9 webcast telemetry (R4yGM)

## Source
- Repository: https://github.com/R4yGM/SpaceXTelemetry-Api. Commit `d1f86217fd81e8cbf0655e1a946e53fc542e3b9a` (last commit 2021-06-12). Cloned 2026-10-15.
- The README says the data were extracted by the author with a private tool from launch webcasts, and calls the project an open source REST API. There is no licence file. Ben approved vendoring on 2026-10-15.
- Vendored files (byte copies of `<project>/<mission>/api/telemetry.csv`): reference/vendor/r4ygm-spacextelemetry/starlink-5.csv, starlink-6.csv, starlink-7.csv, starlink-8.csv, dm-2.csv.
- Columns: time (hh:mm:ss after liftoff), altitude (km, mostly whole numbers), speed (km/h; the starlink-6 header says "Speed KM/H"; the other files say "speed" with the same range of values, about 27,000 at orbit).
- Not vendored: GPS III SV03 and ANASIS-II (GTO-type, not needed now) and the derived downrange files (see Problems).

## Which launches
The repository gives mission names only. Each name matches exactly one launch in data/ll2-snapshot.json, and the date each file was added to the repository (git log) fits:

| File | LL2 snapshot launch | LL2 net (UTC) | Pad | File added |
|---|---|---|---|---|
| starlink-5 | Falcon 9 Block 5, Starlink 5 | 2020-03-18 12:16 | LC-39A | 2020-05-15 (rename) |
| starlink-6 | Falcon 9 Block 5, Starlink 6 | 2020-04-22 19:30 | LC-39A | 2020-05-07 |
| starlink-7 | Falcon 9 Block 5, Starlink 7 | 2020-06-04 01:25 | SLC-40 | 2020-06-04 |
| starlink-8 | Falcon 9 Block 5, Starlink 8 | 2020-06-13 09:21 | SLC-40 | 2020-06-13 |
| dm-2 | Falcon 9 Block 5, SpX-DM2 | 2020-05-30 19:22 | LC-39A | 2020-05-31 |

## Downrange from speed and altitude
- Method: horizontal speed = sqrt(v^2 - vz^2), vz from a centred altitude difference over plus or minus 5 s, integrated by the trapezoid rule on 1 s steps. Implemented in scripts/compare-ascent-sources.js.
- Check (2026-10-15, in session): the same method on the velocity and altitude of SpaceX CRS-16 and CRS-14 in shahar603/Telemetry-Data (commit b245d3b) gives 202, 249, 302, 610 km and 263, 322, 386, 726 km at 254, 277, 300, 400 s. That author's downrange is 203, 250, 303, 610 and 264, 323, 386, 727 km. Agreement within 1 km.
- The derived downrange is ground distance from the speed shown on the webcast. Whether that speed is Earth-relative or inertial is not stated by either source. Both data sets share this, so they compare like with like.

## Results for SpX-35 (node scripts/compare-ascent-sources.js, 2026-10-15)
Launch azimuth 45.0 degrees (51.6 degrees, northeast, from SLC-40). Measured points from data/observations.json.

| Member | Alt / downrange at 254 s (km) | Miss az / el at 254 s (deg) | Alt / downrange at 277 s (km) | Miss az / el at 277 s (deg) |
|---|---|---|---|---|
| CRS-16 (2018) | 159 / 203 | 29.2 / -1.4 | 172 / 250 | 26.6 / -0.6 |
| CRS-14 (2018) | 152 / 264 | 19.2 / -0.6 | 165 / 323 | 13.2 / 0.1 |
| Starlink 5 to 8 (2020) | 145 to 147 / 294 to 297 | 13.2 to 13.8 / -0.6 to -0.8 | 158 to 160 / 354 to 357 | 6.3 to 7.1 / -0.3 to -0.6 |
| DM-2 (2020) | 168 / 220 | 26.6 / 0.4 | 181 / 272 | 22.8 / 1.3 |

- The CRS-14 and CRS-16 misses equal the FINDINGS values (155.2 to 165.2 and 144.2 to 157.6 degrees). This is the tripwire for the script.
- What the sighting needs on this azimuth: 364 km downrange and 145.5 km altitude at 254 s; 389 km and 162.5 km at 277 s. A reading error of 2 degrees in azimuth moves the needed downrange by about 10 km; 2 degrees in elevation moves the altitude by about 13 km and the downrange not at all. The needed downrange hardly depends on the launch azimuth (364 to 366 km for azimuths 40 to 50).
- The 2020 Starlink altitude matches the needed altitude at 254 s (145 to 147 against 145.5 km). Its downrange is still 60 to 75 km short at 254 s and 20 to 45 km short at 277 s.
- Caution: the two measured points imply only about 25 km of ground travel in 23 s (about 1.1 km/s). The flights above travel 2.0 (CRS-16) to 2.6 km/s (Starlink, CRS-14) between those times. With plus or minus 10 km per point, the points allow at most about 2.0 km/s. So the points fit a real ascent only at the edge of their stated error, or one point or its time has a larger error. More measured points per launch would show which.

## Problems
- No licence file (see Source).
- The Starlink 7 `downrange.csv` in the repository is identical to the DM-2 one, and the downrange files' time column does not behave like seconds. We do not use them; we derive downrange ourselves.
- Altitude is mostly given in whole kilometres, so vz is noisy; the 10 s window smooths it.
- These are 2020 Starlink v1.0 flights. Florida Falcon 9 Starlink launches have ended (reference/source-audit.md), so the value of this data is its shape as a modern LEO ascent, not as a Starlink model.

## What this means for Space Jellyfish
Interpretation, not sourced fact.
- A Starlink-shaped ascent halves the SpX-35 direction miss and keeps the height match. It supports the FINDINGS view that the 2018 profiles run too short downrange. It does not close the miss.
- SpX-35 returned its booster to the pad, like CRS-16, yet it was seen farther downrange than all members. So landing mode alone does not predict the ascent shape.
- Adopted 2026-10-15: all five flights are members of `falcon9-leo` (FINDINGS decision "The 2020 R4yGM flights join falcon9-leo"). Built by scripts/build-profiles.js, which ends each member at its highest speed between 400 and 750 s (541 to 549 s for Starlink, 538 s for DM-2) and adds a 0 s point on the pad, because some files start after liftoff (DM-2 at 16 s).
