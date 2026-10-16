---
key: topics/recovery-fleet
title: "SpaceX drone ships: what they are, which one works the Cape, and why its position gives the launch direction"
type: topic-note
sources_summary: "orbitalradar.com page on A Shortfall of Gravitas (last updated 2026-05-31, read 2026-10-15); Wikipedia 'Autonomous spaceport drone ship' (pointer, read 2026-10-15); spacelaunchschedule.com and LL2 for the Bandwagon 5 landing ship; our own destinationPoint calculation."
distilled: 2026-10-15
topics: [launch-data, trajectory, data-access]
relevance: medium
answers: "What is a SpaceX drone ship, which one supports Cape launches now, how far downrange does it wait, and how does its position tell us whether a launch goes northeast or southeast?"
key_points:
  - "A Shortfall of Gravitas (ASOG), based at Port Canaveral, waits about 300 to 650 km downrange (orbitalradar)."
  - "Wikipedia says Just Read the Instructions left Falcon work for Starship in April 2026, so ASOG is the Cape's Falcon drone ship."
  - "Bandwagon 5: LL2 and spacelaunchschedule.com name ASOG; LL2 gives 600 km downrange."
  - "600 km on 53.6 degrees is about 31.7 N 75.5 W (off the Carolinas); on 126.4 degrees about 25.3 N 75.8 W (near the Bahamas)."
  - "No public live position was readable by our tools; AIS sites need a browser."
related_papers: []
---

# SpaceX drone ships (the recovery fleet)

## Sources
1. orbitalradar.com, "A Shortfall of Gravitas". https://orbitalradar.com/recovery-fleet/a-shortfall-of-gravitas. Page says last updated 2026-05-31. Read 2026-10-15 (WebFetch summary).
2. Wikipedia, "Autonomous spaceport drone ship". https://en.wikipedia.org/wiki/Autonomous_spaceport_drone_ship. Read 2026-10-15 (WebFetch summary). Pointer only; the article is inconsistent on how many ships are active.
3. LL2 record for Bandwagon 5 (runbook in reference/topics/cape-launch-azimuths-and-inclinations.md) and https://www.spacelaunchschedule.com/launch/falcon-9-block-5-bandwagon-5-dedicated-mid-inclination-rideshare/ (read 2026-10-15).

## What a drone ship is
- A barge with a flat deck that holds its position at sea with thrusters. A Falcon 9 first stage lands on it after launch (Source 2).
- After landing, a robot (the "Octagrabber") clamps the booster to the deck, and a tug tows the ship back to port (Sources 1, 2). The tugs that escort ASOG are named Bob or Doug (Source 1).
- The names come from ships in Iain M. Banks' Culture novels (Source 2).

## Which ship works the Cape
- A Shortfall of Gravitas (ASOG): home port Port Canaveral. It waits about 300 to 650 km downrange; the exact spot depends on the trajectory and the fuel the booster has left (Source 1).
- Just Read the Instructions (JRTI): Wikipedia says it was based at Port Canaveral but moved from Falcon work to Starship transport in April 2026 (Source 2). Not checked against a primary source.
- Of Course I Still Love You (OCISLY): Long Beach, California, for Vandenberg launches (Source 2). Not relevant to us.

## Why it matters for Space Jellyfish
Interpretation and our own calculation.
- The booster falls along the launch track, so the drone ship sits on that track. A ship off the Carolinas means a northeast launch, which climbs 2 to 3 times higher in the Charleston sky. A ship near the Bahamas means a southeast launch, which stays low.
- For Bandwagon 5 (LL2: ASOG, 600 km downrange), `destinationPoint` in engine/trajectory.js puts the ship near 31.7 N 75.5 W for the northeast azimuth (53.6 degrees) and near 25.3 N 75.8 W for the southeast one (126.4 degrees).
- A landing at Landing Zone 40 (return to the pad, as for SpX-35) gives no direction clue.

## How to find the ship's position
- orbitalradar's fleet hub (https://api.orbitalradar.com/recovery-fleet) says it shows positions every 5 minutes, but our tools saw only "Loading" on 2026-10-15. It needs a browser.
- AIS ship-tracking sites by ship name. Not checked.
