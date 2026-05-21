# T074 validation

```bash
npm ci
npm run validate:automation-runtime
npm run build:automation-runtime-manifest
npm run validate:runtime-db-health
npm run runtime:db:health
npm run validate:runtime-db-health
npm run validate:data
npm run generate:exports
npm run build:custom-domain
npm run verify:dist
git diff --check
find scripts ops src -name "*.mjs" -o -name "*.js" | xargs -I{} node --check {}
```

Optional (credentials + `REGWATCH_APPLY_SUPABASE_SCHEMA=true`):

```bash
npm run runtime:supabase:apply
npm run runtime:db:health
```

Safety: `live_ingestion_enabled`, `scheduled_monitoring_enabled`, `network_execution_enabled` remain false; no secrets in public JSON.
