# T080A — Validation

## Pre-merge

- [x] `git diff --check`
- [x] `npm run validate:source-registry`
- [x] `npm run validate:automation-runtime`
- [x] `npm run validate:runtime-services-readiness`
- [x] `npm run validate:runtime-db-health`
- [x] `npm run validate:monitoring-output`
- [x] `npm run validate:public-export-consistency`
- [x] `npm run build`
- [x] `npm run verify:dist`
- [x] `npm run validate:public-route-consistency`

## Post-deploy smoke

- [x] `/` — v1.0.31, T080 stats, 18 profile cards
- [x] `/tracker/` — T080 dashboard counts match `tracker-summary.json`
- [x] `/map/` — T080 map (filters, meters), v1.0.31 footer
- [x] `/countries/`, `/compare/`, `/jurisdictions/france/` unchanged
- [x] Public JSON endpoints 200
