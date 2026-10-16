# Changelog

What changed on the live page at https://jellyfish.benneely.com, newest
first. The version is set in `package.json`; the page footer shows it. Each
version has a git tag (`v0.4.0` and so on). Versions before 0.4.0 were
given after the fact, one for each working session that changed the page.

We bump the middle number when the page gains a feature and the last number
for a fix. Model changes that move the backtest numbers are listed here too.

## 0.4.0 · 2026-10-15
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

## 0.3.0 · 2026-10-15
- Directions set by hand for upcoming launches that Launch Library 2 gives
  no direction for (first: Bandwagon 5).
- The low-orbit profile now includes four 2020 Starlink flights and Crew
  Demo-2. The backtest moved from 42 likely and 18 possible to 40 and 20.
- Sky view: no longer slides sideways when the phone rolls; portrait only.

## 0.2.0 · 2026-10-12
- Camera sky view (`sky.html`): the predicted path drawn over the phone
  camera, calibrated on the Sun.

## 0.1.0 · 2026-10-08
- First live page: upcoming Cape and KSC launches with a likely, possible
  or no verdict, where and when to look, a sky chart, and a liftoff slip
  table.
