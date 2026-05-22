# Dev runtime activation (GitHub Actions)

Workflow: `.github/workflows/dev-runtime-activate.yml`
Environment: `dev-runtime`
Worker: `regulation-watch-monitor-dev`
Supabase: `caesar-regulation-watch-dev` (schema `public`)

## Supported capabilities

| Capability | Status | Command / route |
|------------|--------|-----------------|
| Schema SQL | Yes | `ops/supabase/001_regulation_watch_runtime_schema.sql` |
| Schema apply (gated) | Yes | `npm run runtime:supabase:apply` / `apply_schema=YES` |
| DB health | Yes | `npm run runtime:db:health` |
| Dev seed (gated) | Yes | `ENABLE_DEV_SEED=true npm run runtime:seed:dev` |
| Runtime smoke | Yes | `npm run runtime:smoke` |
| Worker deploy | Yes | `deploy_worker=YES` → `ops/cloudflare-workers/regulation-watch-monitor` |
| Worker secrets | Yes | Supabase URL + service role via wrangler |
| `/healthz` `/readyz` `/version` | Yes | Also `/health` alias |
| Dry-run ingestion | Yes | `runtime:source-pilot:dry-run`, `monitoring:cycle:dry-run` |
| One-shot live ingestion | Yes (gated) | `run_live_ingestion_once=YES` + `enable_network=YES` |
| Cron | Partial | Wrangler cron can be appended; Worker has no `scheduled()` handler yet |
| Cloudflare bindings | Documented | `docs/runtime/CLOUDFLARE_BINDINGS.md` |

## Unsupported / not automated

- Production deploy, DNS/custom routes
- `RUN_TOKEN` not set by CI (set manually via `wrangler secret put RUN_TOKEN` for protected runs)
- Apply `002_service_role_grants.sql` after schema when using Worker REST writes to Supabase
- UptimeRobot Worker monitor (enable in governance hub after deploy URL known)
- KV/R2/Queue provisioning (documented only)

## First safe activation sequence

1. Confirm GitHub `dev-runtime` env vars/secrets (see `EXTERNAL_SERVICE_ONBOARDING_CHECKLIST.md`).
2. Local: `npm run runtime:services:check` and `npm run runtime:smoke`.
3. CI validation only:
   `gh workflow run dev-runtime-activate.yml -f confirm=ACTIVATE_DEV_RUNTIME -f deploy_worker=NO -f run_dry_ingestion=YES`
4. Apply schema (dev DB only):
   `gh workflow run dev-runtime-activate.yml -f confirm=ACTIVATE_DEV_RUNTIME -f apply_schema=YES -f deploy_worker=NO`
5. Deploy Worker + smoke:
   `gh workflow run dev-runtime-activate.yml -f confirm=ACTIVATE_DEV_RUNTIME -f deploy_worker=YES -f set_worker_secrets=YES -f post_deploy_smoke=YES`
6. Optional seed: `ENABLE_DEV_SEED=true npm run runtime:seed:dev` locally (not default in CI).

## Full activation sequence

Add `-f enable_network=YES -f run_live_ingestion_once=YES` only after schema + Worker smoke pass and operator approval. Cron: `-f enable_cron=YES` only when `scheduled()` handler exists.

## Worker health endpoints

- `GET /healthz` — liveness (no DB/network)
- `GET /readyz` — bindings check (Supabase config present)
- `GET /version` — app, worker name, runtime env, optional git sha
- `GET /health` — alias of `/healthz`

## Rollback / disable

- Worker: Cloudflare dashboard rollback or `wrangler rollback` on dev worker name.
- Schema: manual operator action in Supabase (no CI down-migration).
- Cron: redeploy without `[triggers]` block.
- Live ingestion: keep `ENABLE_LIVE_INGESTION=false` in environment.
