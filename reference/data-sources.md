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

## How the fixtures are used
- The tests read the pinned fixtures and never call the network.
- Run `node scripts/fetch-reference-fixtures.js` by hand to fetch them again. Do this only when the owner asks (see AGENTS.md on change-regenerate).
