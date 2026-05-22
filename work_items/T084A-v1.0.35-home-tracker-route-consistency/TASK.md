# T084A — v1.0.35 Home/Tracker Route Consistency Hotfix

**Date:** 22 May 2026  
**Branch:** `hotfix/T084A-v1.0.35-home-tracker-route-consistency`  
**Version:** 1.0.35 (no bump)

## Problem

T084 v1.0.35 is partially live per external checks: `/review-queue/`, `/sources/`, `/runtime-health/`, and `ingress-filter-summary.json` show T084, while `/` and `/tracker/` were reported as still showing v1.0.29 / T078/T050 copy (13 jurisdictions, 9 sources, 0 automated RSS, `not_configured`).

## Investigation

- **main** at `c42b500` (T084 final) — local `npm run build`, `verify:dist`, and cache-busted `smoke:live-routes` already **PASS** for `/` and `/tracker/` with v1.0.35 / T084 markers.
- Non-cache-busted live fetch (22 May 2026) also shows v1.0.35 on `/` and `/tracker/` — external v1.0.29 reports are **stale checks** (pre-DEPLOY-20260522-056 or CDN/browser cache).

## Scope

- Foreground explicit T084 counts on `/` lead and banner: 25 sources, 6 automated, 19 manual-review, 4 visible, 16 suppressed, gates closed, cron disabled.
- `/tracker/` ingress section: source counts, `/sources/` + `/runtime-health/` links, gates closed.
- Harden `validate:public-route-consistency`, `verify:dist`, `smoke:live-routes` so root/tracker cannot lag ingress-filter-summary at 1.0.35.
- Redeploy static site after copy/validator hardening.

## Out of scope

- New source expansion, Supabase writes, Worker deploy, cron, secrets, gate openings.
