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
- `npm test` — expected 52 tests, 52 pass, 0 fail (2026-10-15). The count
  grows when tests are added; update this line in the same commit.
- `test/fixtures/usno-celnav-sun.json` — expected 12 cases. The engine must
  agree with each within 1/60 degree in GHA, declination, and altitude.
  Largest difference observed: 0.0070 degrees (altitude, 2026-10-13 case).
- `test/fixtures/ngs-ecef.json` — expected 4 cases. The engine must agree
  with each within 2 mm. Largest difference observed: 0.4 mm.
- SLC-40 to the observer along the surface — expected 466.0 km (289.5
  statute miles), within 0.5 km.
- `config/profiles.json` — expected 5 members and 2 profiles:
  `falcon9-leo` (SpaceX CRS-16, SpaceX CRS-14) and `falcon9-gto`
  (Bangabandhu-1, SES-12, Hispasat 30W-6). Altitude at 300 s: 177 to 183 km
  for LEO members, 150 to 158 km for GTO members. Altitude at the end of
  the data: 207 to 208 km for LEO, 164 to 165 km for GTO.
- `data/ll2-snapshot.json` — expected 506 launches, 2017-01-21 to
  2026-10-02. 434 are Falcon 9. 358 have orbit LEO and 73 have GTO. 502
  have status Success and 4 have Failure. 8 pads.
- `node scripts/backtest.js` (2026-10-08, screening height 10 km) — expected
  41 likely, 18 possible, 447 no, out of 506. 32 of the 59 are prime.
  Labels: 0 of 4 `seen-plume` labels are missed. 1 of 8 `seen` labels has
  verdict 'no' (the Atlas V of 2026-04-27).
  Negatives chosen by clock time: 0 wrong of 82 (10:00 to 15:00 local) and
  0 wrong of 83 (23:00 to 02:00 local).
- Screening height sensitivity: 5 km gives 59 not 'no'; 30 km gives 52. The
  Atlas V of 2026-04-27 is 'no' at all three heights.
- `data/labels.json` — expected 12 labels: 8 `seen`, 4 `seen-plume`.

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
- The ascent profiles come from 2018 launches (Block 4 and Block 5). The
  source has no Starlink launch and no vehicle other than Falcon 9. ISS
  missions stand in for all Falcon 9 LEO launches. Treat a Starlink result
  with lower confidence until a Starlink profile exists.
- Downrange distance in the profiles is derived by the telemetry author
  from webcast speed and altitude. It is not a tracked position. Members of
  one profile differ by up to 120 km in downrange at 400 s.
- The profiles end at about second-stage cutoff (493 to 538 s). The engine
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

#### Reported sightings against the snapshot (2026-10-08)
- data/labels.json holds 12 launches with a report that the launch was seen
  from the Charleston area: 10 from local news pages and 2 from Reddit
  posts alone. Each matches exactly one launch in data/ll2-snapshot.json.
  Sources and quotes: reference/topics/charleston-sighting-reports.md.
- 9 of the 12 lifted off between 05:00 and 06:00 local time. The other 3
  lifted off in the evening (17:32, 17:56, and 19:32) or later (20:53).
- The news pages mostly say only that the rocket was seen. One uses the word
  "jellyfish": 2026-07-09, Starlink Group 10-42. The 4 `seen-plume` labels
  rest on that page and on photos in Reddit posts.
- One source conflict: the ABC News 4 page for 2020-11-13 says the Atlas V
  launched at "5:13 p.m."; the snapshot gives 22:32 UTC, which is 5:32 p.m.
  local time.

#### How often the engine says a launch can be seen (backtest, 2026-10-08)
- 59 of 506 launches since 2017 are likely or possible (11.7 percent). By
  year: 1, 1, 2, 2, 4, 8, 8, 15, 9, and 9 for 2017 to 2026 (2026 runs to
  2026-10-02).
- 32 of the 59 are prime: the Sun is 6 degrees or more below the horizon.
- These counts have no weather in them, and they rest on provisional
  thresholds and on Falcon 9 profiles from 2018.

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
- 35 of the 59 backtest launches rated likely or possible are Starlink,
  and 22 of the 32 prime ones (script run 2026-10-15). The past rate of
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
  Four ZIP points in scripts/observer-sensitivity.js are 4.3 to 10.1 km
  from the Census points.
- Azimuth limits: a second source gives 35 to 120 degrees (CSIS, Roberts,
  2019). Wikipedia still gives 37 to 114. The FAA SLC-40 environmental
  documents (2020, 2025) give no azimuth numbers.
- Bandwagon: SpaceNews reports that SpaceX said about 45 degrees.
  Wikipedia lists Bandwagon-5 as SSO; LL2 says mid-inclination. Conflict.
- No source gives a screening height, a lowest elevation, or a shortest
  visible time for rocket plumes. The three values stay provisional.

#### SpX-35 seen from James Island (2026-10-13)
- Wide plume seen. Engine: likely, prime. At 254 and 277 s after liftoff,
  height agreed within about 1 degree; the rocket was 19 to 29 degrees
  farther east than the engine placed it. Numbers: data/observations.json.
- The compass check (above) rules out a 20 degree compass error, but it
  faced west, not southeast. Leading cause: the 2018 ascent profiles put
  the rocket too far back along its track. One launch; not proven.
- Fifth `seen-plume` report. It is not in data/labels.json, because SpX-35
  is not in the pinned snapshot.
- Public reports for the same launch (read 2026-10-15): Live 5 News says
  Lowcountry residents saw a jellyfish cloud; Post and Courier reports the
  trail seen from Charleston, Folly Beach, Moncks Corner and other places.
  URLs in reference/source-audit.md.

#### The observer can be anywhere near Charleston
- `node scripts/observer-sensitivity.js` (506 snapshot launches, ZIP
  centroids). Folly Beach to Isle of Palms (7 to 19 km): same verdict for
  58 or 59 of the 59 that James Island rates likely or possible; peak
  height within 0.3 to 1.3 degrees (median). Summerville (40 km): 57 of 59,
  about 4 degrees lower. Columbia (174 km): 53 of 59, about 14 lower.
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
- Rejected: ASD-STE100 for the README.

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
- Rejected: A Cloudflare Pages Function as a shared feed. A GitHub Action
  that commits the list every hour, because it fills the commit history.

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

### Hand-set directions for launches LL2 gives no direction for (locked)
- What: `config/launch-directions.json`, keyed by LL2 id, sets an azimuth,
  or an inclination with heading northeast, southeast, or both. Each entry
  has a source. The page then draws those paths instead of the fan.
- Why: The fan (37 to 124 degrees) is too wide to plan by. The inclination
  and the drone ship position are often public before launch.
- Rejected: Guess the direction from the orbit class alone.
- How to find a direction, with URLs: the Runbook section in
  reference/topics/cape-launch-azimuths-and-inclinations.md.
