# Public Deployment Baseline

**Phase:** v1.0.4 — Public Technical MVP (autonomous source verification worker)  
**Deployment date:** 20 May 2026  
**Status:** Live — [26168769688](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26168769688)

---

## Deployment record

| Field | Value |
|---|---|
| **Product version** | `v1.0.4` |
| **Deployment ID** | `DEPLOY-20260520-022` |
| **Deployed commit** | `5c19b28` |
| **Git tag** | `regulation-watch-v1.0.4` → `5c19b28` |
| **Prior deploy** | v1.0.3 `16965d9` — [26167248912](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26167248912) |
| **Public URL** | https://regulation-watch.caesar.no/ |

---

## Smoke-tested (20 May 2026)

- All required URLs HTTP **200** (including `/source-verification/` and `/data/autonomous-source-verifications.json`).
- Snapshot `version` **1.0.4**; `autonomous_source_verification_count` **3**; `official_alternative_verified_identity_count` **1**.
- `verified_on_source_count` **0**; `client_use_allowed_count` **0**; `legal_change_claimed_count` **0**.

## v1.0.4 outcomes

| Area | Result |
|---|---|
| **Autonomous worker** | `npm run source:verify:autonomous` — SPARQL, metadata fetch, official alternatives; no WAF bypass |
| **EUR-Lex / EU AI Act** | EUR-Lex HTTP 202 bot gate; EFTA EEA-Lex `official_alternative_verified_identity` for CELEX 32024R1689 |
| **Australia** | `access_failed` (timeout) — identity not confirmed |
| **Japan METI** | `access_failed` (timeout) — identity not confirmed |
| **EU candidate review** | Stays `needs_more_source_review` (EUR-Lex consolidated text not verified) |

Not legal advice. Not client evidence. Not complete coverage.
