# Automation runtime strategy

**T073** — Caesar AI Regulation Watch is moving toward a **real automated monitoring product**, not more static approval-chain pages.

## Priority now

- Live hosted data (Supabase/Postgres)
- Official source monitoring, snapshots, diffs, detected changes
- RSS/API worker runtime (Cloudflare Workers or similar)
- Database-backed ingestion
- Public tracker fed by monitored source data
- Operator visibility (`/automation/` status)

## Later

- SaaS / paid dashboard
- Premium legal assurance and client evidence workflows

## Expected stack

| Layer | Target |
|---|---|
| Monitored data | Supabase / Postgres |
| Scheduled checks | Cloudflare Workers (manual trigger first) |
| Public surface | GitHub Pages static site |
| Future | API, RSS, search, alerts |

## Safety (unchanged)

- Allowlisted sources only; no broad crawl
- No paywall / WAF / CAPTCHA bypass
- Metadata-first; no full legal text storage
- `live_ingestion_enabled`, `scheduled_monitoring_enabled`, and `network_execution_enabled` remain **false** until separate Control Tower approval

## T073 scope

Schema plan, worker scaffold, runtime config, validators, public manifest — **no** live network, **no** Worker deploy, **no** migration applied in CI.
