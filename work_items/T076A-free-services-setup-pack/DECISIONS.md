# T076A — Decisions

## Account allocation

- Regulation Watch uses **Account A** per hub `EXTERNAL_SERVICES_ACCOUNT_POLICY.md`.
- Exact emails remain in hub `.local/` only — not copied into tracked Regulation Watch files.

## Readiness vs connectivity

- `runtime-services-readiness.json` reports **credential presence** only, not Supabase TCP health or Worker deploy state.
- DB connectivity remains on `/runtime-health/` via `runtime-db-health.json`.

## No new source-pilot UI

- Per Control Tower direction: stop expanding offline source-pilot surfaces unless required.
- Single new operator page: `/runtime-services/`.

## Uptime

- UptimeRobot (or equivalent) is manual external setup; `uptime_manual_setup_required` stays true in export until operator configures monitors.

## Status progression

- `automation-runtime.yml` status → `services_onboarding_ready` (pack shipped; services not necessarily connected).
