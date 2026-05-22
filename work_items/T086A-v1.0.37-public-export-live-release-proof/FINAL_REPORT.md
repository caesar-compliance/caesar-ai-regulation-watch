# T086A — Final Report

**Release:** v1.0.37 (no bump) — Public export / live release proof  
**Date:** 22 May 2026

## Conclusion

**No code or export fix required.** Canonical live site `https://regulation-watch.caesar.no/` already serves T086 / v1.0.37 after `DEPLOY-20260522-060`. Reported v1.0.36 drift is explained by **stale checks** (pre-deploy timing, CDN without cache bust, or non-canonical `github.io` URL which returns HTTP 301).

## Git / release

| Field | Value |
|---|---|
| Starting main HEAD | `9a88040` |
| Branch | `hotfix/T086A-v1.0.37-public-export-live-release-proof` |
| Package version | `1.0.37` |
| Prior deploy | `DEPLOY-20260522-060` — [26302698434](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26302698434) |
| T086A redeploy | **None** (live already correct) |

## Root cause (external v1.0.36 reports)

| Cause | Detail |
|---|---|
| Timing | Checks run before `DEPLOY-20260522-060` completed |
| Wrong URL | `https://caesar-compliance.github.io/caesar-ai-regulation-watch/...` → 301 HTML, not JSON |
| Cache | Normal GET without `?t=` / `Cache-Control: no-cache` may briefly show prior deploy |

## Before vs after (canonical live, cache-busted)

### `/` (root)

| Marker | Reported stale | Live now |
|---|---|---|
| Version | v1.0.36 | **v1.0.37** |
| Lead banner | T085 | **T086 Six-Source Runtime DB Alignment** (before T085) |
| Registry/FK | 2/4 worker errors implied | **6/6 aligned, 0 FK errors** (via JSON + runtime-health) |

### `/tracker/`

| Marker | Stale | Live now |
|---|---|---|
| Version | v1.0.36 | **v1.0.37** |
| T086 section | missing / secondary | **Six-source runtime alignment (T086)** present |
| T084 ingress | — | **4 visible / 16 suppressed** preserved |

### `/runtime-health/`

| Marker | Stale | Live now |
|---|---|---|
| `db_registry_alignment_status` | — / missing | **aligned** |
| `source_runs_count` | 7 | **13** |
| Worker outcomes | 2 / 4 | **6 / 0** |

### `runtime-monitoring-status.json`

| Field | Stale (reported) | Live now |
|---|---|---|
| `product_version` | 1.0.36 | **1.0.37** |
| `backend_mvp` | T085 | **T086** |
| `source_runs_count` | 7 | **13** |
| `worker_run_source_success_count` | 2 | **6** |
| `worker_run_source_failure_count` | 4 | **0** |
| `no_registry_fk_error_count` | — | **0** |
| `db_registry_alignment_status` | — | **aligned** |
| `automated_registry_row_count` | — | **6** |
| `cron_enabled` | false | **false** |
| `gates_closed` | true | **true** |

### `ingress-filter-summary.json`

| Field | Stale | Live now |
|---|---|---|
| `product_version` | 1.0.36 | **1.0.37** |
| Ingress counts | 4 / 16 | **4 / 16** (unchanged) |

### `tracker-summary.json`

| Field | Stale | Live now |
|---|---|---|
| `product_version` | 1.0.36 | **1.0.37** |
| `backend_mvp` | T085 | **T086** |
| Worker rollup | 2/4 | **6/0** |

## Local `dist/` (post-build)

Matches `public/data`: `product_version` 1.0.37, T086-first HTML, no v1.0.36 as current release label.

## Validation results

| Command | Result |
|---|---|
| `npm run build` | PASS |
| `npm run verify:dist` | PASS |
| Full validate suite (T086A checklist) | PASS |
| `npm run smoke:live-routes` | PASS — cache bust `T086-*`, runs=13, ok=6, err=0, aligned |

## Live evidence

- **Canonical base:** `https://regulation-watch.caesar.no`
- **Smoke:** `npm run smoke:live-routes` (uses cache-busted query `?t=`)
- **Non-canonical:** `github.io/.../data/runtime-monitoring-status.json` → HTTP 301 (do not use for version proof)

## Safety

| Item | Status |
|---|---|
| Worker deploy | **No** |
| Cron / scheduled monitoring | **Disabled** |
| Secrets | **None used** |
| Broad crawling / full legal text | **No** |
| Gates | **All closed** |
