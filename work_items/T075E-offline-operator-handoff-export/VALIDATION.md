# T075E — Validation

```bash
npm ci
npm run validate:automation-runtime
npm run build:automation-runtime-manifest
npm run validate:runtime-db-health
npm run runtime:db:health
npm run validate:source-pilot-registry
npm run build:source-pilot-status
npm run runtime:source-pilot:dry-run
npm run validate:source-pilot-status
npm run build:source-pilot-review-candidates
npm run validate:source-pilot-review-candidates
npm run build:source-pilot-decision-packets
npm run validate:source-pilot-decision-packets
npm run build:source-pilot-operator-handoff
npm run validate:source-pilot-operator-handoff
npm run validate:data
npm run generate:exports
npm run build:custom-domain
npm run verify:dist
git diff --check
```

Syntax:

```bash
find scripts ops src -name "*.mjs" -o -name "*.js" | xargs -I{} node --check {}
```

Safety greps (no true flags; no fetch in source-pilot paths).
