# T074 decisions

- **Postgres client:** `pg` devDependency for health checks when `psql` is absent; `psql` preferred for schema apply when available.
- **Public health export:** `not_configured` is valid default; no credentials required for CI validation.
- **Schema apply:** gated by `REGWATCH_APPLY_SUPABASE_SCHEMA=true` and disabled monitoring flags; never runs in default validation.
- **Monitoring workflow:** cron removed from `monitoring-cycle.yml`; `workflow_dispatch` only; schedule guard step retained.
- **Runtime status:** `backend_bootstrap_ready` — tooling present, not production live monitoring.
- **Version:** no bump (branch-only until Control Tower release/deploy).
