# Public Deployment Baseline

**Phase:** v0.9.0 — custom domain + ecosystem versioning/deployment standard  
**Deployment date:** 20 May 2026  
**Status:** Deploy pending (merge + manual workflow); DNS and Pages custom domain configured

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Product version** | `v0.9.0` |
| **Deployment ID** | `DEPLOY-20260520-006` (see [DEPLOYMENTS.md](../DEPLOYMENTS.md)) |
| **Deployed commit** | _pending v0.9.0 deploy_ |
| **Prior deploy (v0.8.9)** | `4e987c0` — run [26131903261](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26131903261) |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **Trigger** | `workflow_dispatch` with `confirm_disclaimers=DEPLOY` |
| **Canonical public URL** | https://regulation-watch.caesar.no/ |
| **Domain mode** | custom-domain-root (`/`) |
| **Legacy project URL** | https://caesar-compliance.github.io/caesar-ai-regulation-watch/ — verify after deploy |
| **Hosting** | GitHub Pages (`build_type: workflow`) |
| **Custom domain** | `regulation-watch.caesar.no` (CNAME → `caesar-compliance.github.io`) |

---

## Smoke-tested URLs (pending v0.9.0 deploy)

Use base `https://regulation-watch.caesar.no/` — see [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

**Expected checks:**

- Home/footer show **v0.9.0** (no stale v0.5.1 / v0.8.4 / v0.8.3 pipeline labels).
- No dependency on `/caesar-ai-regulation-watch/` in links when built with `build:custom-domain`.
- `snapshot.version` = **0.9.0**; `client_use_allowed` = **0**.
- Governance review statuses visible on evidence candidates page.

---

## Policy baseline (unchanged)

| Policy | Status |
|---|---|
| Not legal advice / no compliance guarantee | Required on site |
| Evidence export **candidates** only | Yes |
| `client_use_allowed: true` | **0** |
| `final_evidence_allowed: true` | **0** |
| caesar-ai-evidence integration | **No** |
| Auto-deploy on push to `main` | **No** |

---

## Historical deploys (project-path era)

v0.8.5–v0.8.9 used `https://caesar-compliance.github.io/caesar-ai-regulation-watch/` with `ASTRO_BASE_PATH=/caesar-ai-regulation-watch/`. Authoritative table: [DEPLOYMENTS.md](../DEPLOYMENTS.md).

---

## Related documents

- [DEPLOYMENTS.md](../DEPLOYMENTS.md)
- [STATIC_DEPLOYMENT_ARCHITECTURE.md](STATIC_DEPLOYMENT_ARCHITECTURE.md)
- [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md)
- [PROJECT_STATE.md](../PROJECT_STATE.md)
