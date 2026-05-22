# T080 — Validation

## Commands (22 May 2026)

```bash
git diff --check
npm run validate:source-registry
npm run validate:automation-runtime
npm run validate:runtime-services-readiness
npm run validate:runtime-db-health
npm run validate:monitoring-output
npm run validate:public-export-consistency
npm run validate:regulation-records
npm run validate:country-coverage
npm run validate:map-metrics
npm run build
npm run verify:dist
npm run runtime:monitoring-pilot:dry-run
```

## Expected

- Registry: 25 sources, 2 automated
- Public exports: 9 runtime JSON files including `regulation-records.json`, `jurisdiction-profile-cards.json`, `tracker-summary.json`
- `map_version`: T080
- No `legal_change_claimed: true` in exports
