# Space Jellyfish — Journal

Newest entry on top. Entries are never edited — this is history, not current
state. One entry per session: the shutdown debrief.

Keep the 5 most recent entries here. Move older entries, unchanged, to
journal/YYYY-MM.md (the month they were written, newest first).

---

## 2026-10-19 · Bandwagon 5 scrubbed to Tuesday

**Did:** Ben reported the scrub (Spaceflight Now, 18 Oct: poor weather,
now Tuesday). He links it to rough seas; the drone ships were still in
harbor. Read LL2: it changed by 10:08Z on 19 Oct to NET 20 Oct 10:30Z,
Go, 85 percent. Ran the engine for Tuesday. Result: likely, prime at
window open; not prime by 11:00Z. Recorded this in FINDINGS, PLAN and
the direction file. No code change.

**Least confident (Q1):** The scrub reason comes from Ben's quote of the
headline. My fetch of the article showed the older text. A second
fetch later in the day would confirm it.

**Suggestions (Q5):** The fallback file still gives Bandwagon 5 as
"October" (saved 8 Oct). Run save-upcoming-fallback.js from a machine
that can reach LL2. The shell here cannot.

---

## 2026-10-18 · Bandwagon 5 direction, stale links, Phase 2b, shorter cloud card (0.7.1, 0.7.2)

**Did:** Set Bandwagon 5 to southeast from Coast Guard BNM 9080-26
(hazard polygon on the NAVCEN chart viewer, Ben's screenshot). ASOG
was still in port; LL2 still says ASOG at 600 km. Engine: likely,
prime, but low (9 to 13 degrees, south-southeast). Fixed README and
runbook links that pointed to a stale orbitalradar ship page. Looked
for a feed the page could read: Coast Guard BNM pages, RSS and
GovDelivery exist, but WebFetch could not read them and no browser was
reachable. Added Phase 2b (unknown trajectories). Shortened the cloud
note to one sentence (0.7.1). Miles and feet on the card and in the
README (0.7.2).

**Least confident about (Q1):**
- That the hazard polygon lies on the ascent track. Its point came from
  the map cursor. The launch-day report, or the ship's station, will
  show it.
- That 0.7.1 and 0.7.2 look right on the page. Not seen live.
- The miles in the README table. They come from rounded km. A rerun of
  scripts/observer-sensitivity.js with miles would prove them.

**Unstated assumptions (Q2):** The BNM windows are for this launch and
not a backup. The great-circle bearing from the pad is close enough to
the launch azimuth over 700 km. The NAVCEN chart data comes from a feed
a script can read.

**Biggest thing being missed (Q3):** No automatic direction source is
proven yet. Every method so far needs a person with a browser.

**Could've gone better (Q4):** I first told Ben the landing was a return
to the pad, from a search snippet, before I read the repo. The repo and
LL2 both said ASOG. Read the repo first. One JSON edit broke the file;
I caught it with a parse check.

**Suggestions (Q5):** The three easy wins at the top of the Backlog.
Start Phase 2b with the network log of the NAVCEN chart viewer.

---

## 2026-10-16 · Satellite check: two judges failed, the offshore ratio test held (0.7.0)

**Did:** Pulled 7 commits and ran the satellite plan locally. Test 1: the
GOES cloud mask against 11 airports, twilight skill 48, bar 70: no-go.
Test 2: GOES cloud layers low cloud, skill 21, bar 80: no-go. Read the
microwave and validation papers (mostly abstracts). Test 3: NBM judged by
GOES over land and water alike, as a ratio: 0.926 (0.888 to 0.947), bar
0.85: holds. The card shows the offshore ratio from 0.7.0. Ben approved
every rule set before its data. Cleaned PLAN and FINDINGS of each
other's content.

**Least confident about (Q1):**
- That the GOES mask is about equally good over land and water, which the
  ratio needs. A product test against an active sensor (EarthCARE or
  CALIPSO) over both would show it.
- The near-Charleston ratio (0.886, interval down to 0.846). More hours,
  or the past-launch check in the Backlog, would show if it is below 0.85.
- TCF = 65531 as full cloud. A NOAA document or the PUG would prove it.

**Unstated assumptions (Q2):** Open-Meteo past runs are what NBM really
forecast. The mask's errors do not depend on NBM's. The hourly forecast
value is for the whole hour. Twilight at JZI stands for twilight at the
water places.

**Biggest thing being missed (Q3):** Still no ground truth for the view
itself. Ben's sky notes on launch mornings are the only direct check.

**Could've gone better (Q4):** I wrote a missing-value rule from the
valid_range attribute alone and it dropped overcast cases (test 2). I
should look at what each odd value goes with before I name it missing.
My sizing script merged some evening and morning events. I let a
download run to 3.6 GB against a 1.5 GB plan without asking first.

**Suggestions (Q5):** Save the card before Bandwagon 5. Add a unit test for the ratio code. Use the GOES pipeline on past
twilight launches (all in the Backlog). The open question on a minimum of
5 positive cases for the exit gate looks stale: the gate was met.

---

## 2026-10-16 · Cloud forecast study: four models scored, NBM chosen, TAF added (0.5.0, 0.6.0)

**Did:** Tested cloud sources from the live page: Open-Meteo works
(many places in one request, offshore to 174 km); aviationweather.gov and
LAMP are blocked from a page; the NWS API serves TAFs. Ben asked to
verify against observations, not against another forecast. Built a
pinned study: 33 raw files from the IEM ASOS archive and Open-Meteo
past runs, fetched on Ben's Mac; scripts/score-clouds.js scores four
models at 1 to 7 days and by layer. NBM was best at every lead; HRRR
best for low cloud at short lead; most "false alarms" were high cloud
above the 12,000 ft ASOS limit. Wrote clouds/README.md and a knowledge
base note. The page now uses NBM and HRRR low cloud (0.5.0), the KJZI
TAF and a reach set by the sight line, not the old 60 km NWS cap
(0.6.0). Scoped a GOES satellite check of offshore cloud.

**Least confident about (Q1):**
- That airport skill holds offshore, where the plume is seen. The GOES
  check (PLAN) would show it.
- The GOES clear sky mask at twilight and night. Its ReadMe is unread.
  Step 1 of the satellite plan (mask against airports) would show it.
- The trust line on the card uses four full-sky stations only. More
  full-sky stations, or the satellite, would test it.
- The TAF parser has seen only FROM groups live. A TAF with TEMPO or
  PROB groups would show if it reads them right.
- Open-Meteo counting for many places per request comes from a 2023
  post, not the pricing page.

**Unstated assumptions (Q2):** Open-Meteo hourly cloud is matched to the
report nearest the hour. Model archives on Open-Meteo are what the
models really forecast then. The NWS gridded forecast cannot be scored;
the NDFD archive at NCEI was not tried.

**Biggest thing being missed (Q3):** Ground truth for the view itself.
Airports see the sky over land; the plume is seen low over the ocean.

**Could've gone better (Q4):** I told Ben the 60 km cap only bit on low
passes; it cut 48 percent of rays. I wrote two report numbers wrong
before the check caught them, and a rounding bug made two files
disagree. A doc script appended a section twice after an earlier edit
failed. I should run the check before I state a number, and stop a
script at the first failed edit.

**Suggestions (Q5):** Do the satellite work locally, step 1 only first.
Keep the report-vs-results test pattern for any hand-written numbers.
After Bandwagon 5, add Ben's sky notes next to the card's forecast.

---

## 2026-10-15 (night) · Phase 2 done: cloud forecast on the page, versions, cache fix

**Did:** Read the api.weather.gov docs and tested it from the live page
(CORS works; skyCover in percent for about 7 days; grid at 59 km
offshore, none at 107 km). Ben chose local plus directional cloud, as a
triangle under the sight line. Computed where the sight line clears
cloud height. Wrote engine/weather.js and lib/nws.js: local sky cover
loads by itself; a labelled button checks the top 20 percent of the arc
out to 60 km (7 to 33 places, was 74 median). Seen working on Ben's Mac
and iPhone. Added a version (0.4.0) in package.json, a page footer, a
README badge and a short CHANGELOG with commits; dropped git tags (the
proxy refused the push). Found that the Cloudflare zone Browser Cache TTL
(4 h) held old code; changed it to Respect Existing Headers in the
dashboard at Ben's request, and saw max-age=0 after. Closed Phase 2.

**Least confident about (Q1):**
- The cloud top (12 km), the 0.8 arc fraction and the 60 km cap. None has
  a source. A sighting with a cloud forecast beside it would test them.
- skyCover is one total number. Thin high cloud counts the same as a low
  deck. A sighting through a high forecast value would show the cost.
- The offshore grid edge. Only bearings 134 to 184 were tested, and the
  edge lies somewhere between 59 and 107 km.
- The NWS rate limit is not published. A fan launch asks for up to about
  64 requests per press. A 429 in the browser would show the limit.
- The other sites on benneely.com now send their own cache headers.
  Their headers were not checked.

**Unstated assumptions (Q2):** One skyCover value per interval (1 to 6 h)
is fine for a 6 minute view. The /points grid mapping holds for 24 h.
Launch weather rules at the Cape are about the pad sky; not quoted from a
source.

**Biggest thing being missed (Q3):** Forecast skill. A sky cover number
5 days out may say little about the sky at 06:30 on the day. And the
verdict still ignores weather, by design.

**Could've gone better (Q4):** One doc script wrote CHANGELOG, then failed
on FINDINGS, and the half edit was committed; I should check all
replacements before writing any file. I first wrote in the changelog that
_headers fixed caching before I had checked the live headers.

**Suggestions (Q5):** Turn the one-off point-count commands into
`scripts/weather-points.js` and add its counts as a tripwire. Check the
"forecast not available yet" text when a launch more than 7 days out
appears. Check the other benneely.com sites' cache headers once.
