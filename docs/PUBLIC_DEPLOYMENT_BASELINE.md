# Public Deployment Baseline

**Phase:** v1.0.0 — Public Technical MVP (approved with limitations)  
**Deployment date:** 20 May 2026  
**Status:** Live — custom domain deploy run [26164212587](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26164212587)

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Product version** | `v1.0.0` |
| **Release type** | Public Technical MVP — **APPROVED_WITH_LIMITATIONS** |
| **Deployment ID** | `DEPLOY-20260520-018` (see [DEPLOYMENTS.md](../DEPLOYMENTS.md)) |
| **Deployed commit** | `a3b3b3b` (`merge: v1.0.0 public technical MVP release`) |
| **Git tag** | `regulation-watch-v1.0.0` → `a3b3b3b` (tag equals deployed commit) |
| **Latest workflow run ID** | [26164212587](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26164212587) |
| **CI validate-and-build** | [26164179568](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26164179568) — success |
| **Prior deploy** | v1.0.0-rc1 `0765327` — run [26163494827](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26163494827) |
| **Prior tag** | `regulation-watch-v1.0.0-rc1` → `0765327` |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **Trigger** | `workflow_dispatch` with `confirm_disclaimers=DEPLOY` |
| **Canonical public URL** | https://regulation-watch.caesar.no/ |
| **Domain mode** | custom-domain-root (`/`) |
| **Hosting** | GitHub Pages (`build_type: workflow`) |
| **Custom domain** | `regulation-watch.caesar.no` |

---

## Smoke-tested URLs (20 May 2026 — v1.0.0)

Base `https://regulation-watch.caesar.no/` — see [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

**Verified:**

- All required pages and JSON exports HTTP **200**.
- Home/footer show **v1.0.0** and **Public Technical MVP** (no stale v0.5.1 / v0.8.4 / v1.0.0-rc1 labels).
- `data/regulation-watch-snapshot.json` — `version` **1.0.0**; `counts.legal_change_claimed_count` **0**; `counts.client_use_allowed_count` **0**; `counts.verified_on_source_count` **0**.
- Methodology page reflects Public Technical MVP wording; accepted limitations documented.
- No `/caesar-ai-regulation-watch/` base path in custom-domain HTML.
- Evidence candidates: `pipeline_version` **1.0.0**; `client_use_allowed: true` **0**; `final_evidence_allowed: true` **0**.

**Not in scope:** new product features, final evidence export, client evidence, legal advice, complete coverage, scheduled broad crawl, production legal tracker.

---

## v1.0.0 release scope

Public Technical MVP — Control Tower **APPROVED_WITH_LIMITATIONS** (no new product features):

- [V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md](V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md)
- [V1_TECHNICAL_MVP_SCOPE_FREEZE.md](V1_TECHNICAL_MVP_SCOPE_FREEZE.md)
- [V1_RELEASE_CANDIDATE_CHECKLIST.md](V1_RELEASE_CANDIDATE_CHECKLIST.md)

**Accepted limitations:** Australia WAF, EUR-Lex HTTP 202, EDPB 502 re-check, UNESCO `check_artifact`, incomplete content review, `verified_on_source: 0`, monitoring pilot/manual-gated only.
