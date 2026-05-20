# Public Deployment Baseline

**Phase:** v0.9.5 — monitoring adapter pack + deterministic pack run  
**Deployment date:** 20 May 2026  
**Status:** Live — custom domain deploy run [26160894726](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26160894726)

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Product version** | `v0.9.5` |
| **Deployment ID** | `DEPLOY-20260520-012` (see [DEPLOYMENTS.md](../DEPLOYMENTS.md)) |
| **Deployed commit** | `5d43122` (`merge: v0.9.5 monitoring adapter pilot`) |
| **Latest workflow run ID** | [26160894726](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26160894726) |
| **Prior deploy** | v0.9.4 `7029059` — run [26160434304](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26160434304) |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **Trigger** | `workflow_dispatch` with `confirm_disclaimers=DEPLOY` |
| **Canonical public URL** | https://regulation-watch.caesar.no/ |
| **Domain mode** | custom-domain-root (`/`) |
| **Hosting** | GitHub Pages (`build_type: workflow`) |
| **Custom domain** | `regulation-watch.caesar.no` |

---

## Smoke-tested URLs (20 May 2026 — v0.9.5)

Base `https://regulation-watch.caesar.no/` — see [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

**Verified:**

- Home/footer show **v0.9.5** (no stale v0.5.1 / v0.8.4 / v0.8.3 labels).
- `/monitoring/` HTTP 200 — adapter pack **15** configs; pack run `monitoring-run-2026-05-20-v095`.
- `data/monitoring-source-configs.json` — **15** configs, **12** fetchable, **0** `client_use_allowed`.
- `data/monitoring-runs.json` — `metadata_snapshot_created: 10`, `no_change_snapshot_created: 2`, `blocked_or_manual_count: 3`, `change_detected_count: 0`.
- `snapshot.version` = **0.9.5**; `monitoring_source_config_count` = **15**.
- Prior pages (`/source-discovery/`, `/content-review/`, evidence candidates, watcher eligibility) remain HTTP 200.

---

## Policy reminders (unchanged)

- Deterministic local monitoring pack only; no scheduled broad crawl expansion.
- No full legal text storage in repo; metadata-only snapshots.
- Not legal advice; not client evidence; `client_use_allowed: 0`; no final evidence export.
- Blocked/manual-only: EUR-Lex CELEX, EDPB AI topic, Australia industry.gov.au.
