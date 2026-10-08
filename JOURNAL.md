# Space Jellyfish — Journal

Newest entry on top. Entries are never edited — this is history, not current
state. One entry per session: the shutdown debrief.

Keep the 5 most recent entries here. Move older entries, unchanged, to
journal/YYYY-MM.md (the month they were written, newest first).

---

## 2026-10-08 — Page live, labels corrected, Cloudflare feed removed

**Did:** Ben confirmed five Reddit post dates and described the Atlas V
photo; that label is now `seen`. Wrote the page and Ben put it live at
jellyfish.benneely.com. Added a station trajectory class. Tried a Cloudflare
Pages Function as a shared LL2 feed; LL2 answered 429 to all 4 requests, so
it was removed. Added model notes and a prior-art note to reference/. Listed
the project on neely/apps and in neely/registry.

**Least confident about (Q1):**
- The prediction for SpX-35 on 2026-10-13 (likely, prime, 30 to 33 degrees
  up, 6:36 to 6:42 local). Ben's own view that morning will prove it right
  or wrong, if the sky is clear.
- Evening launches. One `seen-plume` label is an evening launch. More
  evening labels would test them.
- That the page will not hit the LL2 limit in normal use. A week of use by
  Ben will show it.

**Unstated assumptions (Q2):** That the browser clock and time zone do not
matter because the page formats times in America/New_York. That an LL2
record with precision "Second", "Minute", or "Hour" is firm enough to show.

**Biggest thing being missed (Q3):** Starlink launches may have left
Florida. If so, the chances each year fall a lot, and the alert phase may
not be worth its cost. Phase 3 also has no working source of launch times.

**Could've gone better (Q4):** I shipped the Cloudflare feed and wrote in
PLAN that it existed before I had seen it answer. I should have tested the
live address first. I also changed the rule for what counts as a miss after
the result was known; FINDINGS says so.

**Suggested improvement (Q5):** Before Phase 3, spend one session only on
the launch-time source: price and terms of an LL2 token, and one other
source.

---

## 2026-10-08 — Repo setup, engine, first backtest

**Did:** Made the repo from the template and drafted the phases. Wrote the
sun, geometry, trajectory, and visibility modules with pinned reference
tests. Pinned 506 launches from LL2. Built reference/ as a knowledge base.
Collected 12 sighting labels from news pages and from Reddit screenshots
that Ben supplied. Ran the first backtest: 11 of 12 labels are not 'no'.

**Least confident about (Q1):**
- The ascent profiles. They are five 2018 flights. Most labels are Starlink
  flights. A Starlink profile with altitude against time would prove them
  right or wrong.
- The missed Atlas V label of 2026-04-27. The post date and a description
  of the photo from Ben would show which of the four causes is true.
- The news labels. A subagent read the pages; I did not open each URL
  myself. Ben has not reviewed them.
- The three provisional thresholds. Twilight launches that the engine
  rejects, with or without a sighting report, would test them.

**Unstated assumptions (Q2):** That a report of "seen" means a sunlit
plume. A rocket flame can be seen at night. That the Reddit screenshot ages
were counted from 2026-10-08. That the observer height of 0 m does not
matter.

**Biggest thing being missed (Q3):** The backtest cannot yet tell the engine
from a rule that says "twilight launches are visible". Only the one miss and
the 'possible' cases carry information about the geometry.

**Could've gone better (Q4):** I ran `git add -A` while a subagent was still
writing notes, so commit 55ab7aa holds four unfinished notes. Its message
says 6 plume labels; the number is 5. I should stage files by name while
agents write.

**Suggested improvement (Q5):** Add a line to the kit AGENTS.md: do not use
`git add -A` while a subagent is writing in the repo.

---

<!-- Entry format:

## YYYY-MM-DD — <session in a few words>

**Did:** <one or two lines>

**Least confident about (Q1):**
- <thing> — would be proven right/wrong by <test/observation>.

**Suggested improvement (Q5):** <one line>

For big sessions, also include:
**Unstated assumptions (Q2):** <...>
**Biggest thing being missed (Q3):** <...>
**Could've gone better (Q4):** <...>

-->
