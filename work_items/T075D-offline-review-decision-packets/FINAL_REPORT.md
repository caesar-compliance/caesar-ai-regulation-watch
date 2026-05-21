# T075D — Offline review decision packets

## Status

- **Branch:** `task/T075D-offline-review-decision-packets`
- **Accepted commit:** `e6fa1ff`
- **Merged:** fast-forward to `main` at `e6fa1ff` (21 May 2026)
- **Released:** `v1.0.25` — release commit `0f8091d`, tag `regulation-watch-v1.0.25`
- **Deployed:** `DEPLOY-20260521-043` — run [26243535039](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26243535039), deployed commit `0f8091d`
- **Docs tip after tag:** closeout docs commit on `main` (post-deploy; tag remains on release commit per repo convention)

## Delivered

- Offline decision packet export (`source-pilot-decision-packets.json`) from review candidates
- Schema + validator with safety invariants (no gates true, no forbidden keys)
- Build script `build:source-pilot-decision-packets`
- `/source-pilot/decision-packets/` operator UI with checklist (5 items) and decision placeholders (4 options)
- `automation-runtime` status `source_pilot_decision_packets_ready`

## Safety (verified at closeout)

- No secrets committed
- No HTTP client usage in source-pilot build/validate paths; fixtures only
- Decision packets metadata-only (1 packet, 1 candidate, 2 sources); no full legal text, raw body, or legal conclusions
- Packet status `blocked_no_supabase`; all safety/runtime gates false
- Runtime flags: `live_ingestion_enabled`, `scheduled_monitoring_enabled`, `network_execution_enabled` — all false
- Evidence/publication gates — all false in exports and automation-runtime
- Supabase schema not applied; DB health `not_configured`
- `monitoring-cycle.yml` — `workflow_dispatch` only (no cron)
- No fix commit required on feature branch

## Live smoke (21 May 2026)

All routes HTTP 200: `/`, `/automation/`, `/runtime-health/`, `/source-pilot/`, `/source-pilot/review/`, `/source-pilot/decision-packets/`, manifest, runtime-db-health, source-pilot-status, source-pilot-review-candidates, source-pilot-decision-packets, regulation-watch-snapshot. Live manifest version `1.0.25`; status `source_pilot_decision_packets_ready`; `verified_on_source_approved_count` 0; DB health `not_configured`.

## Next

- **T075E** — offline export/report polish when Supabase credentials unavailable
- **T075B** — connect pilot snapshots/review candidates/decision packets to Supabase runtime when credentials available
- **T076+** — explicit controlled network check after Control Tower approval
