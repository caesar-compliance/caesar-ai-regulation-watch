# Public Deployment Baseline

**Phase:** v0.9.4 — watcher eligibility + deterministic monitoring run  
**Deployment date:** 20 May 2026  
**Status:** Live — custom domain deploy run [26160434304](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26160434304)

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Product version** | `v0.9.4` |
| **Deployment ID** | `DEPLOY-20260520-011` (see [DEPLOYMENTS.md](../DEPLOYMENTS.md)) |
| **Deployed commit** | `7029059` (`merge: v0.9.4 watcher eligibility monitoring run`) |
| **Latest workflow run ID** | [26160434304](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26160434304) |
| **Prior deploy** | v0.9.3 `b966574` — run [26134336862](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26134336862); docs-only `17f4dc3` on main was not deployed until this release |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **Trigger** | `workflow_dispatch` with `confirm_disclaimers=DEPLOY` |
| **Canonical public URL** | https://regulation-watch.caesar.no/ |
| **Domain mode** | custom-domain-root (`/`) |
| **Hosting** | GitHub Pages (`build_type: workflow`) |
| **Custom domain** | `regulation-watch.caesar.no` |

---

## Smoke-tested URLs (20 May 2026 — v0.9.4)

Base `https://regulation-watch.caesar.no/` — see [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

**Verified:**

- Home/footer show **v0.9.4** (no stale v0.5.1 / v0.8.4 / v0.8.3 labels).
- `/monitoring/` HTTP 200 — eligibility counts **12 / 3 / 3**; run `monitoring-run-2026-05-20-v094`.
- `data/watcher-eligibility.json` — **15** entries, **12** watcher-eligible, **0** `client_use_allowed`.
- `data/monitoring-runs.json` — `latest_watcher_monitoring_run`, `change_detected_count: 0`.
- `snapshot.version` = **0.9.4**; `client_use_allowed_count` = **0**.
- Prior pages (`/source-discovery/`, `/content-review/`, evidence candidates) remain HTTP 200.

**Release/deploy alignment:** Live site now matches merge commit `7029059` on `main` (resolves v0.9.3 deploy at `b966574` vs docs `17f4dc3` mismatch).

**Blocked sources (unchanged):** Australia industry.gov.au (WAF); EUR-Lex CELEX (bot challenge); EDPB AI topic (502 in v0.9.3 pass).

---

## Policy (unchanged)

- Not legal advice; not complete coverage; no client-use evidence; no final evidence export.
- No broad scraping; scheduled monitoring remains manual/gated.
