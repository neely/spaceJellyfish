---
key: topics/cape-launch-azimuths-and-inclinations
title: "Cape Canaveral launch azimuths, orbit inclinations and how to know a launch direction"
type: topic
sources_summary: "Wikipedia Eastern Range (pointer to a 2002 FAA-sponsored assessment), Spaceflight Now (2022, 2025), AIAA repost of Spaceflight Now (2026), SpaceX mission pages (rendered in a browser), Launch Library 2 (3 API calls) and its docs page, orbitalradar glossary. Several key sources were blocked or scanned and are marked snippet only."
distilled: 2026-10-08
topics: [trajectory, launch-data, ascent-profile, visibility]
relevance: high
answers: "Which launch azimuths are allowed from the Cape, how do azimuth and inclination relate, what inclination goes with each mission class, and how can we know the direction of a future launch from public data?"
key_points:
  - "Conflict: Eastern Range fan is 37 to 114 degrees (Wikipedia, citing a 2002 FAA-sponsored assessment) or 35 to 120 degrees (orbitalradar glossary, secondary)."
  - "Southeast and south launches need a dog-leg around land; the polar corridor was first used on 2020-08-30 (Space Florida, snippet only)."
  - "Starlink: 43 degree flight of 2025-11-22 went southeast; Starlink 10-33 (2026-03-19) and the 2026-03-04 flight went northeast; a 53.2 degree flight of 2022-01 was planned southeast (Spaceflight Now)."
  - "LL2 detailed launch records have no inclination or azimuth field. They have mission.orbit (coarse), landing location, downrange distance, timeline and flightclub_url."
  - "Starlink from Florida may have ended on 2026-08-25 (Universe Today, 2026-09-08); the LL2 Cape query on 2026-10-08 returned no Starlink in its first four rows."
related_papers: []
---

# Cape Canaveral launch azimuths, inclinations and how to know a launch direction

Check date for every source below: 2026-10-08.

## Sources
1. Wikipedia, "Eastern Range". https://en.wikipedia.org/wiki/Eastern_Range (fetched via API, wikitext read). Pointer only.
2. FAA-sponsored report "45th Space Wing/Patrick Air Force Base Launch Site Safety Assessment", NTIS PB2005105397, 2002-06-08 (the citation behind the 37 to 114 degree figure on Wikipedia). Not opened.
3. orbitalradar.com glossary, "Launch azimuth". https://orbitalradar.com/glossary/launch-azimuth (fetched raw). Secondary source of low authority.
4. Spaceflight Now, 2022-01-15, "Cape Canaveral's busy January to continue with another Starlink launch". https://spaceflightnow.com/2022/01/15/cape-canaverals-busy-january-to-continue-with-another-starlink-launch/ (fetched raw).
5. Spaceflight Now, 2025-11-22 launch report. https://spaceflightnow.com/2025/11/21/live-coverage-falcon-9-rocket-to-continue-starlink-deployments-with-launch-from-cape-canaveral/ (fetched raw).
6. AIAA repost of Spaceflight Now, 2026-03-04. https://aiaa.org/2026/03/04/spacex-launches-29-starlink-satellites-on-falcon-9-rocket-from-cape-canaveral/ (fetched raw).
7. Spaceflight Now, SpaceX-6 timeline (2015) https://spaceflightnow.com/?p=5483 and Atlas 5 GOES-R timeline https://spaceflightnow.com/?p=20029 (fetched raw).
8. Launch Library 2 API v2.3.0 and docs page https://ll.thespacedevs.com/docs/ (docs read in the browser). Rate limit text from https://thespacedevs.com/llapi: 15 unauthenticated requests per hour.
9. SpaceX mission pages https://www.spacex.com/launches/sl-10-45 and /sl-10-33 (read in a browser; the page is script-rendered, so plain fetch returns nothing).
10. US Coast Guard Local Notice to Mariners and Space Force airspace worksheets (search snippets only; the worksheet PDFs returned 403 and the Coast Guard PDFs were not opened).
11. NASASpaceflight.com article on the polar launch corridor, 2019-10 (HTTP 403; snippet only).
12. Space Florida, "Cape Canaveral Spaceport Supports Polar Launch Capabilities" (snippet only).
13. Universe Today, 2026-09-08 (fetched raw), for the Florida Starlink statement.
14. USPTO patent application 12172774 (the PDF is scanned; text not extracted; snippet only).

Request count to the Launch Library 2 API: exactly 3 (one launch search, one request to the /2.3.0/ root, one Cape upcoming-launch list). Docs pages were opened in a browser as well.

## Allowed azimuths
- Wikipedia: the Eastern Range can support launches between 37 and 114 degrees azimuth. It cites the 2002 report (Source 1, Source 2).
- orbitalradar glossary: Cape Canaveral fan 35 to 120 degrees (Source 3).
- Conflict: 37 to 114 degrees (Source 1) versus 35 to 120 degrees (Source 3). Snippet only: a patent text says 35 to 120 degrees gives 57 to 39 degrees of inclination (Source 14).
- Spaceflight Now: launches from the Cape have historically gone east or northeast over the Atlantic (Source 4).
- Spaceflight Now: south and southeast paths need "dog-leg" turns around land and people. This costs payload (Source 4).
- Spaceflight Now: Falcon 9 has flown south along the Florida coast to reach polar orbit. This was not possible from the Cape for 50 years (Source 4).
- Snippet only (Source 12, Source 11): the polar corridor was certified in December 2017. The first use was SAOCOM 1B on 2020-08-30. It needs an automated flight termination system and a dog-leg around Florida.
- Not found: the current official range safety azimuth limits from the Space Force, and the FAA 2025 Falcon 9 SLC-40 environmental assessment text on trajectories (see "Papers the owner could download").

## Azimuth and inclination
- First-order relation (no Earth rotation): cos(i) = cos(latitude) x sin(azimuth). Source: orbitalradar glossary (Source 3). The patent snippet gives the same form with different symbols.
- Due east (azimuth 90) gives inclination equal to the launch latitude (Source 3).
- Pad latitudes from LL2: SLC-40 28.562 N, SLC-41 28.583 N (Source 8, pad records).

## Inclination by mission type
- ISS: 51.6 degrees (Spaceflight Now SpaceX-6 timeline, Source 7).
- Starlink 53.2 degree shell: Starlink 4-6 (planned 2022-01-17 from pad 39A) targeted this shell (Source 4). Source 4 says it was expected to fly southeast, like the 2022-01-06 Starlink launch, which was the first Starlink mission from Florida to head southeast. So a 53 degree shell flight can go southeast too. Source 4 also lists the first shell at 53.0 degrees and says SpaceX planned five shells of around 4,400 satellites.
- Starlink 43 degree shell: the launch on 2025-11-22 flew south-easterly from SLC-40 to a 43 degree orbit (Source 5).
- Starlink 10-33 (2026-03-19, SLC-40) flew north-easterly (Spaceflight Now https://spaceflightnow.com/2026/03/18/live-coverage-spacex-to-launch-29-starlink-satellites-on-falcon-9-rocket-from-cape-canaveral-11/, fetched raw). The launch on 2026-03-04 from SLC-40 also flew north-easterly (Source 6). The text I saw does not give the inclination of either one.
- Spaceflight Now (Source 4) says SpaceX planned to use southeast paths in winter to get calmer seas at the landing site. This is a stated plan from 2022, not a rule.
- GTO: the Atlas 5 GOES-R parking orbit had an inclination of 28.15 degrees and the transfer orbit 25.68 degrees before the last burn (Source 7). This is a Centaur ascent, not Falcon.
- Not found: a fetched source for 33 degree, 70 degree and 97.6 degree Starlink shells with which are flown from Florida. Snippet only (a third-party tool page): Gen1 shells at 53.0, 53.2, 70.0 and near-polar 97.6 degrees.
- Not found: GPS and crew mission inclinations from a fetched source (the crew ISS case is 51.6 degrees by Source 7).
- Florida Starlink end: Universe Today says SpaceX said Starlink 10-49 on 2026-08-25 may be the last Starlink from the Florida Space Coast (Source 13). In the LL2 query of 2026-10-08 (location id 12 only, so KSC pad 39A is not covered), the first four upcoming launches were Dragon CRS-35 (2026-10-13), Bandwagon 5, Vulcan Amazon Leo and Cygnus NG-25. None was Starlink. This is a four-row sample, not the whole list.

## How to know the direction of a future launch
- SpaceX pages: the mission pages I read (Source 9) give the pad, time, booster and landing ship. They do not state a trajectory direction in the text I saw. They list ascent events (see reference/topics/falcon9-ascent-timeline.md).
- Spaceflight Now live reports state the direction ("north-easterly", "south-easterly") and the target inclination (Source 5, Source 6). The report is usually written on launch day.
- LL2 detailed launch record (Source 8, one request): no field named inclination, azimuth, heading or trajectory was present. These fields exist: mission.orbit (id, name, abbrev; example "Low Earth Orbit"), rocket.launcher_stage[].landing.landing_location (ship or landing zone), landing.downrange_distance (km, example 574.0 for a Vandenberg launch), timeline (relative event times), flightclub_url, pad.latitude and longitude, mission.description. This is "absent from the detailed responses we saw", based on 2 detailed launch records.
- Flightclub: the LL2 flightclub_url points to a trajectory simulation page. I did not open it.
- The docs page lists endpoints /launches/, /landings/, /config/orbits/ and others. No trajectory endpoint is listed (Source 8).
- Landing site as a proxy: Spaceflight Now says that for northeast launches the landing ship sits east of Charleston, South Carolina (Source 4, 2022). A landing zone at the Cape (LZ-40, downrange 0.3 in the 2026-10-13 CRS-35 record) means a return to the launch site. These are hints, not proofs.
- Navigational and airspace notices: Space Force Eastern Range airspace worksheets list launch hazard polygons by date and time in Zulu (snippet only, Source 10). The Coast Guard has a Regulated Navigation Area for rocket flight trajectories out to 12 nautical miles (snippet only, Source 10). Activation starts about 1 hour before launch (snippet only). I could not open the worksheets.

## Not found
- Official current azimuth limits for Cape launches (two conflicting values only).
- An inclination or azimuth field in LL2 (absent from the records seen).
- A fetched source for the 33, 70 and 97.6 degree shells and their launch sites.
- GPS inclination.
- Any NAVAREA IV warning text.

## Papers the owner could download
- "45th Space Wing/Patrick Air Force Base Launch Site Safety Assessment", NTIS PB2005105397 (2002). https://ntrl.ntis.gov/NTRL/dashboard/searchResults/titleDetail/PB2005105397.xhtml. Expected: the 37 to 114 degree figure and its basis.
- FAA, Final Environmental Assessment for Falcon launches at SLC-40, 2025. https://www.faa.gov/space/stakeholder_engagement/SpaceX_Falcon_SLC_40_EA. Expected (unverified): trajectory and azimuth ranges, hazard areas.
- Space Force Eastern Range airspace worksheets from https://www.patrick.spaceforce.mil (PDF downloads; the server refused scripted fetches). Expected: the hazard polygon for each launch, which shows the direction.

## What this means for Space Jellyfish
This section is interpretation, not sourced fact. The numbers are my own calculations.
- Use the first-order relation with pad latitude 28.56 degrees. Azimuth 45 degrees gives 51.6 degrees. Inclination 53.2 degrees gives azimuth 43.0 or 137.0 degrees. For 43 degrees of inclination the azimuth is 56.4 or 123.6 degrees. The southeast values (137.0 and 123.6 degrees) are outside both published fans (37 to 114, 35 to 120). This fits the Spaceflight Now statement that southeast launches need dog-legs.
- Do not trust a single azimuth range. Keep a configurable fan, default 35 to 120 degrees, and flag both sources.
- For each upcoming launch, classify the direction in this order: (1) a fetched Spaceflight Now or SpaceX statement; (2) the mission class and Starlink group (Starlink 10-33 went northeast; the 43 degree flight of 2025-11-22 went southeast; ISS-bound flights need about 45 degrees azimuth by the formula); (3) the landing location and downrange distance from LL2; (4) a default of northeast for ISS-bound launches.
- Treat northeast as the direction that follows the coast toward Charleston (the bearing from the Cape to Charleston is not sourced here). Treat southeast launches as low-value for Charleston.
- Remember the Starlink caveat: if Starlink no longer flies from Florida, most future candidates are CRS, crew, Cygnus, Bandwagon and Amazon Leo.
- Confidence: medium for ISS and the 43 versus 53 degree Starlink split; low for official limits and for any launch class not listed above.
