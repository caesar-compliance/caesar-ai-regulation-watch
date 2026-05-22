# T080A — Validation

## Pre-merge

- [ ] `git diff --check`
- [ ] `npm run validate:source-registry`
- [ ] `npm run validate:automation-runtime`
- [ ] `npm run validate:runtime-services-readiness`
- [ ] `npm run validate:runtime-db-health`
- [ ] `npm run validate:monitoring-output`
- [ ] `npm run validate:public-export-consistency`
- [ ] `npm run build`
- [ ] `npm run verify:dist`
- [ ] `npm run validate:public-route-consistency`

## Post-deploy smoke

- [ ] `/` — v1.0.31, T080 stats, 18 profile cards
- [ ] `/tracker/` — T080 dashboard counts match `tracker-summary.json`
- [ ] `/map/` — T080 map (filters, meters), v1.0.31 footer
- [ ] `/countries/`, `/compare/`, `/jurisdictions/france/` unchanged
- [ ] Public JSON endpoints 200
