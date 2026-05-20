# v1.0.0 Release Candidate Decision Record

**Date:** 20 May 2026  
**Prepared by:** Implementation agent  
**For:** Control Tower (ChatGPT/Artem)

---

## Release candidate identity

| Field | Value |
|---|---|
| **Release candidate** | `v1.0.0-rc1` |
| **Base version** | `v0.9.9` (deployed commit `950441f`; tag `regulation-watch-v0.9.9`) |
| **Candidate status** | **ready_for_CT_review** |
| **Public URL** | https://regulation-watch.caesar.no/ |
| **Scope** | [V1_TECHNICAL_MVP_SCOPE_FREEZE.md](V1_TECHNICAL_MVP_SCOPE_FREEZE.md) — frozen; no feature expansion |

---

## What this RC is

- First **public technical MVP release candidate** for Caesar AI Regulation Watch.
- Documentation, versioning, and conservative public wording update only — **no new product features**.
- All safety gates from v0.9.9 audit retained and re-validated.

## What this RC is not

- Not final **v1.0.0** — Control Tower sign-off required before final tag.
- Not legal verification, client evidence, or production readiness.
- Not complete global coverage or scheduled production monitoring.

---

## Required Control Tower decisions before final v1.0.0

| Decision | Question | Default if deferred |
|---|---|---|
| **Approve technical MVP scope** | Accept frozen scope in [V1_TECHNICAL_MVP_SCOPE_FREEZE.md](V1_TECHNICAL_MVP_SCOPE_FREEZE.md)? | Remain at RC |
| **Approve public wording** | Accept "Public technical MVP candidate" positioning across site and docs? | Remain at RC |
| **Accept known limitations** | Accept source verification gaps and incomplete content review coverage? | Remain at RC |
| **Confirm no client/final evidence claims** | Confirm `client_use_allowed: 0` and `final_evidence_allowed: 0` policy? | Block final v1.0.0 |
| **Confirm no legal advice/compliance guarantee claims** | Confirm disclaimers sufficient for public pilot? | Block final v1.0.0 |

---

## Known limitations (documented, not hidden)

| Limitation | Current state | Impact |
|---|---|---|
| **Australia WAF** | `industry.gov.au` blocked from automated fetch; lead `pending_official_review` | Manual browser verification required |
| **EUR-Lex HTTP 202** | CELEX fetch returns HTTP 202; EU AI Act candidate `needs_more_source_review` | Human browser verification required |
| **EDPB HTTP 502** | Transient HTTP 502 on AI topic page in v0.9.3 pass | Re-check when stable |
| **UNESCO metadata artifact** | `check_artifact` in triage v097 | Control Tower confirm on official source if substantive |
| **`verified_on_source` remains false** | Count **0** on all records | No false verification claims |
| **Not complete global coverage** | 13 jurisdictions / 35 sources curated subset | Explicitly disclaimed |
| **Monitoring is pilot/manual-gated** | 5 URL allowlist; `workflow_dispatch` only; no scheduled production crawl | Not production monitoring |

---

## Safety gate confirmation (pre-RC)

| Gate | Result |
|---|---|
| `client_use_allowed: true` | **0** |
| `final_evidence_allowed: true` | **0** |
| `verified_on_source: true` on records | **0** |
| `legal_change_claimed: true` | **0** |
| Final evidence export | **Not implemented** |
| caesar-ai-evidence writes | **None** |
| Scheduled broad crawl in production | **No** |
| Backend/database/auth | **None** |
| Secrets committed | **None** |
| Simulated candidates | **blocked_simulation_only** (3 of 5) |

---

## Recommended Control Tower paths

1. **Approve final v1.0.0** — after RC deploy/smoke pass and explicit sign-off on scope, wording, and limitations.  
2. **Require source verification first** — if EUR-Lex / Australia / EDPB gaps unacceptable for public v1.0.0 positioning.  
3. **Keep as RC** — continue public pilot at `v1.0.0-rc1` until section B items in [V1_MVP_BLOCKERS_AND_DECISIONS.md](V1_MVP_BLOCKERS_AND_DECISIONS.md) are triaged.

---

## Sign-off (Control Tower)

| Field | Value |
|---|---|
| **Review date** | |
| **Reviewed by** | |
| **Decision** | ☐ Approve final v1.0.0 · ☐ Require source verification · ☐ Keep as RC |
| **Notes** | |
