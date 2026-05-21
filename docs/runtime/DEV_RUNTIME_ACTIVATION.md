# Dev runtime activation (GitHub Actions)

Workflow: `.github/workflows/dev-runtime-activate.yml`  
Environment: `dev-runtime` (secrets and variables configured in GitHub — never commit values).

## What it does

1. Validates automation runtime and data contracts  
2. Checks credential presence via `npm run runtime:services:check` (no secret values logged)  
3. Optionally applies Supabase schema (`ops/supabase/001_regulation_watch_runtime_schema.sql`) when explicitly requested  
4. Optionally deploys the Cloudflare Worker scaffold at `ops/cloudflare-workers/regulation-watch-monitor/`  
5. Sets Worker secrets (Supabase URL + service role key) without echoing values  
6. Post-deploy smoke against `/health`, `/healthz`, or `/readyz`  
7. Optional fixture dry-runs (`runtime:source-pilot:dry-run`, `monitoring:cycle:dry-run`)  
8. Optional one-shot allowlisted live metadata pilot (`monitoring:live-metadata`) when network + live flags are both YES  
9. Optional dev cron on Worker deploy when `enable_cron=YES`  
10. Writes a safe job summary (no secrets)

**Not automated:** DNS/custom routes, production deploy, recurring live ingestion, broad scraping.

## Trigger commands

Default dev activation (validation + credential check + dry-runs; deploy Worker by default):

```bash
gh workflow run dev-runtime-activate.yml \
  -f confirm=ACTIVATE_DEV_RUNTIME
```

Full deploy with defaults (Worker deploy + secrets + smoke + dry-runs):

```bash
gh workflow run dev-runtime-activate.yml \
  -f confirm=ACTIVATE_DEV_RUNTIME \
  -f deploy_worker=YES \
  -f set_worker_secrets=YES \
  -f post_deploy_smoke=YES \
  -f run_dry_ingestion=YES
```

Schema apply (dev only — requires `APPLY_SUPABASE_SCHEMA=false` in environment until run):

```bash
gh workflow run dev-runtime-activate.yml \
  -f confirm=ACTIVATE_DEV_RUNTIME \
  -f apply_schema=YES
```

Deploy only (skip dry-runs):

```bash
gh workflow run dev-runtime-activate.yml \
  -f confirm=ACTIVATE_DEV_RUNTIME \
  -f run_dry_ingestion=NO
```

Dry-run ingestion only:

```bash
gh workflow run dev-runtime-activate.yml \
  -f confirm=ACTIVATE_DEV_RUNTIME \
  -f deploy_worker=NO \
  -f set_worker_secrets=NO \
  -f post_deploy_smoke=NO
```

One-shot live metadata (allowlisted official sources; metadata-only):

```bash
gh workflow run dev-runtime-activate.yml \
  -f confirm=ACTIVATE_DEV_RUNTIME \
  -f enable_network=YES \
  -f run_live_ingestion_once=YES \
  -f deploy_worker=NO
```

Cron enable (dev Worker deploy with schedule):

```bash
gh workflow run dev-runtime-activate.yml \
  -f confirm=ACTIVATE_DEV_RUNTIME \
  -f enable_cron=YES
```

## Warnings

- `apply_schema`, `enable_cron`, `enable_network`, and `run_live_ingestion_once` are **dev-only** and must be selected intentionally.  
- GitHub environment variables must keep dangerous flags `false` unless the matching workflow input is `YES`.  
- `confirm` must be exactly `ACTIVATE_DEV_RUNTIME`.

## Rollback

- Worker: redeploy previous version in Cloudflare dashboard or `wrangler rollback` for the dev worker name.  
- Schema: manual operator rollback in Supabase (no automatic down-migration in CI).  
- Disable cron: redeploy without `[triggers]` or set `enable_cron=NO`.

## Gaps / not yet automated

- `RUN_TOKEN` Worker secret is not set by CI (optional for manual `/run/:sourceKey`).  
- Supabase persistence from Worker remains stubbed in T073 scaffold.  
- Production Pages deploy remains separate (`validate-and-build.yml` / `deploy-static-site.yml`).
