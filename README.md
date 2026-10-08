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
twilight or darkness. We predict when a launch from Cape Canaveral or Kennedy
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
The project is at an early stage, and it does not yet predict anything. Two
of the engine's building blocks exist and are tested (described below); the
trajectory model, the visibility score, the web page, and the email alerts are
planned but not written. [PLAN.md](PLAN.md) holds the roadmap.

What works today:

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

## Structure
- `engine/`: the geometry engine. Pure ES modules with no DOM, no network
  access, and no dependencies, so that the same code can run in the page and
  in a Cloudflare Worker.
- `config/`: reviewed, versioned inputs. `observer.json` is the observer
  point.
- `test/`: tests for the engine, and `test/fixtures/` with the pinned
  reference values they compare against.
- `scripts/`: one-off tools. `fetch-reference-fixtures.js` regenerates the
  fixtures from USNO and NOAA NGS.
- `reference/`: vendored material. `usno-sun-and-sidereal-time.md` holds the
  formulas the engine implements; `handoff-brief.md` is the original project
  brief.
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

The tests read only the pinned fixtures and never call the network. The
stack is flat-file JavaScript with no frameworks, intended for Cloudflare
Pages and Workers.

## License
Copyright (c) 2026 Ben Neely. Released under the
[PolyForm Noncommercial License 1.0.0](LICENSE.md): free to use, change, and
share for noncommercial purposes.
