# v1.0.0 MVP Blockers and Decisions

**Last updated:** 20 May 2026  
**Context:** v0.9.9 MVP readiness audit — technical release candidate pack  
**Live pilot:** https://regulation-watch.caesar.no/ (v0.9.8 deployed)

This document classifies what must, should, or may remain unresolved before a **v1.0.0** public release candidate. It is **not legal advice** and does not authorize client use of any export.

---

## A. Must fix before v1.0.0

These items create **public misinformation risk**, **broken delivery**, or **unsafe governance flags** if left unresolved.

| Blocker | Current state | Risk if shipped | Decision needed |
|---|---|---|---|
| **Stale public version labels** | `verify:dist` guards v0.5.1/v0.8.4 strings; enforced in CI | Users see wrong product version | Fix in build pipeline (done v0.8.8+); verify each deploy |
| **Broken build/deploy** | CI `validate-and-build.yml`; manual deploy gate | Site unavailable or wrong base path | Block v1.0.0 if CI or deploy fails |
| **Missing disclaimer** | Home, disclaimer page, snapshot `disclaimer` field | Unsafe public reliance | Must remain on all deploys |
| **Unsafe `client_use_allowed: true`** | Count **0** | Client evidence misuse | Hard block — validation policy |
| **Unsafe `final_evidence_allowed: true`** | Count **0** | Final evidence export misuse | Hard block |
| **Unsafe `verified_on_source: true`** without explicit approval | Count **0** on records | False verification claims | Hard block unless Control Tower documents exception |
| **Broken public JSON** | 11 exports; validate + generate in build | Integrations break | Smoke test all `/data/*.json` paths |
| **Broken source registry validation** | `npm run validate:data` in CI | Corrupt registry published | CI must pass on main before v1.0.0 tag |
| **Production-readiness claims in public copy** | Disclaimers say pilot / not legal advice | Misleading marketing | Control Tower copy review before v1.0.0 |
| **Tag/deploy misalignment** | v0.9.8 tag on deployed commit `535f635` | Audit trail confusion | Tag only deployed commit for v1.0.0 |

---

## B. Should fix before v1.0.0 if time

High-value quality improvements that do not block a **technical MVP candidate** but weaken a **v1.0.0** claim.

| Item | Current state | Recommended action | Owner |
|---|---|---|---|
| **Australia manual source verification** | Lead `pending_official_review`; v1.0.1 automated re-check still timeout | Human browser verification; update discovery + registry notes | Control Tower |
| **EUR-Lex browser verification** | CELEX HTTP 202 unchanged in v1.0.1; EU AI Act candidate `needs_more_source_review` | Qualified human read of official instrument; do not rely on EC overview alone | Control Tower |
| **EDPB re-check** | ~~HTTP 502 transient in v0.9.3 pass~~ **v1.0.1: HTTP 200** — topic index re-confirmed | Periodic re-check; complements edpb RSS watcher | Implementation agent |
| **UNESCO metadata artifact triage** | ~~`check_artifact` in triage v097~~ **v1.0.1: benign_metadata_change** | No further action unless live page body review requested | Control Tower |
| **Tag/deploy registry cleanup** | DEPLOYMENTS.md historical rows; main may be ahead of last tag | Align v1.0.0 deploy row, tag, and baseline in one pass | Implementation agent |
| **Methodology watcher status** | Says "not implemented" while prototype exists | Update public methodology (v0.9.9) | Implementation agent |
| **Content review coverage** | v1.0.1 batch +9 reviews (EDPB refresh + 8 records); coverage still incomplete | Continue incremental batches; Australia/EUR-Lex human paths | Control Tower |
| **POST_DEPLOY_SMOKE_TESTS.md version refs** | References v0.8.9 / v0.9.1 in places | Align with current version checks | Implementation agent |

---

## C. Can remain post-MVP (v1.0.0+)

Explicitly **out of scope** for v1.0.0 unless product direction changes.

| Item | Notes |
|---|---|
| **Full global coverage** | Curated 13 jurisdictions / 35 sources only |
| **Scheduled production monitoring** | `monitoring-cycle.yml` exists but artifacts-only; SCHEDULED_MONITORING_POLICY restricts broad crawl |
| **Backend / admin UI / database / auth** | Static site only |
| **caesar-ai-evidence integration** | Contract drafted; no writes |
| **Final evidence export** | Candidates only; `final_evidence_allowed: false` |
| **Client-use evidence** | `client_use_allowed: false` everywhere |
| **Premium design system** | Functional pilot UI |
| **Real-time legal change detection** | Metadata pilot only; `legal_change_claimed: 0` |
| **Complete watcher automation in CI** | Watchers manual CLI; not in validate-and-build |
| **Auto-deploy on merge** | Manual `DEPLOY` gate retained by policy |
| **Leaflet / remote map tiles** | Static SVG map only |
| **AI-generated summaries in production** | Not implemented |

---

## Decision log (v0.9.9)

| Decision | Outcome | Rationale |
|---|---|---|
| Ship v0.9.9 as docs-only release candidate pack? | **Yes** | Documents readiness without feature expansion |
| Set `client_use_allowed: true` for any candidate? | **No** | Policy violation |
| Enable scheduled live metadata monitoring? | **No** | SCHEDULED_MONITORING_POLICY; manual workflow only |
| Claim v1.0.0 production-ready in v0.9.9? | **No** | Blockers in section A remain for full release |
| Proceed to v1.0.0 RC after this audit? | **Control Tower** | See recommended decision in release report |

---

## Recommended Control Tower paths

1. **Proceed to v1.0.0 release candidate** — after section A checks green, section B items triaged, and [V1_RELEASE_CANDIDATE_CHECKLIST.md](V1_RELEASE_CANDIDATE_CHECKLIST.md) signed off.  
2. **More source verification first** — if EUR-Lex / Australia / EDPB gaps are unacceptable for public v1.0.0 positioning.  
3. **Continue technical expansion** — only if explicitly scoped (watchers, coverage); not required for MVP candidate status.

---

## References

- [MVP_READINESS_AUDIT.md](MVP_READINESS_AUDIT.md)  
- [V1_RELEASE_CANDIDATE_CHECKLIST.md](V1_RELEASE_CANDIDATE_CHECKLIST.md)  
- [EVIDENCE_EXPORT_CANDIDATE_PIPELINE.md](EVIDENCE_EXPORT_CANDIDATE_PIPELINE.md)  
- [SCHEDULED_MONITORING_POLICY.md](SCHEDULED_MONITORING_POLICY.md)  
- [METADATA_COMPARISON_POLICY.md](METADATA_COMPARISON_POLICY.md)
