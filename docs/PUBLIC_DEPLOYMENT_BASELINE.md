# Public Deployment Baseline

**Phase:** v0.9.8 — manual-gated live metadata artifact review  
**Deployment date:** 20 May 2026  
**Status:** Live — custom domain deploy run [26162703420](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26162703420)

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Product version** | `v0.9.8` |
| **Deployment ID** | `DEPLOY-20260520-015` (see [DEPLOYMENTS.md](../DEPLOYMENTS.md)) |
| **Deployed commit** | `535f635` (`merge: v0.9.8 manual monitoring workflow`) |
| **Git tag** | `regulation-watch-v0.9.8` → `535f635` (tag equals deployed commit) |
| **Latest workflow run ID** | [26162703420](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26162703420) |
| **Manual metadata workflow test** | [26162701373](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26162701373) — artifact `live-metadata-review-pack-26162701373` |
| **Prior deploy** | v0.9.7 `aa94d88` — run [26162113701](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26162113701) |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **Trigger** | `workflow_dispatch` with `confirm_disclaimers=DEPLOY` |
| **Canonical public URL** | https://regulation-watch.caesar.no/ |
| **Domain mode** | custom-domain-root (`/`) |
| **Hosting** | GitHub Pages (`build_type: workflow`) |
| **Custom domain** | `regulation-watch.caesar.no` |

---

## Smoke-tested URLs (20 May 2026 — v0.9.8)

Base `https://regulation-watch.caesar.no/` — see [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

**Verified:**

- Home/footer show **v0.9.8** (no stale v0.5.1 / v0.8.4 / v0.8.3 labels).
- `/monitoring/` HTTP 200 — **Manual artifact review workflow** section; cautious live metadata pilot unchanged.
- `data/regulation-watch-snapshot.json` — `version` **0.9.8**; `legal_change_claimed_count` **0**; `client_use_allowed` counts **0**.
- Prior v0.9.6/0.9.7 monitoring exports remain HTTP 200.
- Manual workflow `manual-live-metadata-review.yml` succeeded; artifact uploaded; no repo commits from workflow.

**Not in scope:** scheduled live metadata monitoring, auto-commit to main, legal/regulatory change claims, client evidence, final evidence export.
