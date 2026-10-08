#!/usr/bin/env python3
"""Build reference/INDEX.md from the front matter of every note under reference/.

Python 3.9, standard library only.

Usage:
    python3 reference/build_index.py                 write reference/INDEX.md
    python3 reference/build_index.py --show <key>    print answers and key_points of one note
    python3 reference/build_index.py --topic <tag>   list notes that carry a tag

Keys: paper notes use the file name without .md (for example author-2020-slug).
Topic notes use the folder and file name without .md (for example
topics/some-topic). Top-level notes use the file name without .md (for example
data-sources). --show accepts the key, "papers/<key>", or any unique trailing
part of a key.

The front matter parser is minimal. It handles the schema in papers/TEMPLATE.md:
scalars, single- and double-quoted strings, inline lists [a, b], and block lists
of "- " items. Unknown extra fields are allowed and kept as raw text.
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
REQUIRED = ["key", "title", "type", "topics", "relevance", "answers", "key_points"]
REL_ORDER = {"high": 0, "medium": 1, "low": 2}
VOCAB = [
    "sun-position", "sidereal-time", "geodesy", "trajectory", "ascent-profile",
    "telemetry", "launch-data", "twilight", "illumination", "plume",
    "visibility", "sightings", "weather", "cloudflare", "email", "data-access",
]
SKIP_FILES = ("TEMPLATE.md", "INDEX.md")
ANSWER_WIDTH = 160


# ---------------------------------------------------------------- parsing

def _read_quoted(s):
    """Return (text, rest) for a string that starts with a quote character."""
    q = s[0]
    out = []
    i = 1
    while i < len(s):
        c = s[i]
        if q == '"' and c == "\\" and i + 1 < len(s):
            out.append(s[i + 1])
            i += 2
            continue
        if q == "'" and c == "'" and i + 1 < len(s) and s[i + 1] == "'":
            out.append("'")
            i += 2
            continue
        if c == q:
            return "".join(out), s[i + 1:]
        out.append(c)
        i += 1
    return "".join(out), ""  # unterminated: take everything


def parse_scalar(s):
    s = s.strip()
    if not s:
        return ""
    if s[0] in "\"'":
        text, _rest = _read_quoted(s)
        return text
    if s[0] == "{":
        return s  # flow map kept raw
    return re.split(r"\s+#", s, maxsplit=1)[0].strip()


def split_inline_list(s):
    """Split the inside of [ ... ] on commas that are outside quotes."""
    items = []
    cur = []
    quote = None
    for c in s:
        if quote:
            cur.append(c)
            if c == quote:
                quote = None
        elif c in "\"'":
            quote = c
            cur.append(c)
        elif c == ",":
            items.append("".join(cur))
            cur = []
        else:
            cur.append(c)
    tail = "".join(cur)
    if tail.strip():
        items.append(tail)
    return [parse_scalar(x) for x in items if x.strip()]


def parse_inline_list(value):
    value = value.strip()
    end = value.rfind("]")
    inner = value[1:end] if end > 0 else value[1:]
    return split_inline_list(inner)


def split_front_matter(text):
    """Return (front_matter_lines, body) or (None, text) if there is none."""
    lines = text.split("\n")
    if not lines or lines[0].strip() != "---":
        return None, text
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            return lines[1:i], "\n".join(lines[i + 1:])
    return None, text


def parse_front_matter(lines):
    data = {}
    current = None  # key of an open block list
    for raw in lines:
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        indented = raw[:1] in (" ", "\t")
        if indented:
            stripped = raw.strip()
            if current is not None and stripped.startswith("- "):
                data[current].append(parse_scalar(stripped[2:]))
            continue
        m = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", raw)
        if not m:
            continue
        key, value = m.group(1), m.group(2)
        current = None
        if value.strip() == "" or value.strip().startswith("#"):
            data[key] = []
            current = key
        elif value.strip().startswith("["):
            data[key] = parse_inline_list(value)
        else:
            data[key] = parse_scalar(value)
    return data


# ---------------------------------------------------------------- loading

def find_notes():
    paths = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel_dir = os.path.relpath(dirpath, ROOT)
        # skip papers/pdf (local PDFs, not in git)
        dirnames[:] = sorted(
            d for d in dirnames
            if not (rel_dir == "papers" and d == "pdf") and not d.startswith(".")
        )
        for name in sorted(filenames):
            if name.endswith(".md") and name not in SKIP_FILES:
                paths.append(os.path.join(dirpath, name))
    return paths


def expected_key(path):
    rel = os.path.relpath(path, ROOT)[:-3]  # strip .md
    if rel.startswith("papers" + os.sep):
        return rel[len("papers" + os.sep):]
    return rel.replace(os.sep, "/")


def load_all():
    notes = []
    errors = []
    warnings = []
    seen = {}
    for path in find_notes():
        rel = os.path.relpath(path, ROOT)
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
        fm_lines, _body = split_front_matter(text)
        if fm_lines is None:
            errors.append("%s: no front matter" % rel)
            continue
        data = parse_front_matter(fm_lines)
        bad = False
        for field in REQUIRED:
            value = data.get(field)
            if value is None or value == "" or value == []:
                errors.append("%s: missing or empty field '%s'" % (rel, field))
                bad = True
        if bad:
            continue
        for field in ("topics", "key_points"):
            if not isinstance(data[field], list):
                errors.append("%s: field '%s' must be a list" % (rel, field))
                bad = True
        if data["relevance"] not in REL_ORDER:
            errors.append("%s: relevance must be high, medium or low (got %r)" % (rel, data["relevance"]))
            bad = True
        if bad:
            continue
        exp = expected_key(path)
        if data["key"] != exp:
            errors.append("%s: key '%s' does not match path (expected '%s')" % (rel, data["key"], exp))
            continue
        if data["key"] in seen:
            errors.append("%s: duplicate key '%s' (also in %s)" % (rel, data["key"], seen[data["key"]]))
            continue
        seen[data["key"]] = rel
        for tag in data["topics"]:
            if tag not in VOCAB:
                warnings.append("%s: tag '%s' is not in the vocabulary" % (rel, tag))
        if len(data["key_points"]) > 6:
            warnings.append("%s: %d key_points (limit 6)" % (rel, len(data["key_points"])))
        for kp in data["key_points"]:
            if len(kp.split()) > 25:
                warnings.append("%s: a key_point has %d words (limit 25)" % (rel, len(kp.split())))
        data["_path"] = rel.replace(os.sep, "/")
        notes.append(data)
    return notes, errors, warnings


# ---------------------------------------------------------------- output

def year_of(note):
    y = str(note.get("year", "")).strip()
    if re.match(r"^\d{4}$", y):
        return y, int(y)
    m = re.search(r"(\d{4})", note["key"])
    return "n.p.", int(m.group(1)) if m else 0


def distilled_of(note):
    return str(note.get("distilled", "")).strip() or "-"


def trunc(text, width=ANSWER_WIDTH):
    text = " ".join(str(text).split())
    if len(text) <= width:
        return text
    cut = text[:width].rsplit(" ", 1)[0].rstrip(",;:.")
    return cut + "..."


def cell(text):
    return str(text).replace("|", "\\|")


def table(rows, notes_are_papers):
    out = [
        "| key | %s | relevance | topics | answers |" % ("year" if notes_are_papers else "distilled"),
        "|---|---|---|---|---|",
    ]
    for n in rows:
        when = year_of(n)[0] if notes_are_papers else distilled_of(n)
        out.append("| [%s](%s) | %s | %s | %s | %s |" % (
            n["key"], n["_path"], when, n["relevance"],
            cell(", ".join(n["topics"])), cell(trunc(n["answers"]))))
    return out


def sort_by_key(n):
    return n["key"]


def build(notes):
    papers = [n for n in notes if n["_path"].startswith("papers/")]
    papers.sort(key=lambda n: (REL_ORDER[n["relevance"]], -year_of(n)[1], n["key"]))
    topics = sorted([n for n in notes if n["_path"].startswith("topics/")], key=sort_by_key)
    top = sorted([n for n in notes if n["_path"].count("/") == 0 and n["key"] != "README"], key=sort_by_key)

    counts = {t: 0 for t in VOCAB}
    for n in notes:
        for t in n["topics"]:
            counts[t] = counts.get(t, 0) + 1
    tag_line = ", ".join("%s %d" % (t, counts[t]) for t in VOCAB)
    extra = [t for t in counts if t not in VOCAB]
    if extra:
        tag_line += "; outside vocabulary: " + ", ".join("%s %d" % (t, counts[t]) for t in sorted(extra))

    out = []
    out.append("# INDEX of reference/")
    out.append("")
    out.append("Generated by `python3 reference/build_index.py`. Do not edit by hand. Edit the front matter of a note and run the script again.")
    out.append("")
    out.append("## How to use")
    out.append("")
    out.append(
        "Read this index. Pick the few notes whose answers match your question. "
        "Read only their front matter (the first lines of the file: answers and key_points). "
        "Open a note body only if the front matter is not enough. "
        "Open the PDF in papers/pdf/ (local only) only if the note is not enough. "
        "Two commands help: `python3 reference/build_index.py --show <key>` prints the answers and key_points of one note. "
        "`python3 reference/build_index.py --topic <tag>` lists the notes with a tag."
    )
    out.append("")
    out.append("## Tags (count of notes)")
    out.append("")
    out.append(tag_line)
    out.append("")
    out.append("## Papers (%d), high relevance first, then newest" % len(papers))
    out.append("")
    out.extend(table(papers, True))
    out.append("")
    out.append("## Topic notes (%d)" % len(topics))
    out.append("")
    out.extend(table(topics, False))
    out.append("")
    out.append("## Top-level notes (%d)" % len(top))
    out.append("")
    out.extend(table(top, False))
    out.append("")
    return "\n".join(out)


def find_note(notes, query):
    q = query.strip()
    if q.endswith(".md"):
        q = q[:-3]
    exact = [n for n in notes if n["key"] == q or n["_path"][:-3] == q]
    if exact:
        return exact[0], []
    tail = [n for n in notes if n["key"].endswith("/" + q) or n["key"].endswith(q)]
    if len(tail) == 1:
        return tail[0], []
    return None, [n["key"] for n in tail]


def main(argv):
    notes, errors, warnings = load_all()
    mode = argv[1] if len(argv) > 1 else None

    if mode in ("--show", "--topic"):
        if len(argv) < 3:
            print("usage: build_index.py %s <%s>" % (mode, "key" if mode == "--show" else "tag"), file=sys.stderr)
            return 2
        for e in errors:
            print("ERROR " + e, file=sys.stderr)
        arg = argv[2]
        if mode == "--show":
            note, many = find_note(notes, arg)
            if note is None:
                print("no note matches '%s'%s" % (arg, (" (ambiguous: %s)" % ", ".join(many)) if many else ""), file=sys.stderr)
                return 1
            print("%s  [%s, %s]" % (note["key"], note["relevance"], note["_path"]))
            print("title: " + note["title"])
            print("answers: " + note["answers"])
            print("key_points:")
            for kp in note["key_points"]:
                print("  - " + kp)
            return 0
        hits = [n for n in notes if arg in n["topics"]]
        hits.sort(key=lambda n: (REL_ORDER[n["relevance"]], n["key"]))
        if not hits:
            print("no note carries the tag '%s'" % arg)
            return 0
        for n in hits:
            print("%s  [%s]  %s" % (n["key"], n["relevance"], trunc(n["answers"])))
        return 0

    if mode is not None:
        print("unknown option %s" % mode, file=sys.stderr)
        return 2

    for w in warnings:
        print("WARNING " + w, file=sys.stderr)
    if errors:
        for e in errors:
            print("ERROR " + e, file=sys.stderr)
        print("INDEX.md not written: %d error(s)" % len(errors), file=sys.stderr)
        return 1
    with open(os.path.join(ROOT, "INDEX.md"), "w", encoding="utf-8") as fh:
        fh.write(build(notes))
    print("wrote INDEX.md: %d notes, %d warning(s)" % (len(notes), len(warnings)))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
