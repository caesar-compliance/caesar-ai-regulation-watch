# T078A validation

```bash
git diff --check
npm run validate:source-registry
npm run validate:automation-runtime
npm run validate:runtime-services-readiness
npm run validate:runtime-db-health
npm run validate:monitoring-output
npm run validate:public-export-consistency
# CI-like export (no DB):
env -u DATABASE_URL -u SUPABASE_DB_URL node scripts/runtime/build-runtime-public-export.mjs
npm run validate:public-export-consistency
npm run build
npm run verify:dist
```

Expected after CI-like export:

- `runtime-monitoring-status.status` = `backend_smoke_passed_public_export_ready`
- `monitored_source_count` = 9, `automated_rss_source_count` = 2
- `detected_changes_count` = 20, `review_candidates_count` = 20
