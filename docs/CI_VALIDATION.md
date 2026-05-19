# CI validation — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

## Workflows

### `validate-and-build.yml` (merge gate)

Triggers: `push`, `pull_request`

Steps:

1. Checkout repository
2. Setup Node.js 20 (npm cache)
3. `npm ci`
4. `npm run validate:data` — JSON Schema + referential checks
5. `npm run generate:exports` — `public/data/*.json`, RSS
6. `npm run build` — Astro static site + Pagefind index

**Does not** run live watchers or deploy.

### `monitoring-cycle.yml` (operational)

Triggers: `workflow_dispatch`, schedule (daily 06:00 UTC)

Steps:

1. `npm ci`
2. `node scripts/run-monitoring-cycle.mjs` (write / dry_run / report_only)
3. Post-cycle `validate:data`
4. Upload artifacts (monitoring reports, watcher runs, snapshots, JSON exports)

**Does not** deploy, use secrets, auto-commit, or merge to `main`. See `docs/SCHEDULED_MONITORING_POLICY.md`.

## What CI validation does not do

- No deployment
- No secrets or external integrations
- No automated ingestion or scraping on push/PR
- **No live URL checks** on push/PR — run `npm run check:urls` locally
- **No watchers on push/PR** — use `npm run monitoring:cycle` or the monitoring workflow

## Local parity

```bash
npm run validate:data
npm run generate:exports
npm run build
```

## Failure modes

- Schema validation errors in `data/` YAML
- Timeline referential errors (unknown `jurisdiction_id`, `source_id`, or `related_record_id`)
- Astro build failures

Fix data, re-run locally, then push.
