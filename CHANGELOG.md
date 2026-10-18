# Changelog

What changed on the live page at https://jellyfish.benneely.com, newest
first. The version is set in `package.json`; the page footer and the README
badge show it. Each heading ends with the commit that shipped the version.
Versions before 0.4.0 were given after the fact, one for each working
session that changed the page.

We bump the middle number when the page gains a feature and the last number
for a fix. Model changes that move the backtest numbers are listed here too.

## 0.7.2 · 2026-10-18 · pending
- Distances on the card are in miles and the low cloud limit in feet
  (about 10,000 ft). The engine still works in metres.

## 0.7.1 · 2026-10-18 · 3ed6a1f
- The cloud card is shorter: one sentence on how far to trust the
  forecast (onshore and offshore), then the method link and the credit.
  The "toward the launch" line is one short sentence.

## 0.7.0 · 2026-10-16 · 6351d79
- The cloud card says how the forecast does out over the water, toward the
  launch: a satellite check scored it against GOES over land and over
  water, and over water it kept about 93% of its skill one day ahead. The
  test is in `clouds/README.md`.

## 0.6.0 · 2026-10-16 · c245716
- Within about a day of a launch, the card adds the airport forecast (TAF)
  for Charleston Executive (or Charleston International): forecast cloud
  amounts and heights over the airport.
- The cloud check toward the launch now reaches as far as the sight line
  can be blocked (up to about 120 km for a low pass) instead of stopping at
  60 km. The 60 km limit came from the old NWS grid edge.

## 0.5.0 · 2026-10-16 · 83fe123
- Clouds now come from the forecast that scored best when we tested four
  against 21 months of airport reports: NOAA NBM for all cloud, plus NOAA
  HRRR low cloud within about a day and a half. The study is in
  `clouds/README.md`.
- The cloud check toward the launch loads by itself (one request instead of
  up to 38), with a row for each direction.
- Each card says how often forecasts that far ahead were right at twilight.
- Credit to Open-Meteo (CC BY 4.0) on the card and in the footer.

## 0.4.0 · 2026-10-15 · 9309d24
- Each launch card within about 7 days of liftoff shows the National
  Weather Service sky cover over the observer at viewing time.
- A button on the card checks sky cover at places between the observer and
  the top of the rocket's arc, up to 60 km out. It says how many requests
  it sends before you press it.
- The footer shows the version.
- Browsers now check every file for a new version on each visit, so an
  update reaches visitors at once instead of after up to 4 hours. (A
  `_headers` file, plus the Cloudflare zone setting Browser Cache TTL
  changed from 4 hours to Respect Existing Headers.)

## 0.3.0 · 2026-10-15 · 1ac496b
- Directions set by hand for upcoming launches that Launch Library 2 gives
  no direction for (first: Bandwagon 5).
- The low-orbit profile now includes four 2020 Starlink flights and Crew
  Demo-2. The backtest moved from 42 likely and 18 possible to 40 and 20.
- Sky view: no longer slides sideways when the phone rolls; portrait only.

## 0.2.0 · 2026-10-12 · d1fce0a
- Camera sky view (`sky.html`): the predicted path drawn over the phone
  camera, calibrated on the Sun.

## 0.1.0 · 2026-10-08 · d06855b
- First live page: upcoming Cape and KSC launches with a likely, possible
  or no verdict, where and when to look, a sky chart, and a liftoff slip
  table.
