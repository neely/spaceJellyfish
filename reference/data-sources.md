---
key: data-sources
title: "External data sources: how to reach each provider"
type: data-access
sources_summary: "Provider pages and live requests (Launch Library 2, Cloudflare Workers limits, USNO celestial navigation API, NOAA NGS NCAT API, NWS api.weather.gov) taken from FINDINGS.md Reference, scripts/fetch-reference-fixtures.js, the NWS API documentation page and browser requests on 2026-10-15; each fact carries its check date"
distilled: 2026-10-08
topics: [data-access, launch-data, cloudflare, sun-position, geodesy, weather]
relevance: high
answers: "Where does each external input come from (Launch Library 2, Cloudflare Workers limits, USNO, NOAA NGS, NWS api.weather.gov) and how is it reached? Gives URLs, rate limits, CORS behavior and known gaps."
key_points:
  - "Launch Library 2 allows up to 15 non-authenticated requests per hour; /launches/upcoming/ returned access-control-allow-origin: *."
  - "location__ids=12 is Cape Canaveral SFS and 27 is Kennedy Space Center. LL2 answers 429 to Cloudflare addresses."
  - "Orbit data on upcoming launches can be only the abbreviation LEO (3 of 3 checked)."
  - "Workers Free: 10 ms CPU per request or Cron Trigger run, 5 Cron Triggers per account, 50 subrequests per run, 100,000 requests per day."
  - "USNO celnav API returns no Sun entry when the Sun is far below the horizon; the fixture's lowest Sun altitude is -11.2 degrees."
  - "api.weather.gov: CORS works from our page; skyCover is percent over ISO intervals, about 7 days; grid covers 59 km offshore, not 107 km."
related_papers: []
---

# External data sources

Access facts about outside providers. Each fact has the date it was checked. Provider behavior can change. Check again before you depend on a fact.

Our own measurements and tripwires are in FINDINGS.md. They are not repeated here, except where they define a source.

Source of this note: the Reference section of FINDINGS.md and the header comments and URLs in scripts/fetch-reference-fixtures.js. All entries were checked on 2026-10-08.

## Launch Library 2 (LL2)

### Access (checked 2026-10-08)
- Base URL: `https://ll.thespacedevs.com/2.3.0/`.
- Rate limit: https://thespacedevs.com/llapi says "up to 15 non-authenticated requests per hour".
- CORS: a request to `/launches/upcoming/` with an `Origin` header returned `access-control-allow-origin: *`. A browser page can call LL2 directly.

### Filters and fields (checked 2026-10-08)
- `location__ids=12` is "Cape Canaveral SFS, FL, USA". `location__ids=27` is "Kennedy Space Center, FL, USA".
- `limit=100` is accepted. `/launches/previous/` with `net__gte` and `ordering=net` pages through history; `next` gives the next page.
- `https://ll.thespacedevs.com/2.3.0/api-throttle/` reports the limit, the current use, the seconds to the next free request, and the address that LL2 counts. The limit is counted for each address.
- LL2 answered 429 to 4 of 4 requests from a Cloudflare Pages Function on 2026-10-08. Cloudflare sends requests from addresses that many customers share. Do not ask LL2 from Cloudflare without a token.
- `https://lldev.thespacedevs.com/2.3.0/` answers 200. Its record for SpX-35 had `last_updated` 2026-10-03 when read on 2026-10-08. It may be a stale copy.
- A record carries `program` (a list with names such as "International Space Station") and `net_precision` (a name such as "Second" or "Month").
- A launch record in `mode=detailed` carries `id`, `net`, `net_precision`, `window_start`, `window_end`, `status`, `mission.orbit`, `flightclub_url`, and `pad` with `latitude` and `longitude`.
- Orbit data on an upcoming launch can be as thin as the abbreviation "LEO". Three upcoming launches were checked and all three showed only "LEO".

## Cloudflare Workers limits

Source: https://developers.cloudflare.com/workers/platform/limits/

### Workers Free and Workers Paid (checked 2026-10-08)
- Workers Free: 10 ms CPU for each HTTP request and each Cron Trigger run. 5 Cron Triggers for each account. 50 subrequests for each run. 100,000 requests each day.
- Workers Paid: 30 s CPU for a Cron Trigger with an interval below 1 hour.
- Workers KV free-tier limits are not in this note. PLAN.md has the task to check them.

## USNO celestial navigation API

### Endpoint (checked 2026-10-08)
- URL: `https://aa.usno.navy.mil/api/celnav` with `date`, `time`, and `coords`.
- It returns the Sun GHA, declination, computed altitude `hc`, and azimuth `zn`.
- The script scripts/fetch-reference-fixtures.js reads the Sun entry of `properties.data` and takes `gha`, `dec`, `hc` and `zn` from its `almanac_data`. It writes test/fixtures/usno-celnav-sun.json.

### Known gap (checked 2026-10-08)
- The API returns no Sun entry when the Sun is far below the horizon. The fixture holds only daytime and twilight cases. The lowest Sun altitude in the fixture is -11.2 degrees.
- The script stops with an error if a case has no Sun entry.

## NOAA NGS NCAT API

### Endpoint (checked 2026-10-08)
- URL: `https://geodesy.noaa.gov/api/ncat/llh`. It returns ECEF `x`, `y`, `z` for a latitude, longitude, and ellipsoid height.
- The script scripts/fetch-reference-fixtures.js sends `lat`, `lon`, `eht`, `inDatum=nad83(2011)` and `outDatum=nad83(2011)`. It writes test/fixtures/ngs-ecef.json. The fixture records the source as NAD83(2011), GRS 80 ellipsoid.

## NWS API (api.weather.gov)

### Documentation (read 2026-10-15)
Source: https://www.weather.gov/documentation/services-web-api
- "A User Agent is required to identify your application." The page says an API key will replace it in the future.
- The rate limit "is not public information". A request over the limit returns an error and can be tried again later. The page says proxies are more likely to reach the limit than direct client requests.
- Use `/points/{lat},{lon}` to get the grid forecast URL. The office and the grid x and y for a point can change, so check `/points` again from time to time.
- `forecastGridData` is "raw forecast data over the next seven days".
- The page does not mention CORS and does not name `skyCover`.

### Live requests (2026-10-15, about 01:48 UTC, from a page at https://jellyfish.benneely.com in a desktop browser)
- CORS: the page read the JSON body of `/points` and of the grid forecast. A browser page can call the API directly. The browser sent its own User-Agent; a page cannot set one.
- The observer point in config/observer.json (32.718, -79.9537) maps to grid `CHS/86,74`. Time zone America/New_York.
- The grid forecast has `skyCover` in `wmoUnit:percent`. Each value has an ISO 8601 interval, for example `2026-10-15T19:00:00+00:00/PT3H`. Interval lengths seen: PT1H, PT3H, PT6H. 84 values, `validTimes` 2026-10-15T18:00Z/P7DT7H.
- Other cloud-related layers present: `ceilingHeight`, `visibility`, `lowVisibilityOccurrenceRiskIndex`. No layer split by cloud height was found by name.
- Cache headers: `/points` max-age 86400 s; grid forecast max-age 3600 s.
- Coverage offshore (bearings 134 to 141 degrees from the observer): points 27 km and 59 km out returned a grid (CHS/95,67 and CHS/105,60). Points 107 km and 174 km out returned status 200 with no grid id. A point 58 km out on bearing 184 (32.2, -80.0) returned CHS/87,51. The edge of the grid offshore was not found exactly; it is between 59 and 107 km on bearing 134 to 138. Other bearings were not tested.

## Other cloud sources (tested 2026-10-16, about 10:20 UTC, from a page at https://jellyfish.benneely.com)

### Open-Meteo
Docs: https://open-meteo.com/en/docs and https://open-meteo.com/en/terms (read 2026-10-15).
- Hourly `cloud_cover`, `cloud_cover_low` ("up to 3 km altitude"), `cloud_cover_mid` ("from 3 to 8 km") and `cloud_cover_high` ("from 8 km"). No cloud base or ceiling variable is listed.
- Terms: free for non-commercial use only, "Less than 10'000 API calls per day, 5'000 per hour and 600 per minute". Data under CC BY 4.0.
- Live: the page read the JSON body, so CORS works. One request with five comma-separated places returned five answers. 168 hourly values (7 days, from 00:00 UTC today). `cell_selection=sea` was used.
- Offshore: answers came back for points 107 km and 174 km out on bearing 138 and 141, where the NWS grid gives none.
- The model behind the default answer was not checked.

### Conflict: NWS and Open-Meteo for 2026-10-19 10:00 and 11:00 UTC (Bandwagon 5 window)
- Observer: NWS skyCover 24 and 22 percent; Open-Meteo total 0 and 0.
- 27 km out (bearing 134): NWS 39 and 36; Open-Meteo 0 and 0.
- 59 km out (bearing 134): NWS 61 and 56; Open-Meteo 100 and 100, all of it low cloud.
- One forecast, read about 3 days ahead. It shows the two sources can disagree a lot. It does not show which is right.

### NWS ceilingHeight
- In the same grid response as skyCover, unit m. On 2026-10-16 it held one value, null, for 28 hours. Not useful on that day.

### Observations and past forecasts for scoring (tested 2026-10-16, from the page)
- NWS `/stations/{id}/observations` works from the page and holds about 7 days of airport reports, with `cloudLayers` (amount and base in m). Automatic stations report CLR when they see no cloud; they do not see cloud above a limit that was not checked from a source.
- NWS `/stations/{id}/tafs` works from the page (CORS), unlike aviationweather.gov. It lists 33 TAFs for KCHS. Each TAF comes as IWXXM XML (`application/vnd.wmo.iwxxm+xml`).
- Iowa Environmental Mesonet ASOS archive (`mesonet.agron.iastate.edu/cgi-bin/request/asos.py`) works from the page: CSV with sky cover and base for each layer, back to at least 2024-01-01 for CHS.
- Open-Meteo Previous Model Runs API (`previous-runs-api.open-meteo.com`, docs https://open-meteo.com/en/docs/previous-runs-api): `cloud_cover_previous_dayN` is the forecast made N days before. Low, mid and high cloud are not available there (no values came back). Probe of single days at CHS: ECMWF IFS 0.25 and GFS have day 1 and day 3 from 2024-03-01; NBM from 2025-01-01 (none on 2024-10-01); HRRR day 1 only. 2024-01-01 had no values for any model.
- LAMP text bulletins (lamp.mdl.nws.noaa.gov): the page fetch failed. A page cannot use them.

### Aviation Weather Center (TAF)
- Docs: https://aviationweather.gov/data/api/ says "Cross-origin resource sharing is not permitted at this time." Live: the page fetch failed (TypeError: Failed to fetch). A page cannot use it.
- The KCHS TAF read on 2026-10-15 23:26 UTC covered 24 h and gave layer heights (for example FEW004).

## How the fixtures are used
- The tests read the pinned fixtures and never call the network.
- Run `node scripts/fetch-reference-fixtures.js` by hand to fetch them again. Do this only when the owner asks (see AGENTS.md on change-regenerate).

## Open-Meteo forecast ranges seen from the page (2026-10-16, 12:38 UTC)
- `ncep_nbm_conus` `cloud_cover`: 192 hourly values (8 days) at the observer and at points 27 to 174 km offshore on bearings 134 to 141.
- `gfs_hrrr` `cloud_cover_low`: values to 2026-10-18T06:00 UTC, about 42 hours ahead, at the same points.
- `cell_selection` nearest, land and sea gave the same NBM cells for the observer and a point 59 km out.
- Open-Meteo `gfs_seamless` day-1 values equal `gfs_hrrr` (Previous Model Runs API, CHS, 2025-06-01). `gfs_global` is GFS.

## NWS API TAFs (checked 2026-10-16, from the page)
- `/stations/{id}/tafs` returned TAF lists for KCHS (33), KJZI (34), KSAV (32) and KMYR (37); none for KLRO and KNBC.
- The list is newest first, one entry per issue slot (about every 6 hours), with `issueTime`, `start` and `end`. The file behind a slot can be an amendment issued later: the KCHS 05:00 slot returned a TAF amendment issued 12:46 UTC. Use the issue time inside the file.
- Each file is IWXXM 2021-2 XML (`application/vnd.wmo.iwxxm+xml`): `baseForecast` and `changeForecast` groups with `changeIndicator`, `phenomenonTime`, and cloud layers with an amount code (`.../CloudAmountReportedAtAerodrome/FEW`) and a base in `[ft_i]`.
- Change indicators in a WMO IWXXM example (old.wmo.int AvXML tutorial): FROM, BECOMING, TEMPORARY_FLUCTUATIONS. Probability indicators were not seen; lib/taf.js shows any other indicator as given.
