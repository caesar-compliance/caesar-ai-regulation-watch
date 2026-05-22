# v1.0.28 — Runtime Foundation Checkpoint

**Date:** 22 May 2026  
**Type:** Versioned release checkpoint (not a live deploy)

## Goal

Mark the post-T076A dev-runtime foundation state on `main` as **v1.0.28** without enabling live ingestion, cron, scheduled monitoring, or broad network execution.

## Scope

- Bump package version `1.0.27` → `1.0.28`
- Set `automation-runtime` status to `runtime_foundation_ready`
- Align docs with tracked readiness JSON:
  - `public/data/runtime-db-health.json` — `connected`
  - `public/data/runtime-services-readiness.json` — `ready_for_manual_worker_review`
- Document v1.0.27/T076A as prior free-services onboarding release
- Release checkpoint only — **no** static GitHub Pages deploy in this task unless separately approved

## Out of scope

- Supabase schema apply or writes
- Cloudflare Worker deploy or API calls
- UptimeRobot changes
- Cron / scheduled monitoring / live ingestion
- Governance gates set to true
- Secrets or `.env.*.local` / `.local/` committed

## Acceptance

- Validation commands pass (see VALIDATION.md)
- Tag `regulation-watch-v1.0.28` on release commit
- Fast-forward merge to `main` when safe
