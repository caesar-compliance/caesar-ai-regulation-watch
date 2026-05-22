# T086A — v1.0.37 Public Export and Live Release Proof/Fix

**Date:** 22 May 2026  
**Branch:** `hotfix/T086A-v1.0.37-public-export-live-release-proof`  
**Version:** 1.0.37 (no bump)

## Problem

T086 report (`DEPLOY-20260522-060`) claims v1.0.37 is live, but some external checks still showed:

- `/` → v1.0.36 / T085-first
- `runtime-monitoring-status.json` → `product_version` 1.0.36, 7 source runs, 2 success / 4 handled errors
- `ingress-filter-summary.json` → `product_version` 1.0.36

## Goal

Prove or fix so canonical public routes and JSON visibly show T086 / v1.0.37:

- `db_registry_alignment_status`: aligned
- `regulation_sources`: 6 automated rows aligned
- `source_runs_count`: 13
- 6/6 source write path success, 0 registry/FK errors
- cron disabled, gates closed

## Investigation scope

1. State guard on `main` ≥ `9a88040`
2. Local `npm run build` + `dist/` inspection
3. Live checks (normal + cache-busted) on **canonical** URL `https://regulation-watch.caesar.no/`
4. Compare non-canonical `github.io` path (301 redirect — not a valid smoke target)

## Allowed

- Docs / work item / README alignment
- Re-export snapshot only if stale (not required when `public/data` already T086)

## Not allowed

- New source expansion, Supabase writes (except re-read/re-export), Worker deploy, cron, secrets, gates opened
