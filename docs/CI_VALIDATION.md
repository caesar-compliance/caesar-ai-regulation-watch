# CI validation — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

## Workflows

### `validate-and-build.yml` (merge gate)

Triggers: `push`, `pull_request`

Steps:

1. Checkout repository
2. Setup Node.js 20 (npm cache)
3. `npm ci`
4. `npm run generate:evidence-candidates`
5. `npm run validate:data` — JSON Schema + referential checks
6. `npm run build` — Astro static site + Pagefind index (site root `/`, no GitHub Pages base path)

**Does not** run live watchers or deploy.

### `deploy-static-site.yml` (manual public deploy)

Triggers: **`workflow_dispatch` only**

Input: `confirm_disclaimers` must be exactly `DEPLOY`.

Steps:

1. `npm ci`
2. `npm run generate:evidence-candidates`
3. `npm run validate:data`
4. `npm run generate:exports`
5. Build with `ASTRO_BASE_PATH=/caesar-ai-regulation-watch/` + Pagefind
6. `npm run verify:dist`
7. Official GitHub Pages actions: configure → upload artifact → deploy

**Requires:** Repository Settings → Pages → Source: **GitHub Actions** (one-time, manual).

**Does not** use secrets, custom domain, or auto-run on push.

See `docs/STATIC_DEPLOYMENT_ARCHITECTURE.md` and `docs/PUBLIC_RELEASE_CHECKLIST.md`.

### `monitoring-cycle.yml` (operational)

Triggers: `workflow_dispatch`, schedule (daily 06:00 UTC)

**Does not** deploy. Unchanged semantics — see `docs/SCHEDULED_MONITORING_POLICY.md`.

## What CI validation does not do

- No automatic deploy on merge to `main`
- No secrets or external integrations (except GitHub Pages OIDC during manual deploy job)
- No automated ingestion or scraping on push/PR
- **No live URL checks** on push/PR — run `npm run check:urls` locally
- **No watchers on push/PR** — use `npm run monitoring:cycle` or the monitoring workflow

## Local parity

```bash
npm run validate:data
npm run generate:exports
npm run build
```

GitHub Pages deploy parity:

```bash
npm run build:pages
ASTRO_BASE_PATH=/caesar-ai-regulation-watch/ npm run verify:dist
```

## Failure modes

- Schema validation errors in `data/` YAML
- Timeline referential errors (unknown `jurisdiction_id`, `source_id`, or `related_record_id`)
- Astro build failures
- `verify:dist` missing required pages or JSON under `dist/`

Fix data, re-run locally, then push.
