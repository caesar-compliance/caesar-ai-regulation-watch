# T076A — Free services setup pack & secret-safe runtime onboarding

**Date:** 21 May 2026  
**Branch:** `task/T076A-free-services-setup-pack`

## Goal

Add a practical free-tier external services onboarding pack so Artem can configure Account A services once and future agents can check credential **presence** safely (no values in exports).

## Scope

- Hub-aligned docs under `docs/runtime/`
- `.env.runtime.example` update + `.env.cloudflare.example`
- `runtime:services:check` + public `runtime-services-readiness.json`
- `/runtime-services/` operator page
- Runtime status `services_onboarding_ready`
- Work item docs; minimal PROJECT_STATE / NEXT_ACTIONS / CHANGELOG / REPO_INVENTORY updates

## Out of scope

- Supabase migration apply
- Cloudflare Worker deploy
- Live ingestion, scheduled monitoring, network execution
- Copying hub `.local/` emails into tracked files
- Hub repo modifications

## Account A (hub policy)

- Supabase: `caesar-regulation-watch-dev`
- Cloudflare: regulation-watch worker scaffold
- GitHub Pages: `caesar-compliance` org
