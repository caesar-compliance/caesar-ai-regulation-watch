# T050 — Choropleth-style map and compare jurisdictions

**Branch:** `feature/T050-choropleth-map-compare-jurisdictions`  
**Depends on:** T049 merged; v1.0.6 deployed.

## Goal

Improve automation-first tracker UX with a choropleth-style status surface and a public jurisdiction comparison view.

## Scope

- Tracker scoring metadata (`regulation_maturity_score`, `activity_score`, etc.)
- `TrackerChoroplethMap` on `/tracker/` with legend
- `/compare/` for 2–4 jurisdictions
- JSON exports: enriched `country-status.json`, `jurisdiction-comparison.json`
- Docs and backlog updates

## Out of scope

- TopoJSON/D3/GPL map libraries
- Live API/RSS adapters
- Deploy / tag / version bump in this task
- Scraping or competitor data copy
