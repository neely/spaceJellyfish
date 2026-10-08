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
- <derived set> — expected <count / bound>.

### Intentional, not bugs
Things that look wrong but are correct. Do not "fix" these.
- <behavior> — <why it's intended>

### Known permanent limitations
- <limitation> — <why it can't/won't be solved, so nobody re-chases it>

### Dead-ends (do not re-explore)
- Tried <X> → got <Y> → rolled back because <reason>.
- Did NOT <tempting shortcut> because <reason it's wrong>.

### Reference
API quirks, schemas, formulas, the regex you fought with, constants —
whatever a session might need to look up. Organize by topic/feature.

#### <Topic>
<content>

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
