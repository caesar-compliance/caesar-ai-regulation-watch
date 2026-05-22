# T078A — Public export and homepage consistency hotfix

**Date:** 22 May 2026  
**Version:** v1.0.29 (hotfix, no semver bump)  
**Branch:** `hotfix/T078A-public-export-homepage-consistency`

## Problem

After T078 deploy (`DEPLOY-20260522-046`), live pages were inconsistent:

- `/tracker/` and `/runtime-health/` showed v1.0.29 branding but monitoring counts were zero.
- `/data/runtime-monitoring-status.json` on live showed `not_configured` (CI rebuild without Supabase).
- Homepage footer already v1.0.29 on live; stale docs still referenced v1.0.27.

## Root cause

`npm run build` runs `build:runtime-public-export` on GitHub Pages without `.env.runtime.local`, overwriting committed T078 pilot JSON with `not_configured` and empty change/candidate arrays.

## Scope

- Committed T078 smoke snapshot under `data/runtime/public-export-snapshot/`.
- Snapshot fallback in `build-runtime-public-export.mjs`.
- Status semantics: `backend_monitoring_mvp`, `backend_smoke_passed_public_export_ready`, `backend_smoke_passed_public_export_pending`.
- `validate:public-export-consistency` guard.
- Tracker/runtime-health count display fixes.

## Out of scope

Supabase schema apply, Worker deploy, cron, live ingestion, secrets in repo.
