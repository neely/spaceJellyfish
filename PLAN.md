# Space Jellyfish — Roadmap

Live at **TBD (subdomain of benneely.com, not yet assigned)** · Repo: **github.com/neely/spaceJellyfish**

**Purpose:** Predict when a Cape Canaveral or KSC launch will show the twilight "space jellyfish" plume from Charleston, SC (James Island, 29412), and send an email alert when it will.
**Non-goals:** No scraping of nextspaceflight.com or jellyfish.johnkrausphotos.com. No pads outside Cape Canaveral and KSC. No observer points other than Charleston. Weather is a secondary modifier, not a primary signal.

---

## Status
- **Active:** Phase 1 — Geometry engine, backtest, static page
- **Last updated:** 2026-10-08
- **Next action:** Write engine/visibility.js: sunlit test, observer
  darkness, score, bearing range, and the azimuth set for each orbit class.

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
- [ ] Azimuth set for each LL2 orbit class, with a source for the range of
      azimuths the Cape allows. Use a wide range with low confidence when
      the orbit data is thin.
- [ ] `engine/visibility.js`: for each time step, is the rocket sunlit, is
      the observer dark enough, is the rocket above the horizon. Output a
      score, a bearing range, a peak elevation, a viewing time window, and a
      confidence level.
- [ ] Slip table: the same evaluation for liftoff offsets in 10-minute steps
      across T-0 ± 2 h.

Backtest. Pinned data only.
- [x] `scripts/snapshot-ll2.js`: fetch past Cape/KSC launches once, inside
      the rate limit. Commit `data/ll2-snapshot.json` with the fetch date.
      The backtest reads only this file. Observed: 506 launches from
      2017-01-21 to 2026-10-02, read with 6 requests; the count matches the
      count LL2 reported.
- [ ] Candidate list: use the engine to list snapshot launches with liftoff
      in morning or evening twilight at Charleston. These are the dates to
      search for sighting reports.
- [ ] `data/labels.json`: hand-curated cases, each with launch ID, label,
      and source URL. Positives: a public report (local news, NWS
      Charleston, a dated social post) that the plume was seen from the
      Charleston area. Negatives: only launches that physics rules out
      (midday, deep night). A twilight launch with no report stays
      unlabelled, because cloud or no observer can also explain silence.
      Find reports by hand search, not by scraping. Ben reviews the list.
      Lead from Ben: Bill Walsh, the Live 5 (WCSC) meteorologist, posts
      about launches that are visible from Charleston.
- [ ] `scripts/backtest.js`: run the engine over the snapshot. Print the
      score distribution and the result for each labelled case.
- [ ] **Exit gate:** at least 5 positive cases are labelled, every labelled
      case is classified correctly, and the share of launches scored
      "visible" is recorded as a tripwire. Phase 3 must not start before
      this box is ticked.

Page.
- [ ] `index.html` and flat JS: fetch upcoming Cape/KSC launches from LL2 in
      the browser. Cache the response locally to stay under 15 requests per
      hour. Run the engine. Show each launch with score, bearing range,
      viewing window, and slip table.
- [ ] Measure engine CPU time for one full evaluation. Compare it with the
      10 ms free-tier limit and record the result.

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

## Open questions
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
> continue Phase 1 with `engine/visibility.js`. Run `npm test` first. Start
> at reference/README.md for sources. Watch out for the LL2 rate limit. Do
> not write a threshold or an azimuth limit from memory; cite a source.
