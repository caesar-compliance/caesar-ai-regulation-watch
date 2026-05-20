# Public Deployment Baseline

**Phase:** v1.0.1 — Public Technical MVP (source verification sprint)  
**Deployment date:** 20 May 2026  
**Status:** Live — custom domain deploy run [26165712249](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26165712249)

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Product version** | `v1.0.1` |
| **Release type** | Public Technical MVP — post-MVP source verification hygiene |
| **Deployment ID** | `DEPLOY-20260520-019` (see [DEPLOYMENTS.md](../DEPLOYMENTS.md)) |
| **Deployed commit** | `489f9e7` (`merge: v1.0.1 source verification sprint`) |
| **Git tag** | `regulation-watch-v1.0.1` → `489f9e7` (tag equals deployed commit) |
| **Latest workflow run ID** | [26165712249](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26165712249) |
| **CI validate-and-build** | [26165680723](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26165680723) — success |
| **Prior deploy** | v1.0.0 `a3b3b3b` — run [26164212587](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26164212587) |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **Trigger** | `workflow_dispatch` with `confirm_disclaimers=DEPLOY` |
| **Canonical public URL** | https://regulation-watch.caesar.no/ |
| **Domain mode** | custom-domain-root (`/`) |

---

## Smoke-tested URLs (20 May 2026 — v1.0.1)

Base `https://regulation-watch.caesar.no/` — all required pages and JSON exports HTTP **200**.

**Verified:**

- Home/footer show **v1.0.1** (no stale rc1 labels).
- `data/regulation-watch-snapshot.json` — `version` **1.0.1**; `content_review_count` **28**; policy counts **0**.
- `metadata-review-triage.json` — UNESCO **benign_metadata_change** (was `check_artifact`).
- Disclaimers present; no unsafe production/client claims.

**v1.0.1 sprint outcomes (not full resolution):**

- **EDPB** — HTTP 200 re-check; source reviewed; content review refreshed.
- **Australia** — still `pending_official_review` (automated timeout).
- **EUR-Lex** — still HTTP 202; EU AI Act candidate `needs_more_source_review`.

---

## References

- [source-verification-2026-05-20-v101.yml](../data/verifications/source-verification-2026-05-20-v101.yml)
- [content-review-2026-05-20-v101.yml](../data/verifications/content-review-2026-05-20-v101.yml)
- [V1_MVP_BLOCKERS_AND_DECISIONS.md](V1_MVP_BLOCKERS_AND_DECISIONS.md)
