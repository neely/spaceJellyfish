# Space Jellyfish — Journal

Newest entry on top. Entries are never edited — this is history, not current
state. One entry per session: the shutdown debrief.

Keep the 5 most recent entries here. Move older entries, unchanged, to
journal/YYYY-MM.md (the month they were written, newest first).

---

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

## 2026-10-12 — Camera sky view, tested with the Sun

**Did:** Built an add-on page, `sky.html`. It shows the phone's back camera
and draws the predicted path, horizon, height lines and compass marks over
it. Sun calibration stores the compass error; Freeze and Save picture make
an augmented photo. Each launch card links to it; the main page is
unchanged. Ben tested it on his iPhone: the drawn Sun sat on the real Sun
(172 degrees, 49 up). Field of view 65 was too narrow; 70 worked and is now
the default. The SpX-35 sunlit path clears his trees from 6:36. Added
reference/topics/model-sky-view.

**Least confident about (Q1):**
- The raw iOS compass. It is not recorded whether Ben tapped Sun
  calibration before the matching screenshot. Opening Settings and reading
  "Compass correction" would show it (0.0 means no tap).
- The declination of −8 degrees. A NOAA calculator value would prove it.
- Field of view 70 for other phones. One phone, one test by eye.
- Android. Not tested on any device.

**Suggestions (Q5):** Build the two-point Sun calibration for the field of
view. Add the Moon as a night calibration target. Show a per-minute marker
for the current time during a launch, so the user can match the real plume
to the drawn path.

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
