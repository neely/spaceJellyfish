# Start here: a reading tour of the knowledge base

This page is for people. It walks through our notes in the order that tells
the story, with a line on why each one is worth a look. Agents do not need
it: their way in is [INDEX.md](INDEX.md), which lists every note by the
question it answers (see [README.md](README.md)).

Each note opens with a short block of front matter: the question it
answers and its key points. If that is all you want, stop there. The body
has the detail and the sources, with dates.

## 1. What a space jellyfish is

- [The twilight phenomenon](topics/twilight-phenomenon-space-jellyfish.md).
  Sunlight catches a high rocket plume while the ground below is dark. A
  Cape launch 52 minutes before sunrise was enough to light the second-stage
  plume. People have seen it from Asheville, Cary and Virginia Beach. The
  sources disagree on how long it lasts, and none gives a firm limit on how
  far the Sun must be below the horizon.
- [Twilight and the Earth's shadow](topics/twilight-definitions-and-earth-shadow.md).
  Civil, nautical and astronomical twilight, and how high the Earth's shadow
  reaches: about 35 km straight up when the Sun is 6 degrees down, and
  about 143 km at 12 degrees. That one formula is most of why the plume
  lights up when it does.

## 2. How a Falcon 9 climbs

- [Ascent timeline](topics/falcon9-ascent-timeline.md). When the first
  stage shuts down, separates and lands, and when the second stage cuts off
  (about eight and a half minutes after liftoff).
- [Webcast telemetry](topics/falcon9-webcast-telemetry.md) and
  [2020 Starlink telemetry](topics/falcon9-starlink-2020-telemetry.md).
  Our ascent paths are read off the speed and altitude numbers on SpaceX
  webcasts, by fans who saved them. There is nothing newer than 2020.

## 3. Which way it goes, and how to find out before launch

- [Launch directions from the Cape](topics/cape-launch-azimuths-and-inclinations.md).
  The range of directions the Cape allows, why the orbit's tilt
  (inclination) fixes the direction to one of two choices, and a runbook
  for finding out which one. The best clue so far is the Coast Guard's
  launch hazard map.
- [Drone ships](topics/recovery-fleet.md). The booster lands on a barge
  hundreds of kilometres out to sea, so where the barge waits gives the
  direction away. Off the Carolinas means the launch is coming our way.

## 4. Has anyone here actually seen one?

- [Charleston sighting reports](topics/charleston-sighting-reports.md).
  Ten local reports from 2018 to 2026. Only one uses the word jellyfish
  (Folly Beach Pier, July 2026). Most say only that the rocket was seen.

## 5. Will the sky be clear?

- [Cloud forecasts for sky viewing](topics/cloud-forecasts-for-sky-viewing.md).
  We scored four forecast models against 21 months of airport reports. It
  is written to be reused by any "is it clear tonight?" project: which free
  forecasts a web page can use, which did best, and the traps (airport
  stations cannot see cloud above 12,000 ft).
- [GOES satellite cloud mask](topics/goes-clear-sky-mask.md). How to read
  the weather satellite's own cloud files, for checking a forecast over the
  ocean, where there are no airports.

## 6. How our own model works

Notes named `model-*` explain our code in plain steps, with the maths.

- [Sun and Earth geometry](topics/model-sun-and-earth-geometry.md): where
  the Sun is, and where a point is in your sky.
- [Trajectory](topics/model-trajectory.md): from a pad, a direction and an
  ascent to the rocket's position over time.
- [Visibility and the verdict](topics/model-visibility-and-verdict.md):
  sunlit or not, and how many paths make "likely".
- [Sky view](topics/model-sky-view.md): how the phone camera page lines
  up the drawn path with the real sky.

## 7. Who did this before us

- [The Space Jellyfish Predictor](topics/prior-art-jellyfish-predictor.md),
  the Florida site that inspired this one, and how our approach differs.

## Also in this folder

- [Data sources](data-sources.md): how we reach each outside service, and
  its limits.
- [Source audit](source-audit.md): every outside number the engine uses,
  when it was last checked, and what is still weak.
