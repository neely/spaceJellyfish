# Space Jellyfish

<p align="center">
  <img src="assets/jellyfish.png" alt="A glowing jellyfish in space with a rocket at the top of its bell" width="320">
</p>

Hyperlocal predictor and email alerts for twilight "space jellyfish" launch
visibility from Charleston, SC.

**Live:** TBD (will be a subdomain of benneely.com, served by Cloudflare)

## What it is
A "space jellyfish" is the glowing plume you see when a rocket climbs high
enough to be in sunlight while the observer on the ground is still in
twilight or darkness. This project predicts when a launch from Cape Canaveral
or Kennedy Space Center will produce that effect as seen from Charleston, SC
(James Island, 29412), about 330 to 380 miles up the coast.

The question is not only "is there a launch and is the sky clear". It is the
illumination geometry: where the rocket is, where the sun is, and whether the
plume is lit while Charleston is dark.

It is an independent build from public data sources: the Launch Library 2 API
for launches and api.weather.gov for forecasts. It does not scrape other
launch-visibility sites.

**Status:** repo setup only. There is no application code yet. See
[PLAN.md](PLAN.md) for where it is going.

## Structure
- `AGENTS.md`, `PLAN.md`, `FINDINGS.md`, `JOURNAL.md`, `CLAUDE.md`: the
  project context files, from the
  [Solo Agent Context Kit](https://github.com/neely/agent-context-project-template).
- `assets/`: images. `jellyfish.png` is the project art (1024 x 1024), also
  the source for a future app icon.
- `reference/`: vendored material. `handoff-brief.md` is the original project
  brief.

## Running / developing
Nothing to run yet. The stack will be flat-file JavaScript with no
frameworks, on Cloudflare Pages and Workers.

## License
Copyright (c) 2026 Ben Neely. Released under the
[PolyForm Noncommercial License 1.0.0](LICENSE.md): free to use, change, and
share for noncommercial purposes.
