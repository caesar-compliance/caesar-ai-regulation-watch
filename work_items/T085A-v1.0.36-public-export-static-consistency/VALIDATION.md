# T085A — Validation

```bash
git diff --check
npm run validate:public-export-snapshot
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
npm run validate:public-route-consistency
npm run build
npm run verify:dist
npm run smoke:live-routes
```

Snapshot-only export check (no DB URL in env; CI path):

```bash
env -u SUPABASE_DATABASE_URL -u DATABASE_URL npm run build:runtime-public-export
# expect source_runs_count 7, worker 2/4, backend_mvp T085
```
