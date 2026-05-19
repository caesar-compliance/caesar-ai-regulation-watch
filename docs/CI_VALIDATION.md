# CI validation — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

## Workflow

File: `.github/workflows/validate-and-build.yml`

Triggers: `push`, `pull_request`

Steps:

1. Checkout repository
2. Setup Node.js 20 (npm cache)
3. `npm ci`
4. `npm run validate:data` — JSON Schema + referential checks
5. `npm run generate:exports` — `public/data/*.json`, RSS
6. `npm run build` — Astro static site + Pagefind index

## What CI does not do

- No deployment
- No secrets or external integrations
- No automated ingestion or scraping

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
