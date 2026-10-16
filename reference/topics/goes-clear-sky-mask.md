---
key: topics/goes-clear-sky-mask
title: "GOES ABI Clear Sky Mask (ACMC): file contents, quality flags, stated accuracy, and how to find a station's pixel"
type: topic-note
sources_summary: "Two ACMC files read with h5wasm 0.10.3 (GOES-16 2025-03-01 11:01 UTC, GOES-19 2026-04-10 11:01 UTC; NOAA buckets on AWS, read 2026-10-16); NOAA STAR ATBD 'NOAA Enterprise Cloud Mask' v1.2, Heidinger and Straka (star.nesdis.noaa.gov/JPSS/documents/ATBD/ATBD_EPS_Cloud_Mask_v1.2.pdf, SHA-256 a054ec72..., read 2026-10-16); NOAA STAR GOES-19 ABI CONUS latitude and longitude file (read 2026-10-16). The GOES-19 provisional ReadMe and PUG Vol 5 were NOT read: noaasis.noaa.gov did not resolve and the OSPO copy answered 503 on 2026-10-16."
distilled: 2026-10-16
topics: [weather, data-access, twilight]
relevance: high
answers: "What is in a GOES ABI-L2-ACMC file, which field is the binary cloud mask, what do the quality flags mean, how good does NOAA say the mask is by day and night, and how do I find the pixel over a place without coding the projection?"
key_points:
  - "ACMC files hold four fields on a 1500 by 2500 grid: BCM (binary), ACM (four levels), Cloud_Probabilities, DQF."
  - "DQF in the files: 0 good, 1 bad, 2 space, 6 degraded."
  - "The files mark a twilight region at solar zenith 87 to 93 degrees (Sun +3 to -3); good quality from 0 to 180."
  - "ATBD Table 11 (ABI and AHI against CALIOP, COD over 0.4): accuracy 0.94 day, 0.93 night, all surfaces. No figure for the terminator."
  - "NOAA STAR publishes the latitude and longitude of each CONUS pixel; GOES-16 and GOES-19 CONUS files share one grid."
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
- Not read: the GOES-19 provisional ReadMe (host down). A web search
  summary said it was dated 18 February 2025 with a review on 29 January
  2025. Not checked against the document.

## Finding a station's pixel
NOAA STAR publishes the latitude and longitude of every CONUS pixel
("Converted from GOES Imager Projection"):
`star.nesdis.noaa.gov/atmospheric-composition-training/documents/goes19_abi_conus_lat_lon.zip`.
scripts/goes-station-pixels.js takes the nearest pixel; for the 11 cloud
stations it was 0.04 to 1.36 km from the airport. The STAR page that
shows the formula answered 403 to a fetch.
