# Free services architecture — Regulation Watch runtime

**Date:** 21 May 2026  
**Policy:** [Caesar AI Governance Hub — External Services Account Policy](https://github.com/caesar-compliance/caesar-ai-governance-hub/blob/main/docs/operations/EXTERNAL_SERVICES_ACCOUNT_POLICY.md) (read locally under `caesar-ai-governance-hub`)

## Account allocation

Caesar AI Regulation Watch uses **Account A** under the hub external services policy:

- **Supabase project (dev):** `caesar-regulation-watch-dev`
- **Cloudflare worker target:** `regulation-watch-monitor-dev` (scaffold: `ops/cloudflare-workers/regulation-watch-monitor/`)
- **GitHub:** `caesar-compliance` org — Pages + Actions for static public site and release automation
- **Public site:** GitHub Pages → custom domain [regulation-watch.caesar.no](https://regulation-watch.caesar.no/)

Account B (Agent Ledger, Incident Atlas) is **not** used for Regulation Watch.

## Free-tier services map

| Service | Role | Regulation Watch usage |
| :--- | :--- | :--- |
| **Supabase Free** | Runtime Postgres | Source runs, snapshots, detected changes, review queue persistence (T075B+) |
| **Cloudflare Free** | Workers runtime | Allowlisted RSS/API metadata checks when approved — **not deployed in T076A** |
| **GitHub Pages + Actions** | Public static surface | Tracker UI, JSON exports, deploy pipeline |
| **UptimeRobot (or equivalent)** | External uptime | HTTP checks on public routes and JSON exports — **manual operator setup** |

## Explicitly not used for this runtime

- **Hetzner C33** — reserved for n8n/NocoDB/other; do not overload for Regulation Watch automation.
- **Spaceship / cPanel** — not used for automation runtime or ingestion.
- **Paid tiers** — free-tier only unless Control Tower approves otherwise.

## Secret handling

- **Supabase API keys (preferred):** `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`) and `SUPABASE_SECRET_KEY` (`sb_secret_...`) with `SUPABASE_API_KEY_MODE=new`.
- **Legacy fallback (optional):** `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` (JWT) only when needed for older scripts — not primary.
- **Never** use `SUPABASE_SECRET_KEY` in browser/client-side code or tracked docs.
- Exact account emails and credentials live **only** in hub ignored `.local/` files and repo-ignored `.env.*.local` files.
- Tracked docs and public JSON exports are **metadata-only** — no emails, tokens, keys, or database URLs.
- Agents must read hub policy + local map locally; they must **not** copy emails from `.local/` into tracked Regulation Watch files.

## Local env files (ignored)

| File | Purpose |
| :--- | :--- |
| `.env.runtime.local` | Supabase + Regulation Watch runtime flags |
| `.env.cloudflare.local` | Cloudflare account/worker credentials |
| `.env.github.local` | Optional fine-grained GitHub token |

Examples (placeholders only): `.env.runtime.example`, `.env.cloudflare.example`

## Safety defaults (must stay false until approved)

- `REGWATCH_APPLY_SUPABASE_SCHEMA=false`
- `REGWATCH_ENABLE_LIVE_INGESTION=false`
- `REGWATCH_ENABLE_SCHEDULED_MONITORING=false`
- `REGWATCH_ENABLE_NETWORK_EXECUTION=false`
- `CLOUDFLARE_ENABLE_WORKER_DEPLOY=false`
- `CLOUDFLARE_ENABLE_CRON_TRIGGER=false`

## Operator surfaces

- `/runtime-services/` — credential **presence** checklist (not connectivity)
- `/runtime-health/` — Supabase/Postgres health when configured (metadata only)
- `npm run runtime:services:check` — refresh `public/data/runtime-services-readiness.json`

## Next engineering steps (after Artem onboarding)

1. Fill `.env.runtime.local` (Account A → `caesar-regulation-watch-dev`).
2. `npm run runtime:db:health` — still `not_configured` until credentials valid.
3. Apply schema manually when approved (`REGWATCH_APPLY_SUPABASE_SCHEMA=true`).
4. T075B — connect source pilot exports to runtime DB.
5. T076+ — single allowlisted network check after Control Tower approval.
6. Cloudflare Worker deploy only after explicit approval.
