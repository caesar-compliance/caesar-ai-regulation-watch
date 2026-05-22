# T085A — v1.0.36 Public Export and Static Route Consistency Hotfix

**Date:** 22 May 2026  
**Branch:** `hotfix/T085A-v1.0.36-public-export-static-consistency`  
**Version:** 1.0.36 (no bump)

## Problem

T085 v1.0.36 is on main after DEPLOY-20260522-058, but external checks showed:

- Live `runtime-monitoring-status.json` with `product_version` 1.0.36 but stale T078 snapshot metrics (`source_runs_count` 5, worker success/fail 0/0, 3 runtime events).
- CI/static deploy without Supabase credentials rebuilds exports from `data/runtime/public-export-snapshot/`, which was still T078-era (5 runs, no T085 redeploy fields).
- `buildFromSnapshot` overwrote committed worker rollup counts when no `generated/runtime/worker-pilot-run.latest.json` was present.

## Root cause

1. Snapshot payloads not refreshed after T085 DB export refresh.
2. `workerRunRollup([], null)` clobbered snapshot success/failure counts during no-DB builds.
3. Missing validators for T085 worker metrics on snapshot, public JSON, dist, and live smoke.

## Scope

- Refresh `data/runtime/public-export-snapshot/*` to T085 v1.0.36 state (7 source runs, 5 events, 2/4 worker outcomes, redeployed).
- Add `worker-pilot-run.payload.json` for CI fallback.
- Fix `buildFromSnapshot` / `workerRunRollup` to preserve T085 counts.
- Add `validate:public-export-snapshot`, extend export/dist/live validators.
- Redeploy static site; smoke live routes (normal + cache-busted).

## Out of scope

- New sources, Worker redeploy, cron, secrets, gate openings, Supabase writes (except re-read already committed exports for snapshot refresh).
