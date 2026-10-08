---
key: topics/prior-art-jellyfish-predictor
title: "Prior art: the Space Jellyfish Predictor site and launch apps"
type: topic-note
sources_summary: "Raw HTML, homepage.js (4766 lines, readable, not minified) and one /api/v2/upcoming reply of jellyfish.johnkrausphotos.com, fetched 2026-10-08 with curl (4 requests). GitHub and web searches, and the Next Spaceflight and Supercluster public pages, on the same day. The owner cleared the site for reading."
distilled: 2026-10-08
topics: [visibility, plume, twilight, illumination, trajectory, launch-data]
relevance: high
answers: "How does the Space Jellyfish Predictor work, what are its terms, which rules are exposed, is its source public, and how does our engine compare?"
key_points:
  - "The model runs on their server. The browser sends observer, mission and T-0, and gets labels back. No thresholds are in the client."
  - "Six labels: Very likely, Likely, Possible, Unlikely, Very unlikely, Impossible. Cut-offs are not exposed. Labels are in 10-minute steps."
  - "Terms: media may cite outputs with clear attribution; heatmaps must be used as provided. No scraping or licence statement was found."
  - "No public source repository was found. The page says an AI wrote the core software."
  - "Most useful ideas to test: continuous contrast score, per-mission profile with a stated azimuth, graded labels, a T-0 slider."
related_papers: []
---

# Prior art: the Space Jellyfish Predictor

Source of every statement: files fetched on 2026-10-08. Where a statement comes from the visible page text, from the script, or from a reply of the server, the line says so.

URLs used (4 requests to johnkrausphotos.com, 2 seconds or more apart):
1. https://jellyfish.johnkrausphotos.com/ (raw HTML)
2. https://jellyfish.johnkrausphotos.com/homepage.js?v=20261002-direction-estimate (main script)
3. https://jellyfish.johnkrausphotos.com/map-config.js (94 bytes: a map-tile settings object; the key in it is not recorded here)
4. https://jellyfish.johnkrausphotos.com/api/v2/upcoming (one reply, read for field names only; nothing saved in the repo)

## Scope and terms
- The owner cleared the site for reading on 2026-10-08. PLAN.md lists scraping it as a non-goal. That stands.
- We take ideas and stated facts from it. We do not take their code, predictions, heatmaps, launch data or images.
- Terms (visible page text, panel "Media usage guidelines"): outputs may be used in news and media "provided that clear attribution" is given to jellyfish.johnkrausphotos.com.
- Same panel: visuals such as heatmaps should be used as provided, "rather than recreated, modified, or redrawn".
- Same panel: users should run a prediction for the location of their audience before publication.
- I found no statement about scraping, reuse of code, data licence or copyright in the page text or script. I did not fetch robots.txt or any other terms page.
- Disclaimer (visible text): the tool is "provided in good faith as a best-effort resource" in an early-access beta. Use is at the user's own risk.

## What the page says
All from visible text of the HTML (panel "Learn more").
- Title: "Space Jellyfish Predictor", v1.2, public beta. A link goes to the X account Space Jelly Alert.
- Definition: rocket and plume lit by sunlight in the upper atmosphere or space while the observer is in relative local darkness.
- Not modelled: some night launches seen from far away without sunlight.
- Method text: geometry between observer, rocket and Sun gives if and when the plume is sunlit, about how high it looks above the horizon, and how strongly it contrasts with the sky.
- Said to matter: observer distance, sky brightness from the Sun position, and viewing direction relative to the Sun.
- For each candidate launch time the model finds the strongest post-liftoff moment and converts it to a likelihood or prominence label.
- Output: labels every ten minutes for two hours either side of T-0, with adaptive refinement near transitions.
- Ascent: a "generalized, smoothed trajectory" to second engine cutoff, from "a handful of typical mission profiles". No mission-specific guidance.
- Not modelled: old plumes lit later (for example by upper-level winds). Only the phase right after liftoff is scored.
- Not modelled: weather and atmosphere.
- Provenance: the core software "was largely created by artificial intelligence"; outputs are not AI-generated. It is "validated against a large dataset" of real launches and subjective viewing. No data is shown.
- Data: "official, non-paywalled, public resources". None named.

## The model runs on a server
This comes from reading homepage.js and one API reply.
- The browser does not compute plume geometry. It has no shadow test, no altitude threshold and no brightness model.
- The only Sun code in the script is a low-accuracy Sun altitude formula. It draws a twilight shade on the map. It is display only.
- Endpoints named in the script:
  - GET /api/v2/upcoming (mission list) and GET /api/v2/upcoming/events (a server-sent event stream for updates).
  - POST /api/v2/prediction-transient. The body holds observer_lat and observer_lng (5 decimals), a mission selector (correlation_id or order), optional trajectory_heading_deg, and optional t0 (epoch seconds).
  - GET /api/missions/heatmap-overlay, /api/missions/heatmap-image and /missions/heatmap-view. Query: mission selector, trajectory_heading_deg, t0.
- Page assets: /homepage.css, /map-config.js, /homepage.js, a bundled Leaflet map library, map tiles. The page's security policy allows connections to its own host only.
- A response header names the origin server "JellyfishV2/1.0" (unclear what that means beyond a name).
- Launch list: the mission list comes from their server. Rows carry a source field (values seen: "spacex", "manual") and a link to a nextspaceflight.com launch page. How the list is built is unclear.
- Observer position: chosen by the user (map picker, browser location). The server returns the prediction.
- Fields in a mission row (names only): launch time and window open/close, pad latitude/longitude, Sun altitude and azimuth at the pad, daylight label, trajectory heading and options, trajectory source, profile name, sunlit start and end (seconds after T-0), first and last visible elevation and azimuth, peak rocket elevation and azimuth and time, engine cutoff time and position, observer distance, heatmap peak score (0 to 1), a list of similar archive launches, and a list of "factors".
- Model metadata in one row (a manual test-style mission, not a Falcon launch) lists: a profile name, target altitude, inclination, azimuth, burn and restart and cutoff times, an assumed liftoff mass, a ground-track mode, and heatmap interpolation and smoothing names. Each value has a status text, such as "Inferred from offshore danger areas" for azimuth. This shows that they build a per-mission physical ascent from assumed mass, thrust and fitted guidance. The exact method is not exposed.
- Heatmap: a grid over ground positions, with a spacing field of about 80 km in that row. It is smoothed. The heatmap gives the score per observer position.

## Their categories and thresholds
Only what is visible in the client. The server rules are not exposed.

| Item | What the client shows |
|---|---|
| Label names | Very likely; Likely; Possible (or Possibly); Unlikely; Very unlikely; Impossible |
| Label cut-offs | Not exposed. Unclear whether they come from a score. |
| Extra word in window text | A row in the sample read "Very likely stunning"; other qualifiers were not checked |
| Heatmap score floor | The client treats a peak score above 0.16 (scale 0 to 1) as a visible signal |
| Time step | The T-0 slider uses 600 s steps from window open to window close, only if the step is 10 minutes and the span is 6 hours or less |
| Daylight cards | A launch marked "daytime" or "nighttime" gets the text that it will not produce a jellyfish |
| Factor wording | "Strongly helped / Helped / Mildly helped / Partially helped" and the "hurt" equivalents, by named factors |
| Factor names seen | sky-plume contrast; plume illumination; plume elevation above the horizon |
| Trajectory source tags | Validated; Presumed; Estimated (shown as "highly generalized"); TBD; Unsupported |
| Map twilight shade | Display only: alpha rises with Sun depression below 0 degrees, capped at 0.58 |

Not exposed: Sun-angle limits, altitude limits, the sunlit test, any screening height, the contrast formula, the distance rule, the number of profile points, the choice of launch azimuth, the slip range in the code (the page text says plus and minus two hours).

## Published source
- GitHub API repository search for "space jellyfish predictor" gave one hit: neely/spaceJellyfish (our own project). Search for "johnkrausphotos" gave none.
- Web search for "Space Jellyfish Predictor johnkrausphotos github" gave no repository.
- The client script is served in readable form, but no licence or source link is given. Searches for "Space Jelly Alert" were not run separately.
- Result: none found.

## Other apps
- Next Spaceflight: https://nextspaceflight.com/ describes launch timelines and "Flight simulations" for its app; no visibility or jellyfish feature is mentioned. The /about page returned 404. A web search for a jellyfish feature found nothing. Not found. Note: their mission rows link to Next Spaceflight launch pages (above).
- Supercluster: App Store page https://apps.apple.com/app/id1500045135 mentions "visibility ratings" for Space Station sightings only. No launch visibility or jellyfish feature. Not found.

## Comparison with our engine
Ours: topics/model-visibility-and-verdict and config/visibility.json. "Unclear" means not exposed.

| Item | Their rule | Our rule |
|---|---|---|
| Sunlit test | Server-side; page says geometry of observer, rocket, Sun. Details unclear. | Cylinder shadow of radius R_mean plus 10 km; no penumbra |
| Sky darkness | Continuous: "sky brightness based on the sun's position"; formula unclear | Step: Sun at or below 0 degrees; prime at -6 degrees |
| Minimum elevation | Unclear; page says height above horizon is scored | 5 degrees hard limit |
| Profile | Per-mission smoothed ascent to second cutoff; assumed mass and fitted guidance; point count unclear | Two Falcon 9 shapes (GTO, LEO) to second cutoff; minimum 65 km |
| Azimuth | One heading per variant, with tags (validated, presumed, estimated); some missions offer toggled variants; one example said "inferred from offshore danger areas" | Due east for GTO-type orbits; 8-azimuth fan for others |
| Slip table | 10-minute steps, plus and minus 2 hours (page text); adaptive refinement near transitions | 10-minute steps, plus and minus 2 hours (PLAN.md) |
| Output labels | Six levels from Very likely to Impossible, plus factor text, heatmap over observer positions | Three: likely, possible, no; prime flag; confidence |
| Weather | Not modelled (page text) | Not in the verdict (see FINDINGS.md and weather notes) |

## What this means for Space Jellyfish
Interpretation, not sourced fact. Most valuable first.
1. Add a continuous score. They say contrast, illumination and elevation all feed the label. Test a score from sky depression, plume lit height and elevation, and check it against our labels.
2. Grade the labels. Their six levels carry more than our three. Test splitting 'possible' and 'no' by score, without tuning to the Atlas V miss.
3. Use mission-specific profiles and tag azimuth confidence. They tag trajectory source (validated, presumed, estimated). Our confidence flag could do the same, and a vehicle profile for Atlas V could be tested.
4. Score the strongest moment, not time visible. Their label is the best moment after liftoff. Compare with our 60 s rule on the backtest.
5. Show the factors in words (contrast, illumination, elevation) and add a T-0 slip view. Both help users and are cheap to test.
