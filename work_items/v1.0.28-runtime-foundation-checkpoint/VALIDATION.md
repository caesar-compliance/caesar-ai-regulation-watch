# v1.0.28 — Validation

```bash
git diff --check
npm run validate:runtime-services-readiness
npm run validate:runtime-db-health
npm run validate:automation-runtime
npm run verify:dist
npm run build
```

Optional after build:

```bash
npm run build:automation-runtime-manifest
```
