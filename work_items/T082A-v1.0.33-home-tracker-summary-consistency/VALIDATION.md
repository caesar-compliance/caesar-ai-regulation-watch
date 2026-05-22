# T082A — Validation

```bash
git diff --check
npm run validate:operator-decisions
npm run validate:review-queue
npm run validate:source-freshness
npm run validate:public-export-consistency
npm run validate:public-route-consistency
npm run build
npm run verify:dist
npm run smoke:live-routes   # after deploy
```

Dist must include on `index.html`: `v1.0.33`, `T082 Operator Decision Workflow`, operator decision counts.

Dist must include on `tracker/index.html`: `Operator review pipeline (T082)` before `Coverage dashboard (T080)`, `not legal verification`.
