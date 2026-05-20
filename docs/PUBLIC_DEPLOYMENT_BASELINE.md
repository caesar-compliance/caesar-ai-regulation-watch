# Public Deployment Baseline

**Phase:** v1.0.2 — Public Technical MVP (human/browser verification sprint)  
**Deployment date:** 20 May 2026  
**Status:** Live — [26166657168](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26166657168)

---

## Deployment record

| Field | Value |
|---|---|
| **Product version** | `v1.0.2` |
| **Deployment ID** | `DEPLOY-20260520-020` |
| **Deployed commit** | `d36909e` |
| **Git tag** | `regulation-watch-v1.0.2` → `d36909e` |
| **Prior deploy** | v1.0.1 `489f9e7` — [26165712249](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26165712249) |
| **Public URL** | https://regulation-watch.caesar.no/ |

---

## Smoke-tested (20 May 2026)

- All required URLs HTTP **200**.
- Snapshot `version` **1.0.2**; `content_review_count` **36**; `client_use_allowed_count` **0**.
- EU AI Act export candidate remains `needs_more_source_review`.

## v1.0.2 outcomes

| Area | Result |
|---|---|
| **Canada** | HTTP 200 — responsible-use AI page re-confirmed |
| **Australia** | Still `pending_official_review` (403/timeout) |
| **EUR-Lex** | Bot gate — candidate unchanged |
| **Japan** | Timeout/403 — human browser still needed |

Not legal advice. Not client evidence. Not complete coverage.
