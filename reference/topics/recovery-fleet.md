---
key: topics/recovery-fleet
title: "SpaceX drone ships: what they are, which one works the Cape, and why its position gives the launch direction"
type: topic-note
sources_summary: "orbitalradar.com page on A Shortfall of Gravitas (last updated 2026-05-31, read 2026-10-15); orbitalradar fleet hub (Ben's screenshot, 2026-10-18); Wikipedia 'Autonomous spaceport drone ship' (pointer, read 2026-10-15); spacelaunchschedule.com and LL2 for the Bandwagon 5 landing ship (LL2 re-read 2026-10-18); our own destinationPoint calculation."
distilled: 2026-10-18
topics: [launch-data, trajectory, data-access]
relevance: medium
answers: "What is a SpaceX drone ship, which one supports Cape launches now, how far downrange does it wait, and how does its position tell us whether a launch goes northeast or southeast?"
key_points:
  - "A Shortfall of Gravitas (ASOG), based at Port Canaveral, waits about 300 to 650 km downrange (orbitalradar)."
  - "Wikipedia says Just Read the Instructions left Falcon work for Starship in April 2026, so ASOG is the Cape's Falcon drone ship."
  - "Bandwagon 5: LL2 and spacelaunchschedule.com name ASOG; LL2 gives 600 km downrange."
  - "600 km on 53.6 degrees is about 31.7 N 75.5 W (off the Carolinas); on 126.4 degrees about 25.3 N 75.8 W (near the Bahamas)."
  - "The orbitalradar fleet hub shows live positions in a browser (Ben's iPhone, 2026-10-18); WebFetch sees only Loading."
  - "Bandwagon 5: ASOG was still in port at 06:53 local the day before launch. In port that morning does not mean no drone ship."
related_papers: []
---

# SpaceX drone ships (the recovery fleet)

## Sources
1. orbitalradar.com, "A Shortfall of Gravitas". https://orbitalradar.com/recovery-fleet/a-shortfall-of-gravitas. Page says last updated 2026-05-31. Read 2026-10-15 (WebFetch summary).
2. Wikipedia, "Autonomous spaceport drone ship". https://en.wikipedia.org/wiki/Autonomous_spaceport_drone_ship. Read 2026-10-15 (WebFetch summary). Pointer only; the article is inconsistent on how many ships are active.
3. LL2 record for Bandwagon 5 (re-read 2026-10-18 by WebFetch: ASOG, ASDS, downrange 600.0, attempt true, record last_updated 2026-10-17T17:51:39Z) (runbook in reference/topics/cape-launch-azimuths-and-inclinations.md) and https://www.spacelaunchschedule.com/launch/falcon-9-block-5-bandwagon-5-dedicated-mid-inclination-rideshare/ (read 2026-10-15).

4. orbitalradar fleet hub, seen in a browser by Ben, screenshot 2026-10-18 ("Fleet Positions, 5 vessels tracked, Updated 6:53:07 AM").
5. spacelaunchschedule.com, https://www.spacelaunchschedule.com/launch/falcon-9-block-5-bandwagon-5-dedicated-mid-inclina/ (a second URL form; search snippet only, 2026-10-18).

## What a drone ship is
- A barge with a flat deck that holds its position at sea with thrusters. A Falcon 9 first stage lands on it after launch (Source 2).
- After landing, a robot (the "Octagrabber") clamps the booster to the deck, and a tug tows the ship back to port (Sources 1, 2). The tugs that escort ASOG are named Bob or Doug (Source 1).
- The names come from ships in Iain M. Banks' Culture novels (Source 2).

## Which ship works the Cape
- A Shortfall of Gravitas (ASOG): home port Port Canaveral. It waits about 300 to 650 km downrange; the exact spot depends on the trajectory and the fuel the booster has left (Source 1).
- Just Read the Instructions (JRTI): Wikipedia says it was based at Port Canaveral but moved from Falcon work to Starship transport in April 2026 (Source 2). Not checked against a primary source.
- Conflict: the ASOG page (Source 1, last updated 31 May 2026, re-read 2026-10-18) still says ASOG works with JRTI on the East Coast. Wikipedia (Source 2) says JRTI left Falcon work in April 2026. The ASOG page may be stale.
- Of Course I Still Love You (OCISLY): Long Beach, California, for Vandenberg launches (Source 2). Not relevant to us.

## Why it matters for Space Jellyfish
Interpretation and our own calculation.
- The booster falls along the launch track, so the drone ship sits on that track. A ship off the Carolinas means a northeast launch, which climbs 2 to 3 times higher in the Charleston sky. A ship near the Bahamas means a southeast launch, which stays low.
- For Bandwagon 5 (LL2: ASOG, 600 km downrange), `destinationPoint` in engine/trajectory.js puts the ship near 31.7 N 75.5 W for the northeast azimuth (53.6 degrees) and near 25.3 N 75.8 W for the southeast one (126.4 degrees).
- A landing at Landing Zone 40 (return to the pad, as for SpX-35) gives no direction clue.
- Conflict: for Bandwagon 5, LL2 (Source 3) and the first spacelaunchschedule URL name ASOG at 600 km. A search snippet of the second spacelaunchschedule URL (Source 5, 2026-10-18) says a return to Landing Zone 40. The snippet may be a page template; LL2 is the newer record.

## How to find the ship's position
- orbitalradar's fleet hub (https://orbitalradar.com/recovery-fleet, "Live Vessel Tracker") shows positions on a map. The ship page (Source 1) has no map. Our tools saw only "Loading" on 2026-10-15. In a browser it works (Source 4): on 2026-10-18 at 06:53 local it tracked 5 vessels. A drone-ship marker at Port Canaveral carried overlapping labels that include A Shortfall of Gravitas (more than one vessel there, names not all readable). Of Course I Still Love You was at Long Beach and the transport Finn Falgout on the Gulf coast.
- Timing: on the morning before Bandwagon 5 (window 10:30Z on 2026-10-19), ASOG had not sailed. Check the hub again later the same day. The ship's position the evening before is a better test than the morning.
- For the launch direction, the Coast Guard hazard areas are often public before the ship sails. See the Runbook in reference/topics/cape-launch-azimuths-and-inclinations.md, step 6.
- AIS ship-tracking sites by ship name. Not checked.

## Bandwagon 5 on the day (2026-10-20)
LL2 (read 2026-10-20 13:31Z) gave the booster landing on A Shortfall of
Gravitas, success, 600 km downrange. The ship was in port at 06:53 local
on 2026-10-18 (Ben's screenshot), so it sailed later than that check.
The launch had moved to Tuesday after a weather scrub.

