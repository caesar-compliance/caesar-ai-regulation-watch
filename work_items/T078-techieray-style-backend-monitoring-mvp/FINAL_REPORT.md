# T078 — Final report

**Date:** 22 May 2026

## Git

| Field | Value |
|-------|-------|
| Starting HEAD | `91bf754a422f69390f1aebf7f3a83964195d8204` |
| Branch | `task/T078-techieray-style-backend-monitoring-mvp` |
| Package version | `1.0.29` |
| Tag (after merge) | `regulation-watch-v1.0.29` |

## Backend objects

- `data/runtime/monitoring-pilot-registry.yml` — 9 official sources
- `scripts/runtime/run-monitoring-pilot.mjs` — fetch, hash, diff, Supabase write
- `scripts/runtime/build-runtime-public-export.mjs` — 6 public JSON files
- `ops/cloudflare-workers/regulation-watch-monitor/` — Worker MVP with `/run-pilot`, `/last-run`
- Supabase tables used: `regulation_sources`, `source_runs`, `source_snapshots`, `source_items`, `detected_changes`, `review_candidates`, `runtime_events`

## Official sources (pilot registry)

| source_key | fetch_mode | official URL |
|------------|------------|--------------|
| edpb-publications-rss | automated RSS | https://www.edpb.europa.eu/feed/publications_en |
| edps-news-rss | automated RSS | https://www.edps.europa.eu/feed/news_en |
| eu-digital-strategy-ai-framework | manual | https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai |
| eur-lex-ai-act-entry | manual | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689 |
| oecd-ai-policy-observatory | manual | https://oecd.ai/en/ |
| council-of-europe-ai-framework | manual | https://www.coe.int/en/web/artificial-intelligence |
| us-nist-ai-rmf | manual | https://www.nist.gov/itl/ai-risk-management-framework |
| uk-ico-ai-guidance | manual | https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/ |
| singapore-pdpc-ai | manual | https://www.pdpc.gov.sg/help-and-resources/2020/01/model-ai-governance-framework |

## Supabase smoke (dev)

- **PASS** — `runtime:monitoring-pilot:write` with `--max-sources=3 --automated-only`
- 2 `source_runs`, 20 `source_items`, 20 `detected_changes`, 20 `review_candidates`, 1 `runtime_events`
- `runtime-db-health.json`: `connected`, `runtime_event_count: 1`

## Worker deployment

- **Deferred** — `wrangler` CLI not installed locally; only `wrangler.toml.example` in repo. Typecheck PASS. Redeploy via existing `dev-runtime-activate` workflow when operator ready.

## Static deployment

- Build and `verify:dist` PASS for v1.0.29
- Deploy via `deploy-static-site` workflow after merge/tag (pending)

## Safety confirmation

- No competitor scraping or proprietary data copy
- Only official allowlisted sources in registry
- No full legal text stored
- No secrets committed
- No broad crawling (`max_sources` / `max_items` limits)
- No paid services
- Evidence gates not set true
- **Scheduled monitoring: DISABLED** (`REGWATCH_ENABLE_SCHEDULED_MONITORING` default false; cron handler no-op)
