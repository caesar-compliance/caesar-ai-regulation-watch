# Public Deployment Baseline

**Phase:** v1.0.3 — Public Technical MVP (manual source verification intake)  
**Deployment date:** 20 May 2026  
**Status:** Live — [26167248912](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26167248912)

---

## Deployment record

| Field | Value |
|---|---|
| **Product version** | `v1.0.3` |
| **Deployment ID** | `DEPLOY-20260520-021` |
| **Deployed commit** | `16965d9` |
| **Git tag** | `regulation-watch-v1.0.3` → `16965d9` |
| **Prior deploy** | v1.0.2 `d36909e` — [26166657168](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26166657168) |
| **Public URL** | https://regulation-watch.caesar.no/ |

---

## Smoke-tested (20 May 2026)

- All required URLs HTTP **200** (including `/source-verification/` and `/data/manual-source-verification-intake.json`).
- Snapshot `version` **1.0.3**; `manual_source_verification_intake_count` **3**; `pending_human_browser_input_count` **3**.
- `verified_on_source_count` **0**; `verified_on_source_approved_count` **0**; `client_use_allowed_count` **0**; `legal_change_claimed_count` **0**.

## v1.0.3 outcomes

| Area | Result |
|---|---|
| **Manual intake** | Schema + batch + public export + `/source-verification/` page |
| **Policy gate** | `VERIFIED_ON_SOURCE_POLICY.md` — no `verified_on_source: true` in this release |
| **Australia** | `intake-australia-industry-ai-principles-v103` — pending human browser |
| **EUR-Lex** | `intake-eu-ai-act-eurlex-v103` — pending human browser (JS required) |
| **Japan METI** | `intake-japan-meti-ai-v103` — pending human browser |

Not legal advice. Not client evidence. Not complete coverage.
