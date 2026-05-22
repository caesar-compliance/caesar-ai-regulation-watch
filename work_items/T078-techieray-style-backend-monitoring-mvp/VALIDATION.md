# T078 — Validation

## Commands (22 May 2026)

| Command | Result |
|---------|--------|
| `git diff --check` | PASS |
| `npm run validate:source-registry` | PASS (9 sources, 2 automated) |
| `npm run validate:automation-runtime` | PASS |
| `npm run validate:runtime-services-readiness` | PASS |
| `npm run validate:runtime-db-health` | PASS (connected) |
| `npm run validate:monitoring-output` | PASS (6 files) |
| `npm run build` | PASS |
| `npm run verify:dist` | PASS (v1.0.29) |
| `npm run runtime:monitoring-pilot:dry-run` | PASS |
| `npm run runtime:monitoring-pilot:write` | PASS (2 RSS, 20 changes, 20 candidates) |
| Worker `npm run typecheck` | PASS |

## Supabase smoke

- `source_runs`: 2 completed pilot runs
- `source_items`: 20 items (10 per feed)
- `detected_changes`: 20 (first-run adds)
- `review_candidates`: 20
- `runtime_events`: 1 `monitoring_pilot_run`

## Worker deployment

- Local `wrangler.toml` not present (example only) — dev worker redeploy deferred to operator with existing dev activation workflow.

## Static deployment

- Pending merge/tag and `deploy-static-site` workflow with `confirm_disclaimers=DEPLOY`.
