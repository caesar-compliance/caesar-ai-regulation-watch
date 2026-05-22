# T086A — Validation

**Date:** 22 May 2026

## State guard

- [x] `main` at `9a88040` (≥ T086 final)
- [x] Package `1.0.37`, tag `regulation-watch-v1.0.37`
- [x] `public/data/runtime-monitoring-status.json` — T086 aligned, 13 runs, 6/0 worker
- [x] `public/data/ingress-filter-summary.json` — `product_version` 1.0.37
- [x] `public/data/tracker-summary.json` — `backend_mvp` T086

## Local build / dist

- [x] `npm run build` — PASS
- [x] `npm run verify:dist` — PASS (v1.0.37, no stale v1.0.36 as current release)
- [x] `dist/data/runtime-monitoring-status.json` — `product_version` 1.0.37, `source_runs_count` 13, aligned, 6/0
- [x] `dist/index.html` — T086 banner before T085, v1.0.37

## Validators (full suite)

- [x] `validate:source-registry`
- [x] `validate:runtime-source-registry-alignment`
- [x] `validate:operator-decisions`
- [x] `validate:review-queue`
- [x] `validate:source-freshness`
- [x] `validate:signal-quality`
- [x] `validate:ingress-filtering` (4 visible / 16 suppressed)
- [x] `validate:automation-runtime`
- [x] `validate:runtime-services-readiness`
- [x] `validate:runtime-db-health`
- [x] `validate:monitoring-output`
- [x] `validate:public-export-consistency`
- [x] `validate:public-route-consistency`
- [x] `validate:public-export-snapshot`
- [x] `git diff --check` — clean (no conflict markers in tracked files)

## Live (canonical)

- [x] `npm run smoke:live-routes` — PASS (cache-busted, v1.0.37 / T086)
- [x] Manual cache-busted JSON — `product_version` 1.0.37, runs=13, ok=6, err=0, aligned

## Deploy

- [x] **No redeploy required** — live already matches `DEPLOY-20260522-060` artifact
