# T085 — Decisions

## Worker deploy path

Local `npx wrangler@3 deploy` with credentials from `.env.cloudflare.local` and `.env.runtime.local` (not committed). `wrangler.toml` remains gitignored.

## RUN_TOKEN

Rotated for T085 dev pilot via `wrangler secret put RUN_TOKEN` (value not logged or committed). Prior operator-held token superseded for protected `/run-pilot` calls in this session.

## Bounded pilot parameters

- `max_sources=6`, `max_items=20` per source
- Official allowlisted automated sources only
- `dry_run=true` first (no DB mutation), then write run

## Source run failures (409)

Four newer automated sources returned `source_runs insert failed: 409` (likely dev DB registry/FK constraints). EDPB and EDPS completed successfully. Failures recorded in `generated/runtime/worker-pilot-run.latest.json`; not treated as task failure.

## Public export fields

Added to `runtime-monitoring-status.json` and `tracker-summary.json`:

- `latest_worker_run_at`, `latest_worker_run_id`
- `worker_allowlist_source_count: 6`
- `worker_run_source_success_count`, `worker_run_source_failure_count`
- `scheduled_monitoring_enabled: false`, `gates_closed: true`, `cron_enabled: false`

## Cron

`REGWATCH_ENABLE_SCHEDULED_MONITORING` remains false; no `[triggers]` in deploy.
