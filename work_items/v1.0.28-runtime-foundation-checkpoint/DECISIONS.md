# v1.0.28 — Decisions

## Runtime status label

- **`runtime_foundation_ready`** — Supabase dev runtime and Cloudflare Worker foundation exist on `main` (post-T076A activation commits); tracked exports reflect readiness; real automated tracker remains disabled.

## Deployment

- **Checkpoint only** — no `deploy-static-site` workflow run in this release. Live public site stays at v1.0.27 until Control Tower approves a deploy.

## Prior release

- **v1.0.27 / T076A** — `services_onboarding_ready`; free-tier credential presence and `/runtime-services/` (deployed 21 May 2026).

## Gates (unchanged)

All remain **false** unless explicitly approved:

- `live_ingestion_enabled`, `scheduled_monitoring_enabled`, `network_execution_enabled`
- `regwatch_apply_supabase_schema`, `regwatch_enable_live_ingestion`, `regwatch_enable_scheduled_monitoring`, `regwatch_enable_network_execution`
- `cloudflare_enable_worker_deploy`, `cloudflare_enable_cron_trigger`
- Evidence/publication gates in automation-runtime and snapshot exports
