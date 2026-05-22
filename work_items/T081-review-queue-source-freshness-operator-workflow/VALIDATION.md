# T081 — Validation

## Commands (minimum)

```bash
git diff --check
npm run validate:source-registry
npm run validate:automation-runtime
npm run validate:runtime-services-readiness
npm run validate:runtime-db-health
npm run validate:monitoring-output
npm run validate:public-export-consistency
npm run validate:public-route-consistency
npm run validate:review-queue
npm run validate:source-freshness
npm run build
npm run verify:dist
```

## Checks

- Review queue card count matches `regulation-review-candidates.json` and `tracker-summary.review_candidates_count`
- Source freshness row count matches monitoring registry (25 sources)
- No gate keys true in public exports
- No forbidden full-text keys in exports
- Built pages show v1.0.32 and T081 sections
