# T084 — Validation

```bash
git diff --check
npm run validate:source-registry
npm run validate:operator-decisions
npm run validate:review-queue
npm run validate:source-freshness
npm run validate:signal-quality
npm run validate:ingress-filtering
npm run validate:automation-runtime
npm run validate:runtime-services-readiness
npm run validate:runtime-db-health
npm run validate:monitoring-output
npm run validate:public-export-consistency
npm run build
npm run verify:dist
npm run validate:public-route-consistency
# after deploy:
npm run smoke:live-routes
```

## Expected ingress (pilot data)

- 20 total candidates
- ~16 `suppress_noise`, 0 duplicate suppress (pilot)
- 4 operator-visible queue cards
- 6 automated / 19 manual in registry normalize (25 total)
