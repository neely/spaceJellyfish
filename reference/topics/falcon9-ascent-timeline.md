---
key: topics/falcon9-ascent-timeline
title: "Falcon 9 ascent event times and altitudes from Florida, and where to find telemetry"
type: topic
sources_summary: "SpaceX mission pages for four 2025-2026 Cape flights (read in a browser 2026-10-08), Launch Library 2 timeline fields (2 records), Spaceflight Now timelines (2015, 2020) and 2025 report, GitHub metadata for shahar603 repositories. Altitude and velocity at events: only sparse sourced values."
distilled: 2026-10-08
topics: [ascent-profile, telemetry, trajectory, launch-data]
relevance: high
answers: "At what time after liftoff do Falcon 9 MECO, stage separation, SES-1, fairing separation, entry burn, landing and SECO-1 happen for current Cape missions, what altitudes are published, and is there open Starlink-era ascent telemetry?"
key_points:
  - "Starlink from SLC-40 (SpaceX pages): MECO T+2:25 to 2:26, separation T+2:29, SES-1 T+2:36, fairing T+2:58 to 2:59, SECO-1 T+8:39 to 8:40."
  - "Fairing separation varies by mission: T+2:58 (Starlink), T+3:24 (GTO Nusantara Lima), T+3:30 (Kuiper KF-02)."
  - "Separation altitude about 65 km on a 2025-11-22 Starlink flight (Spaceflight Now); MECO about 80 km in 2015."
  - "Launch Dashboard API (MIT) is offline as of 2026-10-08. Its Telemetry-Data repository (Unlicense) has no Starlink flights."
  - "Not found: any open Starlink-era altitude versus time data. SpaceXtract (MIT) can extract it from webcast video."
related_papers: []
---

# Falcon 9 ascent event times and altitudes

Check date for every source below: 2026-10-08.
All SpaceX times are marked "all times approximate" on the pages.

## Sources
1. SpaceX, Starlink mission, SL 10-45, 2026-07-14, SLC-40. https://www.spacex.com/launches/sl-10-45 (page is script-rendered; read in the built-in browser).
2. SpaceX, Starlink mission, SL 10-33, 2026-03-19, SLC-40. https://www.spacex.com/launches/sl-10-33 (same method).
3. SpaceX, KF-02 (Kuiper), 2025-08-11, SLC-40. https://www.spacex.com/launches/kf-02 (same method).
4. SpaceX, Nusantara Lima (geosynchronous transfer orbit), 2025-09-11, SLC-40. https://www.spacex.com/launches/nusantaralima (same method).
5. Launch Library 2 v2.3.0, launch records with a `timeline` field: Starlink Group 15-25 (Vandenberg) and Dragon CRS-35 (SLC-40), queried 2026-10-08. https://ll.thespacedevs.com/2.3.0/ . Total API requests made for the whole task: 3.
6. Spaceflight Now, 2025-11-22 Starlink report. https://spaceflightnow.com/2025/11/21/live-coverage-falcon-9-rocket-to-continue-starlink-deployments-with-launch-from-cape-canaveral/ (fetched raw).
7. Spaceflight Now timeline, Starlink 2020-01-06 (60 satellites, older design). https://spaceflightnow.com/2020/01/06/launch-timeline-for-falcon-9-launch-of-starlink-satellites-2/ (fetched raw).
8. Spaceflight Now timeline, SpaceX-6, 2015. https://spaceflightnow.com/?p=5483 (fetched raw).
9. Spaceflight Now timeline, Atlas 5 GOES-R, 2016. https://spaceflightnow.com/?p=20029 (fetched raw).
10. GitHub: https://github.com/shahar603/Launch-Dashboard-API , https://github.com/shahar603/Telemetry-Data , https://github.com/shahar603/SpaceXtract (metadata and README read with the gh CLI).

Snippet only: Vulcan Cert-1 timing (booster jettison about 1:50, core cutoff T+4:58) from a newspaceeconomy.ca search result.

## Falcon 9 event times, current missions (time after liftoff, mm:ss)

| Event | Starlink SL 10-45 (S1) | Starlink SL 10-33 (S2) | KF-02 Kuiper (S3) | Nusantara Lima GTO (S4) |
|---|---|---|---|---|
| Max Q | 1:10 | 1:12 | 1:12 | 1:12 |
| MECO | 2:26 | 2:25 | 2:25 | 2:28 |
| Stage separation | 2:29 | 2:29 | 2:29 | 2:31 |
| SES-1 (second-stage start) | 2:36 | 2:36 | 2:37 | 2:38 |
| Fairing separation | 2:59 | 2:58 | 3:30 | 3:24 |
| Entry burn start | 6:00 | 6:01 | 6:01 | 6:13 |
| Entry burn end | 6:22 | 6:23 | 6:27 | 6:35 |
| Landing burn start | 7:56 | 7:58 | 7:42 | 8:09 |
| Landing | 8:19 | 8:20 | 8:13 | 8:32 |
| SECO-1 | 8:40 | 8:39 | 8:31 | 8:07 |
| SES-2 | 54:10 | 52:10 | 52:43 | 23:13 |
| SECO-2 | 54:11 | 52:11 | 52:46 | 23:57 |
| Payload deploy | 1:03:31 | 1:01:31 | begins 56:18, ends 1:03:58 | 27:25 |

- In the Nusantara Lima column the page lists SECO-1 at 8:07, before landing burn start (8:09). It differs from the Starlink flights, where SECO-1 comes after landing.
- LL2 timeline for Starlink Group 15-25 (Vandenberg, Source 5): Max Q 1:08, MECO 2:26, stage 2 separation 2:29, SES-1 2:36, fairing separation 2:58, entry burn 6:01 to 6:24, landing burn 8:00, landing 8:23, SECO-1 8:39, SES-2 53:05, SECO-2 53:06, deployment 1:01:57.
- LL2 timeline for Dragon CRS-35 (SLC-40, 2026-10-13, planned, Source 5): Max Q 1:08, MECO 2:15, separation 2:18, SES-1 2:26, boostback burn 2:31 to 3:25, entry burn 5:58 to 6:06, landing 7:21 (return to Landing Zone 40), SECO-1 8:30, Dragon separation 9:18. These are planned values from a community-maintained database, not SpaceX data.
- Conflict (older design, not current): the 2020 Starlink timeline (Source 7) has MECO at T+2:33, fairing jettison at T+3:24 and SECO-1 at T+8:49. The 2026 SpaceX pages have MECO at 2:25 to 2:26 and fairing at 2:58. The vehicle and payload changed. Use the 2025-2026 pages.
- Conflict on fairing time: for the same vehicle class, the fairing separates at 2:58 to 2:59 on Starlink flights, but at 3:24 and 3:30 on the GTO and Kuiper flights (Sources 1 to 4).

## Altitude and velocity published at events
- Stage separation altitude: about 40 miles (65 km) for the 2025-11-22 Starlink flight. The booster then climbed past the Karman line before landing (Source 6, as reported by Spaceflight Now).
- MECO altitude and speed (2015, SpaceX-6, ISS cargo): about 80 km and Mach 10, at T+2:37 (Source 8). This is an old timeline. Current MECO is earlier (T+2:25).
- The 2025-11-22 Starlink flight: second stage burned about six minutes; satellites separated into a 274 by 261 km orbit about 1 hour 5 minutes into flight (Source 6).
- The 2020 Starlink timeline: target orbit about 290 km at 53 degrees (Source 7).
- Not found: altitude, velocity or downrange at MECO, SES-1, fairing separation or SECO-1 for a current Starlink flight from a primary source. SpaceX pages give no altitude or velocity.
- Not found: the altitude of the second stage at T+3 to T+8 minutes for Cape missions.

## Other Cape vehicles
- Atlas 5 (GOES-R, 2016, Source 9): solid booster jettison T+1:48.7; nose cone jettison T+3:29.9; main engine cutoff T+4:21.8; stage separation T+4:27.8; first parking orbit 104 by 336 miles at 28.15 degrees.
- Vulcan (snippet only): booster burnout and jettison about T+1:50 on the first flight; core cutoff about T+4:58.
- Not found: ascent timelines for Falcon Heavy and New Glenn from a fetched source.

## Open telemetry data
- Telemetry-Data (https://github.com/shahar603/Telemetry-Data): Unlicense. Last push 2020-01-24. The README says the data moved to the Launch Dashboard API. The folders (listed with the gh CLI) cover about 50 missions, such as Iridium NEXT, CRS-8 to CRS-16, SES and Falcon Heavy Demo. The newest folder name I saw is DM-1. No folder is named for Starlink. The telemetry is time, velocity and altitude read from webcast video at 30 frames per second.
- Launch Dashboard API (https://github.com/shahar603/Launch-Dashboard-API): MIT licence. Repository not archived. Last commit 2022-05-21 and last push 2024-06-19 (a dependency bump). README example shows a REST route `/v2/launches/latest/spacex` that returns raw and analysed telemetry (time, velocity, altitude, downrange distance, acceleration, dynamic pressure) and events (Max Q, MECO and others), with a field for the Launch Library 2 id.
- Is it online? On 2026-10-08 the host api.launchdashboard.space resolved in DNS but the connection on port 80 was refused. HTTPS also failed. Treat it as offline.
- Does it cover Starlink? The README mentions a Starlink-18 first-stage analysis by the author. I cannot list the data because the API is offline.
- SpaceXtract (https://github.com/shahar603/SpaceXtract): MIT licence, last push 2024-08-30. Tool to extract telemetry from SpaceX or Rocket Lab webcast video with OpenCV. It is the route to self-made Starlink-era telemetry.
- Snippet only: a search found no other open dataset of Starlink ascent altitude against time.

## Not found
- Current-flight altitude, velocity and downrange against time (Starlink era) in any open dataset.
- SpaceX trajectory direction text on the mission pages.
- Falcon Heavy and New Glenn ascent timelines.

## Papers the owner could download
None identified. The best next source is a webcast recording processed with SpaceXtract.

## What this means for Space Jellyfish
This section is interpretation, not sourced fact.
- Use a Starlink event table from the 2026 SpaceX pages: MECO 145 s (2:25), stage separation 149 s, SES-1 156 s, fairing 178 s, SECO-1 519 s (8:39). For GTO and Kuiper style flights allow fairing at 204 s to 210 s and SECO-1 about 487 s to 489 s. Mark each as a SpaceX page value.
- The plume is relevant to the second stage after SES-1 (T+2:36). Before then the booster plume is low in the atmosphere. This is my reading of the event list, not a sourced rule.
- Altitude against time is not sourced for current flights. Do not hard-code it. Options: (a) take a first-order model and calibrate it with points from sources, namely about 65 km at stage separation (T+2:29, Source 6) and the target orbit of 274 by 261 km at deployment; (b) extract telemetry from webcasts with SpaceXtract; (c) read the `flightclub_url` that LL2 gives for each launch (not opened here).
- Use LL2 `timeline` relative times as a per-launch input, since it carries MECO and SECO-1 per mission. The values for planned launches are community data.
- Confidence: high for event times (four consistent SpaceX pages, spread under 5 s for MECO and separation); low for altitudes.
