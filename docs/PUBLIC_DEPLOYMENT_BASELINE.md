# Public Deployment Baseline

**Phase:** v0.9.7 — live metadata review triage  
**Deployment date:** 20 May 2026  
**Status:** Live — custom domain deploy run [26162113701](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26162113701)

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Product version** | `v0.9.7` |
| **Deployment ID** | `DEPLOY-20260520-014` (see [DEPLOYMENTS.md](../DEPLOYMENTS.md)) |
| **Deployed commit** | `aa94d88` (`merge: v0.9.7 live metadata triage`) |
| **Git tag** | `regulation-watch-v0.9.7` → `aa94d88` (tag equals deployed commit) |
| **Latest workflow run ID** | [26162113701](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26162113701) |
| **Prior deploy** | v0.9.6 `644c448` — run [26161681675](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26161681675) |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **Trigger** | `workflow_dispatch` with `confirm_disclaimers=DEPLOY` |
| **Canonical public URL** | https://regulation-watch.caesar.no/ |
| **Domain mode** | custom-domain-root (`/`) |
| **Hosting** | GitHub Pages (`build_type: workflow`) |
| **Custom domain** | `regulation-watch.caesar.no` |

---

## Smoke-tested URLs (20 May 2026 — v0.9.7)

Base `https://regulation-watch.caesar.no/` — see [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

**Verified:**

- Home/footer show **v0.9.7** (no stale v0.5.1 / v0.8.4 / v0.8.3 labels).
- `/monitoring/` HTTP 200 — **Live metadata review triage** section; warning metadata change ≠ legal change.
- `data/metadata-review-triage.json` — batch `metadata-review-triage-2026-05-20-v097`; `benign_metadata_change: 2`, `check_artifact: 1`, `legal_change_claimed: 0`.
- `data/regulation-watch-snapshot.json` — `version` **0.9.7**; `metadata_review_triage_count` **3**; `legal_change_claimed_count` **0**.
- Prior v0.9.6 live metadata exports (`live-metadata-runs.json`, `change-review-packs.json`) remain HTTP 200.
- Review queue: benign triaged NIST/UK GOV items removed; UNESCO `check_artifact` remains.

**Not in scope:** scheduled monitoring, legal/regulatory change claims, client evidence, final evidence export.
