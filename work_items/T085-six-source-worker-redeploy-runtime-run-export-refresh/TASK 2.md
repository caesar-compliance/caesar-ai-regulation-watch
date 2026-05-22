# T085 — Six-Source Worker Redeploy, Bounded Runtime Run, and Export Refresh

**Date:** 22 May 2026  
**Release:** v1.0.36 — Six-Source Worker Runtime Run

## Goal

Complete the operational backend step left by T084:

- Redeploy Cloudflare dev Worker with six-source allowlist
- Run protected bounded 6-source monitoring pilot (dry-run + write)
- Write metadata-only results to Supabase dev runtime
- Rebuild public exports and deploy static site
- Keep cron/scheduled monitoring disabled

## Scope

- Worker: `regulation-watch-monitor-dev`
- Allowlist: 6 automated RSS/Atom sources from T084 registry
- Public exports refreshed from dev Supabase
- UI markers on `/`, `/tracker/`, `/runtime-health/`, `/sources/`, `/review-queue/`

## Out of scope

- Cron enablement, broad crawling, new sources, full legal text storage, gate openings
