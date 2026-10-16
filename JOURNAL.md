# Space Jellyfish — Journal

Newest entry on top. Entries are never edited — this is history, not current
state. One entry per session: the shutdown debrief.

Keep the 5 most recent entries here. Move older entries, unchanged, to
journal/YYYY-MM.md (the month they were written, newest first).

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

---


## 2026-10-15 (evening) · Source audit, snapshot refresh, exit gate met, 2020 profiles

**Did:** Audited every outside input (reference/source-audit.md). Found
that SpaceX ended Falcon 9 Starlink launches from Florida; 35 of the 60
past chances were Starlink. Set declination to -8.3 (WMM-2025). Moved the
sensitivity script to Census ZIP points. Vendored 2020 webcast telemetry
(R4yGM, no licence, Ben approved) and derived downrange with a method that
reproduces shahar603 within 1 km. Added Starlink 5 to 8 and DM-2 to
falcon9-leo; the SpX-35 miss falls from 19 to 29 degrees to 6 to 14 for
the Starlink members. Refreshed the LL2 snapshot through the browser on
Ben's Mac (507 launches; old records byte-identical) under a new refresh
rule. Labelled SpX-35; the Phase 1 exit gate is met (0 of 5 missed).
Added a drone ship note and a "Sources worth a look" README section.
Collapsed Phase 1 in PLAN; Phase 2 is active.

**Least confident about (Q1):**
- The exit gate. The fifth label was written after its verdict was known,
  and 5 is a small number. More measured launches would show it.
- The 2020 downrange. Neither source says if the webcast speed is
  Earth-relative or inertial; both data sets share the method, so they
  compare like with like, but absolute downrange may be off. A tracked
  trajectory for one flight would show it.
- The remaining 6 to 14 degree miss, and the two SpX-35 points, which imply
  only 1.1 km/s of ground travel against 2.0 to 2.6 km/s in every flight. A
  second measured launch with more points would show if it is reading error.
- The Starlink statement is secondhand (Spectrum News quoting a post on X).
- The declination comes from pygeomag's WMM-2025 file, not the NOAA
  calculator (it refused WebFetch).

**Unstated assumptions (Q2):** All R4yGM files give speed in km/h (only
one header says so). The R4yGM file names map to the LL2 launches of the
same name (file dates fit). The Census ZCTA internal point is a better
place point than zippopotam's.

**Biggest thing being missed (Q3):** Weather. And the engine flies one
great circle at a fixed azimuth with no Earth rotation or dogleg; that may
be part of the eastward miss that no profile can fix.

**Could've gone better (Q4):** I said "no more Falcon 9s" when I meant
Falcon 9 Starlink, and first gave the wrong day for Bandwagon 5. I used
"fold in the snapshot" without saying what the snapshot is. I should
define project terms when I report.

**Suggestions (Q5):** Start Phase 2 in a new session. Generalise
compare-ascent-sources.js into the planned compare-observations.js. Measure
engine CPU again with 7 LEO members before Phase 3.

## 2026-10-13 to 15 · SpX-35 seen, sky view hardened, hand-set directions

**Did:** Ben saw SpX-35 as a wide plume from James Island, as predicted.
Height and timing matched within about 1 degree; the rocket was 19 to 29
degrees east of the predicted position. A Sun check two days later put the
compass within 1 degree, so the 2018 ascent profiles are the leading cause.
Added data/observations.json and a README table for measured sightings.
Fixed the sky view sliding sideways when the phone rolls (the iOS compass
heading moves with roll); made it portrait only; wrote setup steps in the
page and README. Showed by script that the forecast holds from Folly Beach
to Isle of Palms. Added hand-set launch directions and a runbook with URLs
for finding one. Added demo images to the README.

**Least confident about (Q1):**
- That the SpX-35 direction miss is the profile. A Sun check facing
  southeast at the same spot, and a second measured launch, would show it.
- The roll fix on Android. One Chrome test would show it.
- Bandwagon 5 at 45 degrees. Only a secondary source gives 45 for
  Bandwagon 3; the drone ship position will show the side, not the
  inclination.
- My readings of rocket position from screenshots (about 2 degrees).

**Unstated assumptions (Q2):** That the iOS heading is right when the phone
is level in portrait. That the gyro does not drift over a few minutes. That
LL2 ids stay the same when a launch slips.

**Biggest thing being missed (Q3):** The engine has only 2018 Falcon 9
profiles. Modern flights may fly a different ascent, which moves the
predicted position and maybe the verdict for edge cases.

**Could've gone better (Q4):** I told Ben the style guide was not used; a
locked FINDINGS decision from 2026-10-08 already records the rules taken
from it. I should have searched FINDINGS first. I also first wrote a roll
test with the wrong Euler angles (gimbal lock at beta 90); the test caught
it.

**Suggestions (Q5):** Script the observation comparison. Get a newer
profile and test it on SpX-35. Add a plume glow band to the sky view.

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
