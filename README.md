# Space Jellyfish

[![version](https://img.shields.io/github/package-json/v/Neely/spacejellyfish)](CHANGELOG.md)

<p align="center">
  <img src="assets/jellyfish.png" alt="A glowing jellyfish in space with a rocket at the top of its bell" width="320">
</p>

Hyperlocal predictor for twilight "space jellyfish" launch visibility from
Charleston, SC.

**Live:** https://jellyfish.benneely.com · [What changed](CHANGELOG.md)

## What it is
A "space jellyfish" is the glowing plume you see when a rocket climbs into
sunlight while the ground below is still in twilight or dark. The page
predicts when a launch from Cape Canaveral or Kennedy Space Center will show
one from Charleston (James Island, ZIP 29412), 290 miles from the pad. So the
question is not only "is there a launch, and is the sky clear?" but where
the rocket is, where the Sun is, and whether the plume is lit while we are
dark.

We built it from public data (Launch Library 2 for launches, NOAA forecasts
through Open-Meteo for clouds) and took no code, predictions or images from
other launch-visibility sites. The page works today; email alerts are not
built yet.

## On launch morning
The links we actually use, in the order we use them.

**Is it still on?** The page is the first stop. The news sources are for
the last hours, when Launch Library 2 can lag a scrub or a delay, and for
reading more about the launch.
- [The page](https://jellyfish.benneely.com): any Cape or KSC launch, from
  Launch Library 2, refreshed at most every 20 minutes.
- [Spaceflight Now](https://spaceflightnow.com/launch-schedule/): launch
  schedule, launch-day reports and live coverage for most Cape launches,
  any company.
- The launch provider's own page, for example
  [SpaceX launches](https://www.spacex.com/launches/) (SpaceX only). Official,
  but it is not always the first to change.

**Which way will it go?** Northeast climbs two to three times higher in our
sky than southeast.
- [NAVCEN chart viewer](https://navcen.uscg.gov/chart): Coast Guard launch
  hazard areas, any provider, often posted days ahead. A box off the
  Carolinas means northeast; one near the Bahamas means southeast.
- [orbitalradar live fleet map](https://orbitalradar.com/recovery-fleet):
  SpaceX only, and only when the booster lands on a drone ship. Where the
  ship waits gives the same answer, but it may not sail until the day
  before.
- Step by step:
  [the runbook](reference/topics/cape-launch-azimuths-and-inclinations.md)
  (section "Runbook"). What we set lives in
  [config/launch-directions.json](config/launch-directions.json).

**Watching.** Calibrate the [sky view](#sky-view) the day before, from the
spot you will stand. During the launch, take sky view screenshots and note
whether you saw nothing, a moving point, or a wide plume (see
[Our own observations](#our-own-observations)).

## Reading a launch card

The card keeps to what you need outside. The explanations are here, and each
note on the card links back to the part it shortens.

**The verdict.** *Likely* means every past Falcon 9 flight we fly on this
launch's path has a sunlit rocket in a dark sky, at least 5 degrees up and
for at least a minute (both values are our choice, with no source yet).
*Possible* means only some do. *No jellyfish* means none do; at night the
rocket may still show as a moving point of light. *Prime: dark sky* means
the Sun is at least 6 degrees below the horizon at the peak, so the sky is
dark enough for the plume to stand out. *Confidence* is medium when the path
is one known direction and the vehicle is a Falcon 9, and low otherwise.
Clouds never change the verdict; the geometry does.

**The facts.** *Look between* is the clock window when some path is lit and
visible. *Highest point* is how high it climbs, in degrees above the horizon
(a fist at arm's length is roughly 10 degrees). *Direction* is where it
starts, peaks and ends, or the range of directions when the path is not
known. *Sun below horizon* is how dark the sky is: about 6 degrees is the
end of civil twilight, 12 the end of nautical twilight.

**Clouds.** Cloud over you, cloud at places toward the launch, low cloud
from HRRR within about a day and a half, and the Charleston Executive
airport forecast within about a day. Why the places stop where they do is
under [Clouds](#clouds), below. The one-line note says how often forecasts
that far ahead caught cloudy twilight hours, and how much of that skill held
over the water.

### The chart
The chart is the view when you face southeast: east is on the left, south on
the right, and height runs up the side. Each line is one past Falcon 9 flight
flown on this launch's path, so the spread of lines is the spread between
real ascents. The orange part is the rocket in sunlight while your sky is
dark: that is where the jellyfish shows. The dotted part is before the
plume is counted or after the rocket leaves sunlight. Our flight data stops
at second-stage cutoff, about 8 to 9 minutes after liftoff, so the rocket
may stay visible a little longer than the lines. The tree slider shades the
sky below your treeline (the setting stays in your browser), and the sky
view link draws the same path over your phone camera.

When only the orbit is known, the chart shows both ways to reach it:
northeast (the higher arcs, over the southeast sky) and southeast (the low
arcs in the south). When nothing is known, it shows a fan of possible paths.
When we have found the path ourselves, the card says **Path:** with a
one-line reason, a link to the source, and a link to the full record.

### If liftoff moves
Each box is a possible liftoff time, ten minutes apart, two hours either
side of the plan. It is not a time to look. Orange is likely, blue is
possible, dark is no jellyfish. Outside the orange and blue run, the sky
is either too dark for the rocket to reach sunlight while we can see it,
or too bright to see it. Launches slip often, so if the time changes,
reopen the page for the new viewing window.

## How it works

**Launch times.** Each visitor's browser asks Launch Library 2 directly,
because it allows only 15 requests an hour from one address and refused
Cloudflare's shared addresses. If that fails, the page uses the last answer
the browser saved, then a copy in the repo
([data/upcoming-fallback.json](data/upcoming-fallback.json)) that a GitHub
Action refreshes each morning. Either copy is marked with its date.

**The geometry.** For each launch the engine (`engine/`, plain JavaScript,
no dependencies) works out:
- **Where the Sun is**, with the U.S. Naval Observatory approximate
  algorithm. It agrees with 12 USNO reference cases within 0.007 degrees,
  tested down to a Sun 11 degrees below the horizon.
- **Where the rocket is**, flying real Falcon 9 ascents (altitude and
  downrange distance read off SpaceX webcasts: five 2018 flights and five
  2020 flights) along a great circle from the pad. We fly every flight
  rather than an average, so the page shows the spread. Nothing is newer
  than 2020 and nothing is a vehicle other than Falcon 9, so results for
  Vulcan, Atlas V or New Glenn assume they climb like a Falcon 9. Through
  October 2026, when we built this, Falcon 9 flew most Florida launches.
  Other rockets are a growing share, so we plan to gather ascent data for
  each one as it becomes a jellyfish chance.
- **Whether you can see it lit**: the rocket outside the Earth's shadow, the
  Sun below your horizon, and the rocket at least 5 degrees up. Heights are
  geometric, with no correction for refraction. The thresholds are in
  [config/visibility.json](config/visibility.json), each with a source or
  marked provisional.

**Flight directions.** Launch Library 2 gives none. The page knows space
station flights go northeast and high orbits go due east. For anything else
it draws a fan from 37 to 124 degrees, unless we have set the direction by
hand from the hazard areas or the drone ship (see
[On launch morning](#on-launch-morning)).

**Clouds.** Within about 7 days of a launch, each card shows the forecast
cloud cover over you and at places along your line of sight toward the top
of the rocket's arc. Only the top 20% of the arc counts (down to 80% of the
peak height), because that is where you will be looking. The places stop
where your sight line climbs above 39,000 ft, our assumed cloud top: past
that point, any cloud is below the line and cannot block the view, however
far away the rocket is. The calculation includes the Earth's curve, which
lifts the sight line clear a little sooner than on flat ground. A low
launch reaches farther out: about 41 miles at 10 degrees up, 54 miles at
7.4 degrees and 76 miles at 5 degrees. The cloud top, the
spacing of the places and the 20% are our choices, not values from a
source; real clouds lower than 39,000 ft would shorten the reach.

The forecast is NOAA's National Blend of Models (NBM), plus HRRR low cloud
inside a day and a half and the Charleston Executive airport forecast (TAF)
inside a day. We chose NBM by scoring four models against 21 months of
airport reports and against the GOES weather satellite over the ocean; the
results are under [How we got here](#how-we-got-here).

<a id="sky-view"></a>**Sky view.** Each card links to `sky.html`, which
draws the predicted path over your phone's live camera: horizon, a line
every 10 degrees of height, compass marks and a dot for each minute after
liftoff. Solid orange is the rocket in sunlight; the plume spreads far wider
than the line. Dashed blue is the rocket before it reaches sunlight. It runs
on the phone, uploads nothing, uses the compass and tilt sensors (not GPS),
and works only in portrait. It has been tested on iPhone, not Android.

Calibrate it with the Sun, the day before, from the spot you will watch:
1. **Compass correction.** Point the phone at the Sun, put it in the white
   circle, and tap *Sun is in the circle*. A low Sun is best (the hour
   after sunrise, for a morning launch), because you then hold the phone
   upright as you will at launch time.
2. **Field of view.** With the camera at 1x, turn until the Sun is near the
   screen edge. If the yellow ring sits farther from the centre than the
   Sun, raise *Field of view* in Settings; if closer, lower it. 70 degrees
   worked on one iPhone.

Compass errors of 5 to 10 degrees are normal, mostly from metal and magnets
nearby (cars, railings, grills, MagSafe cases). The correction holds only
for the spot where you made it. Full instructions are on the page, behind
the Help button.

## How well it works

**The backtest.** Over the 507 Cape and KSC launches Launch Library 2 lists
from January 2017 to 13 October 2026, the engine rates 60 (11.8%) as likely
or possible, 33 of them after the end of civil twilight. That count has no
weather in it and rests on provisional thresholds, so it is an upper bound,
not a forecast. It also overstates the future: 35 of the 60 were Falcon 9
Starlink flights, and SpaceX has said those no longer fly from Florida.

**Against what people saw.** We collected 13 launches people in the
Charleston area reported seeing ([data/labels.json](data/labels.json)). Of
the five that show a wide glowing plume, the engine rates four likely and
one possible. Of the eight that say only that the rocket was seen, it rates
seven likely or possible. Five plume reports was our bar before building
alerts; it is met, but five is a small number, so treat it as a minimum,
not a proof.

<a id="our-own-observations"></a>**Our own observations.** Watching with
the sky view from a known spot tests direction, height and timing, not just
"seen or not". Each one goes in
[data/observations.json](data/observations.json) with the engine's values
for the same moments.

| Date | Launch | Where | Verdict | Seen | Height and timing | Direction |
|---|---|---|---|---|---|---|
| 2026-10-13 | SpX-35 | James Island | likely, prime | plume | within about 1 deg | 19 to 29 deg farther east than predicted; the compass checked out, so the ascent model is the likely cause |

<p align="center">
  <img src="assets/demo-plume-spx35.jpg" alt="A wide fan-shaped glowing rocket plume above dark trees in a twilight sky" width="520">
  <img src="assets/demo-skyview-spx35.jpg" alt="Sky view screenshot: the plume below the drawn orange path, with height lines and compass marks" width="260">
</p>
<p align="center"><em>SpX-35 from James Island, 13 October 2026. Left: the
plume. Right: the sky view 254 s after liftoff, facing southeast; the rocket
sits just under the predicted path.</em></p>

After a launch, check from the same spot in daylight whether the drawn Sun
sits on the real Sun before you recalibrate. That separates a compass error
from a model error. One launch is one data point; we look for patterns
across several.

**Who this works for.** While visible, the rocket is 180 to 730 miles away,
so moving a few miles barely matters. Re-running all 507 launches for
other places (`node scripts/observer-sensitivity.js`):

| Place | Miles from James Island | Same verdict (of 507) | Same verdict when James Island says likely or possible (of 60) | Typical change in peak height |
|---|---|---|---|---|
| Folly Beach | 4 | 507 | 60 | 0.6 deg |
| Downtown Charleston | 4 | 507 | 60 | 0.2 deg |
| Johns Island | 8 | 507 | 60 | 1.1 deg |
| Sullivan's Island | 8 | 506 | 60 | 0.9 deg |
| Mount Pleasant | 9 | 506 | 60 | 0.3 deg |
| Isle of Palms | 14 | 506 | 60 | 1.3 deg |
| Summerville | 27 | 506 | 60 | 4.6 deg |
| Columbia | 107 | 503 | 57 | 14.0 deg |

From Folly Beach to Isle of Palms the page is as good as it is for James
Island. Past about 30 miles, treat it as a rough guide. This compares the
model with itself, so it says nothing about how right the model is.

## How we got here
The short version of what we tried. The reasons, and what we rejected, are
in [FINDINGS.md](FINDINGS.md); the session history is in
[JOURNAL.md](JOURNAL.md).

- **Cloud forecast.** We scored ECMWF, GFS, NBM and HRRR against 21 months
  of hourly reports from 11 coastal airports, Wilmington to Jacksonville.
  NBM was best at every lead from 1 to 7 days; HRRR was best for low cloud
  at short range. At twilight, NBM's skill (hit rate minus false-alarm
  rate) fell from 51 at 1 day to 26 at 7 days. Because the plume is seen
  over the ocean, we also scored NBM against the GOES satellite: one day
  ahead it kept about 93% of its land skill offshore. Full report:
  [clouds/README.md](clouds/README.md).
- **Launch feed.** A shared feed on Cloudflare was tried and removed;
  Launch Library 2 refused its shared addresses. An hourly GitHub Action
  was rejected for filling the history; a daily one that commits only on a
  change replaced hand refreshes.
- **Ascent data.** We started with five 2018 Falcon 9 webcast flights and
  added five 2020 flights after SpX-35 came in east of the prediction. The
  2020 Starlink ascents cut that miss to 6 to 14 degrees.
- **Directions by hand.** The Coast Guard hazard areas and the drone ship
  turned out to give a launch's direction days or hours ahead, which
  Launch Library 2 does not.

Our notes on every outside source start at
[reference/START-HERE.md](reference/START-HERE.md).

## What could come next
Ascent data for rockets other than Falcon 9 (Vulcan first: 8 of the next
30 Florida launches), then better guesses for launches with no known path,
then email alerts. All are in [PLAN.md](PLAN.md). More of our own
observations would help most: each one checks the model in a way public
reports cannot.

## Sources worth a look

Everything the engine uses traces back to a public source. The full audit,
with dates and known problems, is
[reference/source-audit.md](reference/source-audit.md).

| Source | What we use it for | Our note |
|---|---|---|
| [Launch Library 2](https://thespacedevs.com/llapi) | Launch times, pads and orbits, live on the page and pinned for the backtest | [data-sources](reference/data-sources.md) |
| [Telemetry-Data](https://github.com/shahar603/Telemetry-Data) and [SpaceXTelemetry-Api](https://github.com/R4yGM/SpaceXTelemetry-Api) | Altitude and speed read off SpaceX webcasts (2018 and 2020 flights), turned into ascent profiles | [2018 data](reference/topics/falcon9-webcast-telemetry.md), [2020 data](reference/topics/falcon9-starlink-2020-telemetry.md) |
| [USNO Sun position](https://aa.usno.navy.mil/faq/sun_approx) and [sidereal time](https://aa.usno.navy.mil/faq/GAST) | Where the Sun is, to about 1 arcminute | [usno-sun-and-sidereal-time](reference/usno-sun-and-sidereal-time.md) |
| [NOAA NGS coordinate tool](https://geodesy.noaa.gov/api/ncat/llh) and the World Magnetic Model (WMM-2025) | Test values for the Earth geometry; the compass correction in the sky view | [model-sun-and-earth-geometry](reference/topics/model-sun-and-earth-geometry.md) |
| Coast Guard launch hazard areas ([NAVCEN chart viewer](https://navcen.uscg.gov/chart)) | Which way a launch will go, days ahead | [cape-launch-azimuths-and-inclinations](reference/topics/cape-launch-azimuths-and-inclinations.md) |
| SpaceX drone ship *A Shortfall of Gravitas* ([orbitalradar live fleet map](https://orbitalradar.com/recovery-fleet)) | Where it waits tells us which way a launch will go | [recovery-fleet](reference/topics/recovery-fleet.md) |
| Cape launch corridors ([CSIS, *Spaceports of the World*](https://www.researchgate.net/figure/Azimuth-Limitations-at-Cape-Canaveral-and-Vandenberg-Launches-from-Cape-Canaveral-and_fig2_332211453); [Spaceflight Now](https://spaceflightnow.com/) launch reports) | The range of directions a Cape launch can fly | [cape-launch-azimuths-and-inclinations](reference/topics/cape-launch-azimuths-and-inclinations.md) |
| [NASA APOD, "Launch Plume: SpaceX Jellyfish"](https://apod.nasa.gov/apod/ap260319.html) | What the jellyfish is and when it happens | [twilight-phenomenon-space-jellyfish](reference/topics/twilight-phenomenon-space-jellyfish.md) |
| Local news and r/Charleston posts | Which past launches people here actually saw | [charleston-sighting-reports](reference/topics/charleston-sighting-reports.md) |
| [Space Jellyfish Predictor](https://jellyfish.johnkrausphotos.com/) | The Florida tool that inspired this one; we compared notes but took no code or data | [prior-art-jellyfish-predictor](reference/topics/prior-art-jellyfish-predictor.md) |

## Structure
The repo root is the site, with no build step.
- `index.html`, `app.js`, `style.css`: the page. `sky.html`, `sky.js`,
  `sky.css`: the camera sky view.
- `engine/`: the geometry engine. No DOM, network or dependencies, so the
  same code can run in the page and in a Cloudflare Worker.
- `lib/`: code shared by the page and the scripts.
- `config/`: reviewed inputs, each value with its source: observer point,
  ascent profiles, thresholds, cloud settings, and directions set by hand.
- `data/`: pinned data. The launch snapshot and the sighting labels are the
  only inputs to the backtest, and we refresh them on purpose, never as a
  side effect. Also our observations, the fallback launch list and the
  satellite extract.
- `clouds/`: the cloud forecast study and its generated results.
- `scripts/`: the backtest, data fetches and refreshes; each script says
  what it does in its first lines.
- `test/`: engine tests against pinned reference values.
- `reference/`: our notes on outside sources, so every value can be traced.
- `.github/workflows/`: the daily fallback refresh.
- `package.json` holds the version shown in the footer; `CHANGELOG.md` says
  what changed.
- `AGENTS.md`, `PLAN.md`, `FINDINGS.md`, `JOURNAL.md`, `CLAUDE.md`: the
  project context files, from the
  [Solo Agent Context Kit](https://github.com/neely/agent-context-project-template).

## Running / developing
Node.js 22 or later. The engine has no dependencies; only the GOES satellite
scripts need `npm install` (h5wasm).

```bash
npm test                         # pinned fixtures only, no network
node scripts/backtest.js --list  # run the engine over the snapshot
npm run dev                      # serve the page at http://127.0.0.1:8765
```

## License
Copyright (c) 2026 Ben Neely. Released under the
[PolyForm Noncommercial License 1.0.0](LICENSE.md): free to use, change, and
share for noncommercial purposes.
