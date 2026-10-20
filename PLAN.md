# Space Jellyfish — Roadmap

Live at **https://jellyfish.benneely.com** · Repo: **github.com/neely/spaceJellyfish**

**Purpose:** Predict when a Cape Canaveral or KSC launch will show the twilight "space jellyfish" plume from Charleston, SC (James Island, 29412), and send an email alert when it will.
**Non-goals:** No code, predictions, or images taken from nextspaceflight.com or jellyfish.johnkrausphotos.com; reading them for ideas is allowed (Ben, 2026-10-08). No pads outside Cape Canaveral and KSC. No observer points other than Charleston. Weather is a secondary modifier, not a primary signal.

---

## Status
- **Active:** none. Phases 0 to 2 and the cloud work are done. Live
  version 0.8.0 (shorter card with links to the README guide, miles and
  feet; not yet seen live). Next phase: 2b, unknown trajectories (Ben,
  2026-10-18). Phase 3 (alerts) starts only when Ben asks.
- **Last updated:** 2026-10-20
- **Next action:** when LL2 marks Bandwagon 5 "Success" (it said "In
  Flight" at 2026-10-20 13:31Z), refresh the snapshot and add the `seen`
  label (Backlog). Bandwagon 5 was seen on 2026-10-20, low SSE, faint;
  the cloud forecast was right (clouds/README.md, launch-morning checks).

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
- Phase 2 — Weather modifier. Done 2026-10-15 (v0.4.0): NWS sky cover
  over the observer, and a button for sky cover along the top of the arc
  out to 60 km (150 km from 0.6.0). Seen working on the live page on Ben's Mac and on his
  iPhone. The beyond-7-days text has not been seen live yet. Decisions and
  numbers are in FINDINGS; the checklist with its "Observed" notes is in
  git history (PLAN.md at commit 223a889).
- Cloud forecast study and satellite check, 2026-10-16 (0.5.0 to 0.7.0):
  four models scored against 11 airports (NBM and HRRR chosen); GOES
  cloud mask and cloud layers both failed as a better judge than the
  airports (tests 1 and 2); NBM kept its skill offshore when GOES judged
  land and water alike (test 3), shown on the card from 0.7.0. Report:
  clouds/README.md. Results and decisions in FINDINGS; the checklists
  with their "Observed" notes are in git history (PLAN.md at commit
  b4383da).
- Source audit, 2026-10-15: reference/source-audit.md. Follow-ups done:
  declination -8.3 (WMM-2025), Census ZIP points, Bandwagon source note,
  2020 R4yGM flights added to `falcon9-leo`, snapshot refreshed, SpX-35
  labelled.

## Backlog (open items from Phase 1, in order)
- [ ] Easy win: check the live page shows "Version 0.8.0", the one-line
      cloud note, the one-line "Path:" note with its two links, miles in
      the cloud table, and that the README guide links land on their
      sections (Bandwagon 5 card).
- [ ] Easy win: Sunday evening, check orbitalradar.com/recovery-fleet
      for ASOG. If it has sailed, note where it heads in
      reference/topics/recovery-fleet.md. Southeast agrees with the
      hazard area.
- [ ] Easy win: with the Claude desktop app or the Chrome extension
      running on Ben's Mac, open navcen.uscg.gov/chart and read its
      network log for the hazard-area feed. This starts Phase 2b,
      method 1. If the BNM 9080-26 text is found, put its waypoints in
      the Bandwagon 5 source in config/launch-directions.json.
- [x] Check the live page (jellyfish.benneely.com) shows 0.7.0 in the
      footer and the "Out over the water" line on the cloud card.
      (0.7.1 folds that line into one shorter sentence.)
      Observed 2026-10-16 in the in-app browser: footer "Version 0.7.0";
      Bandwagon 5 card "kept about 94% of its skill over land".
- [ ] Bandwagon 5 label: when LL2 gives status Success, run
      `node scripts/snapshot-ll2.js`, add a `seen` label to
      data/labels.json (Ben's sighting, data/observations.json), fill
      its llId there, and update the snapshot, label and backtest
      tripwires in FINDINGS. Expected new record: Bandwagon 5 only (LL2
      listed no other Cape or KSC launch after SpX-35 on 2026-10-20).
      The commit states what moved (FINDINGS, refresh rule).
- [x] Before Bandwagon 5 (Monday 2026-10-19, 06:30 local): on Sunday,
      find where the drone ship ASOG waits and set northeast or southeast
      in config/launch-directions.json (runbook in
      reference/topics/cape-launch-azimuths-and-inclinations.md; ship notes
      in reference/topics/recovery-fleet.md). Sunday part done 2026-10-18:
      heading set to southeast from Coast Guard BNM 9080-26 (hazard
      polygon east of the Bahamas, seen by Ben on navcen.uscg.gov/chart).
      ASOG was still in port at 06:53; if it sails, check it goes
      southeast. On launch morning, save the
      card's cloud lines (a screenshot) before going out, so Ben's sky
      note can be set beside what the card said. After the launch: add
      Ben's sky view points to data/observations.json and refresh the
      snapshot (refresh rule in FINDINGS). Done 2026-10-20 except the
      refresh (item above): launched 07:04 local after the Monday scrub;
      Ben saw a faint plume low in the SSE on the drawn path (telephoto
      needed); no card screenshot, so the cloud forecast was read back
      from Open-Meteo past runs and set beside the airports and GOES
      (clouds/README.md). Observed: Ben's sky view screenshot at 07:07;
      LL2 record read 2026-10-20 13:31Z (booster on ASOG, 600 km).
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
- [ ] A profile for vehicles other than Falcon 9. No source found yet.
      Until then, other vehicles use the Falcon 9 members with low
      confidence.
- [ ] Ascent data from flights after 2020. None found yet.
- [ ] A unit test for the ratio and bootstrap in
      scripts/score-goes-relative.js (a small made-up set of counts with a
      known answer). Today only its output is checked against the report.
- [ ] Past twilight launches and cloud: read the GOES mask at the
      sight-line places at T+300 s for the 60 visible snapshot launches,
      with scripts/fetch-goes-relative.js as the pattern. It answers the
      open question below and shows whether the 5 `seen-plume` launches had
      a clear line of sight. New rules before data, as for tests 1 to 3.

## Phase 2b — Resolve unknown trajectories  ← NEXT
Goal: a direction for every Cape launch before launch day, from a
source, without Ben looking it up by hand. Today LL2 gives no direction,
the page draws the fan for anything not a station or high-orbit flight,
and the fix is a hand edit (config/launch-directions.json). Ben asked to
make this a priority (2026-10-18).
- [ ] Score each method on each launch. For every launch from now on,
      record which methods gave a direction before launch, when they gave
      it, and whether the launch-day report agreed. Keep it in one file
      (for example data/direction-checks.json). Bandwagon 5 is the first
      row: hazard area southeast (2026-10-18), ship still in port; on the
      day, LL2 gave the landing on ASOG at 600 km and Ben saw the rocket
      in the SSE, so the southeast call held.
- [ ] Count how many upcoming launches show the fan today, and how many
      past twilight launches in the snapshot had no known direction. This
      sizes the problem.
- [ ] Hazard areas, read automatically (method 1). Ben asked (2026-10-18). Find a
      source the page or a Worker can read: the NAVCEN chart viewer's
      data feed (read its network log in a desktop browser), the District
      7 BNM RSS feeds, or the BNM message pages (sources in the Runbook,
      step 6). WebFetch could not read any of them. Then: match the
      notice to the launch by mission name, get the polygon, set the
      direction from its bearing, and show it on the card. The drone ship
      position (orbitalradar) is a third-party page with no known feed;
      lower priority.
- [ ] LL2 landing location and downrange distance as an automatic hint
      (method 2). A drone ship 500 km or more downrange with a mission
      inclination gives two candidate tracks; the hazard area picks one.
      A landing zone gives no hint.
- [ ] Drone ship position (method 3). Find a feed a script may read (an
      AIS source with terms that allow it). orbitalradar shows it in a
      browser only.
- [ ] Mission class rules (method 4): earlier flights of the same series
      (Bandwagon, Transporter, CRS, Cygnus, Amazon Leo, crew). Record each
      series' inclination and side with a source.
- [ ] Polar and sun-synchronous launches (13 in the snapshot) fly south
      and use the fan. Give them their own class with the corridor
      azimuths, when a source gives them (moved from the Backlog).
- [ ] The card says which method set the direction and when, and keeps
      the fan with a "path not known" note when none did.

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
  Leads (2026-10-19): no public ascent data found for Atlas V, Vulcan or
  New Glenn. Read altitude and speed off the webcast of the first one in
  twilight (the SpaceXtract approach). Flight Club simulations are a
  second lead, not checked. ULA mission booklets give the launch azimuth.
  Next 30 launches (list of 2026-10-19): 13 Falcon 9, 8 Vulcan, 3 New
  Glenn, 2 Falcon Heavy, 2 Terran R, 2 unknown.
- Workers Paid — only if the engine does not fit in 10 ms.
- Wallops launches — one Charleston sighting is on record (Antares,
  2022-11-07). Out of scope now; Ben decides if the scope grows.
- GOES cloud top height (ABI-L2-ACHAC, 0.3 MB a file) would give the
  cloud top for the sight-line test directly. Read PUG Vol 5 first (the
  OSPO copy answered 503 on 2026-10-16).

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
  launches? The GOES pipeline (clouds/README.md, tests 1 to 3) can now
  read past cloud; see the Backlog item.
- Weather: how do the local and directional sky cover values combine into
  one modifier? No source gives weights. Show both raw values first.
- Launch weather rules at the Cape: a launch that goes says the pad sky
  was acceptable, not the Charleston sky. Ben asked (2026-10-15). Quote
  the rules from a source before the docs rely on this.
- Is 5 positive cases the right minimum for the exit gate? The gate was
  met with 5 on 2026-10-15. Whether 5 is enough stays open; a new
  plume report or observation adds to it.
- Does the free-tier limit of 5 Cron Triggers per account leave room? A code
  search of Ben's repos found no other cron. That search may not cover
  private repos.
- Alert timing: how long before T-0, and how many emails per launch?
- Clouds: does thin high cloud hide a lit plume? No source. A sighting
  through a forecast of high cloud would show it.

---

## Handoff → next session
Start prompt (local Claude Code, repo cloned on Ben's Mac):
> Read AGENTS.md, then the PLAN.md status block, Backlog and Open
> questions, then FINDINGS.md (skim; Tripwires in full). Run `npm test` and
> `node scripts/backtest.js` and check them against the tripwires. When
> LL2 marks Bandwagon 5 Success, do its label and snapshot refresh
> (Backlog). The satellite check
> is done (clouds/README.md, tests 1 to 3); start a new satellite test
> only when Ben asks, with rules set before the data. Phase 3 starts only
> when Ben asks. For any page
> change, bump the version and add a CHANGELOG entry (FINDINGS, Versions).
