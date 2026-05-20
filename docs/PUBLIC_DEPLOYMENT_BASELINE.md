# Public Deployment Baseline

**Phase:** v1.0.0-rc1 — public technical MVP candidate (release candidate)  
**Deployment date:** 20 May 2026  
**Status:** Live — custom domain deploy run [26163494827](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26163494827)

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Product version** | `v1.0.0-rc1` |
| **Deployment ID** | `DEPLOY-20260520-017` (see [DEPLOYMENTS.md](../DEPLOYMENTS.md)) |
| **Deployed commit** | `0765327` (`merge: v1.0.0-rc1 technical MVP candidate`) |
| **Git tag** | `regulation-watch-v1.0.0-rc1` → `0765327` (tag equals deployed commit) |
| **Latest workflow run ID** | [26163494827](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26163494827) |
| **CI validate-and-build** | [26163493481](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26163493481) — success |
| **Prior deploy** | v0.9.9 `950441f` — run [26163138385](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26163138385) |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **Trigger** | `workflow_dispatch` with `confirm_disclaimers=DEPLOY` |
| **Canonical public URL** | https://regulation-watch.caesar.no/ |
| **Domain mode** | custom-domain-root (`/`) |
| **Hosting** | GitHub Pages (`build_type: workflow`) |
| **Custom domain** | `regulation-watch.caesar.no` |

---

## Smoke-tested URLs (20 May 2026 — v1.0.0-rc1)

Base `https://regulation-watch.caesar.no/` — see [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

**Verified:**

- All required pages and JSON exports HTTP **200**.
- Home/footer show **v1.0.0-rc1** and **Public technical MVP candidate** (no stale v0.5.1 / v0.8.4 labels).
- `data/regulation-watch-snapshot.json` — `version` **1.0.0-rc1**; `legal_change_claimed_count` **0**; `client_use_allowed_count` **0**.
- Methodology page reflects public technical MVP candidate wording; Control Tower sign-off noted before final v1.0.0.
- No `/caesar-ai-regulation-watch/` base path in custom-domain HTML.

**Not in scope:** new product features, final evidence export, client evidence, legal advice, complete coverage, scheduled broad crawl.

---

## v1.0.0-rc1 release scope

Release candidate — scope freeze + documentation + version bump (no new product features):

- [V1_TECHNICAL_MVP_SCOPE_FREEZE.md](V1_TECHNICAL_MVP_SCOPE_FREEZE.md)
- [V1_RELEASE_CANDIDATE_DECISION_RECORD.md](V1_RELEASE_CANDIDATE_DECISION_RECORD.md)
- [V1_RELEASE_CANDIDATE_CHECKLIST.md](V1_RELEASE_CANDIDATE_CHECKLIST.md) (updated)

**Control Tower sign-off required before final v1.0.0 tag.**
