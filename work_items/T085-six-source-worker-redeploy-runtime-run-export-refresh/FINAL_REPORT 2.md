# T085 — Final Report

**Release:** v1.0.36 — Six-Source Worker Runtime Run  
**Date:** 22 May 2026

## Git / release

| Field | Value |
|---|---|
| Starting HEAD | `3c50f3a` |
| Duplicate cleanup | Removed **622** untracked macOS `* 2.*` artifacts |
| Branch | `task/T085-six-source-worker-redeploy-runtime-run-export-refresh` |
| Tag | `regulation-watch-v1.0.36` (pending push) |
| Package version | `1.0.36` |

## Worker deployment

| Field | Value |
|---|---|
| Method | Local `npx wrangler@3 deploy` |
| Worker | `regulation-watch-monitor-dev` |
| URL | `https://regulation-watch-monitor-dev.nazzarkoartem.workers.dev` |
| Version ID | `ce915d1c-9f29-43f0-9e3a-2463f20ddf18` |
| Deployed commit (GIT_SHA var) | `3c50f3a` → updated after merge |
| `/version` | `1.0.36`, `backend_mvp: T085` |
| Cron | Not enabled |

## Worker smoke

| Step | Result |
|---|---|
| GET /healthz | 200 |
| GET /readyz | 200 |
| GET /version | 200 — v1.0.36 |
| GET /last-run | 200 |
| POST /run-pilot (no auth) | 401 |
| POST /run-pilot dry_run | 200 — 6 sources |
| POST /run-pilot write | 200 — 2 complete, 4 error (409 insert) |

### Write run source breakdown

| Source | Status | Notes |
|---|---|---|
| edpb-publications-rss | complete | 10 items |
| edps-news-rss | complete | 10 items |
| eu-digital-strategy-ai-framework | error | source_runs insert 409 |
| us-nist-ai-rmf | error | source_runs insert 409 |
| france-cnil-ai-fr | error | source_runs insert 409 |
| uk-dsit-organisation | error | source_runs insert 409 |

## Supabase counts (dev)

| Table | Before | After |
|---|---|---|
| source_runs | 5 | 7 |
| source_items | 20 | 21 |
| detected_changes | 20 | 20 |
| review_candidates | 20 | 20 |
| runtime_events | 3 | 5 |

## Ingress / queue (unchanged rules)

| Metric | Count |
|---|---|
| Operator-visible | 4 |
| Suppressed noise | 16 |
| Total cards | 20 |

## Public export

- `runtime-monitoring-status.json` — T085 worker fields, `backend_mvp: T085`, `worker_version: 1.0.36`
- Refreshed ingress, review queue, source freshness, tracker summary

## Static deploy

| Field | Value |
|---|---|
| Workflow | `deploy-static-site.yml` |
| Run ID | _(fill after `gh workflow run`)_ |

## Safety

- Cron / scheduled monitoring: **disabled**
- Broad crawling / competitor copying: **none**
- Metadata-only / no full legal text: **yes**
- Secrets / `.env.*.local` / `.local/`: **not committed**
- Protected gates: **all closed**
