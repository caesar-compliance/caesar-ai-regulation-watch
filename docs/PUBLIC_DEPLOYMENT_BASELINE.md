# Public Deployment Baseline

**Phase:** v0.9.2 — source resolution and content review  
**Deployment date:** 20 May 2026  
**Status:** Live — custom domain deploy run [26133918817](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26133918817)

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Product version** | `v0.9.2` |
| **Deployment ID** | `DEPLOY-20260520-009` (see [DEPLOYMENTS.md](../DEPLOYMENTS.md)) |
| **Deployed commit** | `8038f9d` (`merge: v0.9.2 source resolution content review`) |
| **Latest workflow run ID** | [26133918817](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26133918817) |
| **Prior deploy** | `8040212` — v0.9.1 run [26133482897](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26133482897) |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **Trigger** | `workflow_dispatch` with `confirm_disclaimers=DEPLOY` |
| **Canonical public URL** | https://regulation-watch.caesar.no/ |
| **Domain mode** | custom-domain-root (`/`) |
| **Legacy project URL** | https://caesar-compliance.github.io/caesar-ai-regulation-watch/ — **301 redirect** to custom domain |
| **Hosting** | GitHub Pages (`build_type: workflow`) |
| **Custom domain** | `regulation-watch.caesar.no` (CNAME → `caesar-compliance.github.io`) |

---

## Smoke-tested URLs (20 May 2026 — v0.9.2)

Base `https://regulation-watch.caesar.no/` — see [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

**Verified:**

- Home/footer show **v0.9.2** (no stale v0.5.1 / v0.8.4 / v0.8.3 labels).
- `/source-discovery/` HTTP 200; lead summary **24 confirmed**, **1 pending**, **1 rejected**.
- `/content-review/` HTTP 200; `data/content-reviews.json` — **16** items (includes `content-review-2026-05-20-v092` batch).
- `snapshot.version` = **0.9.2**; `client_use_allowed_count` = **0**; `final_evidence_allowed` = **0**.
- Evidence export candidates: **5** total, **0** `client_use_allowed: true`.
- Disclaimer/methodology links present in footer.

**Not in scope for this deploy:**

- Final evidence export to caesar-ai-evidence
- `client_use_allowed: true` on any candidate or review
- Legal advice or compliance guarantee

---

## Policy baseline (unchanged)

- Public pilot only; human review required before client use.
- Competitor trackers used as discovery leads only in v0.9.1 batch; v0.9.2 resolves pending official URLs where possible.
- Simulated detected changes remain blocked from client/final evidence paths.
