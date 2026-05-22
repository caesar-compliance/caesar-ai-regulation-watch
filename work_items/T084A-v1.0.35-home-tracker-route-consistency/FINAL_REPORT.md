# T084A — Final Report

**Date:** 22 May 2026  
**Version:** 1.0.35 (unchanged)  
**Branch:** `hotfix/T084A-v1.0.35-home-tracker-route-consistency` → merged to `main`

## Verdict

**Root cause:** External v1.0.29 reports on `/` and `/tracker/` were **stale checks** (pre-T084 deploy or CDN/browser cache). Live site at investigation time already served **v1.0.35** with T084 banners after DEPLOY-20260522-056; T084A adds **explicit ingress/source counts** in lead copy and hardens validators so regressions fail CI/smoke.

## State guard (22 May 2026)

| Field | Value |
|---|---|
| Branch | `main` |
| HEAD (final) | `d879984` (smoke HTML normalization) |
| T084A feature | `6cd833c` |
| T084 final | `c42b500` |
| Package | `1.0.35` |
| Tag | `regulation-watch-v1.0.35` |

### ingress-filter-summary.json

| Field | Count |
|---|---|
| `product_version` | 1.0.35 |
| `automated_source_count` | 6 |
| `manual_source_count` | 19 |
| `operator_visible_count` | 4 |
| `suppress_noise_count` | 16 |
| `gates_closed` | true |
| `cron_enabled` | false |

## Root `/` — before vs after

| Marker | Before T084A (live pre-deploy) | After T084A (DEPLOY-20260522-057) |
|---|---|---|
| Version | v1.0.35 (already) | v1.0.35 |
| T084 banner | Present (partial counts) | **Lead + banner:** 25 official · 6 automated RSS/Atom · 19 manual-review · 4 operator-visible · 16 suppressed noise · gates closed · cron disabled |
| Stale v1.0.29 / 13 jurisdictions / 9 sources | **Absent** on cache-busted and normal fetch | **Absent** |
| Stats strip | 25 sources / 6 RSS / 19 manual | Unchanged (aligned) |

## `/tracker/` — before vs after

| Marker | Before | After |
|---|---|---|
| Ingress dashboard (T084) | Present | **Expanded intro:** 25 official · 6 automated RSS/Atom · 19 manual-review · gates closed · cron disabled |
| Links | review-queue | **+** `/sources/`, `/runtime-health/` in T084 section |
| Stale T078/T050 / not_configured | **Absent** live | **Absent** |

## Other routes (unchanged OK)

| Route | Status |
|---|---|
| `/review-queue/` | v1.0.35, T084 ingress + T083 signal quality |
| `/sources/` | 6 automated / 19 manual-review |
| `/runtime-health/` | T084 ingress filtering section |
| `/data/ingress-filter-summary.json` | product_version 1.0.35, counts above |

## Local dist inspection

`npm run build` + `verify:dist` — **PASS**

- `dist/index.html`: v1.0.35, T084 before T083, no v1.0.29, no 13-jurisdiction copy
- `dist/tracker/index.html`: Ingress filter dashboard (T084), 6 automated, 19 manual-review, Suppressed noise metric, no `not_configured`

## Deploy

| Field | Value |
|---|---|
| Deployment ID | DEPLOY-20260522-057 |
| GitHub Run | [26300252724](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26300252724) |
| Deploy commit | `6cd833c` |
| Product version | 1.0.35 (no bump) |

## Live smoke

`npm run smoke:live-routes` with cache bust `T084A-post3-*` — **PASS** after deploy.

Normal URL fetch (no `?t=`): `/` and `/tracker/` also show v1.0.35 and T084 markers (no v1.0.29).

## Validation (all PASS)

- `validate:source-registry` through `validate:ingress-filtering`
- `validate:public-export-consistency`
- `validate:public-route-consistency` (T084 guards at 1.0.35)
- `npm run build`
- `npm run verify:dist`

## Safety

- No Supabase writes
- No Worker deploy
- No cron enabled
- No secrets committed
- All protected gates remain closed
