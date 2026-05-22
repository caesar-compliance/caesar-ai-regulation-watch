# T079 — Dev Worker Activation + End-to-End Runtime Run

**Date:** 22 May 2026  
**Release:** v1.0.30 — Dev Worker Runtime Activation  
**Branch:** `task/T079-dev-worker-activation-e2e-runtime-run`

## Goal

Move from backend smoke snapshot on the static site to a deployed Cloudflare dev Worker running the controlled monitoring pilot against dev Supabase and refreshing public exports.

## Scope

- Deploy `regulation-watch-monitor-dev` with T078 Worker routes
- Protected manual `POST /run-pilot` (allowlisted EDPB/EDPS RSS only)
- Dev Supabase REST grants for `service_role`
- Public export status `backend_monitoring_mvp_worker_run`
- UI/docs updates; no cron; no scheduled monitoring

## Out of scope

- Production Worker/DNS, paid services, broad crawl, new sources, full legal text storage, gate enablement, secrets in repo
