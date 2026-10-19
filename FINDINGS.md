# Space Jellyfish — Findings

What this project has concluded. Topical, not chronological. Resolved only —
no open items; those stay in PLAN.md.

Both sections are edited in place. If a result contradicts an entry, correct
that entry. The history lives in JOURNAL.md.

---

## Established

Discovered truths. Facts you did not choose.

### Tripwires
Expected counts, known splits, sanity bounds. Recompute a derived set against
these before you trust it. Hard-stop on mismatch.
- `npm test` — expected 94 tests, 94 pass, 0 fail (2026-10-16). It also
  passes with no `node_modules` (h5wasm is needed only to fetch GOES files). The count
  grows when tests are added; update this line in the same commit.
- `test/fixtures/usno-celnav-sun.json` — expected 12 cases. The engine must
  agree with each within 1/60 degree in GHA, declination, and altitude.
  Largest difference observed: 0.0070 degrees (altitude, 2026-10-13 case).
- `test/fixtures/ngs-ecef.json` — expected 4 cases. The engine must agree
  with each within 2 mm. Largest difference observed: 0.4 mm.
- SLC-40 to the observer along the surface — expected 466.0 km (289.5
  statute miles), within 0.5 km.
- `config/profiles.json` (2026-10-15) — expected 10 members and 2
  profiles: `falcon9-leo` (SpaceX CRS-16, SpaceX CRS-14, Starlink 5 to 8,
  SpX-DM2) and `falcon9-gto` (Bangabandhu-1, SES-12, Hispasat 30W-6).
  Altitude at 300 s: 169 to 189 km for LEO members (CRS 177 to 183,
  Starlink 169 to 172, DM-2 189), 150 to 158 km for GTO members. Altitude
  at the end of the data: 198 to 216 km for LEO, 164 to 165 km for GTO.
  Rebuilding with `node scripts/build-profiles.js` changes only the
  "built" date.
- `data/ll2-snapshot.json` (fetched 2026-10-16T00:41Z) — expected 507
  launches, 2017-01-21 to 2026-10-13. 435 are Falcon 9. 359 have orbit LEO
  and 73 have GTO. 503 have status Success and 4 have Failure. 8 pads.
  The first 506 records are byte-identical to the 2026-10-08 snapshot
  (SHA-256 of the records array, first 12 hex: 00eb5fefa0e2); the only
  new record is SpX-35. Whole array: 67beee3934d2.
- `node scripts/backtest.js` (2026-10-15, screening height 10 km, 10
  profile members) — expected 40 likely, 20 possible, 447 no, out of 507.
  33 of the 60 are prime. Starlink 10-45 and 10-49 are possible (they
  were likely with the 2018 members only).
  Share scored visible (likely or possible): 60 of 507, 11.8 percent.
  Labels: 0 of 5 `seen-plume` labels are missed. 1 of 8 `seen` labels has
  verdict 'no' (the Atlas V of 2026-04-27).
  Negatives chosen by clock time: 0 wrong of 82 (10:00 to 15:00 local) and
  0 wrong of 83 (23:00 to 02:00 local).
- Screening height sensitivity (507 launches): 5 km gives 60 not 'no', the
  same as 10 km; 30 km gives 53. The
  Atlas V of 2026-04-27 is 'no' at all three heights.
- `data/labels.json` — expected 13 labels: 8 `seen`, 5 `seen-plume`.
- `data/clouds/` (fetched 2026-10-16 12:24 to 12:34 UTC) — expected 33
  raw files and a manifest; `scripts/score-clouds.js` stops if a SHA-256
  does not match. 11 stations, 15,019 to 15,667 hours each of 15,672.
  Below 12,000 ft: 169,038 hours scored for ECMWF day 1, 43,753 cloudy.
  Full sky (CHS, NBC, SAV, JAX): 62,224 hours. Twilight: 22,357 and 8,219.
  Station reports with a layer above 12,000 ft: CHS 7,966, NBC 2,559,
  SAV 6,988, JAX 10,662, HXD 17, others 0.
- `clouds/results.json` — NBM twilight skill below 12,000 ft, days 1 to 7:
  51, 47, 44, 41, 37, 31, 26. HRRR low-cloud skill, all hours: 65.
  `test/clouds-report.test.js` checks the report tables against it.
- `data/goes/acm-stations.json` (fetched 2026-10-16) — expected 300
  sample hours (240 twilight, 60 day; 2,002 and 6,765 candidates at JZI)
  and 782 scans. `--recheck 5` gave 5 of 5 identical (file SHA-256 and
  box values). `data/goes/station-pixels.json`: 11 stations, pixel 0.04 to
  1.36 km from the airport.
- `data/goes/ccl-stations.json` (fetched 2026-10-16) — expected 782 CCL
  files, one per mask scan, 0 not found. `--recheck 5` gave 5 of 5
  identical.
- `clouds/goes-ccl-results.json` — twilight, max(CF1, CF2) against the
  sky below 10,000 ft: 1,517 pairs, skill 21 (hit 23, false alarm 2).
  Dropped pairs: missing value 1,175 (all TCF = 65531), no report 65, no
  scan 10.
- `data/goes/relative-acm.json` (fetched 2026-10-16) — expected 2,001
  twilight hours at JZI, 1,984 scans, 17 hours with no scan within 5
  minutes. `--recheck 5` gave 5 of 5 identical. `data/goes/water-nbm.json.gz`:
  12 water cells, 0.42 to 1.42 km from the places, elevation 0.
- `clouds/goes-relative-results.json` — NBM day 1, twilight: skill 48
  water, 51 land; Q 0.926 (0.888 to 0.947), 1,246 events, verdict holds.
  Near-Charleston land: Q 0.886 (0.846 to 0.916).
- `clouds/goes-results.json` — twilight, below 12,000 ft: 2,506 pairs,
  skill 48 (hit 84, false alarm 36). Twilight, full sky: 916 pairs, skill
  66. Dropped pairs: no report 65, no scan 10, few good pixels 3.

### Intentional, not bugs
Things that look wrong but are correct. Do not "fix" these.
- None yet.

### Known permanent limitations
- Sun position is good to about 1 arcminute. The USNO algorithm states this
  limit. It is enough for this project; do not chase more accuracy.
- Angles are geometric. The engine applies no atmospheric refraction.
- `surfaceDistanceM` uses a sphere of the mean radius. It is good to about
  0.5 percent. Look angles and ranges use the WGS 84 ellipsoid and do not
  have this limit.
- The ascent profiles come from 2018 launches (Block 4 and Block 5) and,
  for LEO, from four 2020 Starlink launches and DM-2 (2020). There is no
  flight after 2020 and no vehicle other than Falcon 9.
- Downrange distance in the profiles is derived from webcast speed and
  altitude (by the telemetry author for the 2018 members, by
  scripts/lib/webcast-telemetry.js for the 2020 members). It is not a
  tracked position. LEO members differ by up to 162 km in downrange at
  400 s (610 to 773 km); GTO members by up to 76 km.
- The profiles end at about second-stage cutoff (493 to 549 s). The engine
  models nothing after that, and no first-stage boostback or entry burn.
- The trajectory is one great circle at a fixed azimuth. The engine does not
  model the turn caused by Earth rotation or a dogleg. The bearing range
  must absorb this error.
- The USNO celestial navigation API returns no Sun entry when the Sun is far
  below the horizon. The fixture holds only daytime and twilight cases. The
  lowest Sun altitude in the fixture is -11.2 degrees.

### Dead-ends (do not re-explore)
- Tried a Cloudflare Pages Function (`functions/api/upcoming.js`) that asked
  LL2 with no token → LL2 answered 429 on 4 of 4 requests on 2026-10-08 →
  removed. Cloudflare sends requests from addresses that many customers
  share, and LL2 counts 15 requests per hour for each address. Do not ask
  LL2 from Cloudflare without a token.
- Did NOT tune a threshold to remove a missed label. See Decisions.
- NGA MSI broadcast warnings API
  (`msi.nga.mil/api/publications/broadcast-warn`) for launch hazard areas
  → newest NAVAREA IV entry is from May 2024, none about a launch
  (checked 2026-10-15 and 2026-10-18) → not used. Use the Coast Guard
  BNM sources in the Runbook, step 6.

### Reference
API quirks, schemas, formulas, constants. Organized by topic.

Every entry below is an external claim, checked on 2026-10-08. Check it again
before you rely on it.

#### Distance from the Cape to Charleston
- The engine computes 466.0 km (289.5 statute miles) from SLC-40 to the
  observer in config/observer.json. The bearing from the observer to the pad
  is 187.6 degrees.
- reference/handoff-brief.md says "~330–380 mi". The computed value does not
  agree with the brief. The computed value is the one to use.
- A rocket 150 km above SLC-40 is 15.6 degrees above the horizon at the
  observer. A point on the ground at the pad is 2.1 degrees below it.

#### What a launch looks like from the observer (engine output, 2026-10-08)
- SpaceX CRS-16 profile on azimuth 44.9 degrees from SLC-40: elevation 15.6
  degrees at 200 s, 30.4 at 300 s, 26.9 at 400 s, 10.7 at 500 s. The bearing
  moves from 177 to 66 degrees.
- The same profile on azimuth 135 degrees: elevation peaks near 11.5 degrees
  at 300 s and is 1.5 degrees at 500 s.
- SES-12 profile on azimuth 90 degrees: elevation peaks near 11.0 degrees at
  300 s.
- A northeast launch is 2 to 3 times higher in the Charleston sky than a
  southeast or due-east launch.

#### Reported sightings against the snapshot (2026-10-08, SpX-35 added 2026-10-15)
- data/labels.json holds 13 launches with a report that the launch was seen
  from the Charleston area: 10 from local news pages, 2 from Reddit posts
  alone, and SpX-35 from Ben's own sighting and two news pages. Each matches exactly one launch in data/ll2-snapshot.json.
  Sources and quotes: reference/topics/charleston-sighting-reports.md.
- 9 of the first 12 lifted off between 05:00 and 06:00 local time (SpX-35:
  06:33). The other 3
  lifted off in the evening (17:32, 17:56, and 19:32) or later (20:53).
- The news pages mostly say only that the rocket was seen. One uses the word
  "jellyfish": 2026-07-09, Starlink Group 10-42. Four of the 5 `seen-plume`
  labels rest on that page and on photos in Reddit posts. The fifth
  (SpX-35, 2026-10-13) rests on Ben's own measured sighting and two news
  reports, one of which names a jellyfish cloud.
- One source conflict: the ABC News 4 page for 2020-11-13 says the Atlas V
  launched at "5:13 p.m."; the snapshot gives 22:32 UTC, which is 5:32 p.m.
  local time.

#### How often the engine says a launch can be seen (backtest, 2026-10-15)
- 60 of 507 launches since 2017 are likely or possible (11.8 percent). By
  year: 1, 1, 2, 2, 4, 8, 8, 15, 9, and 10 for 2017 to 2026 (2026 runs to
  2026-10-13).
- 33 of the 60 are prime: the Sun is 6 degrees or more below the horizon.
- These counts have no weather in them, and they rest on provisional
  thresholds and on Falcon 9 profiles from 2018 and 2020.

#### Sources for the visibility thresholds (research, 2026-10-08)
- No source gives a Sun depression limit for plume visibility, a lowest
  elevation, or a screening height for rocket plumes. See
  reference/topics/twilight-phenomenon-space-jellyfish.md and
  reference/topics/twilight-definitions-and-earth-shadow.md.
- LL2 detailed records hold no inclination and no azimuth. See
  reference/topics/cape-launch-azimuths-and-inclinations.md.
- The Launch Dashboard API was offline on 2026-10-08. No Starlink ascent
  data with altitude against time was found. See
  reference/topics/falcon9-ascent-timeline.md.

#### Who launches from Florida (snapshot and LL2, 2026-10-08)
- 2026 to 2026-10-02: 58 Florida launches. 51 are SpaceX (48 Falcon 9, 3
  Falcon Heavy), 5 are ULA (4 Atlas V, 1 Vulcan), 1 is SLS, 1 is New Glenn.
- Florida Starlink launches by month in 2026: 6, 5, 7, 2, 4, 3, 3, 3, then 0
  in September and 0 in October to 2026-10-02. The last one in the snapshot
  is Starlink Group 10-49 on 2026-08-25.
- LL2 lists "Starship | Starlink Group 31-1 (Starship Flight 14)" on
  2026-09-28T12:48 UTC from Orbital Launch Pad 2, SpaceX Starbase, Texas.
  The snapshot has no Starship launch from Florida.
- SpaceX said Starlink 10-49 (2026-08-25) was the last Falcon 9 Starlink
  launch from Florida. Future Florida Starlink missions will fly on
  Starship, with no date given. Source: Spectrum News 13, 2026-08-25,
  quoting Kiko Dontchev (SpaceX VP of Launch) on X. Read 2026-10-15. The X
  post itself was not read.
- 35 of the 60 backtest launches rated likely or possible are Starlink,
  and 22 of the 33 prime ones (script run 2026-10-15, 507 launches). The past rate of
  chances is therefore much higher than the future rate.
- LL2 upcoming list for Florida (one request, 2026-10-08): 203 entries. One
  has status Go: Falcon 9 Dragon CRS-2 SpX-35, 2026-10-13T10:33:44Z, SLC-40.
  The others shown have status TBD and placeholder dates.
- Engine verdict for SpX-35 at that time: likely, prime, low confidence. Sun
  10.1 degrees below the horizon. On azimuth 50 with the two ISS profiles:
  visible from about T+190 s to T+530 s, peak 27 to 29 degrees up near
  bearing 127 to 133, moving from bearing 173 to 178 round to 67 to 69.

#### One comparison with the Space Jellyfish Predictor (2026-10-08)
- For SpX-35 on 2026-10-13 the site shows "Rocket in sunlight: T+03:15" and
  a northeast arrow (screenshot from Ben). The engine gives T+3:07 and
  T+3:14 for the two ISS profiles at a screening height of 10 km, and
  T+3:26 and T+3:31 at 30 km.
- This is one number from another model. It is weak support for a screening
  height near 10 km. Detail: reference/topics/prior-art-jellyfish-predictor.md.

#### A Wallops launch seen from Charleston
- A Reddit post from Folly Beach on 2022-11-07 shows a glowing plume at
  about 5:30 local. LL2 lists Antares 230+ Cygnus NG-18 from Wallops,
  Virginia, at 10:32:42 UTC that day. Wallops is 698 km from the observer
  on a bearing of 34 degrees. It is out of scope.

#### Falcon 9 webcast telemetry
- https://github.com/shahar603/Telemetry-Data, Unlicense, commit `b245d3b`.
  `<mission>/JSON/analysed.json` holds time (s), altitude (km), and
  downrange distance (km) at 1 s steps. The mission README gives orbit,
  block, and landing type.
- DM-1, Eshail 2, and TelStar v19 have no README table, so their block and
  orbit are not stated. They are not used.

#### Reference data sources for tests
- USNO celestial navigation API: `https://aa.usno.navy.mil/api/celnav` with
  `date`, `time`, and `coords`. It returns the Sun GHA, declination, computed
  altitude `hc`, and azimuth `zn`.
- NOAA NGS NCAT API: `https://geodesy.noaa.gov/api/ncat/llh`. It returns
  ECEF `x`, `y`, `z` for a latitude, longitude, and ellipsoid height.
- `scripts/fetch-reference-fixtures.js` reads both and writes the fixtures.

#### Launch Library 2 (LL2)
- Base URL: `https://ll.thespacedevs.com/2.3.0/`.
- Rate limit: https://thespacedevs.com/llapi says "up to 15 non-authenticated
  requests per hour".
- CORS: a request to `/launches/upcoming/` with an `Origin` header returned
  `access-control-allow-origin: *`. A browser page can call LL2 directly.
- `location__ids=12` is "Cape Canaveral SFS, FL, USA". `location__ids=27` is
  "Kennedy Space Center, FL, USA".
- `https://ll.thespacedevs.com/2.3.0/api-throttle/` reports the limit, the
  current use, the seconds to the next free request, and the address that
  LL2 counts. The limit is counted for each address.
- `https://lldev.thespacedevs.com/2.3.0/` answers 200. Its record for SpX-35
  had `last_updated` 2026-10-03 when read on 2026-10-08. It may be a stale
  copy. Do not use it for live times until its update rule is known.
- `limit=100` is accepted. `/launches/previous/` with `net__gte` and
  `ordering=net` pages through history; `next` gives the next page.
- A launch record in `mode=detailed` carries `id`, `net`, `net_precision`,
  `window_start`, `window_end`, `status`, `mission.orbit`, `flightclub_url`,
  and `pad` with `latitude` and `longitude`.
- Orbit data on an upcoming launch can be as thin as the abbreviation "LEO".
  Three upcoming launches were checked and all three showed only "LEO".

#### NWS API, api.weather.gov (2026-10-15)
Docs read and live requests from a page at jellyfish.benneely.com. Full
detail and quotes: reference/data-sources.md.
- The docs require a User-Agent. A browser sends its own; a page cannot
  set one. The rate limit is not published.
- CORS works: the page read the JSON of `/points` and of the grid
  forecast.
- The observer maps to grid CHS/86,74. `skyCover` is in percent, over
  ISO 8601 intervals (1, 3 and 6 hours seen), for about 7 days ahead.
  There is no split by cloud height.
- Cache: `/points` 24 h, grid forecast 1 h.
- Offshore on bearing 134 to 138: a grid at 27 and 59 km, no grid at 107
  and 174 km.

#### Cloud forecast test (2026-10-16)
Full report: clouds/README.md. Tables: clouds/results.md. Knowledge-base
note: reference/topics/cloud-forecasts-for-sky-viewing.md.
- Four models (ECMWF IFS 0.25, GFS, NBM, HRRR) through Open-Meteo, against
  hourly reports from 11 coastal airports, 2025-01-01 to 2026-10-15.
- NBM total cloud scored best at every lead from 1 to 7 days on the sky
  below 12,000 ft. Against the full sky (four stations) NBM and the blend
  of ECMWF, GFS and NBM were close; the blend led near Charleston at 1 to
  2 days.
- HRRR low cloud scored best for low cloud at short lead (skill 65, GFS
  38, ECMWF 25). ECMWF's low layer caught 27 percent of low cloud.
- HRRR total cloud fell from skill 59 at short lead to 35 at 1 day.
- 67 to 70 percent of the "false alarms" against the sky below 12,000 ft
  had a reported layer above 12,000 ft at the full-sky stations: high
  cloud that automatic stations cannot report.
- The earlier one-week score (2026-10-09 to 16, 816 hours) put ECMWF
  lowest on MAE. The 21-month test does not agree; that week was mostly
  clear (142 cloudy hours).
- Open-Meteo `gfs_seamless` day-1 values equal `gfs_hrrr`; `gfs_global`
  is GFS.

#### Satellite check, step 1: GOES Clear Sky Mask against airports (2026-10-16)
Report: clouds/README.md, "Satellite check, step 1". Tables:
clouds/goes-results.md. Note: reference/topics/goes-clear-sky-mask.md.
- Result: no-go under the rule set before the data (skill 70 or more at
  twilight below 12,000 ft). Skill 48; NBM day 1 scores 51 on that truth.
  Full sky: 66.
- False alarms are 36 percent below 12,000 ft and 17 percent against the
  full sky. Day skill 51, twilight 48, Sun 0 to -3 degrees 44.
- ACMC files hold BCM, ACM (four levels), Cloud_Probabilities and DQF.
  GOES-16 and GOES-19 CONUS files share one x and y grid.
- The file's stated centre (30.0830, -87.0970) is the midpoint of NOAA
  STAR grid pixels (749, 1249) and (750, 1250). The east bound equals the
  grid's north-east corner longitude (-52.9469).
- The ECM ATBD v1.2 gives day and night accuracy, but none for twilight.
  The GOES-19 ECM Provisional ReadMe (18 February 2025) reports no major
  issues and says nothing about twilight.

#### Satellite check, test 2: GOES Cloud Cover Layers against airports (2026-10-16)
Report: clouds/README.md, "Satellite check, test 2". Tables:
clouds/goes-ccl-results.md.
- Result: no-go under the approved rules (skill 80 or more at twilight).
  Skill 21; HRRR low cloud scores 64 on that truth.
- The missing-value rule dropped TCF = 65531, which marks full cloud
  (65531 x 1.526e-5 = 1.0000; 1,163 of the 1,175 boxes were mostly cloudy
  in the mask). Counted back in, skill is near 19. No NOAA document read
  states the meaning of 65531.
- CCL layers overlap in the files, so the product uses cloud base, not
  only cloud top as the ATBD v1.0 says.

#### Satellite check, test 3: NBM over land and water, judged by GOES (2026-10-16)
Report: clouds/README.md, "Satellite check, test 3". Tables:
clouds/goes-relative-results.md.
- Result: holds under the approved rule (lower 95 percent bound of
  Q = skill(water) / skill(land) at 0.85 or more). Day 1: Q 0.926
  (0.888 to 0.947). Days 2 to 7: Q 0.94 to 1.06.
- Near-Charleston land (LRO, CHS, JZI), which does not decide: Q 0.886
  (0.846 to 0.916).
- GOES calls 63 percent of water pairs cloudy and 47 percent of land pairs.
- All known biases favour "holds" (mask a little better over ocean;
  coastal airport boxes take in sea).
- Open-Meteo `cell_selection` defaults to `land`. For the 12 water places,
  `land`, `sea` and `nearest` gave the same NBM cell.

#### Site cache headers (2026-10-15)
- `.js`, `.css` and `.png` from jellyfish.benneely.com come with
  `cache-control: public, max-age=14400, must-revalidate`. HTML and JSON
  come with `max-age=0`. After a deploy, the browser kept the old app.js
  until a cache-bypass request.
- A `_headers` file with `/*` and `max-age=0` was deployed (commit
  9309d24). Pages consumed it (`/_headers` is not served), but `.js`,
  `.css` and `.png` still came with max-age 14400.
- Cause, from the Cloudflare docs (developers.cloudflare.com/cache/how-to/
  edge-browser-cache-ttl/, read 2026-10-15): the zone setting Browser
  Cache TTL defaults to 4 hours and overrides an origin Cache-Control
  that is lower. "Respect Existing Headers" stops that.
- Fix (2026-10-15, about 02:30 UTC): Ben asked for the whole zone. The
  benneely.com Browser Cache TTL was changed from 4 hours to Respect
  Existing Headers in the dashboard. About 15 s later, `/app.js`,
  `/style.css`, `/engine/weather.js` and `/assets/jellyfish.png` came
  with `max-age=0, must-revalidate`. Other sites on the zone now send
  their own headers; their headers were not checked.

#### Where cloud can block the line of sight (computed 2026-10-15)
- Ground distance from the observer at which the sight line rises above a
  cloud height. Sphere of mean radius, no refraction. The cloud heights
  are examples, not sourced values.
  - Elevation 5 degrees: 22 km (2 km cloud), 65 km (6 km), 123 km (12 km).
  - 10 degrees: 11, 33, 66 km. 15 degrees: 7, 22, 44 km.
  - 20 degrees: 5, 16, 33 km. 30 degrees: 3, 10, 21 km. 40 degrees: 2,
    7, 14 km.
- Cloud near the plume is far below the sight line. The cloud that can
  block the view is the near part of the triangle. At 10 degrees or more,
  no cloud beyond 66 km can block it. That is inside the grid, which
  reaches at least 59 km offshore.
- Directional points per launch, over the 60 snapshot launches that are
  not 'no' (one-off commands, 2026-10-15; bins of 10 degrees, points every
  15 km, cloud top 12 km):
  - Every visible sample, no cap: 7 to 97 (median 74); reach up to 123
    km. The long reach comes from samples near the 5 degree lowest
    elevation.
  - Fixed limit of 20 degrees: 17 of the 60 launches get no ray, because
    they never reach 20 degrees.
  - Top 20 percent of each track's arc and a 60 km cap (0.4.0 and
    0.5.0): 7 to 33 (median 28). Fan class 32 median (50 launches),
    due-east class 19 (10 launches). SpX-35 flown as a station launch: 8
    points. The cap cut 248 of 521 rays (checked 2026-10-16).
  - Top 20 percent of the arc, cap 150 km (config in use from 0.6.0): 7 to
    52 places (median 32); no ray reaches the cap; longest ray 123 km.

#### Engine CPU time (2026-10-08, before the 2020 members)
- On the development Mac with Node 26: 0.43 ms for each launch over the
  snapshot, and 13 ms for a 25-step slip table of a fan launch. Not
  measured inside a Worker. The LEO profile now has 7 members, not 2, so
  LEO work is about 3.5 times larger. Measure again before Phase 3.

#### Cloudflare Workers limits
Source: https://developers.cloudflare.com/workers/platform/limits/
- Workers Free: 10 ms CPU for each HTTP request and each Cron Trigger run.
  5 Cron Triggers for each account. 50 subrequests for each run. 100,000
  requests each day.
- Workers Paid: 30 s CPU for a Cron Trigger with an interval below 1 hour.

---

#### Sky view field tests (Ben's iPhone, Safari, 2026-10-12 to 15)
- Drawn Sun on the real Sun within about 1 degree: at azimuth 172,
  elevation 49 (10-12, after calibration) and at 250, 13.5 (10-15, before
  recalibrating, at the SpX-35 spot, facing west). Stored compass error
  -3.4 degrees.
- Field of view 65 put the ring about 20 percent too far out; 70 worked.
- The iOS compass heading moved about 1 degree per degree of roll (screen
  recording, 10-15). Our camera model does not move with roll (test).
- How the sky view computes what it draws: reference/topics/model-sky-view.md.

#### Source audit (2026-10-15)
Full table: reference/source-audit.md. No pinned value was changed.
- Telemetry-Data commit b245d3b is still the repository HEAD.
- USNO Sun and sidereal time constants still match engine/sun.js.
- Magnetic declination at the observer is -8.28 degrees by WMM-2025 for
  2026.79. config/skyview.json has -8.
- The Census ZCTA point for 29412 is 0.6 km from config/observer.json.
  The zippopotam point is kept; 0.6 km does not change a verdict.
  Four ZIP points in scripts/observer-sensitivity.js are 4.3 to 10.1 km
  from the Census points.
- Azimuth limits: a second source gives 35 to 120 degrees (CSIS, Roberts,
  2019). Wikipedia still gives 37 to 114. The FAA SLC-40 environmental
  documents (2020, 2025) give no azimuth numbers.
- Bandwagon: SpaceNews reports that SpaceX said about 45 degrees.
  Wikipedia lists Bandwagon-5 as SSO; LL2 says mid-inclination. Conflict.
- No source gives a screening height, a lowest elevation, or a shortest
  visible time for rocket plumes. The three values stay provisional.

#### Bandwagon 5 direction (2026-10-18)
- Coast Guard CGD-SE BNM 9080-26 (NAVCEN chart viewer, Ben's
  screenshot) puts the launch hazard area east of the Bahamas, about
  708 km out on bearing 118 from SLC-40. Heading set to southeast in
  config/launch-directions.json.
- ASOG was still at Port Canaveral at 06:53 local the day before. LL2
  still gave ASOG at 600 km (record of 2026-10-17 17:51Z).
- Engine at window open (10:30Z, local script run 2026-10-18):
  southeast gives likely, prime, Sun -11.8 degrees, peak elevation 9 to
  13 degrees at bearing 162 to 168, visible 200 to 240 s. Northeast
  would have given 24 to 28 degrees. A low south-southeast pass.
- Scrub (2026-10-18, Ben): Spaceflight Now reported that poor weather
  scrubbed the Monday attempt and SpaceX moved to Tuesday. Ben links
  this to rough seas; both drone ships were still in harbor on Monday
  morning. Ben saw that SpaceX's own page and other sources had not
  changed. LL2 had changed by 2026-10-19 10:08Z: NET and window open
  2026-10-20 10:30Z, window close 11:30Z, status Go, 85 percent,
  concern "Liftoff Winds" (read with WebFetch, 2026-10-19).
  10:08Z is the record's last edit, not the time of the date change.
  The time of the date change is not known.
- Lesson: a scrub can reach the page late, because the page reads only
  LL2. Check a news source on the morning of a launch.
- Engine for Tuesday (local script run 2026-10-19, southeast): 10:30Z
  likely, prime, Sun -11.9 degrees, peak and bearing the same as Monday.
  11:00Z likely, not prime (Sun -5.7). 11:30Z not visible. The Monday
  run gave the same numbers as the record above.
- The Coast Guard hazard windows (19 to 25 Oct) include Tuesday.

#### SpX-35 seen from James Island (2026-10-13)
- Wide plume seen. Engine: likely, prime. At 254 and 277 s after liftoff,
  height agreed within about 1 degree; the rocket was 19 to 29 degrees
  farther east than the engine placed it. Numbers: data/observations.json.
- The compass check (above) rules out a 20 degree compass error, but it
  faced west, not southeast. Leading cause: the 2018 ascent profiles put
  the rocket too far back along its track. One launch; not proven.
- Fifth `seen-plume` label in data/labels.json (added 2026-10-15, after
  the snapshot refresh). The verdict was known before the label was
  written.
- Ascent data check (2026-10-15, `node scripts/compare-ascent-sources.js`):
  the sighting needs about 364 km downrange at 254 s and 389 km at 277 s,
  plus or minus 10 km. CRS-14 and CRS-16 (2018) give 264 and 203 km at
  254 s. 2020 Starlink flights give 294 to 297 km and cut the azimuth miss
  to 13 to 14 degrees (254 s) and 6 to 7 degrees (277 s), with height still
  within 1 degree. DM-2 (2020) does not help. The 2018 profiles are too
  short downrange; a 2020 Starlink ascent is closer but still short.
  Detail: reference/topics/falcon9-starlink-2020-telemetry.md.
- The two measured points imply about 1.1 km/s of ground travel between
  them. Every flight in the data moves 2.0 to 2.6 km/s then. The points fit
  only at the edge of their stated 2 degree error.
- Public reports for the same launch (read 2026-10-15): Live 5 News says
  Lowcountry residents saw a jellyfish cloud; Post and Courier reports the
  trail seen from Charleston, Folly Beach, Moncks Corner and other places.
  URLs in reference/source-audit.md.

#### The observer can be anywhere near Charleston
- `node scripts/observer-sensitivity.js` (507 snapshot launches, Census
  ZCTA points, run 2026-10-15). Folly Beach to Isle of Palms (6 to 23 km):
  same verdict for all 60 that James Island rates likely or possible,
  Johns Island (13 km) included. Peak height within 0.2 to 1.3 degrees
  (median). Summerville (43 km): 60 of 60, about 4.6 degrees lower.
  Columbia (172 km): 57 of 60, about 14 lower. (Run with 10 profile
  members.)
- The rocket is 290 to 1,180 km away while visible. This compares the
  model with itself; it does not test it.

## Decisions

Choices made, and why. Mark settled ones `(locked)`.

### License: PolyForm Noncommercial 1.0.0 (locked)
- What: The repo uses the PolyForm Noncommercial License 1.0.0.
- Why: The owner wants permissive reuse, but not commercial use.
- Rejected: MIT and Apache-2.0, because they permit commercial use. CC BY-NC,
  because Creative Commons does not recommend its licenses for software.

### Journal location: JOURNAL.md (locked)
- What: Session debriefs go to JOURNAL.md.
- Why: It needs no network and stays in the cold-start read path.
- Rejected: GitHub issues labeled `journal`.

### Data-driven rules apply (locked)
- What: The reproducibility and tripwire sections in AGENTS.md stay.
- Why: The backtest against historical launches is a derived set. Its numbers
  must be pinned and checked.
- Rejected: Deleting both sections for lighter rules.

### One engine, two consumers (locked)
- What: The geometry engine is a set of pure ES modules. The page and the
  Worker both import it.
- Why: One model gives one answer. The page and the alert cannot disagree.
- Rejected: A separate copy of the maths in the Worker.

### The backtest reads only the pinned LL2 snapshot (locked)
- What: Past launches are fetched once and committed. The backtest reads
  that file.
- Why: LL2 allows 15 requests per hour. Live data would also make the
  results drift.
- Rejected: Live LL2 calls in the backtest.
- Refresh rule (Ben, 2026-10-15): refresh the snapshot on purpose after
  every launch we watch, and before any exit-gate claim. Each refresh
  commit states what moved (counts, labels, tripwires). Never refresh as
  a side effect of other work.
- Rejected (2026-10-15): unpinning the backtest. Drift in LL2 records
  would hide code bugs behind moving numbers.

### Ground truth is a hand-curated list of public sighting reports (locked)
- What: Positive cases are public reports that the plume was seen from the
  Charleston area, each with a source URL. Negative cases are only launches
  that physics rules out.
- Why: Ben has no sighting of his own. A twilight launch with no report
  proves nothing, because cloud or no observer can also explain silence.
- Rejected: Scraping other visibility sites. Physics checks alone. Treating
  "no report" as a negative.

### All Cape and KSC vehicles are tracked (locked)
- What: Every launch from Cape Canaveral and KSC is evaluated. A vehicle
  with no tuned profile uses a generic profile and softer alert wording.
- Why: A twilight launch of any vehicle can make a plume.
- Rejected: SpaceX only.

### Alerts go to one recipient (locked)
- What: One email address, held as a Worker secret.
- Why: This is a personal tool. The page is public; the alerts are private.
- Rejected: A fixed list. Public sign-up, which needs a subscriber store,
  confirmation, unsubscribe, and abuse handling.

### State lives in Workers KV (locked)
- What: Alert state and the cached launch list live in KV.
- Why: Frequent polling would fill the commit history.
- Rejected: GitHub as the state store.

### The Worker reads launches from a KV cache (locked)
- What: The cron refreshes the LL2 launch list slowly and reads the cache on
  other runs.
- Why: A poll every 5 minutes is 12 requests per hour against a limit of 15.
- Rejected: An LL2 call on every cron run.
- Limit found 2026-10-08: LL2 answers 429 to requests from Cloudflare with
  no token (see Dead-ends). This decision holds only when the Worker has a
  source of launch times that accepts it. PLAN Phase 3 has the open item.

### No alerts before the Phase 1 exit gate (locked)
- What: Phase 3 does not start until the backtest exit gate in PLAN is met.
- Why: A wrong "go outside" email costs trust.
- Rejected: Building the alert path in parallel with the model.

### Tests read pinned fixtures, never the network (locked)
- What: Reference values from USNO and NOAA NGS are fetched by
  scripts/fetch-reference-fixtures.js and committed under test/fixtures/.
- Why: The tests must give the same result on every run, and offline.
- Rejected: Calling the reference APIs from the tests.

### The equation of the equinoxes is skipped (locked)
- What: engine/sun.js uses mean sidereal time, not apparent sidereal time.
- Why: USNO gives the largest difference as about 1.1 seconds of time, which
  is about 0.005 degrees. The solar formula itself is good to 1 arcminute.
- Rejected: Adding the nutation correction.

### README follows the owner's style guide (locked)
- What: README and other public text for humans use first-person plural,
  no em-dashes, calibrated hedging, numbers with context and a caveat, and
  named limitations. PLAN, FINDINGS, and JOURNAL stay in ASD-STE100.
- Why: Ben gave a personal style guide for public text on 2026-10-08. The
  guide is not in this repo; the rules above are the part that applies.
- Order (Ben, 2026-10-19): what a reader needs first. Launch-morning
  links, then how to read a card, then how it works now, how well it
  works, a short "how we got here" with links to FINDINGS and clouds/,
  and what could come next. Development detail stays in FINDINGS,
  JOURNAL and reference/, linked, not repeated.
- Test for README text (Ben, 2026-10-19): it must make sense to a reader
  a year from now who never heard of the launch it came from. Single
  launches, sessions and dated events go in JOURNAL or FINDINGS. The
  README keeps only the lasting rule or link they taught us. CHANGELOG
  is a dated history, so it is exempt. The Atlas V sighting of
  2026-04-27 left the README; it stays in data/labels.json and here.
- Rejected: ASD-STE100 for the README. The build-order layout (a long
  Status section first; the links Ben needed on launch morning were near
  the bottom).

### Pad coordinates come from the LL2 record (locked)
- What: There is no pad config file. The engine takes the pad latitude and
  longitude from each launch record.
- Why: LL2 already carries them. A second copy can drift.
- Rejected: `config/pads.json`.

### A profile is a set of real flights, not an average (locked)
- What: Each profile lists member missions. The engine evaluates each member
  and reports the range.
- Why: The spread between members is the honest measure of profile
  uncertainty. An average hides it.
- Rejected: One averaged curve for each orbit class.

### reference/ is a knowledge base with progressive disclosure (locked)
- What: Each note in reference/ starts with front matter that says what the
  note answers. reference/INDEX.md lists all notes. Read the index, then
  the front matter, then the body, then the original source.
- Why: Ben asked for traceable sources on 2026-10-08, in the same form as
  `neely/follySurf-data`. FINDINGS holds our conclusions; reference/ holds
  where the information came from. Ben also asked for the mathematics of
  the model there: the notes named `topics/model-*.md` explain how the
  engine works and list ideas to test.
- Rejected: Putting source detail in FINDINGS.
- Added 2026-10-18 (Ben): `reference/START-HERE.md`, a reading tour for
  people. It is not a note: build_index.py skips it, and the agent read
  path does not include it. Rejected: a human tour inside INDEX.md or
  reference/README.md (more text on the agent path).

### Thresholds live in config/visibility.json, each with a source (locked)
- What: engine/visibility.js holds no threshold. Each value in the config
  names its note in reference/, or says it is provisional.
- Why: A value with no source must be visible as such.
- Rejected: Constants in the code.

### No threshold changes to remove a missed label (locked)
- What: A missed label is reported and stays in PLAN until its cause is
  known.
- Why: Tuning to 12 labels would fit noise, and AGENTS says a contradicting
  result outranks the hypothesis.
- Rejected: Raising or lowering the screening height until the miss goes.

### The verdict has three levels and a prime flag (locked)
- What: A launch is likely when every track has at least 60 s of visible
  sunlit flight, possible when some tracks do, and no when none does. Prime
  means the Sun is at or below -6 degrees.
- Why: The spread over tracks is the trajectory uncertainty. A single number
  would hide it.
- Rejected: One score from 0 to 100, because no source supports the weights.

### The azimuth fan runs from 37 to 124 degrees (locked)
- What: Launches with no known direction are flown on 8 azimuths from 37 to
  124 degrees.
- Why: One source gives 37 to 114 degrees for the Cape. A 43 degree Starlink
  flight on 2025-11-22 went southeast, which the azimuth relation puts at
  123.6 degrees. An observed flight outranks a quoted range.
- Rejected: The quoted range alone.

### Only a `seen-plume` label can be a miss (locked)
- What: A 'no' verdict is a miss only for a label of `seen-plume`. A `seen`
  label with a 'no' verdict is listed, not counted.
- Why: The engine predicts a sunlit plume. A rocket flame can be seen at
  night from Charleston with no sunlight on it. Ben read the Atlas V post of
  2026-04-27 and said it shows "a bright moving point with a short tail if
  at all". The Space Jellyfish Predictor site names the same case as one it
  does not model.
- Rejected: Counting every sighting as a required hit. That would push the
  thresholds toward calling night launches jellyfish.
- Note: this rule was written after the result was known. It rests on what
  the photo shows, not on the verdict.

### Station launches fly one known azimuth (locked)
- What: A launch that LL2 marks with the program "International Space
  Station" is flown on the northeast azimuth for 51.6 degrees (45.0 degrees
  from SLC-40), with medium confidence.
- Why: The inclination is known, so the fan is not needed. The page can
  then give one direction and one height.
- Rejected: The fan for every LEO launch.
- Limit: The snapshot holds no program names, so the backtest still uses
  the fan for station launches.

### The page asks LL2 from the browser (locked)
- What: The page asks LL2 for upcoming launches from the visitor's browser.
  It keeps the answer for 20 minutes. If LL2 fails it uses the answer saved
  in the browser, then `data/upcoming-fallback.json`, and says the copy is
  old.
- Why: Each visitor has their own LL2 allowance of 15 requests per hour. A
  feed on Cloudflare was tried and failed (see Dead-ends).
- Fallback refresh: a GitHub Action runs `save-upcoming-fallback.js` once
  a day and commits only when the list changed (Ben, 2026-10-19: keep it
  automatic). Before this, the copy was saved by hand and was 11 days old
  on launch morning.
- LL2 accepted a request with no token from a GitHub runner (first run,
  2026-10-19, run 39239698228). One run only. This bears on the Phase 3
  open item (a launch source for the Worker).
- Rejected: A Cloudflare Pages Function as a shared feed. A GitHub Action
  that commits the list every hour, because it fills the commit history.
  Refresh by hand only (the copy goes stale).

### Sky view: live camera, portrait only, calibrated on the Sun (locked)
- What: `sky.html` draws the path over the live back camera from the phone
  orientation sensors. Portrait only: in landscape it hides the drawing.
  The compass is read only while the phone is level (roll under 5
  degrees); the gyro carries the direction otherwise. Sun calibration
  stores the compass error; field of view is a setting (default 70).
- Why: A photo has no tilt, and trees hide the horizon. The iOS compass
  heading moves with roll. The browser does not give the lens.
- Rejected: Upload a photo and align it by hand. Landscape support. Focal
  length from photo metadata (the video is cropped differently).

### Vendor the R4yGM 2020 telemetry without a licence file (locked)
- What: Five telemetry.csv files from R4yGM/SpaceXTelemetry-Api (commit
  d1f8621) are copied into reference/vendor/r4ygm-spacextelemetry/.
- Why: It is the only open altitude data for a Starlink-era Falcon 9
  ascent found. Ben approved vendoring on 2026-10-15 after he was told the
  repository has no licence file.
- Rejected: Ask the author first; read it without copying.

### The 2020 R4yGM flights join falcon9-leo (locked)
- What: Starlink 5 to 8 and SpX-DM2 (2020) are members of `falcon9-leo`
  with CRS-16 and CRS-14. Every R4yGM flight to low orbit with second-stage
  data is used. Each ends at its highest speed between 400 and 750 s.
- Why: The 2018 members put SpX-35 19 to 29 degrees too far west. The
  Starlink members cut that to 6 to 14 degrees with height still within 1
  degree. DM-2 fits worse but stays: choosing members by their fit to one
  sighting would be tuning. Ben left the decision to the agent on
  2026-10-15.
- Rejected: A separate `falcon9-starlink-2020` profile (Florida Starlink
  on Falcon 9 has ended, so no launch class would use it). Keeping only the
  2018 members. Starlink members only.
- Effect: backtest 40 likely, 20 possible, 447 no (was 42, 18, 447); the
  same 60 launches are not 'no'; 0 of 5 `seen-plume` labels missed.

### Hand-set directions for launches LL2 gives no direction for (locked)
- What: `config/launch-directions.json`, keyed by LL2 id, sets an azimuth,
  or an inclination with heading northeast, southeast, or both. Each entry
  has a source. The page then draws those paths instead of the fan.
- Why: The fan (37 to 124 degrees) is too wide to plan by. The inclination
  and the drone ship position are often public before launch.
- Rejected: Guess the direction from the orbit class alone.
- How to find a direction, with URLs: the Runbook section in
  reference/topics/cape-launch-azimuths-and-inclinations.md.

### The card shows what you need outside; the README explains (locked)
- What: Card notes are one line each and link to the README section
  "Reading a launch card". A hand-set path shows `cardNote` and links to
  `link` and to config/launch-directions.json; `source` is not shown.
  Ben asked (2026-10-18): keep the card short, lose no information, use
  links.
- Why: The full direction record (about 200 words for Bandwagon 5)
  filled the card. Readers outside need the time, height and direction.
- Rejected: Collapsible sections on the card (more code, the text still
  rots in two places). Dropping the explanations (loses information).

### Units: miles and feet for people, metric inside (locked)
- What: The page and the README give distances in statute miles and
  heights in feet. The engine, config, data, FINDINGS and reference/
  stay metric. Ben asked (2026-10-18).
- Why: Ben and the readers think in miles and feet. The sources and the
  engine are metric; converting them risks errors and misquotes.
- Rejected: Convert everything, including source quotes and config.
  A km and miles toggle on the page (more code for one reader).

### Weather: local and directional sky cover (locked)
- What: The weather modifier uses two inputs. Local: cloud cover at the
  observer. Directional: cloud cover at points along the bearing of the
  visible track. The source is set by the decision "Cloud forecast
  source". The points run from the observer out to the nearer of
  two limits: where the sight line rises above a cloud top height, or
  the ground point under the plume. No point lies beyond either limit.
  Only the top of the arc counts: samples at or above 0.8 of each
  track's highest visible elevation. No point is farther than 150 km,
  the farthest distance where NBM and HRRR were seen to answer on every
  bearing tested (was 60 km, the NWS grid edge, until 0.6.0).
  The page shows both values. A point with no grid is reported as no
  data, not filled in. Since 0.5.0 both load by themselves: Open-Meteo
  takes every place in one request. (0.4.0 used the NWS API, two requests
  per place, and loaded the directional values only on a button.)
- Why: Only cloud under the sight line can block the view (Ben,
  2026-10-15: "think of it like a triangle"). Overhead cloud hides
  everything; a clear sky overhead can still have a cloud bank on the
  horizon. Cloud past the plume, or above the sight line, is behind the
  rocket from the observer.
- The cloud top height is provisional. No source gives one. It lives in
  config with that label.
- Rejected: The point forecast alone, which can say clear when the
  horizon toward the plume is not. Points out to the plume, which count
  cloud far below the sight line. Every visible sample with no cap (74
  points median). A fixed 20 degree limit (no ray for 17 of 60 launches).
  Directional values on every page load while each place cost two NWS
  requests (rejected for 0.4.0; no longer applies with one request).
- Not settled here: the weights that turn the two values into a
  modifier.

### Versions: package.json and CHANGELOG.md (locked)
- What: The version is written once, in `package.json`. The page footer
  reads it from there. `CHANGELOG.md` has one short entry per version,
  newest first; a test checks that its top entry matches `package.json`.
  Each changelog heading ends with the commit that ships the version. A
  commit cannot hold its own hash, so the heading says `pending` until a
  small follow-up commit puts the hash in (the test accepts either).
  The README badge reads `package.json` through shields.io. Middle
  number for a page feature, last number for a fix.
- Why: Ben asked for a version in the footer and a badge, and no heavy
  changelog (2026-10-15). One source cannot drift.
- Versions 0.1.0 to 0.3.0 were set after the fact, one per session that
  changed the page: v0.1.0 at d06855b (2026-10-08, first live page),
  v0.2.0 at d1fce0a (2026-10-12, sky view), v0.3.0 at 1ac496b
  (2026-10-15, hand-set directions and 2020 profiles). 0.4.0 adds clouds.
- Rejected: Git tags (2026-10-15). This session's git proxy refused the
  tag push (403), so each tag would need a command on Ben's laptop; Ben
  said it is not worth it. GitHub Releases for each version (more to write than Ben
  wants). A version string copied into index.html (a second copy drifts).
  Version query strings on every import (the page has no build step; the
  `_headers` file is the fix, once the zone respects it).

### Cloud forecast source (locked)
- What: The page shows NBM total cloud (Open-Meteo, `ncep_nbm_conus`) up
  to about 7 days ahead, and adds HRRR low cloud (`gfs_hrrr`,
  `cloud_cover_low`) when the launch is inside HRRR's range. Each card
  quotes NBM's twilight hit and false-alarm rates for its lead time from
  clouds/results.json. From 0.6.0 it also shows the newest TAF for KJZI,
  else KCHS, when that TAF covers the viewing time (not scored).
- Why: The cloud forecast test (FINDINGS Reference; clouds/README.md).
  Ben asked to verify against observations, to stress 1 to 3 days, and to
  switch sources nearer the launch (2026-10-16).
- Rejected: The NWS gridded `skyCover` (no archive to score it, one total
  value, no grid past 59 to 107 km offshore, two requests per place). The
  blend of three models (close on the full sky, worse on low cloud, three
  requests). TAF as the main forecast (airports only, about a day); it is
  shown as an extra line instead. Aviation Weather Center API and LAMP (no cross-origin
  access).

### Satellite check, step 1: rules fixed before the data (2026-10-16) (locked)
- What: GOES ABI-L2-ACMC binary mask `BCM`, DQF 0 only, 5 by 5 pixel box
  at each station, cloudy at 50 percent or more; each report paired with
  the nearest scan within 5 minutes; 300 hours evenly spaced by the Sun at
  JZI; go only if twilight skill below 12,000 ft is 70 or more. Files are
  read with h5wasm 0.10.3 (npm devDependency, loaded only when a file is
  opened). Station pixels come from NOAA STAR's CONUS lat/lon file.
  Rules: config/goes-acm.json.
- Why: Ben chose the reader, the sample size and the bar (2026-10-16). A
  truth for offshore scoring must clearly beat the forecast it grades
  (NBM day 1: 51).
- Rejected: h5py through pip (a second language in the pipeline). The
  four-level ACM and Cloud_Probabilities (not the product data.gov
  describes; not scored, and not to be tried as a rescue of this result).
  A one-pixel match (too small against an observer's sky; no parallax
  margin). Coding the projection formula (the PUG was not reachable;
  NOAA's own grid is the source). HDF5 range reads (whole files were
  simpler for a sample).

### Satellite check, test 2: rules fixed before the data (2026-10-16) (locked)
- What: GOES ABI-L2-CCLC, max(CF1, CF2) in the 10 km cell that holds the
  station, against the airport sky below 10,000 ft; same 300 hours and
  scans as test 1; DQF not used; go only if twilight skill is 80 or more.
  Rules: config/goes-ccl.json. Approved by Ben before the data.
- Why: test 1's mask counts high cloud that the airports cannot see.
  The bar follows test 1's rule: a truth must clearly beat the forecast
  it will grade (HRRR low cloud, 64).
- Rejected: CF1 + CF2 (counts overlapping pixels twice); a DQF filter
  (clear cells carry DQF 2); a 3 by 3 block of cells (30 km, larger than
  the sky an airport reports).

### Satellite check, test 3: compare land and water as a ratio (2026-10-16) (locked)
- What: NBM against the GOES cloud mask at the 11 airports and at 12
  water places off Charleston, by the same rules; decide on the ratio of
  skills, day 1, twilight, lower 95 percent bound 0.85 or more; all 2,001
  twilight hours; resample twilight events. Rules: config/goes-relative.json.
  Approved by Ben before the data. The page shows the ratio for the
  card's lead time (0.7.0).
- Why: tests 1 and 2 showed that no satellite product here is a better
  judge than the airports. A ratio needs the judge only to be about as
  good over land as over water. Ben asked whether the forecast works
  over water, where the plume is seen.
- Rejected: the difference of skills (the judge's errors scale both
  skills, so they cancel in a ratio, not a difference); the 240 picked
  hours (sizing gave an interval too wide for a verdict); ship reports
  (Ben, 2026-10-16: not wanted).

