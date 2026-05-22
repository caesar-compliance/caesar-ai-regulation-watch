# T079 — Validation

## Preflight

- [x] Worker routes: `/healthz`, `/readyz`, `/version`, `/last-run`, `/run-pilot`, `/run/:sourceKey`
- [x] Bearer auth on mutation endpoints
- [x] Cron gated by `REGWATCH_ENABLE_SCHEDULED_MONITORING` (default false)
- [x] No secrets in tracked files

## Worker smoke (dev)

- [x] `GET /healthz` → 200
- [x] `GET /readyz` → 200 (after RUN_TOKEN set)
- [x] `GET /version` → 1.0.30
- [x] `POST /run-pilot` without token → 401
- [x] `POST /run-pilot?dry_run=true` → success, no persistence
- [x] `POST /run-pilot` write → EDPB + EDPS RSS, Supabase `source_runs` + `runtime_events`

## Repo validation (run on branch before merge)

```bash
git diff --check
npm run validate:source-registry
npm run validate:automation-runtime
npm run validate:runtime-services-readiness
npm run validate:runtime-db-health
npm run validate:monitoring-output
npm run validate:public-export-consistency
cd ops/cloudflare-workers/regulation-watch-monitor && npm run typecheck
npm run build
npm run verify:dist
```

## Live smoke (after static deploy)

- `/`, `/tracker/`, `/map/`, `/runtime-health/`, `/runtime-services/`
- `/data/runtime-monitoring-status.json` — `backend_monitoring_mvp_worker_run`, `worker_deployed: true`
- Worker `/healthz`, `/readyz`, `/version`, `/last-run`, unauthorized `POST /run-pilot`
