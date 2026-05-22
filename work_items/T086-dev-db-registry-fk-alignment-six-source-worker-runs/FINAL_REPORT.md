# T086 — Final Report

**Release:** v1.0.37 — Six-Source Runtime DB Alignment  
**Date:** 22 May 2026

## Git / release

| Field | Value |
|---|---|
| Starting HEAD | `f5d351d` |
| Branch | `task/T086-dev-db-registry-fk-alignment-six-source-worker-runs` |
| Final commit | *(see post-push)* |
| Tag | `regulation-watch-v1.0.37` |
| Package version | `1.0.37` |

## 409 root cause

| Item | Detail |
|---|---|
| Failing table | `source_runs` |
| Constraint | FK `source_runs.source_key` → `regulation_sources.source_key` |
| HTTP shape | `source_runs insert failed: 409` (PostgREST; missing parent row) |
| Missing keys | `eu-digital-strategy-ai-framework`, `us-nist-ai-rmf`, `france-cnil-ai-fr`, `uk-dsit-organisation` |
| Present before align | `edpb-publications-rss`, `edps-news-rss` only (2 rows in `regulation_sources`) |

## DB alignment actions

| Action | Result |
|---|---|
| `npm run runtime:align-dev-source-registry` | 4 upserted, 2 already present → **6/6** automated keys in dev DB |
| `ops/supabase/005_runtime_source_registry_alignment.sql` | Added (idempotent upsert SQL) |
| Snapshot | `data/runtime/dev-source-registry-alignment.json` |

## Worker

| Item | Status |
|---|---|
| Code | v1.0.37 — `ensureRegulationSourceRow` before `source_runs`; `source_items` upsert `on_conflict=source_key,external_id` |
| Redeploy | **Not performed** — `wrangler deploy` requires `CLOUDFLARE_API_TOKEN` (not in local env) |
| Live Worker | Still T085 v1.0.36; DB alignment sufficient for FK inserts without redeploy |

## Source-by-source write result

### Before (T085 Worker write)

| Source | Status |
|---|---|
| edpb-publications-rss | complete |
| edps-news-rss | complete |
| eu-digital-strategy-ai-framework | error (409) |
| us-nist-ai-rmf | error (409) |
| france-cnil-ai-fr | error (409) |
| uk-dsit-organisation | error (409) |

### After (T086 local REST verify — same insert path)

| Source | Status |
|---|---|
| edpb-publications-rss | complete |
| edps-news-rss | complete |
| eu-digital-strategy-ai-framework | complete |
| us-nist-ai-rmf | complete |
| france-cnil-ai-fr | complete |
| uk-dsit-organisation | complete |

**Summary:** 6 attempted · 6 success · 0 failure · **0 registry/FK errors**

## Supabase counts (dev)

| Table | Before T086 | After align + verify |
|---|---|---|
| regulation_sources | 2 | 6 (automated keys) |
| source_runs | 7 | 13 |
| source_items | 21 | 21 |
| detected_changes | 20 | 20 |
| review_candidates | 20 | 20 |
| runtime_events | 5 | 5 |

## Public export (local build)

| Field | Before | After |
|---|---|---|
| product_version | 1.0.36 | 1.0.37 |
| backend_mvp | T085 | T086 |
| db_registry_alignment_status | — | aligned |
| automated_registry_row_count | — | 6 |
| worker_run_source_success_count | 2 | 6 |
| worker_run_source_failure_count | 4 | 0 |
| no_registry_fk_error_count | — | 0 |
| Ingress visible / suppressed | 4 / 16 | 4 / 16 (unchanged) |

## Validation

| Command | Result |
|---|---|
| `npm run build` | PASS |
| `npm run verify:dist` | PASS (v1.0.37) |
| `validate:runtime-source-registry-alignment` | PASS |
| `validate:public-export-consistency` | PASS |
| `validate:ingress-filtering` | PASS (4 visible, 16 suppressed) |
| `smoke:live-routes` (pre-change) | PASS v1.0.36 |

## Deploy

| Item | Status |
|---|---|
| Static deploy run ID | *(pending `gh workflow_dispatch` after merge)* |
| Post-deploy smoke | Pending |

## Safety

- Cron / scheduled monitoring: **disabled**
- Broad crawling / competitor copying: **none**
- Metadata-only / no full legal text: **yes**
- Secrets / `.env.*.local` / `.local/`: **not committed**
- Protected gates: **all closed**
