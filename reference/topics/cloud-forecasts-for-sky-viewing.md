---
key: topics/cloud-forecasts-for-sky-viewing
title: "Cloud forecasts for sky viewing: which free sources work from a browser, and how good they are on the Southeast coast"
type: topic-note
sources_summary: "Our cloud forecast test (clouds/README.md, clouds/results.json, data pinned 2026-10-16 in data/clouds/); Open-Meteo docs (forecast, previous runs, historical forecast, pricing, terms; read 2026-10-15 and 16); IEM ASOS download page (read 2026-10-16); NWS CL31 implementation plan (2008, read 2026-10-16); NWS TAF training lesson 3 (read 2026-10-16); live requests from a page at jellyfish.benneely.com (2026-10-15 and 16)."
distilled: 2026-10-16
topics: [weather, data-access, visibility, twilight]
relevance: high
answers: "For any app that asks whether the sky will be clear (launches, satellites, meteors, comets), which free cloud forecasts can a browser page use, which scored best against airport reports from 1 to 7 days ahead, and what traps lie in the data?"
key_points:
  - "NBM total cloud scored best of ECMWF, GFS, NBM and HRRR at every lead from 1 to 7 days, 11 coastal airports, 2025-01 to 2026-10."
  - "HRRR low cloud scored best for low cloud at short lead (skill 65 against 38 for GFS and 25 for ECMWF)."
  - "Automatic airport stations report cloud only up to 12,000 ft; score against that part of the sky or against full-sky stations."
  - "Open-Meteo works from a page, takes many places in one request and reaches far offshore; NWS grid stops 59 to 107 km offshore."
  - "Aviation Weather Center API and LAMP bulletins are blocked from a page; the NWS API serves TAFs with CORS."
related_papers: []
---

# Cloud forecasts for sky viewing

This note is for reuse. It says which cloud sources a static web page can
call, how good they were on the South Carolina and Georgia coast, and the
traps we found. The full study, tables and method are in
[clouds/README.md](../../clouds/README.md). Numbers are from
`clouds/results.json` (data fetched 2026-10-16).

## Sources a browser page can use (tested 2026-10-15 and 16)

| Source | From a page | Notes |
|---|---|---|
| Open-Meteo forecast API (`api.open-meteo.com/v1/forecast`) | Yes | Many places in one request (comma lists). Hourly `cloud_cover`, `_low` (to 3 km), `_mid` (3 to 8 km), `_high` (above 8 km). NBM about 8 days, HRRR about 42 hours on 2026-10-16. Answered 174 km offshore. Free for non-commercial use; data CC BY 4.0; 10,000 calls a day; more than 10 variables or 2 weeks counts as more than one call. |
| Open-Meteo Previous Model Runs API | Yes | `cloud_cover_previous_dayN` = forecast made N days before. Low, mid and high came back empty. NBM from 2025-01-01; ECMWF and GFS from at least 2024-03-01; HRRR day 1 only. |
| Open-Meteo Historical Forecast API | Yes | First hours of each run, stitched. Low, mid and high for ECMWF, GFS, HRRR; not NBM. |
| NWS API gridded forecast (`api.weather.gov`) | Yes | `skyCover` total only, about 7 days, two requests per place, no grid past 59 to 107 km offshore. `ceilingHeight` was null on 2026-10-16. |
| NWS API TAF (`/stations/{id}/tafs`) | Yes | IWXXM XML. About 24 to 30 hours, airports only. |
| Aviation Weather Center data API | No | Docs: "Cross-origin resource sharing is not permitted at this time." |
| NOAA LAMP text bulletins | No | Page fetch failed. |
| IEM ASOS archive (`mesonet.agron.iastate.edu/cgi-bin/request/asos.py`) | Yes | Years of hourly reports with each cloud layer. Up to 1,000 station-years per request. |

## What scored best (11 coastal airports, 2025-01-01 to 2026-10-15)

- **All-sky cloud, 1 to 7 days:** NBM. Twilight skill (hit rate minus
  false-alarm rate, times 100) at 1 to 7 days: 51, 47, 44, 41, 37, 31, 26.
  The blend of ECMWF, GFS and NBM was close against the full sky.
- **Low cloud, short lead:** HRRR (skill 65). Use a model's low layer only
  after a test like this; ECMWF's low layer caught 27 percent of low cloud.
- **Seasons:** summer was hardest (NBM skill 35 at 1 day), winter easiest
  (63).

## Traps

- **ASOS sees only to 12,000 ft.** "CLR" from an automatic station means no
  cloud below 12,000 ft, not a clear sky (NWS CL31 implementation plan,
  2008). 67 to 70 percent of apparent false alarms were high cloud the
  station could not see.
- **Model names.** Open-Meteo `gfs_seamless` uses HRRR for the first day; ask
  for `gfs_global` to get GFS.
- **Rounding.** Round percentages once, from full precision. Rounding a
  stored rounded value moved some numbers by 1.
- **Cloud amounts.** FEW is 1 to 2 eighths, SCT 3 to 4, BKN 5 to 7, OVC 8
  (NWS TAF training, lesson 3).

## Ideas not tried

GOES satellite cloud as truth offshore; the NDFD archive at NCEI to score the
NWS forecast itself; Open-Meteo ensembles for a chance of clear sky; whether
thin high cloud hides a bright plume.
