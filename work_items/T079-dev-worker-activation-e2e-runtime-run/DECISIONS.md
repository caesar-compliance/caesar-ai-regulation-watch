# T079 — Decisions

## Worker deploy path

Local `npx wrangler@3 deploy` with credentials from `.env.cloudflare.local` / `.env.runtime.local` (not committed). GitHub `dev-runtime-activate.yml` remains the approved CI path for future runs.

## Supabase REST 403 fix

Worker uses PostgREST with `SUPABASE_SECRET_KEY` (`sb_secret_`). Tables created via direct Postgres lacked `GRANT` to `service_role`. Added `ops/supabase/002_service_role_grants.sql` (additive, non-destructive).

## RUN_TOKEN

Not set by CI. Operator sets `RUN_TOKEN` via `wrangler secret put` for protected mutation endpoints. `/readyz` requires both Supabase URL/key and RUN_TOKEN.

## Public export status

| Status | Meaning |
|--------|---------|
| `backend_monitoring_mvp_worker_run` | Dev Supabase export after Worker pilot run |
| `backend_monitoring_mvp` | Dev Supabase export without worker run type |
| `backend_smoke_passed_public_export_ready` | CI snapshot when DB absent at build |

## Cron

`REGWATCH_ENABLE_SCHEDULED_MONITORING` default false; no `[triggers]` in wrangler deploy for T079.
