# Which cloud forecast to trust for a night-sky event

A small, reproducible study inside the Space Jellyfish project. We wanted
to know which free cloud forecast best predicts whether the sky over the
South Carolina and Georgia coast will be clear at twilight, and how that
skill falls off from 1 to 7 days ahead. The answer now drives the clouds
section of https://jellyfish.benneely.com. The method should carry over to
any app that asks "will I be able to see it?": satellite passes, meteor
showers, comets, eclipses.

**Short answer.** Of four models, the NOAA National Blend of Models (NBM)
scored best at every lead time from 1 to 7 days. For low cloud within about
a day, NOAA's HRRR model was much better than the rest. Skill falls steadily
with lead time, as you would expect: at twilight, NBM's skill score went
from 51 at 1 day to 26 at 7 days. Every number below comes from
[results.md](results.md), which a script writes from pinned data.

## Why we did this

The page first showed sky cover from the National Weather Service gridded
forecast (api.weather.gov). That worked, but it left three problems:

- **One number for the whole sky.** NWS `skyCover` does not split low cloud
  from thin high cloud. A rocket plume 100 km up can show through thin
  cirrus but not through a low deck, so the split matters.
- **It stops offshore.** The plume is seen low in the south and east, over
  the ocean. The NWS grid gave a forecast 59 km offshore and none at 107 km
  (tested 2026-10-15). It also needs two requests for each place, so a
  check along the line of sight took up to 38 requests.
- **No way to score it.** We found no archive of past NWS gridded
  forecasts that a browser or a short script can read, so we could not
  check how good it is.

A second source made the problem plain. For the Bandwagon 5 launch window
(2026-10-19, about 06:30 local), forecast three days out, NWS gave 56 to 61
percent cloud 59 km offshore and Open-Meteo gave 100 percent. One forecast
cannot say which is right. Scoring many past forecasts against what the sky
really did can.

## What we tried

Every source below was tested from a browser page on the live site, because
that is where the app runs. Details and quotes: `reference/data-sources.md`.

| Source | What it gives | Result |
|---|---|---|
| NWS gridded forecast, `skyCover` | Total sky cover, about 7 days, 1 to 6 hour blocks | Works from the page. Used in version 0.4.0. Replaced. |
| NWS gridded forecast, `ceilingHeight` | Cloud ceiling in metres | One null value for 28 hours on 2026-10-16. Not useful. |
| Aviation Weather Center TAF and data API | Airport forecasts with cloud layer heights | The docs say cross-origin requests are not permitted; the page fetch failed. |
| NWS API, `/stations/{id}/tafs` | The same airport forecasts (TAF) | Works from the page. IWXXM XML, about 24 to 30 hours, airports only. Second best for the last day; not used yet. |
| NOAA LAMP bulletins | Hourly ceiling and sky cover guidance for airports, to 38 hours | The page fetch failed (no cross-origin access). |
| Open-Meteo forecast API | Hourly total, low, mid and high cloud from many models | Works from the page; many places in one request; answered 174 km offshore. **Used.** |
| Open-Meteo Previous Model Runs API | What each model forecast 1 to 7 days before each hour | Total cloud only (low, mid and high came back empty). Used for the lead-time test. |
| Open-Meteo Historical Forecast API | The first hours of each model run, stitched together | Has low, mid and high cloud (not for NBM). Used for the layer test. |
| Iowa Environmental Mesonet ASOS archive | Every hourly airport report for years, with each cloud layer | Works from the page and from a script. Used as the truth. |

## Method

**Truth: airport reports.** We used the routine hourly reports (METAR) from
11 coastal airports, from Wilmington, NC to Jacksonville, FL, for
2025-01-01 to 2026-10-15. They share Charleston's sea breeze and marine
cloud. Three of them (LRO, CHS, JZI) are near Charleston. Each report lists
up to four cloud layers. We turned each layer into percent with the middle
of its range in eighths: FEW (1 to 2 eighths) is 18.75, SCT (3 to 4) is
43.75, BKN (5 to 7) is 75, OVC is 100, and clear is 0. The sky cover of an
hour is its largest layer. A report at 10:56 counts as the 11:00 hour.

**A trap: automatic stations cannot see high cloud.** ASOS reports sky
condition only up to 12,000 ft (NWS CL31 implementation plan, 2008). In our
data, 6 of the 11 stations never reported a layer above 12,000 ft and one
(HXD) did 17 times. Four (CHS, NBC, SAV, JAX) did thousands of times. So we
scored two truths:

- **Below 12,000 ft**, at all 11 stations: the part of the sky every station
  sees. This is the low and middle cloud that hides a plume most surely.
- **Full sky**, at the four stations that report above 12,000 ft.

**Forecasts.** ECMWF IFS 0.25°, NOAA GFS, NOAA NBM and NOAA HRRR, through
Open-Meteo, at each airport's coordinates. HRRR is in the archive only for
1 day ahead. "Blend" is the plain mean of ECMWF, GFS and NBM.

**Scores.** An hour is cloudy at 50 percent or more (broken or overcast).
For each model and lead time we count the share of cloudy hours it called
cloudy (hit rate) and the share of clear hours it called cloudy (false-alarm
rate). Skill is hit rate minus false-alarm rate, shown here times 100: 0 is
no better than chance, 100 is perfect. We also give the mean absolute error
(MAE) in percentage points, next to the MAE of a forecast of "clear" every
hour. **Twilight** hours are those with the Sun between 0 and 18 degrees
below the horizon at the station, the window for a lit plume over a dark
observer.

## What we found

Hours scored: 169,038 below 12,000 ft (26 percent cloudy), 62,224 full sky
(45 percent cloudy). Twilight: 22,357 and 8,219.

### 1. NBM is the best all-sky forecast at every lead time

Skill at twilight, sky below 12,000 ft, all 11 stations:

| Days ahead | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| NBM | 51 | 47 | 44 | 41 | 37 | 31 | 26 |
| Blend | 42 | 40 | 39 | 35 | 32 | 28 | 26 |
| ECMWF | 39 | 39 | 36 | 33 | 30 | 25 | 22 |
| GFS | 31 | 28 | 28 | 25 | 20 | 18 | 15 |
| HRRR | 35 | | | | | | |

NBM also had the lowest MAE at every lead in this test. Against the full
sky, at the four stations that see it, NBM and the blend were close: near
Charleston the blend had skill 56 at 1 day and NBM 53; at all four stations
over all hours, 51 and 47. Both beat a forecast of "clear" by a wide margin
there (MAE 21.6 and 22.5 against 47.2 at 1 day).

### 2. HRRR is the best low-cloud forecast at short lead

The Historical Forecast API holds the first hours of each run. Its low
cloud layer (up to 3 km in Open-Meteo's definition) against the airport sky
below 10,000 ft (3,048 m), all hours:

| Model | Skill | Hit rate | False-alarm rate |
|---|---|---|---|
| HRRR | 65 | 73 | 9 |
| GFS | 38 | 46 | 7 |
| ECMWF | 25 | 27 | 2 |

NBM has no low cloud layer there. ECMWF's low layer missed most low cloud,
although its total cloud did well. Low, mid and high are split differently
by each model, so a layer from one model is not a safe stand-in for another
without a test like this one.

### 3. Skill falls with lead time, and it falls fast for HRRR

NBM at twilight lost about half its skill from 1 day (51) to 7 days (26).
HRRR's total cloud scored 59 in its first hours but 35 one day ahead, below
NBM's 49 at the same lead (all hours).

### 4. Summer is hardest

At 1 day, sky below 12,000 ft, NBM skill was 63 in winter (December to
February), 45 in spring, 35 in summer and 52 in autumn. Summer afternoon
storms and their debris clouds are hard to place.

### 5. Most "false alarms" against the low sky were real high cloud

Against the sky below 12,000 ft, total cloud from GFS and HRRR had a worse
MAE than a forecast of "clear" every hour (38.1 and 37.2 against 29.0 at 1
day), and ECMWF was about level (28.7). We checked why. At the four full-sky
stations, 67 to 70 percent of the hours where a model called cloud and the
low sky was clear had a reported layer above 12,000 ft. The models were
mostly seeing cloud the automatic stations cannot. This is why we score
both truths and why the page shows low cloud on its own when HRRR has it.

## What the app does with this

- Within about 7 days of a launch, the page asks Open-Meteo for **NBM total
  cloud** over the observer and at places along the line of sight to the
  top of the rocket's arc (one request).
- When the launch is within HRRR's range (about 42 hours on 2026-10-16), it
  also shows **HRRR low cloud** at the same places.
- It says how far to trust the number: the NBM hit and false-alarm rates at
  twilight for that lead time, read from `results.json`.
- Cloud never changes the jellyfish verdict. Geometry decides that.

## Second best, and not pursued

- **Blend of ECMWF, GFS and NBM.** Best against the full sky near
  Charleston at 1 to 2 days, but not against the low sky, and it costs three
  requests. A fair second choice.
- **ECMWF.** Second best on the low sky at most leads. Its low layer is
  weak (finding 2).
- **TAF from the NWS API.** Real forecasters, cloud bases in feet, readable
  from a page. Only airports and only about a day. A good add-on for the
  last 24 hours.
- **Satellite truth.** Airports see only the sky over land. GOES satellite
  cloud products would let us score the offshore part of the line of sight.
  Not tried.
- **The NWS gridded forecast itself.** NCEI keeps an archive of the
  National Digital Forecast Database. Scoring it would need GRIB2 files.
  Not tried.
- **Probabilities.** Open-Meteo also offers ensemble forecasts. A "chance
  of clear sky" may serve a viewer better than one number. Not tried.
- **Does thin high cloud hide a plume?** We have no source. The page shows
  low cloud apart from total cloud so a viewer can judge.

## Limits

- 21.5 months, 11 stations. Models change versions; Open-Meteo says its
  stitched archive is not meant for long-term trends.
- Forecasts are for the model grid cell nearest each airport. ECMWF 0.25°
  cells are about 25 km across.
- Open-Meteo does not say whether hourly cloud is the value at the hour or
  a mean over it. We matched each report to the nearest whole hour.
- The truth is cloud over land airports. The plume is seen over the ocean.
- The cloudy line (50 percent), the full-sky rule (at least 1 percent of a
  station's reports name a layer above 12,000 ft) and the twilight window
  are our choices.
- One HXD report gives a cloud base of 93,600 ft, which cannot be right.
  HXD is not a full-sky station here, so its layers above 12,000 ft are not
  used.
- A few archive hours are missing (under 2 percent, the same hours at every
  station). Those hours are skipped.

## Reproduce it

Everything is pinned. Raw data: `data/clouds/raw/` (33 gzip files, 5.3 MB),
with URLs and SHA-256 checksums in `data/clouds/manifest.json`. The scorer
checks every checksum before it reads a file.

```
node scripts/score-clouds.js   # about 30 s; writes results.json and results.md
npm test                       # includes tests on real sample days
```

To fetch again (only on purpose; the numbers will move a little):
`node scripts/fetch-cloud-history.js` from a machine with normal internet
access. It makes about 2,000 of Open-Meteo's 10,000 free daily calls.
Settings: `config/cloud-stations.json`. Code: `scripts/lib/clouds.js`.

**Sources.** Iowa Environmental Mesonet ASOS archive
(mesonet.agron.iastate.edu); Open-Meteo forecast, Previous Model Runs and
Historical Forecast APIs (open-meteo.com, data CC BY 4.0, free for
non-commercial use); NWS API (api.weather.gov); NWS CL31 implementation plan
(2008) for the 12,000 ft limit; NWS TAF training, lesson 3, for cloud
amounts in eighths.
