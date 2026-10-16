---
key: topics/goes-clear-sky-mask
title: "GOES ABI Clear Sky Mask (ACMC) and Cloud Cover Layers (CCLC): file contents, quality flags, stated accuracy, and how to find a station's pixel"
type: topic-note
sources_summary: "Two ACMC files read with h5wasm 0.10.3 (GOES-16 2025-03-01 11:01 UTC, GOES-19 2026-04-10 11:01 UTC; NOAA buckets on AWS, read 2026-10-16); NOAA STAR ATBD 'NOAA Enterprise Cloud Mask' v1.2, Heidinger and Straka (star.nesdis.noaa.gov/JPSS/documents/ATBD/ATBD_EPS_Cloud_Mask_v1.2.pdf, SHA-256 a054ec72..., read 2026-10-16); NOAA STAR GOES-19 ABI CONUS latitude and longitude file (read 2026-10-16); GOES-19 ECM Provisional ReadMe, 18 Feb 2025 (ospo.noaa.gov mirror, SHA-256 a30abeb3..., read 2026-10-16); AWG CCL ATBD v1.0, Li and Heidinger, Feb 2021 (star.nesdis.noaa.gov/jpss/documents/ATBD/ATBD_EPS_Cloud_CCL_v1.0.pdf, SHA-256 24f9c56c...); GOES-19 CCL Beta (1 Oct 2024) and Provisional (6 Mar 2025) ReadMes (ospo.noaa.gov); CIRA CCL Quick Guide (31 Aug 2023); six CCLC files read with h5wasm (2026-10-16). PUG Vol 5 NOT read (OSPO copy answered 503)."
distilled: 2026-10-16
topics: [weather, data-access, twilight]
relevance: high
answers: "What is in a GOES ABI-L2-ACMC or ABI-L2-CCLC file, which fields give the cloud mask and low cloud, what do the quality flags mean, how good does NOAA say they are, and how do I find the pixel over a place without coding the projection?"
key_points:
  - "ACMC files hold four fields on a 1500 by 2500 grid: BCM (binary), ACM (four levels), Cloud_Probabilities, DQF."
  - "DQF in the files: 0 good, 1 bad, 2 space, 6 degraded."
  - "The files mark a twilight region at solar zenith 87 to 93 degrees (Sun +3 to -3); good quality from 0 to 180."
  - "ATBD Table 11 (ABI and AHI against CALIOP, COD over 0.4): accuracy 0.94 day, 0.93 night, all surfaces. No figure for the terminator."
  - "NOAA STAR publishes the latitude and longitude of each CONUS pixel; GOES-16 and GOES-19 CONUS files share one grid."
  - "CCLC: cloud fraction in five flight-level layers on 10 km cells; layers overlap in the files; its DQF marks clear cells bad."
related_papers: []
---

# GOES ABI Clear Sky Mask (ACMC)

Used by the satellite check, step 1 (config/goes-acm.json,
clouds/README.md). Every value below was read on 2026-10-16. Check it
again before you rely on it.

## What a file holds (read with h5wasm from two real files)
- Grid 1500 rows by 2500 columns (CONUS sector). Fields, with the
  `long_name` and `flag_meanings` from the file:
  - `BCM`: "ABI L2+ Clear Sky Mask", flag values 0 and 1,
    "clear_or_probably_clear cloudy_or_probably_cloudy". Fill 255.
  - `ACM`: "(Real-Value) four level cloud mask", 0 to 3, "clear
    probably_clear probably_cloudy cloudy".
  - `Cloud_Probabilities`: 16-bit, scale factor 1.5261e-5.
  - `DQF`: 0 good_quality_qf, 1 bad_quality_qf, 2 space_qf, 3 to 5
    spare, 6 degraded_quality_qf.
- `twilight_solar_zenith_angle_bounds` = [87, 93], "solar zenith angle
  degree range for the twilight region". `retrieval_solar_zenith_angle_bounds`
  = [0, 180], "solar zenith angle degree range where good quality clear
  sky mask data is produced".
- `algorithm_product_version_container`: algorithm
  `OR_ABI-L2-ALG-ACM_v02r01.zip`, product version `v02r01` (GOES-19 file).
- Projection: geostationary, perspective point height 35786023 m,
  semi-major axis 6378137, semi-minor 6356752.31414, origin longitude
  -75, sweep x. The GOES-16 file (2025-03-01) and the GOES-19 file
  (2026-04-10) have the same x and y scale and offset.

## How good NOAA says it is (ECM ATBD v1.2)
- Requirement (Table 1, "probability of correct typing" of the binary
  mask, clouds with optical depth over 0.4): ocean day 92 percent, ocean
  night 90, snow-free land day 90, night 88; global 87.
- ABI and AHI against CALIOP (Table 11, optical depth over 0.4),
  accuracy for all surfaces: 0.94 all, 0.94 day, 0.93 night. Deep ocean
  0.95 day, 0.93 night. Land 0.93 day, 0.92 night.
- The ATBD says that the performance "degrades when the cloud optical
  depth filter is lessened" (Table 12, no filter: lower).
- The ATBD gives no number for the terminator. It names a terminator
  step: in that region "the clear sky reflectance is renormalized".
- GOES-19 ECM Provisional ReadMe (18 February 2025; review held 29
  January 2025): the DQF table above, and "No major ECM performance
  issues were noted during this review cycle." It says nothing about
  twilight. noaasis.noaa.gov did not resolve; the same file is on
  ospo.noaa.gov under operations/goes/product-quality-overview/ps-pvr/.

## Finding a station's pixel
NOAA STAR publishes the latitude and longitude of every CONUS pixel
("Converted from GOES Imager Projection"):
`star.nesdis.noaa.gov/atmospheric-composition-training/documents/goes19_abi_conus_lat_lon.zip`.
scripts/goes-station-pixels.js takes the nearest pixel; for the 11 cloud
stations it was 0.04 to 1.36 km from the airport. The STAR page that
shows the formula answered 403 to a fetch.

## Cloud Cover Layers (ABI-L2-CCLC)
Used by the draft test 2 (config/goes-acm.json is test 1; config/goes-ccl.json
is test 2).
- What it is (GOES-19 CCL Provisional ReadMe, 6 March 2025): "a cloud
  fraction at a predefined spatial resolution and between specified cloud
  layers", plus a total, at 10 km for CONUS. Layers: SFC-FL050,
  FL050-FL100, FL100-FL180, FL180-FL240, FL240-TOA. Only known issue:
  missing blocks over some Full Disk sectors.
- How it is made (ATBD v1.0, 3.1 and 3.4.2): the total is the cloudy share
  of the cloud mask pixels in the box ("cloudy or probably cloudy"); each
  layer is the share of pixels the ACHA cloud top puts in that layer. The
  ATBD says the operational version "assumes single layer clouds and does
  not require cloud base information", and that "Clouds extending to lower
  level will only be considered for computing the upper level fraction."
- The files do not agree with that: in 6 scans, 20 of 66 station values
  have CF1 to CF5 adding to more than TCF (for example CHS 0, 96, 96, 0,
  0 with TCF 100). So layers overlap, as when cloud base is used. The CIRA
  Quick Guide (2023) says the products "are calculated using Cloud Top
  Height (CTH) and Cloud Base Heights (CBH)". Algorithm in the files:
  OR_ABI-L2-ALG-CCL_v02r00.
- Requirement (ATBD Table 1): "60% Correct Classification for unobscured
  fraction in each layer". Against CALIPSO (ATBD Table 5, no filtering,
  FRAMEWORK): layer 1 80.0 percent, layer 2 50.5 percent.
- Limits (Quick Guide): night retrievals are degraded, "particularly true
  for cloud base derived from NWP data at night, and challenging-to-detect
  low clouds"; it "may not represent the lowest 'ceiling' in
  multi-layered cloudy scenes with a thick top layer".
- File facts: TCF uint16, scale 1.526e-5, fill 65535; 65531 also appears
  (outside valid_range 0 to 65530). CF1 to CF5 uint8 percent, valid 0 to
  100; 128 also appears. CL is a bit flag per cell (bit 0 lowest layer).
  DQF 0 good, 1 degraded, 2 bad; ATBD 3.4.3.2: "There is currently no
  quality flag for CCL cloud fraction" and the layer flag "shares the
  same quality flag as ACHA". Clear cells carry DQF 2.
- Grid: x and y steps are 5 times the ACMC steps, offset by 2 ACMC
  pixels, so CCL cell i covers ACMC rows 5i to 5i+4.
- Values change between consecutive 5-minute scans (seen in 3 pairs).

