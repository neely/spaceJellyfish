---
key: topics/prior-art-jellyfish-predictor
title: "Prior art: the Space Jellyfish Predictor site and launch apps"
type: topic-note
sources_summary: "The public page jellyfish.johnkrausphotos.com, read 2026-10-08 through a page summariser (wording below is as summarised unless in quotation marks). The owner cleared this site for reading on 2026-10-08. The Next Spaceflight and Supercluster apps are named but were not examined."
distilled: 2026-10-08
topics: [visibility, plume, twilight, trajectory, illumination]
relevance: high
answers: "How does the best-known jellyfish predictor describe its method, what does it leave out, and how does our engine differ?"
key_points:
  - "It finds the strongest moment after liftoff and gives a likelihood label, in ten-minute steps for two hours each side of T-0."
  - "It uses plume height above the horizon and contrast with the sky; sky brightness depends on the Sun and on viewing direction."
  - "Its ascent path is a smoothed profile from a few typical missions, ending at second engine cutoff."
  - "It does not model weather, wind-delayed illumination, or night launches seen from far away without sunlight."
  - "It gives no thresholds, formulas, or named data sources."
related_papers: []
---

# Prior art: the Space Jellyfish Predictor

## Scope rule
PLAN.md lists scraping this site as a non-goal. That rule stands: we take no predictions, launch data, or images from it. The owner cleared it on 2026-10-08 as a site to read for ideas. This note records only how the site describes its own method.

## What the site says (jellyfish.johnkrausphotos.com, read 2026-10-08)
- It is the "Space Jellyfish Predictor", version 1.2, public beta.
- It "estimates the likelihood that a given rocket launch could produce such an effect during its ascent".
- The user picks an observer point on a map. The site lists upcoming missions.
- For each candidate launch time it finds the strongest moment after liftoff. It turns that moment into a likelihood label.
- Labels are given in ten-minute steps for two hours each side of T-0, with finer steps near a change of label.
- The output reflects how high the plume is above the horizon and how strongly it contrasts with the sky.
- The geometry uses the observer, the rocket, and the Sun to find if and when the plume is sunlit.
- Sky brightness depends on the Sun position. The viewing direction relative to the Sun also matters. So does the observer distance.
- The ascent path is a simplified, smoothed profile based on "a handful of typical mission profiles". It runs to second engine cutoff. It does not follow the guidance of a specific mission.
- Not modelled, by its own statement: weather and atmospheric conditions, illumination delayed by upper-level winds, and night launches that are visible from long distances without sunlight.
- It says it uses "official, non-paywalled, public resources". It names none.
- It says the model was "validated against a large dataset of real-world launch scenarios and subjective viewing experiences".
- It links to an account named "Space Jelly Alert" on X.

## Not examined
- The Next Spaceflight app. The owner named it on 2026-10-08. We have not looked at it.
- The Supercluster app. A user in an r/Charleston thread of 2023-01-16 said they used it to identify a launch.

## Limits of this note
The page was read through a summariser. Sentences outside quotation marks are the summariser's wording. The site gives no numbers, so nothing here can set a threshold.

## What this means for Space Jellyfish
Interpretation, not sourced fact.
- Our design is close to theirs: a profile to second engine cutoff, a sunlit test, and a slip table in ten-minute steps for two hours each side of T-0 (already in PLAN.md).
- Two things they use that we do not: a continuous sky contrast, and the viewing direction relative to the Sun. Our engine has a hard limit (Sun below the horizon) and a prime flag at -6 degrees. A contrast term is the first idea to test.
- They state that night launches can be seen from far away without sunlight. Our label `seen` cannot tell that case from a sunlit plume. This bears on the missed Atlas V label of 2026-04-27 (PLAN.md, Open questions).
- They validate against "subjective viewing experiences". Our labels are the same kind of evidence.
