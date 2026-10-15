---
key: source-audit
title: "Source audit: every outside input, where it is used, and how it was checked (2026-10-15)"
type: audit
sources_summary: "Each input in config/, data/ and the sky view, checked again on 2026-10-15 against its source with WebFetch, WebSearch, git ls-remote and a WMM-2025 calculation. Sources that could not be reached are marked. No pinned value was changed."
distilled: 2026-10-15
topics: [data-access, launch-data, ascent-profile, telemetry, trajectory, sightings, visibility, sky-view, geodesy, sun-position]
relevance: high
answers: "Which outside inputs does the engine and the page use, where does each come from, how old is it, was it checked again, what is wrong with it, and what would replace it?"
key_points:
  - "No pinned value changed. Proposed changes and their impact are at the end."
  - "SpaceX said Starlink 10-49 (2026-08-25) was the last Falcon 9 Starlink from Florida. 35 of 59 backtest chances are Starlink."
  - "Telemetry-Data b245d3b is still HEAD. R4yGM/SpaceXTelemetry-Api has 2020 Starlink and DM-2 altitude and speed, no licence."
  - "Declination at the observer is -8.28 degrees (WMM-2025). Config -8 is within 0.3. Census 29412 point is 0.6 km off."
  - "Azimuth fan: CSIS 2019 gives 35 to 120; Wikipedia 37 to 114. Bandwagon about 45 degrees (SpaceNews); Wikipedia says SSO."
  - "SpX-35 was reported seen from Charleston by Live 5 News (jellyfish cloud) and Post and Courier."
related_papers: []
---

# Source audit (2026-10-15)

One row for each outside input. Columns: what it is; where it is used; source and version or date; age on 2026-10-15; how it was checked today; known problems; what would replace it.

Rule for this audit (PLAN): no pinned value changes. A proposed change is listed under "Proposed changes" with its downstream impact.

"Checked" means I read the source again today. "Not reachable" means the tool could not open it today; the reason is given.

## Launch data

| Input | Used in | Source, version | Age | Checked 2026-10-15 | Known problems | Replacement |
|---|---|---|---|---|---|---|
| Past launches | data/ll2-snapshot.json, scripts/backtest.js | LL2 2.3.0 /launches/previous/, location ids 12 and 27, fetched 2026-10-08T17:18Z, 506 launches | 7 days; ends 2026-10-02 | Count and metadata read from the file; backtest reproduces 41/18/447. LL2 not re-queried (pinned by design). | Does not hold SpX-35 (2026-10-13), so SpX-35 cannot be labelled. No program field, so station launches use the fan in the backtest (FINDINGS). | Change-regenerate on Ben's request (PLAN easy wins). |
| Upcoming fallback | data/upcoming-fallback.json, app.js fallback | LL2 upcoming, 30 records, fetched 2026-10-08T18:18Z | 7 days | Timestamp read from the file. | Holds SpX-35 as upcoming; it has flown. Times in it go stale every day by nature. | Re-run scripts/save-upcoming-fallback.js when it matters. |
| LL2 rate limit and access | lib/ll2.js, app.js cache of 20 min | https://thespacedevs.com/llapi | n/a | Page still says "up to 15 non-authenticated requests per hour". | None new. | n/a |
| Live LL2 record, Bandwagon 5 | config/launch-directions.json | LL2 id 3b430f81... | read today | net 2026-10-19T10:30Z, window to 11:30Z, Go for Launch, SLC-40, LL2 last_updated 2026-10-13T17:28Z. | Record not updated since 10-13. | Read again on 10-18. |
| Live LL2 record, SpX-35 | data/observations.json liftoffUtc | LL2 id bf2c3027... | read today | net 2026-10-13T10:33:44Z, precision Second, Launch Successful. Matches the file. Spaceflight Now also gives 6:33 a.m. EDT. | One secondary article (Nature World News) says 6:35; it is wrong against LL2 and Spaceflight Now. | n/a |
| Florida Starlink | Backtest interpretation, PLAN open question | Spectrum News 13, 2026-08-25, quoting Kiko Dontchev (SpaceX VP Launch) on X | 7 weeks | Read today. The article says future Florida Starlink missions will fly on Starship, with no date. | Secondary report of a post on X; the post itself was not read. | The X post, if Ben can open it. |

## Trajectory inputs

| Input | Used in | Source, version | Age | Checked 2026-10-15 | Known problems | Replacement |
|---|---|---|---|---|---|---|
| Ascent profiles | config/profiles.json (scripts/build-profiles.js) | shahar603/Telemetry-Data, commit b245d3b, Unlicense; 5 flights from 2018 | Data 2018; repo last push 2020 | `git ls-remote`: HEAD is still b245d3b. | SpX-35 seen 19 to 29 degrees east of the prediction. Downrange is derived. No Starlink, no other vehicle. | See "Ascent data leads" below. |
| ISS inclination 51.6 | config/visibility.json trajectories.iss | NASA ISS reference page | current page | Page says the ISS inclination is 51.6 degrees. | None. | n/a |
| Due-east rule for high orbits | config/visibility.json trajectories.east | Relation cos(i) = cos(lat) sin(az), orbitalradar glossary | Page "Last reviewed 2026-09-07" | Formula read again today; unchanged. | Glossary is a low-authority secondary source for a textbook relation. | Any astrodynamics text. Low priority. |
| Azimuth fan 37 to 124 | config/visibility.json trajectories.fan | Wikipedia "Eastern Range" (37 to 114, citing a 2002 FAA-sponsored report); orbitalradar (35 to 120); 124 from the 2025-11-22 Starlink flight | 2002 primary; pages current | Wikipedia still says 37 to 114 with the same citation. Orbitalradar still shows 35 to 120. New: CSIS "Spaceports of the World" (Thomas G. Roberts, March 2019) says Cape allowable azimuths are 35 to 120 (read via a ResearchGate figure page). FAA SLC-40 Draft EA (March 2025) and the 2020 Falcon EA give no azimuth numbers; the Draft EA says trajectories stay in the range analysed in 2020. | Two values still disagree; no current Space Force number. | The 2002 report (NTIS PB2005105397) or the 2020 EA appendices, if Ben downloads them. |
| Polar and SSO launches | Fan (PLAN item) | NASASpaceflight 2020-08-30 (SAOCOM 1B) | 6 years | Read today: the flight went southeast along the Florida coast, then a dogleg south after stage separation. No azimuth number. The 2020 FAA EA says about 10 percent of Falcon 9 launches would use the southern trajectory. | No corridor azimuth found. | A hazard area from a NOTAM or a navigational warning for a polar launch. |
| Bandwagon 5 direction | config/launch-directions.json | orbitcodex.com for Bandwagon 3 at 45 degrees (secondary) | 6 months | Better source found: SpaceNews reports SpaceX said Bandwagon missions go to about 45 degrees (SmallSat conference talk, Aug. 9; the article shows no year). Spaceflight Now (2025-04-21) says Bandwagon 3 went to a mid-inclination orbit, no number, booster to LZ-2. spacelaunchschedule.com names drone ship A Shortfall of Gravitas for Bandwagon 5. | Conflict: Wikipedia "List of spaceflight launches in October to December 2026" lists Bandwagon-5 as SSO. LL2 and the mission name say mid-inclination. Heading still unknown. | Drone ship position on 10-18 (runbook). |

### Ascent data leads (new, 2026-10-15)
- R4yGM/SpaceXTelemetry-Api (https://github.com/R4yGM/SpaceXTelemetry-Api, last commit 2021-06-12). Vendored and compared on 2026-10-15: reference/topics/falcon9-starlink-2020-telemetry.md. It holds altitude and speed against time for Starlink 5, 6, 7, 8 (2020, Florida), Crew Dragon DM-2 (ISS, 2020), GPS III SV03 and ANASIS-II. There is no licence file, so we can read it but should not vendor it without the author's permission.
  - Altitude at 254 s: Starlink 5 to 8 give 145 to 147 km; DM-2 gives 168 km. Our LEO members give 152 (CRS-14) and 159 (CRS-16) km.
  - Problem: the Starlink 7 downrange file is identical to the DM-2 file, so at least one is a copy. The downrange time column does not behave like seconds (933 km at row 200 for Starlink 8). Do not use the downrange files.
- Launch Dashboard API (shahar603): the repository holds only server code; the data lived in a database and S3. The host api.launchdashboard.space now answers, but its robots rule blocks WebFetch. The built-in browser on Ben's computer was offline today, so it is not checked.
- 2026-10-15 evening, on Ben's iPhone (Safari): the Launch Dashboard API gave "Safari can't reach the page". Both Flight Club pages (SpX-35 and Bandwagon 5) started to load, then Safari stopped with "a problem repeatedly occurred". Not yet tried on a desktop browser.
- Flight Club: LL2 gives a per-launch page (for Bandwagon 5: https://flightclub.io/result/3d?llId=3b430f81-0ff1-4d85-8a1a-cef0de326198). Robots rule blocks WebFetch. It is a simulation, not telemetry, and its terms are not checked.
- Other telemetry repos found (jonas-braun/spacex_flight_data 2018, wergil81/SpaceX 2017, rikkertkoppes/spacex-telemetry 2017): older than the pinned data. Not useful.

## Labels and sighting reports

| Input | Used in | Source | Age | Checked 2026-10-15 | Known problems | Replacement |
|---|---|---|---|---|---|---|
| 12 labels | data/labels.json, backtest | Local news pages and Reddit posts (reference/topics/charleston-sighting-reports.md) | 2018 to 2026 | Re-opened: the 4 abcnews4 pages, the Live 5 page (2021) and the Post and Courier page (2026-07-09) load, with dates and times that match the file. The Post and Courier caption still names the jellyfish effect. The three counton2.com pages refuse WebFetch today; a site-limited search still lists all three, so they exist. | The Yahoo copy for 2025-07-26 no longer shows a date. The original WCBD page exists: https://www.counton2.com/news/local-news/gallery-falcon-9-launch-seen-over-lowcountry-early-saturday-morning/ (found by search, not opened). Reddit posts cannot be opened by the agent. | Swap the 2025-07-26 source to the WCBD URL after it is opened. |
| SpX-35 reports (not yet a label) | Future label, observations | Live 5 News, 2026-10-13 (https://www.live5news.com/2026/10/13/photos-spacex-rocket-launch-takes-over-lowcountry-skies/); Post and Courier, 2026-10-13 (https://www.postandcourier.com/news/images-spacex-rocket-charleston-sc-coast/article_edd30f89-5bfb-4ecb-8995-c01ea71b241c.html) | 2 days | Read today. Live 5: residents saw a so-called jellyfish cloud. Post and Courier: trail seen from Charleston, Folly Beach, Moncks Corner and others; no plume wording. | SpX-35 is not in the snapshot. | Add to charleston-sighting-reports.md and to labels.json after the snapshot is regenerated. |

## Thresholds (config/visibility.json)

| Input | Value | Source | Checked 2026-10-15 | Status |
|---|---|---|---|---|
| screeningHeightM | 10000 | Provisional; Taylor 1984 (7 +/- 1 km), Bertolin 2020 (5 km) | Searched again. Chernouss et al. 2012 (Geophysica 48, 65-79) describe sunlit exhaust clouds at 100 to 700 km seen from about 1000 km, but give no screening height or Sun depression limit. | Still provisional. |
| maxSunElevationDeg | 0 | Twilight phenomenon notes | No new source. | Unchanged. |
| minElevationDeg | 5 | Provisional | No source found. | Still provisional. |
| minVisibleS | 60 | Provisional | No source found. | Still provisional. |
| minAltitudeM | 65000 | Spaceflight Now 2025-11-22 (stage separation about 65 km) | Not re-read. | Unchanged. |
| primeSunElevationDeg | -6 | USNO and NWS civil twilight | USNO RST page not re-read; definition is stable. | Unchanged. |

## Sun and Earth formulas, test fixtures

| Input | Used in | Source | Checked 2026-10-15 | Result |
|---|---|---|---|---|
| Sun position | engine/sun.js | USNO https://aa.usno.navy.mil/faq/sun_approx | Page read. g, q and L constants match engine/sun.js lines 23 to 25. Stated accuracy about 1 arcminute. | Match. |
| Sidereal time | engine/sun.js | USNO https://aa.usno.navy.mil/faq/GAST | Page read. It gives the form with 0.065709824279 DUT (for JD_TT = JD_UT) that engine/sun.js uses, and also a full form with 0.065707485828 DUT + 0.0854103 T. The equation of the equinoxes is at most about 1.1 s. | Match. |
| ECEF test cases | test/fixtures/ngs-ecef.json | NOAA NGS NCAT API | API answers (observer point: x 937015.706, y -5289083.645, z 3427687.953 m). Fixture cases not re-fetched (pinned). | API alive. |
| USNO celnav cases | test/fixtures/usno-celnav-sun.json | USNO celnav API | Not re-fetched (pinned). | Not checked. |

## Observer and places

| Input | Used in | Source | Checked 2026-10-15 | Result |
|---|---|---|---|---|
| Observer point | config/observer.json | api.zippopotam.us, 29412: 32.718, -79.9537 | Zippopotam unchanged. Census TIGERweb ZCTA layer, 29412: internal point 32.7130, -79.9521. | About 0.6 km apart. |
| ZIP points | scripts/observer-sensitivity.js | api.zippopotam.us, read 2026-10-13 | Census internal points read today. Distance from the zippopotam point to the Census point: 29439 0.4 km, 29401 0.5, 29577 0.7, 29482 1.2, 29201 2.1, 29451 Isle of Palms 4.3, 29464 Mount Pleasant 4.6, 29483 Summerville 5.6, 29902 Beaufort 10.1. 29455 Johns Island, left out as bad: Census gives 32.6852, -80.0910, 30.2 km from the zippopotam value, which confirms it was wrong. | Script distances and FINDINGS numbers rest on zippopotam points. |

Distances above are haversine distances on a 6371 km sphere, computed in the session with Python; they are not engine output.

## Sky view

| Input | Used in | Source | Checked 2026-10-15 | Result |
|---|---|---|---|---|
| Magnetic declination -8 | config/skyview.json | Not sourced | WMM-2025 coefficients (pygeomag 1.1.0, WMM_2025.COF, model date 11/13/2024) at 32.718 N, 79.9537 W, sea level, 2026.79: -8.28 degrees. High-resolution model: -8.21. The NOAA web calculator refused WebFetch. | Within 0.3 degrees. Sun calibration absorbs the rest. |
| Field of view 70 | config/skyview.json | Ben's iPhone, by eye, 2026-10-12 | No outside source exists; browsers do not report the lens. | Device value, one phone. |

## Runbook URLs (reference/topics/cape-launch-azimuths-and-inclinations.md)

| URL | Result 2026-10-15 |
|---|---|
| LL2 search and record | Answers. |
| orbitcodex Bandwagon 3 | Not re-read; SpaceNews is now the better source. |
| orbitalradar recovery fleet | Page loads; positions show only "Loading". No position readable by WebFetch. Needs a browser. |
| msi.nga.mil broadcast-warn API | Answers, but the newest NAVAREA IV entry is still May 2024. Not useful. |
| navcen.uscg.gov local notices | WebFetch failed again. |
| spacelaunchschedule.com Bandwagon 5 | Loads. Names drone ship ASOG and gives the Flight Club link. Its trajectory image file name says "FL-South-RTLS", which conflicts with the drone ship landing; treat it as a generic image. |
| flightclub.io | Robots rule blocks WebFetch. Needs a browser. |
| spacex.com/launches | Not re-checked (needs a browser). |
| jellyfish.johnkrausphotos.com | Loads, "v1.2, Public beta"; launch list did not render for WebFetch. |
| Cloudflare Workers limits | Unchanged for Free (10 ms CPU, 5 Cron Triggers, 50 subrequests, 100,000 requests a day). Paid now also lists 15 minutes CPU for a Cron interval of 1 hour or more. |
| FAA SLC-40 EA page | Loads; documents are on drs.faa.gov, which needs a browser. |

## Proposed changes and downstream impact

Status 2026-10-15 evening: items 2, 3 and 5 are applied; item 4 is applied as an extra source (the WCBD page could not be opened); items 1, 6 and 7 are not applied. See PLAN "Audit follow-ups".

1. Observer point to the Census ZCTA point (0.6 km). Impact: tripwire "SLC-40 to observer 466.0 km" may move in the tenths; backtest verdicts likely unchanged (FINDINGS shows 7 to 19 km moves change 0 or 1 of 59), but the tripwire counts must be re-run; FINDINGS Reference numbers for SpX-35 and the sky view would shift slightly. Value: low. Recommend: keep, and note the source difference.
2. ZIP points in scripts/observer-sensitivity.js to Census points, and add Johns Island back. Impact: the FINDINGS entry "The observer can be anywhere near Charleston" (distances and counts). No engine or page change.
3. Magnetic declination -8 to -8.3. Impact: sky view only; the drawn path moves 0.3 degrees before Sun calibration; no effect after calibration. Recommend: change and cite WMM-2025.
4. Source URL for the 2025-07-26 label to the WCBD page, after it is opened. Impact: none on numbers.
5. Bandwagon 5 source note: cite SpaceNews (about 45 degrees, SpaceX) and record the Wikipedia SSO conflict. Impact: none on numbers; the heading is set on 10-18.
6. Azimuth fan: no change. Record CSIS 2019 as a second 35 to 120 source. Impact: none.
7. Regenerate the LL2 snapshot (already in PLAN) to bring in SpX-35 with the two news reports. Impact: snapshot count, all backtest tripwires, labels count, README backtest paragraph.
