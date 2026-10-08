---
key: topics/falcon9-webcast-telemetry
title: "Falcon 9 webcast telemetry (shahar603/Telemetry-Data): the source of the ascent profiles"
type: topic-note
sources_summary: "GitHub repository shahar603/Telemetry-Data at commit b245d3b (last push 2020-01-24, Unlicense). Read 2026-10-08: the top-level README, 36 mission READMEs, and the analysed.json files of the missions named below."
distilled: 2026-10-08
topics: [telemetry, ascent-profile, trajectory, data-access]
relevance: high
answers: "Where do the altitude and downrange curves in config/profiles.json come from, which missions are used and why, and what are the limits of that data?"
key_points:
  - "Altitude and downrange at 1 s steps, calculated by the repository author from SpaceX webcast speed and altitude."
  - "Used: CRS-16 and CRS-14 (ISS) and Bangabandhu-1, SES-12, Hispasat 30W-6 (GTO). All flew in 2018."
  - "LEO members end near 207 km altitude at 528 to 538 s; GTO members near 164 km at 493 to 529 s."
  - "No Starlink launch and no vehicle other than Falcon 9. The newest data is from 2019."
  - "Downrange is derived, not tracked; members of one profile differ by up to 120 km at 400 s."
  - "The README says the data moved to the Launch Dashboard API; that API is not checked yet."
related_papers: []
---

# Falcon 9 webcast telemetry

## Source
- Repository: https://github.com/shahar603/Telemetry-Data ("A collection of telemetry captured from SpaceX Launch Webcasts").
- Licence: Unlicense (GitHub API, read 2026-10-08).
- Pinned commit: `b245d3b81aa36b7941ec10f3f4b508999d106a6d`. The last push was 2020-01-24.
- The top-level README says the telemetry "has been moved to the Launch Dashboard API" (https://github.com/shahar603/Launch-Dashboard-API). We have not checked that API.

## What the files hold
Each mission folder has `JSON/analysed.json`, `JSON/events.json`, raw files, graphs, and a README.

- The raw files hold time (s), speed (m/s), and altitude (km) read from the webcast at 30 frames per second.
- `analysed.json` holds values at 1 s steps "that can be calculated from the raw data" (top-level README). The fields are `time` (s), `velocity` (m/s), `altitude` (km), `velocity_y` and `velocity_x` (m/s), `acceleration` (m/s^2), `downrange_distance` (km), `angle` (degrees), and `q`.
- Each file analyses one stage. The mission README row "Analysed Telemetry" says which. A Stage 1 file follows the booster back down and is of no use for the ascent to orbit.
- The mission README table also gives Orbit, Vehicle, Block, Payload Mass, and Landing.

The README does not say how downrange distance is calculated. The field names suggest it is the horizontal speed added up over time. It is a derived value. It is not a tracked position.

## Missions read (36 folders with an analysed.json)
The table lists the missions with second-stage data that runs to about second-stage cutoff and whose README states orbit and block.

| Mission | Orbit | Block | Landing | Data ends (s) | Altitude at end (km) | Downrange at end (km) | Used |
|---|---|---|---|---|---|---|---|
| SpaceX CRS-16 | ISS | 5 | RTLS | 528 | 207 | 1307 | yes, falcon9-leo |
| SpaceX CRS-14 | ISS | 4 | No | 538 | 208 | 1467 | yes, falcon9-leo |
| SpaceX CRS-8 | ISS | 2 | ASDS | 605 | 214 | 1661 | no, old block |
| Bangabandhu-1 | GTO | 5 | ASDS | 493 | 164 | 1396 | yes, falcon9-gto |
| SES-12 | GTO | 4 | No | 498 | 165 | 1482 | yes, falcon9-gto |
| Hispasat 30W-6 | GTO | 4 | No | 529 | 164 | 1594 | yes, falcon9-gto |
| GPS III SV01 | MEO | 5 | No | 493 | 168 | 1515 | no, MEO is not a profile yet |

Not used, with the reason:
- DM-1, Eshail 2, TelStar v19: the README has no table, so block and orbit are not stated.
- CRS-9, CRS-10, CRS-13: the data stops at 418 to 444 s, before cutoff.
- Block 1 to Block 3 missions: older vehicle versions.
- Iridium, FormoSat-5, and other polar or sun-synchronous missions: not Cape trajectories.
- Missions with Stage 1 data only (for example CRS-11, CRS-12, ZUMA, NROL-76).

## Numbers worth keeping
Altitude / downrange in km, from config/profiles.json.

| Time (s) | CRS-16 | CRS-14 | Bangabandhu-1 | SES-12 | Hispasat 30W-6 |
|---|---|---|---|---|---|
| 100 | 27 / 9 | 22 / 8 | 25 / 18 | 23 / 13 | 22 / 16 |
| 200 | 120 / 112 | 110 / 142 | 103 / 189 | 103 / 191 | 101 / 180 |
| 300 | 183 / 303 | 177 / 386 | 151 / 465 | 158 / 494 | 151 / 451 |
| 400 | 207 / 610 | 206 / 727 | 166 / 857 | 171 / 907 | 166 / 831 |
| 490 | 208 / 1053 | 209 / 1160 | 164 / 1375 | 165 / 1426 | 165 / 1318 |

## Limits and caveats
- All five members flew in 2018. Current Falcon 9 missions can differ.
- There is no Starlink mission in the repository. Starlink is most of the Cape manifest in the LL2 snapshot (358 of 506 launches since 2017 are LEO, and 434 of 506 are Falcon 9).
- A return-to-launch-site mission (CRS-16) climbs more steeply than an expendable one (CRS-14): 303 km against 386 km downrange at 300 s.
- The data ends at about second-stage cutoff. It holds nothing on the plume after cutoff.

## What this means for Space Jellyfish
Interpretation, not sourced fact.
- The engine uses each member as one possible flight and reports the range across members. See FINDINGS.md, "A profile is a set of real flights, not an average".
- The spread between CRS-16 and CRS-14 is a fair first guess of the uncertainty for a LEO launch. It is not a measured Starlink uncertainty.
- A Starlink profile is the most useful data to add. The Launch Dashboard API is the first place to look.

## How to rebuild
`node scripts/build-profiles.js` reads the pinned commit and writes config/profiles.json.
