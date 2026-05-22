# T085A — Final Report

**Release:** v1.0.36 (no bump) — Public export / static consistency hotfix  
**Date:** 22 May 2026

## Git / release

| Field | Value |
|---|---|
| Starting main HEAD | `730d669` |
| Branch | `hotfix/T085A-v1.0.36-public-export-static-consistency` |
| Final commit | `8eb3dbe` |
| Final main HEAD | `8eb3dbe` |
| Package version | `1.0.36` |

## Root cause

| Issue | Detail |
|---|---|
| Stale CI snapshot | `data/runtime/public-export-snapshot/` still T078 (5 `source_runs`, 3 events, no redeploy fields) |
| Export builder bug | `buildFromSnapshot` called `workerRunRollup([], null)`, zeroing success/failure counts |
| Deploy path | Static deploy without Supabase rebuilt exports from snapshot → live JSON showed `1.0.36` label but T078-era worker metrics |

HTML routes (`/`, `/tracker/`, `/runtime-health/`) were already v1.0.36 / T085-first after DEPLOY-20260522-058; gap was **runtime JSON metrics** on CDN.

## Fix

- Refreshed snapshot payloads + `worker-pilot-run.payload.json` (2 ok / 4 handled errors, 7 runs, 5 events, `worker_redeployed`)
- `buildFromSnapshot` passes snapshot runs; `workerRunRollup` preserves payload counts
- `refresh:public-export-snapshot`, `validate:public-export-snapshot`
- Stricter `validate:public-export-consistency`, `verify:dist`, `smoke:live-routes` for T085 worker fields

## Worker

**Not touched** — backend/Worker already correct per T085; hotfix is static export / snapshot only.

## Static deploy

| Field | Value |
|---|---|
| Workflow | `Deploy static site` |
| Run ID | `26302078440` |
| Trigger | `confirm_disclaimers=DEPLOY` |
| Result | success (~38s) |

## Live before / after (`runtime-monitoring-status.json`, no cache bust)

| Field | Before | After |
|---|---|---|
| `product_version` | 1.0.36 | 1.0.36 |
| `backend_mvp` | T085 | T085 |
| `source_runs_count` | 5 | **7** |
| `worker_run_source_success_count` | 0 | **2** |
| `worker_run_source_failure_count` | 0 | **4** |
| `worker_redeployed` | undefined | **true** |
| `runtime_events_recent` | 3 | **5** |

## Route smoke (cache-busted + normal)

| Route | Result |
|---|---|
| `/` | v1.0.36, T085 before T084, gates closed, cron disabled |
| `/tracker/` | T085 / T084 / T083 / T082 ordering OK |
| `/runtime-health/` | T085 + T084 validators OK |
| `/data/ingress-filter-summary.json` | `product_version` 1.0.36, 4 visible / 16 suppressed |
| `/data/tracker-summary.json` | `product_version` 1.0.36, `backend_mvp` T085 |
| `/data/runtime-monitoring-status.json` | runs=7, ok=2, err=4 |

`npm run smoke:live-routes` — **PASS** (normal and `?t=` bust).

## Validation

All requested validators + `npm run build` + `npm run verify:dist` — **PASS** on `8eb3dbe`.

## Safety

| Check | Status |
|---|---|
| Cron enabled | No |
| Secrets committed | No |
| Gates opened | No (closed) |
| Broad crawling | No |
| Full legal text stored | No |
