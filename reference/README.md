---
key: README
title: "reference/ entry point: how to find and add notes"
type: index
sources_summary: "Entry point to reference/. It holds no source material of its own. Each note records where and when its information was obtained."
distilled: 2026-10-08
topics: [data-access]
relevance: high
answers: "What is in reference/, how do I find the right note with the least reading, and how do I add a paper or a topic note?"
key_points:
  - "Read INDEX.md first, then only the front matter of matching notes, then a body, then the original source."
  - "python3 reference/build_index.py --show <key> prints one note's answers and key_points."
  - "python3 reference/build_index.py --topic <tag> lists the notes that carry a tag."
  - "PDFs in papers/pdf/ are local only and not in git."
  - "Our own measurements are in FINDINGS.md, not here."
related_papers: []
---

# reference/

External and vendored material. It is not our own data. Our own measurements and conclusions are in FINDINGS.md, not here.

## How to look something up (progressive disclosure)
1. Read INDEX.md. It lists every note with one line on what it answers. It is generated. Do not edit it by hand.
2. Read only the front matter of the notes that match (the first lines of the file: answers and key_points).
3. Read a note body only if the front matter is not enough.
4. Open the original source (the PDF in papers/pdf/ or the web page) only if the note is not enough.

Two commands save reading:
- `python3 reference/build_index.py --show <key>` prints the answers and key_points of one note. The key is the file name without .md. For a topic note use the folder too, for example topics/some-topic.
- `python3 reference/build_index.py --topic <tag>` lists the notes that carry a tag, with their answers line.

## Folders
- `papers/` holds one note per paper or document. See papers/TEMPLATE.md. Local PDFs go in `papers/pdf/`.
- `topics/` holds topic notes. They are built from web sources and from our reading.
- Top-level notes are single documents. Examples: `data-sources.md` (how to reach each external data provider), `handoff-brief.md` (the original project brief), `usno-sun-and-sidereal-time.md` (formulas implemented by engine/sun.js).
- `build_index.py` builds INDEX.md and checks the front matter of every note.

Do not rename `usno-sun-and-sidereal-time.md`. engine/sun.js and the tests refer to this file name.

## Rules
- Every note records where and when its information was obtained, and how much of the source was read. Papers do this in the front matter (obtained, read_coverage). Topic notes and top-level notes do it in sources_summary and, where useful, in a numbered source list.
- The first lines of each note (the front matter: answers and key_points) must be enough to decide whether to read the body. Write them last, and check them against the body.
- A paper note changes only in the section "Effect on existing notes" after it is written. Topic notes cite a paper as (see papers/<key>.md, p. N), with the page taken from the paper note.
- Where two sources disagree, keep both. Start the bullet with the word Conflict and a colon, and say which source says what.
- Do not add a fact that you cannot find in the source. Facts come from a file or a command, not from memory (see AGENTS.md).
- PDFs in papers/pdf/ are local only and are not in git. Do not copy their text. Do not put download stamps, institution names or addresses from them in any note.
- Use short plain sentences (ASD-STE100). Do not use the em-dash character.

## Add a paper
1. Put the PDF in papers/pdf/.
2. Copy papers/TEMPLATE.md to papers/<key>.md. The key is author-year-short-slug and is also the file name.
3. Fill the front matter and the sections from the PDF. Give a page for each finding.
4. In the topic notes it affects, add a short cited line, and fill the section "Effect on existing notes" in the paper note.
5. Run `python3 reference/build_index.py`. It exits non-zero and names the file and field if the front matter is incomplete.

## Add a topic note
1. Create topics/<slug>.md. The key is `topics/<slug>`.
2. Fill the front matter. Required fields: key, title, type, topics, relevance, answers, key_points. Add sources_summary and distilled as well.
3. Number the web sources in the body. Give the date each was retrieved. Say which sources could not be opened.
4. Run `python3 reference/build_index.py`.

## Tags
Use tags from the list in INDEX.md (the list is the VOCAB variable in build_index.py). Add a new tag to VOCAB only if none fits.
