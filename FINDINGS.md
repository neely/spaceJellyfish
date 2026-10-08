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
- None yet. Phase 1 adds the sun-position reference values and the backtest
  share.

### Intentional, not bugs
Things that look wrong but are correct. Do not "fix" these.
- None yet.

### Known permanent limitations
- None yet.

### Dead-ends (do not re-explore)
- None yet.

### Reference
API quirks, schemas, formulas, constants. Organized by topic.

Every entry below is an external claim, checked on 2026-10-08. Check it again
before you rely on it.

#### Launch Library 2 (LL2)
- Base URL: `https://ll.thespacedevs.com/2.3.0/`.
- Rate limit: https://thespacedevs.com/llapi says "up to 15 non-authenticated
  requests per hour".
- CORS: a request to `/launches/upcoming/` with an `Origin` header returned
  `access-control-allow-origin: *`. A browser page can call LL2 directly.
- `location__ids=12` is "Cape Canaveral SFS, FL, USA". The id for Kennedy
  Space Center is not confirmed.
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
