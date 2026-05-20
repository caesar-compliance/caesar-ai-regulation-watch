# Public Deployment Baseline

**Phase:** v0.9.9 — public pilot · technical MVP candidate (readiness audit pack)  
**Deployment date:** 20 May 2026  
**Status:** Live — custom domain deploy run [26163138385](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26163138385)

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Product version** | `v0.9.9` |
| **Deployment ID** | `DEPLOY-20260520-016` (see [DEPLOYMENTS.md](../DEPLOYMENTS.md)) |
| **Deployed commit** | `950441f` (`merge: v0.9.9 MVP readiness audit`) |
| **Git tag** | `regulation-watch-v0.9.9` → `950441f` (tag equals deployed commit) |
| **Latest workflow run ID** | [26163138385](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26163138385) |
| **CI validate-and-build** | [26163135924](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26163135924) — success |
| **Prior deploy** | v0.9.8 `535f635` — run [26162703420](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26162703420) |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **Trigger** | `workflow_dispatch` with `confirm_disclaimers=DEPLOY` |
| **Canonical public URL** | https://regulation-watch.caesar.no/ |
| **Domain mode** | custom-domain-root (`/`) |
| **Hosting** | GitHub Pages (`build_type: workflow`) |
| **Custom domain** | `regulation-watch.caesar.no` |

---

## Smoke-tested URLs (20 May 2026 — v0.9.9)

Base `https://regulation-watch.caesar.no/` — see [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

**Verified:**

- All required pages and JSON exports HTTP **200**.
- Home/footer show **v0.9.9** and **Public pilot · Technical MVP candidate** (no stale v0.5.1 / v0.8.4 labels).
- `data/regulation-watch-snapshot.json` — `version` **0.9.9**; `legal_change_claimed_count` **0**; `client_use_allowed_count` **0**.
- Methodology page reflects watcher prototype + live metadata pilot (not "watchers not implemented").
- No `/caesar-ai-regulation-watch/` base path in custom-domain HTML.

**Not in scope:** new product features, final evidence export, client evidence, legal advice, complete coverage, scheduled broad crawl.

---

## v0.9.9 release scope

Documentation-only technical release candidate pack:

- [MVP_READINESS_AUDIT.md](MVP_READINESS_AUDIT.md)
- [V1_MVP_BLOCKERS_AND_DECISIONS.md](V1_MVP_BLOCKERS_AND_DECISIONS.md)
- [V1_RELEASE_CANDIDATE_CHECKLIST.md](V1_RELEASE_CANDIDATE_CHECKLIST.md)
