# v1.0.0 Technical MVP Scope Freeze

**Effective:** 20 May 2026  
**Released version:** `v1.0.0` (Public Technical MVP — approved with limitations)  
**Prior RC:** `v1.0.0-rc1`  
**Base version:** `v0.9.9`  
**Status:** Frozen — no feature expansion without Control Tower approval

This document defines exactly what the **v1.0.0 technical MVP** includes and excludes. It is **not legal advice** and does not authorize client use of any export.

---

## What v1.0.0 technical MVP includes

| Capability | Description | Status |
|---|---|---|
| **Public static site** | Astro read-only site at https://regulation-watch.caesar.no/ | Included |
| **Custom domain** | `regulation-watch.caesar.no` via GitHub Pages; manual deploy gate | Included |
| **Official-source-first registry** | 35 sources across 13 jurisdictions; credibility tiers; schema validation | Included |
| **Source discovery page/data** | 26 leads; competitor-assisted discovery policy; public JSON export | Included |
| **Law/guidance records** | 21 manual sample records; data model validation; human review fields | Included |
| **Content review workflow** | Batches through v0.9.3; 19 reviewed items exported; `/content-review/` | Included |
| **Evidence export candidates** | 5 candidates; gates enforced; `client_use_allowed: 0` | Included |
| **Evidence candidate review gate** | 2 reviewed; schema + policy validation; public JSON export | Included |
| **Monitoring eligibility** | 15 entries; 12 fetch-eligible; 3 manual/blocked; public JSON | Included |
| **Deterministic monitoring pack** | v095 pack; offline metadata snapshots; no legal text storage | Included |
| **Cautious live metadata pilot** | 5-source allowlist; metadata only; human triage required | Included |
| **Manual-gated monitoring artifact workflow** | `manual-live-metadata-review.yml`; artifact only; no auto-deploy | Included |
| **Public JSON exports** | 11+ JSON files; snapshot; machine-readable pilot API surface | Included |
| **RSS/feed** | `/feeds/changes.xml` — manual sample changes only | Included |
| **Search** | Pagefind index after full build; `/search/` | Included |
| **Disclaimers/methodology** | Home banner, disclaimer page, methodology, snapshot disclaimer field | Included |

---

## What v1.0.0 technical MVP does NOT include

| Exclusion | Rationale |
|---|---|
| **Full global coverage** | Curated 13 jurisdictions / 35 sources only; explicitly disclaimed |
| **Legal advice** | Governance review support only; professional review required |
| **Compliance guarantee** | No regulatory outcome claims |
| **Client-ready evidence** | `client_use_allowed: false` everywhere; candidates only |
| **Final evidence export** | `final_evidence_allowed: false`; no caesar-ai-evidence writes |
| **caesar-ai-evidence integration** | Contract drafted; no production writes |
| **Backend/admin/user accounts** | Static site only; no auth or database |
| **Scheduled production monitoring** | `monitoring-cycle.yml` artifacts-only; live metadata manual-gated |
| **Broad crawling** | Rate-limited allowlist; SCHEDULED_MONITORING_POLICY restricts expansion |
| **Complete source verification** | `verified_on_source: 0` on all records; human gaps remain |
| **Premium design system** | Functional pilot UI only |

---

## Positioning (public wording)

Use conservative language only:

- **Public Technical MVP**
- **Official-source-first**
- **Human-review gated**
- **Monitoring pilot**
- **Metadata-only monitoring**
- **Not legal advice**
- **Not complete coverage**
- **Not client evidence**
- **No final evidence export**

Do **not** use: production-ready, complete tracker, verified legal database, client-ready evidence, compliance guarantee.

---

## Change control

Any addition to this scope requires:

1. Control Tower written approval  
2. Update to this document  
3. Re-run [V1_RELEASE_CANDIDATE_CHECKLIST.md](V1_RELEASE_CANDIDATE_CHECKLIST.md)  
4. Re-deploy and smoke test before tag

---

## References

- [MVP_READINESS_AUDIT.md](MVP_READINESS_AUDIT.md)  
- [V1_MVP_BLOCKERS_AND_DECISIONS.md](V1_MVP_BLOCKERS_AND_DECISIONS.md)  
- [V1_RELEASE_CANDIDATE_DECISION_RECORD.md](V1_RELEASE_CANDIDATE_DECISION_RECORD.md)  
- [V1_RELEASE_CANDIDATE_CHECKLIST.md](V1_RELEASE_CANDIDATE_CHECKLIST.md)
