# T082A — Final Report

**Date:** 22 May 2026  
**Verdict:** **Fixed** — root cause was homepage/tracker source copy, not CDN cache alone.

## Git

| Field | Value |
|---|---|
| Starting HEAD | `f4013ef` |
| Branch | `task/T082A-v1.0.33-home-tracker-summary-consistency` |
| Hotfix commit | `77dd957` |
| Final main HEAD | `77dd957` |
| Package version | `1.0.33` (unchanged) |

## Root cause

- `/` used legacy `getReviewQueueSummary()` from registry review queue and led with **T080 coverage model** banner text.
- `/tracker/` had T082 section but **below** `Product tracker dashboard (T080)`, so external checks reported T080-first summary.
- `smoke-live-routes.mjs` still asserted v1.0.32 / T080-primary tracker markers.

Review queue (`/review-queue/`) and JSON exports were already correct on v1.0.33 deploy `26297652799`.

## Root `/` — before / after

| Marker | Before (live pre-T082A) | After (deploy 26297981779) |
|---|---|---|
| Version in hero/banner | v1.0.31 / T080-first | **v1.0.33** |
| Operator workflow | Not on homepage | **T082 Operator Decision Workflow** banner |
| Candidate count | Legacy registry queue copy | **20** regulation review candidates |
| Operator decisions | Not shown | **4** operator decisions |
| Gates / cron | Partial | **gates closed · cron disabled** in banner |

## Tracker `/tracker/` — before / after

| Marker | Before | After |
|---|---|---|
| First dashboard section | Product tracker dashboard (T080) | **Operator review pipeline (T082)** |
| Status counts | T080 metrics only above fold | **16 / 1 / 1 / 1 / 1** review pipeline counts |
| Legal verification | Implicit | **Accepted for tracking is not legal verification** |
| T080 section | Primary heading | **Coverage dashboard (T080)** (secondary) |

## Unchanged (still OK)

- `/review-queue/` — v1.0.33, 20 candidates, 4 decisions
- `/data/operator-review-summary.json` — product_version 1.0.33, decision_count 4
- `/data/regulation-review-queue.json` — merged operator decisions

## Dist inspection (local build)

| File | v1.0.33 | T082 | T080-only issue |
|---|---|---|---|
| `dist/index.html` | yes | yes | no v1.0.31 |
| `dist/tracker/index.html` | yes | yes (before T080) | no `Product tracker dashboard (T080)` |
| `dist/review-queue/index.html` | yes | yes | — |

## Deploy

| Field | Value |
|---|---|
| Workflow | `deploy-static-site.yml` |
| Run ID | [26297981779](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26297981779) |
| Input | `confirm_disclaimers=DEPLOY` |

## Live evidence

- `npm run smoke:live-routes` — **PASS** (cache-busted, v1.0.33 / T082 assertions)
- Cache-busted fetch: `/`, `/tracker/`, `/review-queue/`, JSON exports — **PASS**

## Safety

- No Supabase writes, no Worker deploy, no cron, no gates opened, no secrets.
