# Space Jellyfish Tracker — Project Brief

Hyperlocal Charleston, SC SpaceX launch-visibility predictor + email alerts.
Scaffold with `agent-context-project-template`, then build module by module
with testing at each stage before wiring automation together.

## What this actually is

Not "is it clear and is there a launch" — it's specifically the **twilight
illumination geometry**: a rocket high enough in the ascent to still be
sunlit while the observer on the ground is in relative darkness (the
"space jellyfish" plume effect). Reference sites for the concept:
nextspaceflight.com and jellyfish.johnkrausphotos.com — this is an
independent build from public data sources, not scraping either site.

Observer point: Charleston, SC / James Island (29412) as the default —
adjust if a different exact point is wanted.

## Architecture

- **Data source**: Launch Library 2 API (thespacedevs.com), filtered to
  Cape Canaveral / KSC pads only. Free, no key.
- **Trajectory + sun-geometry engine**: a pure JS module (no DOM, no side
  effects) — takes liftoff time + a generalized ascent profile, computes
  rocket position, sun position, illumination, and elevation/bearing from
  Charleston for 10-min windows ±2hr around T-0. Imported by both the
  static page and the alert Worker — one engine, two consumers.
- **Weather**: api.weather.gov (NWS), free, no key. Secondary modifier on
  top of the geometry score, not a primary signal — forecast only firms up
  close to T-0.
- **Scheduler**: one Cloudflare Worker Cron Trigger, fixed cadence (~every
  5 min). Cheap no-op if nothing's within ~24h; runs full geometry model
  when a tracked launch gets close.
- **State**: Workers KV — "last known status" / "already alerted" per
  (launch ID, NET timestamp). Not GitHub — polling this often would spam
  commit history.
- **Alerts**: Resend, reusing the delivery pattern from `creel`.
- **Config**: pad coordinates + ascent profile curves as versioned JSON in
  the repo — low frequency, worth reviewing/diffing.
- **Stack conventions**: Cloudflare Pages/Workers + GitHub as backend,
  flat-file JS, no frameworks — matches the rest of the ecosystem.

## Known risks to design around, not discover late

1. **Trajectory guessing is the weakest link.** LL2's orbit metadata for
   an unflown mission is often sparse/TBD until close to launch. Charleston
   is far enough away (~330–380 mi) that small azimuth errors barely change
   *whether* it's geometrically visible, mostly just blur the exact
   bearing — so output a bearing **range**, not a single number, and let
   low-confidence trajectory guesses soften the alert language rather than
   suppress it.
2. **Don't wire alerts before the model is validated.** Backtest against
   LL2's historical launches before letting anything email a "go outside"
   alert. The 5:30am plume photo is one real data point to check the model
   against.
3. **Free-tier Worker CPU is 10ms per Cron invocation.** The geometry math
   should fit, but confirm early — Workers Paid ($5/mo, 30s CPU) is the
   fallback if not.
4. **Scrubs and NET slips will cause duplicate/contradictory alerts if
   state isn't keyed on (launch ID, NET timestamp).** A reschedule should
   trigger fresh evaluation, not silence or a repeat email for the same
   prediction.

## Recommended build order

1. **Stage 1** — static page + on-demand geometry engine only, no
   automation. Validate correctness via backtest before anything else.
2. **Stage 2** — add the weather layer as a secondary modifier.
3. **Stage 3** — Worker cron + KV state + Resend alerts, only once Stage 1
   is trusted.

## Reuse

- `creel` (neely/creel) — Resend email pipeline to copy the pattern from.
- Standard five-file continuity system for the new repo.
