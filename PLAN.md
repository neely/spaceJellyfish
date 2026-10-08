# Space Jellyfish — Roadmap

Live at **TBD (subdomain of benneely.com, not yet assigned)** · Repo: **github.com/neely/spaceJellyfish**

**Purpose:** Predict when a Cape Canaveral or KSC launch will show the twilight "space jellyfish" plume from Charleston, SC (James Island, 29412), and send an email alert when it will.
**Non-goals:** No code, predictions, or images taken from nextspaceflight.com or jellyfish.johnkrausphotos.com; reading them for ideas is allowed (Ben, 2026-10-08). No pads outside Cape Canaveral and KSC. No observer points other than Charleston. Weather is a secondary modifier, not a primary signal.

---

## Status
- **Active:** Phase 1 — Geometry engine, backtest, static page
- **Last updated:** 2026-10-08
- **Next action:** Ben points Cloudflare at the repo so the page is live
  before 2026-10-13. Then build the twilight candidate list and search
  local outlets for those dates, to find more `seen-plume` labels (4 now, 5
  needed).

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
- [x] `data/labels.json`: 12 launches, each with launch ID, label, and
      source. 8 are `seen` and 4 are `seen-plume`. Ben confirmed five
      Reddit post dates. Original task text follows.
      Hand-curated cases, each with launch ID, label, and source URL. Positives: a public report (local news, NWS
      Charleston, a dated social post) that the plume was seen from the
      Charleston area. Negatives: only launches that physics rules out
      (midday, deep night). A twilight launch with no report stays
      unlabelled, because cloud or no observer can also explain silence.
      Find reports by hand search, not by scraping. Ben reviews the list.
      Lead from Ben: Bill Walsh, the Live 5 (WCSC) meteorologist, posts
      about launches that are visible from Charleston. No post or quote
      from him was found by web search; Facebook and X could not be read.
      Leads so far: reference/topics/charleston-sighting-reports.md has 10
      dated reports checked against the raw pages. Each matches a launch in
      the snapshot. Not yet written to data/labels.json.
- [x] `scripts/backtest.js`: run the engine over the snapshot. Print the
      verdict distribution and the result for each labelled case. Observed
      2026-10-08: 41 likely, 18 possible, 447 no; 0 of 165 clock-chosen
      negatives are wrong. After Ben relabelled the Atlas V case: 0 of 4
      `seen-plume` labels are missed, and 1 of 8 `seen` labels has verdict
      'no'. The script exits 1 when a `seen-plume` label is missed. It is
      not part of `npm test`.
- [ ] **Exit gate:** at least 5 `seen-plume` cases are labelled, every
      `seen-plume` case is classified correctly, and the share of launches scored
      "visible" is recorded as a tripwire. Phase 3 must not start before
      this box is ticked.

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
- [ ] The page is not live. Ben sets up Cloudflare. The page needs no build
      step: the repo root is the site.

## Phase 2 — Weather modifier
- [ ] Confirm api.weather.gov requirements (headers, CORS, forecast range)
      from its own docs. Record them in FINDINGS.
- [ ] `engine/weather.js` (pure): turn a sky-cover forecast into a modifier
      on the geometry score. Geometry stays the primary signal.
- [ ] The page shows the modifier only when the forecast covers T-0.
      Otherwise it shows "forecast not available yet".

## Phase 3 — Worker cron, KV state, email alerts
- [ ] Confirm KV free-tier read and write limits against the planned cadence.
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
- Cloudflare subdomain of benneely.com — Ben does this. Then update the
  README "Live" line and the line at the top of this file.
- Entries on `neely/apps` and `neely/registry` — deferred until the page is
  live.
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
- Has Starlink left Florida? The snapshot has no Florida Starlink launch
  after 2026-08-25, and Starship Flight 14 carried a Starlink group from
  Texas on 2026-09-28. Starlink launches are most of the past twilight
  chances. Find a statement from SpaceX. If they have ended, the chances
  each year are far fewer than the backtest shows.
- Live test: Falcon 9 SpX-35, 2026-10-13 at 06:33 local. The engine says
  likely and prime. Ben can watch. Record what was seen as a label.
- Is 5 positive cases the right minimum for the exit gate? It depends on how
  many Charleston reports the search finds.
- Does the free-tier limit of 5 Cron Triggers per account leave room? A code
  search of Ben's repos found no other cron. That search may not cover
  private repos.
- Alert timing: how long before T-0, and how many emails per launch?

---

## Handoff → next session
Start prompt:
> Read AGENTS.md, the PLAN.md status block, and FINDINGS.md "Reference", then
> run `npm test` and `node scripts/backtest.js`. Then build the twilight
> candidate list and search local outlets for those dates with a Sonnet
> subagent. The goal is a fifth `seen-plume` label and evening cases. Start at
> reference/README.md for sources. Do not tune a threshold to fix a miss.
