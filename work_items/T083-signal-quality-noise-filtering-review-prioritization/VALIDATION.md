# T083 — Validation

```bash
git diff --check
npm run validate:operator-decisions
npm run validate:review-queue
npm run validate:source-freshness
npm run validate:signal-quality
npm run validate:source-registry
npm run validate:automation-runtime
npm run validate:runtime-services-readiness
npm run validate:runtime-db-health
npm run validate:monitoring-output
npm run validate:public-export-consistency
npm run build
npm run verify:dist
```

Post-deploy:

```bash
npm run smoke:live-routes
```

## validate:signal-quality failures

- `signal_score` outside 0–100
- Unknown relevance, category, or recommended action
- Missing `reason_codes`
- All non-operator candidates still high priority without variety
- Noise presented as binding legal change
- Protected gates true
- Missing rules file
- `signal-quality-summary.json` counts diverge from queue cards
