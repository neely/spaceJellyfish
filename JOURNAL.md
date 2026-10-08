# Space Jellyfish — Journal

Newest entry on top. Entries are never edited — this is history, not current
state. One entry per session: the shutdown debrief.

Keep the 5 most recent entries here. Move older entries, unchanged, to
journal/YYYY-MM.md (the month they were written, newest first).

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
