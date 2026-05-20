# Public Deployment Baseline

**Phase:** v0.9.3 — targeted human/browser source verification  
**Deployment date:** 20 May 2026  
**Status:** Live — custom domain deploy run [26134336862](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26134336862)

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Product version** | `v0.9.3` |
| **Deployment ID** | `DEPLOY-20260520-010` (see [DEPLOYMENTS.md](../DEPLOYMENTS.md)) |
| **Deployed commit** | `b966574` (`merge: v0.9.3 targeted source verification`) |
| **Latest workflow run ID** | [26134336862](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26134336862) |
| **Prior deploy** | `9655fb3` docs / `8038f9d` — v0.9.2 run [26133918817](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26133918817) |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **Trigger** | `workflow_dispatch` with `confirm_disclaimers=DEPLOY` |
| **Canonical public URL** | https://regulation-watch.caesar.no/ |
| **Domain mode** | custom-domain-root (`/`) |
| **Legacy project URL** | https://caesar-compliance.github.io/caesar-ai-regulation-watch/ — **301 redirect** to custom domain |
| **Hosting** | GitHub Pages (`build_type: workflow`) |
| **Custom domain** | `regulation-watch.caesar.no` (CNAME → `caesar-compliance.github.io`) |

---

## Smoke-tested URLs (20 May 2026 — v0.9.3)

Base `https://regulation-watch.caesar.no/` — see [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

**Verified:**

- Home/footer show **v0.9.3** (no stale v0.5.1 / v0.8.4 / v0.8.3 labels).
- `/source-discovery/` HTTP 200; lead summary **24 confirmed**, **1 pending** (Australia), **1 rejected**.
- `/content-review/` HTTP 200; `data/content-reviews.json` — **19** items (includes `content-review-2026-05-20-v093` batch).
- `data/verifications.json` — **41** items (includes `source-verification-2026-05-20-v093`).
- `snapshot.version` = **0.9.3**; evidence export candidates **5** total, **0** `client_use_allowed: true`.
- EU AI Act candidate review status **needs_more_source_review** (unchanged).
- Disclaimer/methodology links present in footer.

**v0.9.3 verification outcomes (documented, not resolved):**

- Australia `industry.gov.au` ethics principles — WAF/403; lead stays pending.
- EUR-Lex CELEX 32024R1689 — HTTP 202 bot protection; full instrument not verified.
- EDPB AI topic — HTTP 502 transient from reviewer environment.

**Not in scope for this deploy:**

- Final evidence export to caesar-ai-evidence
- `client_use_allowed: true` on any candidate or review
- Legal advice or compliance guarantee

---

## Policy baseline (unchanged)

- Public pilot only; human review required before client use.
- Competitor trackers used as discovery leads only; no competitor text copied.
- Simulated detected changes remain blocked from client/final evidence paths.
