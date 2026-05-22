# T086 — Validation

## Preflight

- [x] `main` at `f5d351d` (T085A)
- [x] `npm run build`, `verify:dist`, `smoke:live-routes` (v1.0.36 live) before changes

## DB alignment

- [x] `npm run runtime:align-dev-source-registry` — 4 upserted, 2 present, 6/6 automated in DB
- [x] `npm run validate:runtime-source-registry-alignment`

## Write verify

- [x] `node scripts/runtime/run-local-six-source-write-verify.mjs` — 6/6 OK, 0 FK errors
- [ ] `npm run runtime:worker-pilot:smoke` — skipped (no `RUN_TOKEN` in local env files)

## Build / validators

- [x] `npm run build`
- [x] `npm run verify:dist`
- [x] `validate:source-registry`, `validate:ingress-filtering`, `validate:automation-runtime`, `validate:public-export-consistency`, `validate:public-route-consistency`

## Post-deploy (pending)

- [ ] `npm run smoke:live-routes` (v1.0.37)
- [ ] Live JSON: `db_registry_alignment_status: aligned`, `no_registry_fk_error_count: 0`
