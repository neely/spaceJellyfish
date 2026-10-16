# Space Jellyfish — Roadmap

Live at **https://jellyfish.benneely.com** · Repo: **github.com/neely/spaceJellyfish**

**Purpose:** Predict when a Cape Canaveral or KSC launch will show the twilight "space jellyfish" plume from Charleston, SC (James Island, 29412), and send an email alert when it will.
**Non-goals:** No code, predictions, or images taken from nextspaceflight.com or jellyfish.johnkrausphotos.com; reading them for ideas is allowed (Ben, 2026-10-08). No pads outside Cape Canaveral and KSC. No observer points other than Charleston. Weather is a secondary modifier, not a primary signal.

---

## Status
- **Active:** Phase 2 — Weather modifier
- **Last updated:** 2026-10-15
- **Next action:** Phase 2 items are done; check the clouds section on
  Ben's iPhone, then decide if Phase 2 is closed. The Bandwagon 5 item at
  the top of the Backlog has a deadline (Sunday 2026-10-18).

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
- Phase 1 — Geometry engine, backtest, static page, camera sky view. Exit
  gate met 2026-10-15: 0 of 5 `seen-plume` labels missed on the 507-launch
  snapshot. Live at jellyfish.benneely.com. Results and tripwires are in
  FINDINGS; the full checklist with its "Observed" notes is in git history
  (PLAN.md at commit 735e47d).
- Source audit, 2026-10-15: reference/source-audit.md. Follow-ups done:
  declination -8.3 (WMM-2025), Census ZIP points, Bandwagon source note,
  2020 R4yGM flights added to `falcon9-leo`, snapshot refreshed, SpX-35
  labelled.

## Backlog (open items from Phase 1, in order)
- [ ] Before Bandwagon 5 (Monday 2026-10-19, 06:30 local): on Sunday,
      find where the drone ship ASOG waits and set northeast or southeast
      in config/launch-directions.json (runbook in
      reference/topics/cape-launch-azimuths-and-inclinations.md; ship notes
      in reference/topics/recovery-fleet.md). After the launch: add Ben's
      sky view points to data/observations.json and refresh the snapshot
      (refresh rule in FINDINGS).
- [ ] Morning Sun check facing southeast at the SpX-35 spot (Ben, about
      08:30 to 09:30, Sun at azimuth 109 to 119), to close the compass
      question for that direction.
- [ ] `scripts/compare-observations.js`: read data/observations.json, run
      the engine with the current profiles for each point, and print the
      differences. scripts/compare-ascent-sources.js does this for SpX-35
      only; generalise it rather than add a second script.
- [ ] The page and the sky view put the minute labels on the first visible
      track, which is CRS-16, the member that fits SpX-35 worst. Decide if
      the labels should follow a middle member.
- [ ] Launch Dashboard API and Flight Club: try once on a desktop browser
      (on Ben's iPhone, 2026-10-15, the API did not answer and Flight Club
      crashed Safari). If it fails, record both as dead ends.
- [ ] Sky view: draw a soft glow band behind the sunlit rocket line, so
      the wide plume is not a surprise.
- [ ] Sky view: two-tap field-of-view calibration from the Sun (centre,
      then edge).
- [ ] One Android test of the sky view (Chrome).
- [ ] Candidate list: list snapshot launches since 2021 with the Sun
      between 0 and 18 degrees below the observer horizon at T+300 s. Split
      them by engine verdict. Search local outlets for each date. The cases
      that test the engine are twilight launches it rejects and launches it
      rates likely and prime.
- [ ] Polar and sun-synchronous launches (13 in the snapshot) fly south.
      They use the fan. Give them their own class when a source gives the
      corridor azimuths.
- [ ] A profile for vehicles other than Falcon 9. No source found yet.
      Until then, other vehicles use the Falcon 9 members with low
      confidence.
- [ ] Ascent data from flights after 2020. None found yet.

## Phase 2 — Weather modifier  ← ACTIVE
- [x] Confirm api.weather.gov requirements (headers, CORS, forecast range)
      from its own docs. Record them in FINDINGS.
      Observed 2026-10-15: docs read; from jellyfish.benneely.com the
      page read `/points` and the grid forecast (CORS works); skyCover in
      percent for about 7 days; grid at 59 km offshore, none at 107 km.
- [x] Decide which cloud matters: local and directional sky cover (FINDINGS
      Decisions). Observed: sight-line distances computed (FINDINGS
      Reference).
- [x] `engine/weather.js` (pure): from a launch's visible track, give the
      directional sample points; from skyCover series, give the local and
      directional values at the visible time. Geometry stays the primary
      signal. Cloud top height in config, marked provisional.
      Observed 2026-10-15: 66 tests pass; top 20 percent of the arc and a
      60 km cap give 7 to 33 points per launch (FINDINGS Reference).
- [x] The page shows the modifier only when the forecast covers T-0.
      Otherwise it shows "forecast not available yet".
      Observed 2026-10-15 on the live page (desktop browser): Bandwagon 5
      card showed local sky cover 45 percent; the button checked 19
      places in 5.7 s, all with a forecast, 49 to 68 percent. The beyond-
      7-days text was seen only in code, not live.

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
- SpX-35 (2026-10-13): seen as a plume, as predicted, but east of the
  predicted position: 19 to 29 degrees with the 2018 members, 6 to 14
  with the 2020 Starlink members (FINDINGS). Is the rest the profiles, the
  fixed-azimuth great circle, or reading error? A second measured launch
  will tell.
- Weather: how often was the line of sight clouded on past twilight
  launches? This needs historical cloud data, not the forecast API. Not
  part of Phase 2.
- Weather: how do the local and directional sky cover values combine into
  one modifier? No source gives weights. Show both raw values first.
- Launch weather rules at the Cape: a launch that goes says the pad sky
  was acceptable, not the Charleston sky. Ben asked (2026-10-15). Quote
  the rules from a source before the docs rely on this.
- Is 5 positive cases the right minimum for the exit gate? It depends on how
  many Charleston reports the search finds.
- Does the free-tier limit of 5 Cron Triggers per account leave room? A code
  search of Ben's repos found no other cron. That search may not cover
  private repos.
- Alert timing: how long before T-0, and how many emails per launch?
- Tags v0.1.0 to v0.4.0: the session's git proxy refused the tag push
  (403). Ben to create and push them from his clone (commits in FINDINGS,
  Versions).

---

## Handoff → next session
Start prompt:
> Read AGENTS.md, then the PLAN.md status block, Phase 2 and Open
> questions, then FINDINGS.md (skim; Tripwires in full). Run `npm test` and
> `node scripts/backtest.js` and check them against the tripwires. Do the
> Backlog item with a deadline if it is due. Then start Phase 2: confirm
> the api.weather.gov rules from its own docs (record them in FINDINGS
> Reference and reference/data-sources.md), and discuss "which cloud
> matters" with Ben before writing engine/weather.js. Do not tune a
> threshold to fix a miss.
