# v1.0.0 Final Control Tower Decision Record

**Date:** 20 May 2026  
**Prepared by:** Implementation agent  
**For:** Control Tower (ChatGPT/Artem)  
**Purpose:** Governance/release decision — final v1.0.0 approved as **Public Technical MVP** with documented limitations

This document is **not legal advice** and does not authorize client use of any export.

---

## Release identity

| Field | Value |
|---|---|
| **Prior candidate** | `v1.0.0-rc1` |
| **Prior candidate tag** | `regulation-watch-v1.0.0-rc1` → commit `0765327` |
| **Approved release** | `v1.0.0` |
| **Approved tag** | `regulation-watch-v1.0.0` (on deployed main commit after final deploy) |
| **Release type** | **Public Technical MVP** |
| **Base audit** | v0.9.9 MVP readiness audit |
| **Public URL** | https://regulation-watch.caesar.no/ |
| **Scope** | [V1_TECHNICAL_MVP_SCOPE_FREEZE.md](V1_TECHNICAL_MVP_SCOPE_FREEZE.md) — frozen; no feature expansion |

---

## Control Tower decision

| Field | Value |
|---|---|
| **Decision date** | 20 May 2026 |
| **Reviewed by** | Artem / Control Tower |
| **Decision** | **APPROVED_WITH_LIMITATIONS** |
| **Approved release** | `regulation-watch-v1.0.0` |
| **Release type** | Public Technical MVP |

**Statement:** Control Tower confirms the Public Technical MVP may ship as v1.0.0 with documented limitations, without legal advice, complete coverage, client evidence, final evidence export, or production legal-tracker claims.

---

## What v1.0.0 is

- **Public Technical MVP** — first semver `1.0.0` label for the frozen technical MVP scope in [V1_TECHNICAL_MVP_SCOPE_FREEZE.md](V1_TECHNICAL_MVP_SCOPE_FREEZE.md).
- **Official-source-first** — curated registry; human-review gated; monitoring pilot (metadata-only where live).
- **Documentation and version label** — same frozen product scope as rc1; version labels updated from rc1 to final v1.0.0 after deploy.

## What v1.0.0 is not (non-claims)

| Non-claim | Requirement |
|---|---|
| **Not legal advice** | Disclaimers on home, disclaimer page, snapshot, candidate pages |
| **Not complete coverage** | Explicit subset; 13/35 curated registry |
| **Not production legal tracker** | Pilot/manual monitoring; metadata-only where live |
| **Not client evidence** | `client_use_allowed: false` everywhere |
| **No final evidence export** | `final_evidence_allowed: false`; no caesar-ai-evidence writes |
| **No caesar-ai-evidence integration** | Contract only; no production integration |
| **Not compliance guarantee** | No regulatory outcome claims |
| **Not official interpretation** | Official-source-first; human review required |
| **Not production-ready** | Public Technical MVP label only |

---

## Safety gate summary (validated 20 May 2026)

| Gate | Result | Notes |
|---|---|---|
| `client_use_allowed: true` | **0** | Hard policy — validation enforced |
| `final_evidence_allowed: true` | **0** | No final evidence export |
| `verified_on_source: true` (records) | **0** | No false verification claims |
| `legal_change_claimed: true` | **0** | Monitoring triage + exports |
| Final evidence export | **Not implemented** | Candidates only |
| caesar-ai-evidence writes | **None** | Contract drafted only |
| Scheduled broad crawl in production | **No** | Manual-gated live metadata; SCHEDULED_MONITORING_POLICY |
| Backend / database / auth | **None** | Static site only |
| Secrets committed | **None** | — |
| Simulated evidence candidates | **blocked_simulation_only** | 3 of 5 candidates |
| `npm run monitoring:policy-check` | **Pass** | Artifact pack policy |
| Public wording | **Conservative** | Public Technical MVP; disclaimers present |

---

## Known limitations (documented, not hidden)

| Limitation | Current state | Classification |
|---|---|---|
| **Australia WAF** | `industry.gov.au` blocked from automated fetch; lead `pending_official_review` | Source blocker — manual browser verification required |
| **EUR-Lex HTTP 202** | CELEX fetch returns HTTP 202; EU AI Act candidate `needs_more_source_review` | Source blocker — human browser verification required |
| **EDPB HTTP 502** | Transient HTTP 502 on AI topic page in v0.9.3 pass | Source blocker — re-check when stable |
| **UNESCO metadata artifact** | `check_artifact` in triage v097 | Pending CT confirm on official source |
| **`verified_on_source: false` everywhere** | Count **0** true on records | By design until human verification complete |
| **Incomplete content review** | 19 reviewed vs 41 not reviewed (snapshot metrics) | Coverage gap — documented |
| **No client / final evidence** | `client_use_allowed: 0`; no final export | Policy — unchanged |
| **Not complete global coverage** | 13 jurisdictions / 35 sources curated subset | Explicitly disclaimed |
| **Monitoring is pilot/manual-gated** | 5 URL allowlist; `workflow_dispatch` only | Not production monitoring |

---

## Accepted limitations (APPROVED_WITH_LIMITATIONS)

The following are **explicitly accepted** as part of the Public Technical MVP positioning — not as defects to be hidden:

1. **Curated coverage only** — 13 jurisdictions, 35 sources; not complete global legal coverage.
2. **Human-review gated** — records and exports require professional review; `verified_on_source` remains false on all records until separately verified and approved.
3. **Source fetch gaps** — Australia (WAF), EUR-Lex (HTTP 202), EDPB (502 history) documented; manual verification paths documented in blockers doc.
4. **Incomplete content review** — 19 content-reviewed items exported; majority of review-queue metrics still unreviewed.
5. **Evidence candidates only** — governance review support; no client use; simulated candidates blocked.
6. **Metadata monitoring pilot** — 5-source allowlist; manual workflow; `legal_change_claimed: 0`; UNESCO `check_artifact` may remain open.
7. **No caesar-ai-evidence integration** — no production writes to evidence repo.
8. **Manual deploy gate** — no auto-deploy on merge; deploy requires `confirm_disclaimers=DEPLOY`.

Waivers for section B items in [V1_MVP_BLOCKERS_AND_DECISIONS.md](V1_MVP_BLOCKERS_AND_DECISIONS.md) are accepted for v1.0.0 Public Technical MVP (source verification gaps, incomplete content review, monitoring pilot scope).

---

## Sign-off (Control Tower)

| Field | Value |
|---|---|
| **Review date** | 20 May 2026 |
| **Reviewed by** | Artem / Control Tower |
| **Decision** | **APPROVED_WITH_LIMITATIONS** |
| **Waivers** (section B blockers) | Australia WAF; EUR-Lex HTTP 202; EDPB 502 re-check; UNESCO `check_artifact`; incomplete content review; `verified_on_source: 0`; monitoring pilot scope |
| **Version label** | `v1.0.0` / tag `regulation-watch-v1.0.0` |
| **Notes** | Final v1.0.0 is Public Technical MVP only — not production legal tracker, not client evidence, not complete coverage |

---

## References

- [V1_RELEASE_CANDIDATE_DECISION_RECORD.md](V1_RELEASE_CANDIDATE_DECISION_RECORD.md) — rc1 candidate record  
- [V1_RELEASE_CANDIDATE_CHECKLIST.md](V1_RELEASE_CANDIDATE_CHECKLIST.md) — checklist status  
- [V1_TECHNICAL_MVP_SCOPE_FREEZE.md](V1_TECHNICAL_MVP_SCOPE_FREEZE.md) — scope freeze  
- [V1_MVP_BLOCKERS_AND_DECISIONS.md](V1_MVP_BLOCKERS_AND_DECISIONS.md) — blockers classification  
- [MVP_READINESS_AUDIT.md](MVP_READINESS_AUDIT.md) — module audit  
- [PUBLIC_DEPLOYMENT_BASELINE.md](PUBLIC_DEPLOYMENT_BASELINE.md) — live baseline  
