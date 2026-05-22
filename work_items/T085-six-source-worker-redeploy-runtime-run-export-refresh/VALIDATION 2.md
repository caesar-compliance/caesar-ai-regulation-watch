# T085 — Validation

## Pre-edit

- [x] `npm run build`
- [x] `npm run smoke:live-routes` (v1.0.35 live baseline)

## Worker preflight

- [x] `PILOT_ALLOWLIST` — 6 sources
- [x] Routes: `/healthz`, `/readyz`, `/version`, `/last-run`, `POST /run-pilot`, `POST /run/:sourceKey`
- [x] Bearer auth on mutation endpoints
- [x] `REGWATCH_ENABLE_SCHEDULED_MONITORING` default false
- [x] Secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RUN_TOKEN` (names only)

## Worker smoke

- [x] `GET /healthz` → 200
- [x] `GET /readyz` → 200
- [x] `GET /version` → 1.0.36
- [x] `POST /run-pilot` no auth → 401
- [x] `POST /run-pilot?dry_run=true` → 6 sources, no persistence
- [x] `POST /run-pilot` write → 2 success, 4 handled errors

## Validators

- [x] `validate:source-registry` through `validate:public-route-consistency`
- [x] Worker `npm run typecheck`
- [x] `npm run build`, `verify:dist`

## Post-deploy (after static release)

- [ ] `npm run smoke:live-routes` (v1.0.36)
- [ ] Live Worker smoke on production URL
