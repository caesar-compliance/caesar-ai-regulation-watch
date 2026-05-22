# T084 — Final Report

**Release:** v1.0.35 — Automated Source Expansion and Ingress Filtering  
**Date:** 22 May 2026

## Git / release

| Field | Value |
|---|---|
| Starting HEAD | `ae6a72a` |
| Branch | `task/T084-automated-source-expansion-ingress-filtering` |
| Feature commit | `4a916f4` |
| Hotfix commit | `b14d009` (tracker smoke copy) |
| Final main HEAD | `b14d009` |
| Tag | `regulation-watch-v1.0.35` → `b14d009` |
| Package version | `1.0.35` |

## Source counts

| Metric | Before | After |
|---|---|---|
| Total sources | 25 | 25 |
| Automated | 2 | **6** |
| Manual-review | 23 | **19** |

### Promoted to automated

1. `eu-digital-strategy-ai-framework` — EC digital strategy RSS  
2. `us-nist-ai-rmf` — NIST news RSS  
3. `france-cnil-ai-fr` — CNIL FR RSS  
4. `uk-dsit-organisation` — GOV.UK Atom  

### Kept manual (audit)

- `uk-ico-ai-guidance` — RSS 404  
- `us-ftc-ai-guidance` — feeds 403  
- `oecd-ai-policy-observatory` — no stable RSS  
- `council-of-europe-ai-framework` — 403/WAF  
- `eur-lex-ai-act-entry` and other portals — WAF / page-only  

## Ingress / queue

| Metric | Count |
|---|---|
| Total fetched items | 20 |
| Operator-visible (default queue) | **4** |
| `suppress_noise` | 16 |
| `suppress_duplicate` | 0 |
| `candidate_review_now` | 0 |
| `candidate_source_check` | 1 |
| `candidate_manual_later` | 3 |

Signal quality (unchanged rules v1.0.0): high relevance 0, noise 8, dismiss recommended 8.

## Validation

All required validators **PASS** including `validate:ingress-filtering`.  
`npm run build`, `verify:dist`, `validate:public-route-consistency` **PASS**.

## Deploy

| Deploy | Run ID | Result |
|---|---|---|
| Static site (initial) | [26299643139](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26299643139) | success |
| Static site (tracker copy fix) | [26299771110](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26299771110) | success |

## Live smoke

`npm run smoke:live-routes` — **PASS** (v1.0.35, cache-busted) after deploy `26299771110`.

Routes checked: `/`, `/tracker/`, `/review-queue/`, `/runtime-health/`, `/sources/`, JSON exports including `ingress-filter-summary.json`.

## Worker / bounded run

| Item | Result |
|---|---|
| Worker code | `PILOT_ALLOWLIST` updated (6 sources) — **deploy via CI recommended** (`dev-runtime-activate.yml`); local `wrangler deploy` not run (config path) |
| `runtime:monitoring-pilot:dry-run` | PASS — 6 automated sources, no network without `--allow-network` |

## Safety

- Cron / scheduled monitoring: **disabled**  
- Broad crawling / competitor copying: **none**  
- Metadata-only / no full legal text: **yes**  
- Secrets / `.env.*.local` / `.local/`: **not committed**  
- Protected gates: **all closed**
