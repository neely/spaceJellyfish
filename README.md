# Space Jellyfish

<p align="center">
  <img src="assets/jellyfish.png" alt="A glowing jellyfish in space with a rocket at the top of its bell" width="320">
</p>

Hyperlocal predictor and email alerts for twilight "space jellyfish" launch
visibility from Charleston, SC.

**Live:** https://jellyfish.benneely.com

## What it is
A "space jellyfish" is the glowing plume that appears when a rocket climbs
high enough to be in sunlight while the observer on the ground is still in
twilight or darkness. We aim to predict when a launch from Cape Canaveral or Kennedy
Space Center will produce that effect as seen from Charleston, SC (James
Island, ZIP 29412), which our geometry code places 466 km (290 statute miles)
from Space Launch Complex 40.

The question is therefore not only "is there a launch, and is the sky clear?"
It is a question of illumination geometry: where the rocket is, where the Sun
is, and whether the plume is lit while Charleston is dark.

This is an independent build from public data sources: the Launch Library 2
API for launches and api.weather.gov for forecasts. We take no code,
predictions, or images from other launch-visibility sites, although we have
read how they describe their methods (see `reference/`).

## Status
There is a live web page and a tested geometry engine, but there are no alerts
yet and weather is not included.
[PLAN.md](PLAN.md) holds the roadmap.

**The page.** `index.html` lists upcoming Cape Canaveral and Kennedy Space
Center launches and, for each one with a set time, shows whether a sunlit
plume is likely, the clock window in which to look, the compass direction it
moves through, how high it climbs, a chart of its path across the sky, and how
the answer changes if liftoff slips (ten-minute steps for two hours either
side). It refreshes launch times each time it is opened, at most once every 20
minutes. Launch Library 2 allows only 15 requests an hour from one address, so
the page asks from each visitor's own browser, and if that fails it shows
the last copy it has, with its date. (We tried a shared feed on Cloudflare;
Launch Library 2 rejected every request from Cloudflare's shared addresses,
so we removed it.)

**The backtest so far.** We ran the engine over the 506 Cape Canaveral and
Kennedy Space Center launches that Launch Library 2 lists from January 2017
to 2 October 2026. It rates 59 of them (11.7%) as likely or possible to show
a sunlit rocket in a dark Charleston sky, and 32 of those fall after the end
of civil twilight, when the sky is darkest. That count carries no weather and
rests on three provisional thresholds, so it is an upper bound on the chances
rather than a forecast of sightings.

We compared the engine with 12 launches that people in the Charleston area
reported seeing (local news stories and r/Charleston posts, listed in
[data/labels.json](data/labels.json)). Four of the reports show a wide
glowing plume, and the engine rates all four as likely. Of the other eight,
which say only that the rocket was seen, it rates seven as likely or
possible. It also rates none of 165 midday or late-night launches as
visible, although any rule based on the clock alone would pass that check, so
it says little about the geometry itself.

**One sighting without a sunlit plume.** An Atlas V launch on 27 April 2026
at 8:53 pm was seen and photographed from the Charleston area, and the engine
finds no sunlit part of that ascent at any screening height we tried (5, 10,
and 30 km). The photo shows a bright moving point rather than a glowing cloud,
which is what a rocket flame looks like at night, so we count it as a sighting
of the rocket and not of a jellyfish. This is consistent with the engine but
does not confirm it: only one of our four plume reports is an evening launch,
and all of our ascent profiles are Falcon 9 flights, so results for evening
launches and for other vehicles should be treated with caution.

Four plume reports are too few to call the engine validated, and we have set
five as the minimum before any alert is built.

**Our own observations.** Public reports tell us only whether a launch was
seen. Watching with the sky view from a known spot also tells us where the
rocket was and when, so each of these tests the direction, height, and
timing of the model. They are kept in
[data/observations.json](data/observations.json), with the measured points
and the engine's values for the same moments.

| Date | Launch | Where | Verdict | Seen | Height and timing | Direction |
|---|---|---|---|---|---|---|
| 2026-10-13 | SpX-35 | James Island | likely, prime | plume | within about 1 deg | 19 to 29 deg farther east than predicted at the same moment; on or just under the drawn arc; compass check pending |

<p align="center">
  <img src="assets/demo-plume-spx35.jpg" alt="A wide fan-shaped glowing rocket plume above dark trees in a twilight sky" width="520">
  <img src="assets/demo-skyview-spx35.jpg" alt="Sky view screenshot: the plume below the drawn orange path, with height lines and compass marks" width="260">
</p>
<p align="center"><em>SpX-35 from James Island, 13 October 2026. Left: the plume, photographed
with the phone camera. Right: the sky view 254 s after liftoff, facing
southeast; the rocket (the bright tip of the plume) sits just under the
predicted path, and the plume fills far more sky than the line.</em></p>

To add one: before the launch, calibrate the sky view as described below.
During it, take sky view screenshots (their time stamps give the seconds
after liftoff), and note whether you saw nothing, a moving point of light,
or a wide glowing plume. Afterwards, from the same spot in daylight, check
whether the drawn Sun sits on the real Sun before recalibrating, because that
separates a compass error from a model error. One launch is one data point,
so we read this table for patterns across several launches rather than for
any single row.

**Who this works for.** The engine computes everything for one point on
James Island, but while it is visible the rocket is 290 to 1,180 km away
(over all 506 snapshot launches), so moving the observer a
few kilometres barely changes the answer. We re-ran all 506 snapshot launches
for other places (`node scripts/observer-sensitivity.js`, ZIP centroids):

| Place | km from James Island | Same verdict (of 506) | Same verdict when James Island says likely or possible (of 59) | Typical change in peak height |
|---|---|---|---|---|
| Folly Beach | 7 | 506 | 59 | 0.7 deg |
| Downtown Charleston | 7 | 505 | 58 | 0.3 deg |
| Sullivan's Island | 12 | 505 | 59 | 0.9 deg |
| Mount Pleasant | 19 | 504 | 58 | 0.4 deg |
| Isle of Palms | 19 | 505 | 59 | 1.3 deg |
| Summerville | 40 | 503 | 57 | 4.1 deg |
| Columbia | 174 | 499 | 53 | 14.1 deg |

Anywhere from Folly Beach to Isle of Palms, the page is as good for you as it
is for James Island: the verdict differs for at most 2 of 506 launches, and
heights and directions shift by about 1 degree, less than a phone compass
error. By Summerville (40 km) the verdict still holds but heights run about 4
degrees off, and beyond roughly 50 km the page should be treated as a rough
guide only. These figures compare the model with itself; they say nothing
about how right the model is, only that the answer does not depend on which
Charleston-area neighbourhood you stand in.

**Sky view (camera).** Each launch card links to `sky.html`. It opens the
phone's back camera and draws the predicted rocket path over the live
picture, with the horizon, a line every 10 degrees of height, compass marks,
and a dot for each minute after liftoff. The solid orange line is the rocket
while it is sunlit; the glowing plume spreads far wider than that line. The
dashed blue line is the rocket before it reaches sunlight. Everything runs on
the phone and nothing is uploaded. The page uses the compass and tilt
sensors, not GPS.

The drawing depends on two settings, which each phone keeps for itself, and
both are set with the Sun:

1. **Compass correction.** The day before, stand exactly where you will
   watch, ideally when the Sun is low over the trees (for a morning launch,
   the hour after sunrise puts the Sun low in the east and southeast, close
   to the rocket's path). Point the phone at the Sun, put it in the white
   centre circle, and tap *Sun is in the circle*. The yellow ring, which
   marks where the page expects the Sun, should land on it. A low Sun is
   better than a high one because you then hold the phone upright, as you
   will at launch time.
2. **Field of view.** Lenses differ, and browsers do not report them, so the
   page cannot know how wide your camera sees. With the camera at 1x, turn
   until the Sun is near the edge of the screen. If the yellow ring sits
   farther from the centre than the Sun, raise *Field of view* in Settings;
   if it sits closer, lower it. 70 degrees worked on one iPhone. The centre
   of the screen is right whatever this value is.

Compass errors of 5 to 10 degrees are normal, and they come mostly from
metal and magnets close to the phone: cars, railings, grills, decks with
steel in them, and magnetic cases, MagSafe wallets, and car mounts.
Recalibrating the phone's own compass helps (on Android, a figure-8 motion
in a compass or maps app; on iPhone, keep Compass Calibration on under
Location Services, System Services). The correction holds only for the spot
where it was made. On one iPhone the correction was -3.4 degrees on
12 October 2026; the sky view has not been tested on Android, where it
should work in Chrome. The full instructions are also on the page itself,
on the start screen and behind the Help button.

What the engine consists of:

- **Sun position** (`engine/sun.js`): the U.S. Naval Observatory approximate
  solar coordinates algorithm. Across 12 reference cases from the USNO
  celestial navigation API, our values agree within 0.007 degrees, against a
  stated algorithm accuracy of about 1 arcminute (0.017 degrees). The
  reference cases cover daytime and twilight only (Sun altitude down to
  -11.2 degrees), so agreement deeper into the night is untested.
- **Earth geometry** (`engine/geo.js`): geodetic to Earth-fixed coordinates
  and the elevation, bearing, and range from the observer to a point. Across
  4 reference conversions from the NOAA NGS coordinate tool, our values agree
  within 0.4 mm. Elevations are geometric, with no correction for atmospheric
  refraction.

- **Trajectory** (`engine/trajectory.js`): the rocket's position against
  time, taken as one great circle from the pad with altitude and downrange
  distance from real Falcon 9 flights. The flight data are five 2018
  missions (two to the ISS, three to geostationary transfer orbit) from the
  public [Telemetry-Data](https://github.com/shahar603/Telemetry-Data)
  collection, whose author derived them from SpaceX webcast telemetry. The
  collection has no Starlink launch and no other vehicle, so results for
  those rest on the assumption that they climb like the 2018 missions, which
  is untested.

- **Visibility** (`engine/visibility.js`): whether the rocket is in sunlight
  (outside a cylindrical Earth shadow), whether the Sun is below the
  observer's horizon, and whether the rocket is at least 5 degrees up.
  Launch Library 2 does not give a launch direction, so for most launches we
  fly every profile on eight azimuths from 37 to 124 degrees and report a
  launch as "likely" when all of them are visible and "possible" when only
  some are. The thresholds are in `config/visibility.json`, each with its
  source or marked provisional.

## Structure
- `index.html`, `app.js`, `style.css`: the page. It has no build step; the
  repo root is the site.
- `sky.html`, `sky.js`, `sky.css`: the camera sky view. `lib/skyproject.js`
  holds its projection math and `config/skyview.json` its defaults.
- `lib/`: code shared by the page and the scripts.
- `engine/`: the geometry engine. Pure ES modules with no DOM, no network
  access, and no dependencies, so that the same code can run in the page and
  in a Cloudflare Worker.
- `config/`: reviewed, versioned inputs. `observer.json` is the observer
  point; `profiles.json` holds the ascent profiles; `visibility.json` holds
  the thresholds and azimuths.
- `test/`: tests for the engine, and `test/fixtures/` with the pinned
  reference values they compare against.
- `data/`: pinned data. `ll2-snapshot.json` holds the 506 Cape Canaveral and
  Kennedy Space Center launches that Launch Library 2 listed from January
  2017 to 2 October 2026; `labels.json` holds the reported sightings. The
  backtest reads these files and nothing else. `observations.json` holds our
  own measured sightings. `upcoming-fallback.json` is a
  saved copy of upcoming launches that the page shows only when every live
  source fails.
- `scripts/`: one-off tools. `fetch-reference-fixtures.js` regenerates the
  fixtures from USNO and NOAA NGS; `build-profiles.js` regenerates the ascent
  profiles; `snapshot-ll2.js` regenerates the launch snapshot; `backtest.js`
  runs the engine over the snapshot and the labels;
  `observer-sensitivity.js` re-runs it for other Charleston-area places;
  `serve.js` serves the page locally.
- `reference/`: our knowledge base of outside sources, so that each value in
  the engine can be traced to where it came from. Each note opens with a
  short statement of what it answers; `INDEX.md` lists them all, and
  `README.md` explains how to read and extend it.
- `assets/`: images. `demo-*.jpg` are the SpX-35 photo and sky view
  screenshot shown above. `jellyfish.png` is the project art (1024 x 1024), also
  the source for a future app icon.
- `AGENTS.md`, `PLAN.md`, `FINDINGS.md`, `JOURNAL.md`, `CLAUDE.md`: the
  project context files, from the
  [Solo Agent Context Kit](https://github.com/neely/agent-context-project-template).

## Running / developing
The engine needs Node.js 22 or later and has no dependencies to install.

```bash
npm test
```

```bash
node scripts/backtest.js --list
```

To see the page locally, start the small server and open
http://127.0.0.1:8765:

```bash
npm run dev
```

The tests read only the pinned fixtures and never call the network. The
stack is flat-file JavaScript with no frameworks, intended for Cloudflare
Pages and Workers.

## License
Copyright (c) 2026 Ben Neely. Released under the
[PolyForm Noncommercial License 1.0.0](LICENSE.md): free to use, change, and
share for noncommercial purposes.
