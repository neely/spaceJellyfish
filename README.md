# Space Jellyfish

<p align="center">
  <img src="assets/jellyfish.png" alt="A glowing jellyfish in space with a rocket at the top of its bell" width="320">
</p>

Hyperlocal predictor and email alerts for twilight "space jellyfish" launch
visibility from Charleston, SC.

**Live:** TBD (will be a subdomain of benneely.com, served by Cloudflare)

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
API for launches and api.weather.gov for forecasts. We do not scrape other
launch-visibility sites.

## Status
The geometry engine runs and has had a first backtest, but nothing is live:
there is no web page and no alert yet, and weather is not included.
[PLAN.md](PLAN.md) holds the roadmap.

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
  backtest reads these files and nothing else.
- `scripts/`: one-off tools. `fetch-reference-fixtures.js` regenerates the
  fixtures from USNO and NOAA NGS; `build-profiles.js` regenerates the ascent
  profiles; `snapshot-ll2.js` regenerates the launch snapshot; `backtest.js`
  runs the engine over the snapshot and the labels.
- `reference/`: our knowledge base of outside sources, so that each value in
  the engine can be traced to where it came from. Each note opens with a
  short statement of what it answers; `INDEX.md` lists them all, and
  `README.md` explains how to read and extend it.
- `assets/`: images. `jellyfish.png` is the project art (1024 x 1024), also
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

The tests read only the pinned fixtures and never call the network. The
stack is flat-file JavaScript with no frameworks, intended for Cloudflare
Pages and Workers.

## License
Copyright (c) 2026 Ben Neely. Released under the
[PolyForm Noncommercial License 1.0.0](LICENSE.md): free to use, change, and
share for noncommercial purposes.
