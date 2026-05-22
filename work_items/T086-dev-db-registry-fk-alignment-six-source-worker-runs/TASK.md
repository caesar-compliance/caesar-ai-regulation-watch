# T086 — Dev DB Registry/FK Alignment for Six-Source Worker Runs

**Branch:** `task/T086-dev-db-registry-fk-alignment-six-source-worker-runs`  
**Version:** `1.0.37` — Six-Source Runtime DB Alignment  
**Tag:** `regulation-watch-v1.0.37`

## Problem

T085 six-source Worker write run: 2 success (`edpb-publications-rss`, `edps-news-rss`), 4 errors with `source_runs insert failed: 409` for keys added in T084 but missing from dev `regulation_sources`.

## Goal

Align dev DB registry for all 6 automated pilot keys; bounded write path succeeds without FK/registry 409s; public exports and UI reflect T086 alignment.

## Scope

- Idempotent `regulation_sources` upsert (script + SQL + Worker defensive upsert)
- Validators and public export fields for alignment status
- No cron, no gate changes, metadata-only
