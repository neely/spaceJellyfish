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
- `npm test` — expected 40 tests, 40 pass, 0 fail (2026-10-08). The count
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
- The backtest share is not set yet.

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
- None yet.

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

#### Reported sightings against the snapshot (scratch run, 2026-10-08)
- reference/topics/charleston-sighting-reports.md lists 10 dated reports
  that a launch was seen from the Charleston area. Each date matches one
  launch in data/ll2-snapshot.json.
- The Sun was below the observer horizon at T+300 s in all 10: between 4.3
  and 16.0 degrees below. No report is from a daytime or deep-night launch.
- With trial thresholds (screening height 20 km, rocket at least 3 degrees
  up), the engine finds a sunlit, above-horizon part of the ascent for all
  10 on a northeast azimuth. The trial thresholds are not sourced. This is
  a first look, not the backtest.
- Only one report uses the word "jellyfish": 2026-07-09, Starlink Group
  10-42, liftoff 09:25:43 UTC, Sun 9.6 degrees below the horizon.
- One source conflict: the ABC News 4 page for 2020-11-13 says the Atlas V
  launched at "5:13 p.m."; the snapshot gives 22:32 UTC, which is 5:32 p.m.
  local time.

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
- Workers KV free-tier limits are not checked yet.

---

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
  where the information came from.
- Rejected: Putting source detail in FINDINGS.
