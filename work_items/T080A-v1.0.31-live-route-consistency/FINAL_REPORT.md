# T080A — Final Report: v1.0.31 Live Route Consistency Hotfix

**Date:** 22 May 2026  
**Release:** v1.0.31 (hotfix, no semver bump)  
**Tag:** `regulation-watch-v1.0.31` (unchanged)

## Git

| Field | Value |
|-------|-------|
| Starting HEAD | `b55a115f0b479d3563107dadb8bb04836c68bb2e` |
| Branch | `hotfix/T080A-v1.0.31-live-route-consistency` |
| Final commit | `1b50fcdf03e629b2c9e1fd187a491553605fcd14` |
| Final main HEAD | `1b50fcdf03e629b2c9e1fd187a491553605fcd14` (after fast-forward merge) |
| Package version | `1.0.31` |
| Tag status | Unchanged — `regulation-watch-v1.0.31` |

## Root cause

| Symptom | Cause |
|---------|--------|
| `/map/` served legacy display-only map (v1.0.21-era UX) | `src/pages/map.astro` shadowed `src/pages/map/index.astro` in Astro routing |
| `/` showed mixed T080/YAML counts and “13 jurisdictions” copy | Homepage used `getPilotSummary()` + hardcoded nav text, not `tracker-summary.json` |
| README status stale at v1.0.30 | Docs not updated after T080 merge |

Countries/compare/jurisdiction routes already consumed T080 exports — no code defect there.

## Files changed

- **Removed:** `src/pages/map.astro`
- **Added:** `src/lib/public-route-summary.ts`, `scripts/validate-public-route-consistency.mjs`, work item docs
- **Updated:** `src/pages/index.astro`, `scripts/verify-dist-output.mjs`, `package.json`, `README.md`, `PROJECT_STATE.md`, `src/lib/runtime-monitoring-data.ts`
- **Regenerated (build):** `public/data/*.json` timestamps from `build:runtime-public-export`

## Route before / after

| Route | Before (live pre-T080A) | After (live post-deploy) |
|-------|-------------------------|---------------------------|
| `/` | v1.0.31 footer but stats 40 sources / 21 laws; “13 jurisdictions” nav copy; YAML jurisdiction cards | v1.0.31; T080 stats (18 profiles, 20 regulations, 25 sources, 2 RSS, 23 manual); profile-card grid |
| `/tracker/` | T080 dashboard present on live (18/20/25) | Unchanged — validated against `tracker-summary.json` |
| `/map/` | `<h1>Global coverage map</h1>` — legacy CoverageMap | `<h1>Global regulation map</h1>` — T080 filters, meters, side panel |
| README | Status v1.0.30 | Status v1.0.31 T080 summary |

## Validation

| Command | Result |
|---------|--------|
| `git diff --check` | PASS |
| `npm run validate:source-registry` | PASS |
| `npm run validate:automation-runtime` | PASS |
| `npm run validate:runtime-services-readiness` | PASS |
| `npm run validate:runtime-db-health` | PASS |
| `npm run validate:monitoring-output` | PASS |
| `npm run validate:public-export-consistency` | PASS |
| `npm run build` | PASS |
| `npm run verify:dist` | PASS |
| `npm run validate:public-route-consistency` | PASS |

## Deployment

| Field | Value |
|-------|-------|
| Workflow | `deploy-static-site.yml` |
| Run ID | [26295890931](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26295890931) |
| Deploy commit | `1b50fcd` |
| `confirm_disclaimers` | `DEPLOY` |

## Live smoke (22 May 2026, post-deploy)

| URL | Result |
|-----|--------|
| `/` | 200 — v1.0.31, T080 stats, jurisdiction profile cards |
| `/tracker/` | 200 — T080 dashboard; 18 / 20 / 25 counts |
| `/map/` | 200 — Global regulation map, maturity/activity filters |
| `/countries/` | 200 — 18 cards (unchanged) |
| `/compare/` | 200 (unchanged) |
| `/jurisdictions/france/` | 200 (unchanged) |
| `/data/tracker-summary.json` | 200 — `product_version: 1.0.31`, 18 countries, 20 regulations, 25 sources |
| `/data/regulation-records.json` | 200 |
| `/data/jurisdiction-profile-cards.json` | 200 |
| `/data/regulation-map-metrics.json` | 200 — 18 markers |

## Safety confirmation

- `/` shows **v1.0.31** with T080 coverage counts
- `/tracker/` shows **T080** counts aligned with exports
- `/map/` shows **T080** map/metrics and **v1.0.31** footer
- `/countries/` still shows **18** jurisdictions
- `/jurisdictions/france/` still works
- **No** Supabase writes
- **No** Worker deploy
- **No** cron enabled
- **No** secrets committed
- **No** legal/evidence/client gates opened
