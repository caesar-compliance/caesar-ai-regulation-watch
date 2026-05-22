# T080B — Final Report: Live Route Artifact / Cache Consistency

**Date:** 22 May 2026  
**Verdict:** **Live already correct** — external v1.0.29 reports are **stale checks / CDN cache window**, not a missing deploy or route defect.

## State guard

| Check | Value |
|-------|-------|
| main HEAD | `1aedc39ae927d13af23f44417edbfa357ef65e03` (≥ T080A) |
| Package | `1.0.31` |
| Working tree | Clean at investigation start |

## Root cause analysis

| Finding | Detail |
|---------|--------|
| T080A deploy on production | Run [26295890931](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26295890931) at commit `1b50fcd` — removed `map.astro` shadow, updated homepage |
| DEPLOYMENTS gap | T080A deploy was live but not logged until T080B (`DEPLOY-20260522-050`) — auditors comparing DEPLOY-049 only could assume `/map/` still broken |
| CDN caching | `cache-control: max-age=600` on GitHub Pages CDN — HTML can be stale up to **10 minutes** after deploy without cache bust |
| Route shadowing | **Fixed in T080A** — no `src/pages/map.astro`; only `src/pages/map/index.astro` |

## Local dist (post-`npm run build` at `1aedc39`)

No code changes in T080B — dist matches T080A build.

| File | Markers present | Stale absent |
|------|-----------------|--------------|
| `dist/index.html` | `v1.0.31`, `Jurisdiction profile`, `Regulation records` | no v1.0.29/21, no “13 jurisdictions”, no “Global coverage map” |
| `dist/tracker/index.html` | `v1.0.31`, `Product tracker dashboard (T080)` | no v1.0.29, no “13 Jurisdictions tracked” |
| `dist/map/index.html` | `v1.0.31`, `Global regulation map` | no “Global coverage map”, no “Display-only map” on main map page |

## Live evidence — normal URLs (22 May 2026)

| URL | Version / title | Notes |
|-----|-----------------|-------|
| `/` | v1.0.31, T080 stats (18 profiles, 20 regulations, 25 sources) | No v1.0.29, no “13 jurisdictions” nav |
| `/tracker/` | v1.0.31, T080 dashboard (18/20/25) | No T078-only footer |
| `/map/` | **Global regulation map**, v1.0.31 | Not legacy coverage map |
| `/countries/` | 18 cards (unchanged) | OK |
| `/compare/` | v1.0.31 (unchanged) | OK |
| `/jurisdictions/france/` | T080 profile (unchanged) | OK |

## Live evidence — cache-busted URLs

Query param `?t=T080B` with `Cache-Control: no-cache`:

| URL | Result |
|-----|--------|
| `/?t=T080B` | v1.0.31, Jurisdiction profile, Regulation records |
| `/tracker/?t=T080B` | v1.0.31, Product tracker dashboard (T080) |
| `/map/?t=T080B` | Global regulation map, v1.0.31 |

`npm run smoke:live-routes` — **PASS** (all three routes).

## Deploy

| Field | Value |
|-------|-------|
| Production deploy (T080A) | `DEPLOY-20260522-050`, commit `1b50fcd`, run [26295890931](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26295890931) |
| T080B redeploy | **Not required** — artifact already correct |
| T080B commit | Docs + `smoke:live-routes` only |

## Validation

| Command | Result |
|---------|--------|
| `git diff --check` | PASS |
| `npm run validate:public-route-consistency` | PASS |
| `npm run validate:public-export-consistency` | PASS |
| `npm run build` | PASS |
| `npm run verify:dist` | PASS |
| `npm run smoke:live-routes` | PASS |

## Safety

No Supabase writes, Worker deploy, cron, secrets, or gates opened.

## Operator guidance

If an external check still shows v1.0.29:

1. Re-run after **10+ minutes** from last deploy, or use cache-busted URL (`?t=<unique>`).
2. Confirm checker targets **https://regulation-watch.caesar.no/** (not an old report or DEPLOY-049-only assumption).
3. Run `npm run smoke:live-routes` from this repo.
