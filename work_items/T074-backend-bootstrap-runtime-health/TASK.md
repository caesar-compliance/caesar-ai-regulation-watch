# T074 — Backend bootstrap & runtime health

Bootstrap Supabase/Postgres runtime tooling without enabling live scheduled monitoring or broad ingestion.

## Deliverables

- `.env.runtime.example` and `ops/supabase/README.md`
- `scripts/runtime/check-runtime-db-health.mjs` + public `runtime-db-health.json`
- `scripts/runtime/apply-supabase-schema.mjs` (explicit local flag only)
- `/runtime-health/` static page
- Reconcile `monitoring-cycle.yml` — no cron schedule
- Runtime status `backend_bootstrap_ready`; all safety flags false

## Out of scope

- Worker deploy, live ingestion, scheduled monitoring, schema apply without credentials
