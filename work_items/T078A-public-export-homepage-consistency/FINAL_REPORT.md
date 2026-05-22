# T078A final report

**Date:** 22 May 2026

## Git

| Field | Value |
|-------|-------|
| Starting HEAD | `40af8bc42f94e958bade7487dc498772a6ab8351` |
| Branch | `hotfix/T078A-public-export-homepage-consistency` |
| Hotfix commit | `273d04e0b884e1f2c77ea776c37c5d253e288288` |
| Final main HEAD | `273d04e0b884e1f2c77ea776c37c5d253e288288` |
| Tag / package version | Unchanged — `1.0.29`, tag `regulation-watch-v1.0.29` |

## Root cause

`npm run build` (GitHub Pages deploy) runs `build:runtime-public-export` without Supabase credentials. The script wrote `status: not_configured` and empty change/candidate arrays, overwriting committed T078 pilot data in `dist/`.

Homepage/footer already used `src/lib/project-version.ts` (v1.0.29); live inconsistency was primarily monitoring JSON and tracker dashboard counts.

## Before / after (live)

| Artifact | Before (pre-T078A) | After (DEPLOY-20260522-047) |
|----------|-------------------|------------------------------|
| Homepage/footer version | v1.0.29 (banner); docs still said v1.0.27 | v1.0.29 |
| `runtime-monitoring-status.status` | `not_configured` | `backend_smoke_passed_public_export_ready` |
| Monitored / RSS / changes / review | 9 / 0 / 0 / 0 | 9 / 2 / 20 / 20 |
| Tracker automation status | `not_configured` | `backend_smoke_passed_public_export_ready` |
| `runtime-db-health.status` | `connected` (unchanged) | `connected` |

## Files changed (25)

- `data/runtime/public-export-snapshot/*` — T078 smoke payloads (metadata-only)
- `scripts/runtime/build-runtime-public-export.mjs` — snapshot fallback + status semantics
- `scripts/runtime/validate-public-export-consistency.mjs` — new guard
- `scripts/runtime/validate-monitoring-output.mjs`, `scripts/verify-dist-output.mjs`
- `public/data/regulation-*.json`, `runtime-monitoring-status.json`
- `src/pages/tracker/index.astro`, `src/pages/runtime-health/index.astro`
- `package.json`, `CHANGELOG.md`, `ROADMAP.md`, `NEXT_ACTIONS.md`, `DEPLOYMENTS.md`
- `work_items/T078A-public-export-homepage-consistency/*`

## Validation

| Command | Result |
|---------|--------|
| `git diff --check` | PASS |
| `npm run validate:source-registry` | PASS (9 sources, 2 automated) |
| `npm run validate:automation-runtime` | PASS |
| `npm run validate:runtime-services-readiness` | PASS |
| `npm run validate:runtime-db-health` | PASS (connected) |
| `npm run validate:monitoring-output` | PASS |
| `npm run validate:public-export-consistency` | PASS |
| `npm run build` | PASS |
| `npm run verify:dist` | PASS |

CI-like export (no `.env.runtime.local`): snapshot path → `backend_smoke_passed_public_export_ready`.

## Deployment

| Field | Value |
|-------|-------|
| Workflow | `deploy-static-site.yml` |
| Run ID | [26293954803](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26293954803) |
| Deploy ID | DEPLOY-20260522-047 |
| Commit | `273d04e` |

## Live smoke test (22 May 2026)

| URL | Result |
|-----|--------|
| `/` | 200 — footer v1.0.29 |
| `/tracker/` | 200 — 9 / 2 / 20 / 20, status `backend_smoke_passed_public_export_ready` |
| `/map/` | 200 |
| `/runtime-health/` | 200 |
| `/runtime-services/` | 200 |
| `/data/runtime-monitoring-status.json` | 200 — ready, counts correct |
| `/data/runtime-db-health.json` | 200 — connected |

## Safety confirmation

- No Supabase schema apply
- No destructive DB changes
- No Cloudflare Worker deployment or API calls
- No cron / scheduled monitoring enabled
- No broad network fetch in this hotfix
- No competitor data copying
- No secrets committed (`.env.*.local` not in repo)
- Legal / evidence / client / publication gates remain false
