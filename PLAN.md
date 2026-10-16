# Space Jellyfish — Roadmap

Live at **https://jellyfish.benneely.com** · Repo: **github.com/neely/spaceJellyfish**

**Purpose:** Predict when a Cape Canaveral or KSC launch will show the twilight "space jellyfish" plume from Charleston, SC (James Island, 29412), and send an email alert when it will.
**Non-goals:** No code, predictions, or images taken from nextspaceflight.com or jellyfish.johnkrausphotos.com; reading them for ideas is allowed (Ben, 2026-10-08). No pads outside Cape Canaveral and KSC. No observer points other than Charleston. Weather is a secondary modifier, not a primary signal.

---

## Status
- **Active:** Phase 1 — Geometry engine, backtest, static page
- **Last updated:** 2026-10-15
- **Next action:** Source audit is done (reference/source-audit.md).
  Bandwagon 5 is Monday 2026-10-19, 06:30 to 07:30 local (LL2, read
  2026-10-15). On Sunday 10-18, find where the drone ship waits and set
  its heading in config/launch-directions.json (runbook in
  reference/topics/cape-launch-azimuths-and-inclinations.md). Ben watches
  with the sky view and takes screenshots for data/observations.json. Then
  Ben picks from "Audit follow-ups" and the easy wins.

---

## Conventions
- Keep README.md in sync with what's actually live.
- Move settled decisions to FINDINGS.md; mark them `(locked)`. Open questions
  stay here, not in FINDINGS.
- Check off phases below as completed. Don't delete finished items. A ticked
  box means you saw the thing work. Tests that pass are not proof on their
  own — name what you observed.
- When a phase finishes: move non-obvious rationale to FINDINGS first, then
  collapse the phase to one line under Completed.

---

## ✓ Completed
- Listed on `neely/apps` and in `neely/registry` on 2026-10-08.
- Phase 0 — Repo setup: public repo made from the template, first-run setup
  done, phases drafted.

## Phase 1 — Geometry engine, backtest, static page  ← ACTIVE

Engine. Pure ES modules in `engine/`: no DOM, no network, no dependencies.
Tests run with `node --test`.
- [x] Vendor the sun-position formula source into `reference/` and cite it.
      Do not write the formula from memory. Observed: the constants in
      reference/usno-sun-and-sidereal-time.md match the raw text of the two
      USNO pages.
- [x] `engine/sun.js`: sun direction for a UTC time. Test against published
      reference values. Record them as tripwires in FINDINGS. Observed: 12
      USNO cases agree within 0.007 degrees; `npm test` shows 26 pass, 0 fail.
- [x] `engine/geo.js`: geodetic to ECEF, elevation, bearing, slant range from
      the observer. Test against hand-checked cases. Include the Cape to
      Charleston distance. Compute it; do not take it from the brief.
      Observed: 4 NGS cases agree within 0.4 mm; SLC-40 to the observer is
      466.0 km.
- [x] `config/observer.json` and `config/profiles.json`: observer point and
      Falcon 9 ascent profiles (altitude and downrange against time), built
      by `scripts/build-profiles.js` from pinned public telemetry. There is
      no `config/pads.json`: each LL2 launch record carries its pad
      coordinates. Observed: 5 members in 2 profiles; LEO members are at 177
      to 183 km at 300 s and GTO members at 150 to 158 km.
- [ ] A newer Falcon 9 profile. SpX-35 (2026-10-13) was seen 19 to 29
      degrees farther east than the 2018 profiles at the same moments,
      with the compass checked (FINDINGS).
- [ ] A profile for vehicles other than Falcon 9. No source found yet. Until
      then, other vehicles use the Falcon 9 members with low confidence.
- [x] `engine/trajectory.js`: great-circle position against time from pad,
      azimuth, and profile member; launch azimuths from an inclination.
      Observed: `npm test` shows 33 pass, 0 fail. A 51.6 degree orbit gives
      azimuths of 45.0 and 135.0 degrees from SLC-40.
- [x] Azimuth set for each LL2 orbit class. Due east for GTO and escape
      orbits. A fan from 37 to 124 degrees for all other orbits, because LL2
      gives no inclination or azimuth.
- [ ] Polar and sun-synchronous launches (13 in the snapshot) fly south.
      They now use the fan. Give them their own class when a source gives
      the corridor azimuths.
- [x] `engine/visibility.js`, mechanics: for each time step, is the rocket
      sunlit, is the observer dark enough, is the rocket above the horizon.
      One track gives visible seconds, viewing window, peak elevation, and
      bearings. Observed: `npm test` shows 40 pass, 0 fail.
- [x] `config/visibility.json`: the thresholds, each with its source. Three
      values are provisional because no source gives them: screening height
      10 km, lowest elevation 5 degrees, shortest visible time 60 s.
- [x] `evaluateLaunch`: combine the tracks of one launch into a verdict
      (likely, possible, no), a prime flag, a bearing range, and a
      confidence level. Observed: `node scripts/backtest.js` runs over all
      506 launches.

Backtest. Pinned data only.
- [x] `scripts/snapshot-ll2.js`: fetch past Cape/KSC launches once, inside
      the rate limit. Commit `data/ll2-snapshot.json` with the fetch date.
      The backtest reads only this file. Observed: 506 launches from
      2017-01-21 to 2026-10-02, read with 6 requests; the count matches the
      count LL2 reported.
- [ ] Candidate list: list snapshot launches since 2021 with the Sun
      between 0 and 18 degrees below the observer horizon at T+300 s. Split
      them by engine verdict. Search local outlets for each date. The cases
      that test the engine are twilight launches it rejects and launches it
      rates likely and prime.
- [x] `data/labels.json`: 13 launches, each with launch ID, label, and
      source. 8 are `seen` and 5 are `seen-plume` (SpX-35 added
      2026-10-15). Ben confirmed five Reddit post dates. Original task
      text follows.
      Hand-curated cases, each with launch ID, label, and source URL. Positives: a public report (local news, NWS
      Charleston, a dated social post) that the plume was seen from the
      Charleston area. Negatives: only launches that physics rules out
      (midday, deep night). A twilight launch with no report stays
      unlabelled, because cloud or no observer can also explain silence.
      Find reports by hand search, not by scraping. Ben reviews the list.
      Lead from Ben: Bill Walsh, the Live 5 (WCSC) meteorologist, posts
      about launches that are visible from Charleston. No post or quote
      from him was found by web search; Facebook and X could not be read.
      Sources: reference/topics/charleston-sighting-reports.md has the
      dated reports checked against the raw pages. Each matches a launch in
      the snapshot.
- [x] `scripts/backtest.js`: run the engine over the snapshot. Print the
      verdict distribution and the result for each labelled case. Observed
      2026-10-08: 41 likely, 18 possible, 447 no; 0 of 165 clock-chosen
      negatives are wrong. After Ben relabelled the Atlas V case: 0 of 4
      `seen-plume` labels are missed, and 1 of 8 `seen` labels has verdict
      'no'. The script exits 1 when a `seen-plume` label is missed. It is
      not part of `npm test`.
- [x] **Exit gate:** at least 5 `seen-plume` cases are labelled, every
      `seen-plume` case is classified correctly, and the share of launches scored
      "visible" is recorded as a tripwire. Phase 3 must not start before
      this box is ticked. Observed 2026-10-15 after the snapshot refresh:
      `node scripts/backtest.js` prints "Missed: 0 of 5 seen-plume labels"
      and exits 0; the share (60 of 507, 11.8 percent) is a FINDINGS
      tripwire. Caveats: the fifth label was written after its verdict was
      known, and the open question on the minimum of 5 stays open.

Page.
- [x] `index.html`, `app.js`, `style.css`: fetch upcoming Cape/KSC launches
      from LL2 in the browser. Keep the answer for 20 minutes to stay under
      15 requests per hour. Run the engine. Show each launch with verdict,
      viewing window, direction, height, sky chart, and slip table.
      Observed 2026-10-08 in a local preview at desktop and phone width:
      SpX-35 shows Likely and Prime, look between 6:36 and 6:42 AM, 30 to 33
      degrees up, starts S, peaks SE, ends ENE; no console error; no
      sideways scroll at 375 px.
- [x] Slip table: liftoff offsets in 10-minute steps across T-0 ± 2 h, on
      the page. Observed for SpX-35: likely for liftoff from 5:53 to 7:13.
- [x] Measure engine CPU time for one full evaluation. Observed on the
      development Mac with Node 26: 0.43 ms for each launch over the
      snapshot, and 13 ms for a 25-step slip table of a fan launch. This is
      not a measurement inside a Worker.
- [x] The page is live at https://jellyfish.benneely.com (Cloudflare Pages,
      set up by Ben on 2026-10-08). There is no build step: the repo root is
      the site.
- [x] Fallback chain in the page: LL2 direct, then the saved answer in the
      browser, then `data/upcoming-fallback.json`. Observed 2026-10-08 on
      the live site: LL2 direct answers and the page shows SpX-35 with no
      console error.
- [x] Phone layout: the sky chart is drawn at the real width, and a table
      gives the time, direction, and height for each minute. Observed at
      375 px in a local preview: labels are readable, no sideways scroll.
      Ben has not yet confirmed on his phone.
- [x] Camera sky view (add-on, `sky.html`, `sky.js`, `sky.css`,
      `lib/skyproject.js`, `config/skyview.json`): live back camera, phone
      orientation sensors, and the predicted path drawn over the picture.
      Sun calibration stores the compass error; Freeze and Save picture
      make an augmented photo. Each launch card links to it. The main page
      keeps every feature. Observed 2026-10-12 in headless Chromium at
      390 px with a fake camera and simulated iOS orientation events: the
      readout follows the events (compass 150 plus declination -8 gives
      facing 142), the SpX-35 path and minute labels draw, and drag mode
      works with no sensors; `npm test` shows 50 pass, 0 fail. Observed
      2026-10-12 on Ben's iPhone: the Sun ring sat on the Sun (172 degrees,
      49 up); with field of view 70 it stayed on the Sun near the edge; the
      SpX-35 sunlit path clears his trees from 6:36.

- [x] Sky view follow-ups, 2026-10-13 to 15: setup steps on the start
      screen and behind Help; calibration message; compass read only when
      the phone is level; portrait only. Observed on Ben's iPhone
      2026-10-15: tilting no longer moves the direction ("compass held"
      shows), landscape shows the turn-upright message, and the drawn Sun
      sat on the real Sun before recalibrating. `npm test`: 52 pass.
- [x] Hand-set launch directions (`config/launch-directions.json`,
      `lib/directions.js`). Observed 2026-10-15 in headless Chromium with
      Bandwagon 5 set to 45 degrees, heading both: the card shows two
      paths (peak 25 to 28 degrees for northeast, 10 to 12 for southeast),
      "two possible paths", and the source note. Backtest unchanged (41,
      18, 447).

### Source audit
- [x] Done 2026-10-15. Observed: reference/source-audit.md has a row for
      each input below, each checked again where the source could be
      reached; `npm test` 52 pass and the backtest gives 41, 18, 447
      after the audit. Fixes are the items under "Audit follow-ups".
      Original task text follows.
      Audit every outside input. For each one, write one row in a new
      `reference/source-audit.md`: what it is, where it is used (file and
      key), source and version or date, how old it is, how it was checked,
      known problems, and what would replace it. Check each claim against
      the source again where the source can be reached; mark what cannot.
      Inputs known so far:
      - Ascent profiles: config/profiles.json from shahar603/Telemetry-Data
        (2018 flights, last push 2020). Known problem: SpX-35 position
        miss. Look for newer data (Launch Dashboard API).
      - LL2 snapshot, data/ll2-snapshot.json (to 2026-10-02) and
        data/upcoming-fallback.json (2026-10-08).
      - Sighting labels, data/labels.json, and the sources in
        reference/topics/charleston-sighting-reports.md.
      - Thresholds in config/visibility.json: three are provisional.
      - Azimuth fan 37 to 124 degrees: sources disagree (37 to 114 from a
        2002 FAA-sponsored report via Wikipedia; 35 to 120 secondary).
      - Station inclination 51.6; due-east rule for high orbits.
      - Sun and Earth formulas (USNO, NGS fixtures): likely fine; confirm.
      - Observer point (ZIP centroid) and the ZIP centroids in
        scripts/observer-sensitivity.js (one bad API value dropped).
      - Sky view: magnetic declination -8 (not verified; check NOAA),
        default field of view 70 (one phone).
      - config/launch-directions.json entries (Bandwagon 5 at 45 degrees
        from one secondary source).
      - The runbook URLs: which ones still answer.
      Output: the audit table, FINDINGS entries for any problem found, and
      PLAN items for each fix. Do not change a pinned value during the
      audit; list the change and its downstream impact instead.

### Audit follow-ups (Ben decides each; impact in reference/source-audit.md)
- [x] Magnetic declination -8 to -8.3 in config/skyview.json, cited to
      WMM-2025. Sky view only. Observed: config reads -8.3; `npm test` 52
      pass. Ben: recalibrate on the Sun once, as the drawing moves 0.3
      degrees until then.
- [x] Ascent data: R4yGM Starlink 5 to 8 and DM-2 (2020) vendored with
      Ben's approval; `node scripts/compare-ascent-sources.js` compares
      them on SpX-35. Observed: Starlink cuts the azimuth miss to 13 to 14
      degrees (254 s) and 6 to 7 (277 s); CRS rows equal FINDINGS.
- [ ] Decide: add a `falcon9-starlink-2020` profile (or put the four
      flights in `falcon9-leo`). Model change: needs a downstream trace
      first (backtest counts, prime counts, label results, README numbers,
      FINDINGS tripwires). Ben decides.
- [ ] Launch Dashboard API and Flight Club. 2026-10-15 on Ben's iPhone:
      the API gave "Safari can't reach the page"; both Flight Club pages
      loaded, then Safari stopped with "a problem repeatedly occurred". Try
      once on a desktop browser; if it fails, record both as dead ends.
- [x] 2025-07-26 label: the WCBD URL is added to moreSources. It could
      not be opened (counton2.com refuses automated reading), so the Yahoo
      source stays. Labels count unchanged (12).
- [x] Bandwagon 5 source note cites SpaceNews (about 45 degrees) and the
      Wikipedia SSO conflict (config/launch-directions.json). The drone
      ship position on 10-18 still sets the heading.
- [x] ZIP points in scripts/observer-sensitivity.js are Census points;
      Johns Island is back. Observed: FINDINGS and the README table match
      the new run (Johns Island 13 km, 57 of 59).
- [ ] Observer point: keep zippopotam (0.6 km from Census). No change
      unless Ben wants it.

### Easy wins (next, in this order)
- [ ] Set Bandwagon 5 to northeast or southeast from the drone ship
      position the day before (runbook). One line in
      config/launch-directions.json.
- [ ] Morning Sun check facing southeast at the SpX-35 spot (Ben, about
      08:30 to 09:30, Sun at azimuth 109 to 119), to close the compass
      question for that direction.
- [ ] `scripts/compare-observations.js`: read data/observations.json, run
      the engine for each point, and print the differences. Replaces the
      hand computation done for SpX-35.
- [ ] A newer Falcon 9 ascent profile. Start with the Launch Dashboard API
      named in reference/topics/falcon9-webcast-telemetry.md. Test it
      against the SpX-35 points before adopting it.
- [ ] Sky view: draw a soft glow band behind the sunlit rocket line, so
      the wide plume is not a surprise.
- [ ] Sky view: two-tap field-of-view calibration from the Sun (centre,
      then edge).
- [x] Regenerate the LL2 snapshot so SpX-35 can become the fifth
      `seen-plume` label. Ben asked on 2026-10-15 after the impact trace.
      Observed: fetched in the browser on Ben's Mac with the same reduce
      code as scripts/snapshot-ll2.js (6 requests); 507 launches; the
      first 506 records are byte-identical to the old snapshot; backtest
      42, 18, 447.
- [ ] One Android test of the sky view (Chrome).

## Phase 2 — Weather modifier
- [ ] Confirm api.weather.gov requirements (headers, CORS, forecast range)
      from its own docs. Record them in FINDINGS.
- [ ] `engine/weather.js` (pure): turn a sky-cover forecast into a modifier
      on the geometry score. Geometry stays the primary signal.
- [ ] The page shows the modifier only when the forecast covers T-0.
      Otherwise it shows "forecast not available yet".

## Phase 3 — Worker cron, KV state, email alerts
- [ ] Confirm KV free-tier read and write limits against the planned cadence.
- [ ] Choose how the Worker gets launch times. LL2 answered 429 to every
      request from a Cloudflare Pages Function on 2026-10-08 (see FINDINGS,
      Dead-ends). Options: an LL2 API token, another launch data source, or
      a fetch from outside Cloudflare. This blocks the rest of Phase 3.
- [ ] Worker with one Cron Trigger. KV holds the cached LL2 launch list.
      Refresh slowly by default. Refresh faster only when a tracked launch
      is close. Stay under 15 LL2 requests per hour in every case.
- [ ] Alert state in KV keyed on (launch ID, NET timestamp). A NET change
      causes a new evaluation. The same prediction is never sent twice.
- [ ] `worker/email.js`: Resend by raw `fetch`, no SDK. Follow
      `worker/email.js` in `neely/creel`. One recipient, held as a Worker
      secret.
- [ ] Alert wording follows the confidence level. A low-confidence
      trajectory softens the wording. It does not suppress the alert.
- [ ] Deploy by a manual `workflow_dispatch` GitHub Action with
      `cloudflare/wrangler-action`, as in creel. `wrangler.toml` holds no
      secrets.
- [ ] Dry-run period: log the alerts that would be sent and send none.
      Compare with real launches before turning email on.

## Future / if needed
- iOS home-screen icon from `assets/jellyfish.png` — deferred until the page
  is live.
- Tuned profiles for Vulcan, New Glenn, Falcon Heavy — only if the generic
  profile proves too coarse.
- Workers Paid — only if the engine does not fit in 10 ms.
- Wallops launches — one Charleston sighting is on record (Antares,
  2022-11-07). Out of scope now; Ben decides if the scope grows.

## Open questions
- Evening launches. The Atlas V of 2026-04-27 (20:53 local, Sun 11.6 to
  13.2 degrees down) was seen as a bright point; the engine says no sunlit
  plume. Ben read the post and set the label to `seen`, so it is not a miss.
  It is also not proof that the engine is right for evening launches. Only
  one `seen-plume` label is an evening launch (USSF-67). Find more.
- The sample loop stops at the last multiple of 10 s, so the last 3 to 9 s
  of a profile are not sampled. 177 of 713 visible tracks are still visible
  at the last sample: the profile ends before the pass does. Decide if the
  engine should say so in its output.
- SpX-35 (2026-10-13): seen as a plume, as predicted, but 19 to 29
  degrees east of the predicted position (FINDINGS). Is that the 2018
  profiles? A second measured launch and a newer profile will tell.
- Is 5 positive cases the right minimum for the exit gate? It depends on how
  many Charleston reports the search finds.
- Does the free-tier limit of 5 Cron Triggers per account leave room? A code
  search of Ben's repos found no other cron. That search may not cover
  private repos.
- Alert timing: how long before T-0, and how many emails per launch?

---

## Handoff → next session
Start prompt:
> Read AGENTS.md, the PLAN.md status block and "Easy wins", and FINDINGS.md
> "Reference", then run `npm test` and `node scripts/backtest.js`. Read
> reference/source-audit.md and ask Ben which "Audit follow-ups" to do. Then, if
> Bandwagon 5 has not flown, help Ben set its direction with the runbook in
> reference/topics/cape-launch-azimuths-and-inclinations.md. If it has, ask
> for his sky view screenshots and add them to data/observations.json. Then
> work the easy wins in order. Do not tune a threshold to fix a miss.
