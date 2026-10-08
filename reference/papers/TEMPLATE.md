---
key: author-year-short-slug            # same as this file's name without .md
title: "Full title as printed on the paper"
authors: "Surname, A.B.; Surname, C.D.; ..."   # as printed; "et al." only after the first six
year: 2022
venue: "Journal or conference, volume(issue), pages"
doi_or_url: "10.xxxx/xxxxx"             # DOI as printed, else the URL printed on the document
type: journal-article                    # journal-article | preprint | conference | report | abstract | web-doc
source_file: "pdf/author-year-short-slug.pdf"   # local only, not in git
# A note that covers several small documents lists them instead:
# sources:
#   - {file: "pdf/name-1.pdf", title: "...", url: "...", date_on_document: "..."}
obtained: "PDF supplied by the owner, YYYY-MM-DD"   # or: "fetched from <url>, YYYY-MM-DD"
distilled: YYYY-MM-DD
distilled_by: "Claude (subagent), from the PDF"
read_coverage: "full text"               # or "pages 3-17 and appendix A", or "scanned; read as page images"
topics: [trajectory, ascent-profile, launch-data]   # 3-8 lower-case tags from the list in INDEX.md; add a new tag only if none fits
relevance: high                          # high | medium | low (for Space Jellyfish decisions)
answers: "One or two sentences: the question this note answers for the project."
key_points:
  - "At most six points, each under 25 words, each one a finding a reader could act on."
  - "Put a number in the point when the paper gives one."
---

# Short title (Author Year)

## Summary
Four to eight sentences in our own words. What was done, with what data, and what was found.

## Data and method
What the study used: region, period, vehicles, instruments or models, sample sizes, how accuracy was measured.

## Findings
Each finding is one bullet in our own words and ends with where it is in the paper,
for example (p. 1405, Fig. 7) or (Sec. 4b, Table 2). Give numbers with units.

## Numbers worth keeping
A small table of the values most likely to be looked up later. Include the page for each.

| Quantity | Value | Where |
|---|---|---|

## Limits and caveats
The authors' own stated limits, then ours (region, season, vehicle, model version, sample size).

## What this means for Space Jellyfish
Interpretation, not sourced fact. Tie it to the engine, the config files and the open questions in PLAN.md.

## Testable with our data
Specific checks the project could run.

## Effect on existing notes
Which statements in reference/topics/ or other reference/ notes this paper confirms,
corrects or extends. Name the file and the section. Do not edit those files.
