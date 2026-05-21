# T075A — Controlled source pilot framework

## Status

- **Merged:** fast-forward to `main` at `1d18a6c` (21 May 2026).
- **Released:** `v1.0.23` — release commit `0024497`, tag `regulation-watch-v1.0.23`.
- **Deployed:** `DEPLOY-20260521-041` — run [26242192121](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26242192121), deployed commit `0024497`.
- **Docs tip after tag:** closeout docs commit on `main` (post-deploy; tag remains on release commit per repo convention).

## Delivered

- Controlled pilot registry (2 sources: `edpb-publications-rss`, `edps-news-rss`; metadata-only, network disabled)
- Registry + status schemas and validators
- Fixture adapter, snapshot builder, dry-run runner
- Public `source-pilot-status.json` and `/source-pilot/` page
- `automation-runtime` status `source_pilot_framework_ready`

## Safety (verified at closeout)

- No secrets committed; no `.env.runtime.local`
- No HTTP client usage in source-pilot scripts; fixtures only
- `stores_metadata_only: true`, `stores_full_text: false` on all registry sources
- Runtime flags: `live_ingestion_enabled`, `scheduled_monitoring_enabled`, `network_execution_enabled` — all false
- Evidence/publication gates — all false in registry, status export, and automation-runtime
- Supabase schema not applied; DB health `not_configured`
- `monitoring-cycle.yml` — `workflow_dispatch` only (no cron)
- No fix commit required on feature branch

## Live smoke (21 May 2026)

All routes HTTP 200: `/`, `/automation/`, `/runtime-health/`, `/source-pilot/`, manifest, runtime-db-health, source-pilot-status, regulation-watch-snapshot. Live manifest version `1.0.23`; snapshot policy counts remain 0.

## Next

- **T075B** — connect pilot snapshots/detected changes to Supabase runtime when credentials available
- **T075C** — improve offline reviewer/operator UI around source pilot candidates (if Supabase not yet configured)
- **T076+** — explicit controlled network check after Control Tower approval
