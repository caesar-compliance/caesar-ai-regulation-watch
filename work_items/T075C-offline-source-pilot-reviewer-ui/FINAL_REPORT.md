# T075C — Offline source pilot reviewer UI

## Status

- **Branch:** `task/T075C-offline-source-pilot-reviewer-ui`
- **Merged:** fast-forward to `main` at `b46a1af` (21 May 2026)
- **Released:** `v1.0.24` — release commit `8124799`, tag `regulation-watch-v1.0.24`
- **Deployed:** `DEPLOY-20260521-042` — run [26242929134](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26242929134), deployed commit `8124799`
- **Docs tip after tag:** closeout docs commit on `main` (post-deploy; tag remains on release commit per repo convention)

## Delivered

- Offline review candidate export (`source-pilot-review-candidates.json`) from fixture diffs
- Schema + validator with safety invariants (no gates true, no forbidden keys)
- Build script `build:source-pilot-review-candidates`
- Enhanced `/source-pilot/` overview and `/source-pilot/review/` filter table (All, pending_review, needs_source_verification, blocked_no_network, ready_for_manual_inspection)
- `automation-runtime` status `source_pilot_reviewer_ready`

## Safety (verified at closeout)

- No secrets committed; local `.env.runtime.local` present but not tracked
- No HTTP client usage in source-pilot build/validate paths; fixtures only
- Review candidates metadata-only (1 candidate, 2 sources); no full legal text, raw body, or legal conclusions
- Runtime flags: `live_ingestion_enabled`, `scheduled_monitoring_enabled`, `network_execution_enabled` — all false
- Evidence/publication gates — all false in exports and automation-runtime
- Supabase schema not applied; DB health `not_configured`
- `monitoring-cycle.yml` — `workflow_dispatch` only (no cron)
- No fix commit required on feature branch

## Live smoke (21 May 2026)

All routes HTTP 200: `/`, `/automation/`, `/runtime-health/`, `/source-pilot/`, `/source-pilot/review/`, manifest, runtime-db-health, source-pilot-status, source-pilot-review-candidates, regulation-watch-snapshot. Live manifest version `1.0.24`; `verified_on_source_approved_count` 0; DB health `not_configured`.

## Next

- **T075D** — offline review decision packet/export when Supabase credentials unavailable
- **T075B** — connect pilot snapshots/review candidates to Supabase runtime when credentials available
- **T076+** — explicit controlled network check after Control Tower approval
