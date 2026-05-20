# MVP Readiness Audit — Caesar AI Regulation Watch

**Audit date:** 20 May 2026  
**Product version audited:** v0.9.9 (technical release candidate pack)  
**Prior live version:** v0.9.8 @ https://regulation-watch.caesar.no/  
**Auditor role:** Implementation agent (readiness/audit only — no feature expansion)

---

## Executive summary

Caesar AI Regulation Watch is **partially ready** as a **technical MVP candidate** for controlled public pilot use. The static site, custom domain, data validation pipeline, governance gates, and manual monitoring workflows are operational. **v1.0.0** remains blocked on source verification gaps (EUR-Lex, Australia, EDPB), incomplete human content review coverage, and explicit policy decisions documented in [V1_MVP_BLOCKERS_AND_DECISIONS.md](V1_MVP_BLOCKERS_AND_DECISIONS.md).

This release (v0.9.9) adds **readiness documentation only** — no new product features, no final evidence export, no client-use flags, no scheduled broad crawl.

---

## Module assessments

| Module | Status | MVP decision |
|---|---|---|
| Public website | partially_ready | Proceed as technical MVP candidate with disclaimers |
| Custom domain / deployment | ready | Live; manual deploy gate retained |
| Source registry | partially_ready | 35 sources; 3 blocked from automated fetch |
| Source discovery | partially_ready | 24/26 confirmed; 1 pending; 1 rejected |
| Law/guidance records | partially_ready | 21 records; all `verified_on_source: false` |
| Content review | partially_ready | 19 reviewed items; many records still unreviewed |
| Evidence export candidates | partially_ready | 5 candidates; gates enforced; 0 client-use |
| Candidate review gate | ready | 2 reviewed; policy validation in CI |
| Monitoring eligibility | ready | 15 entries; 12 fetch-eligible; 3 manual/blocked |
| Deterministic monitoring pack | ready | v095 pack run; offline; no legal text storage |
| Cautious live metadata pilot | partially_ready | 5-source allowlist; 3 metadata deltas triaged |
| Manual monitoring artifact workflow | ready | workflow_dispatch + RUN; artifact only |
| Public JSON exports | ready | 11+ JSON files; snapshot v0.9.x |
| RSS/feed exports | partially_ready | Sample changes RSS only |
| Search | ready | Pagefind after full build |
| Disclaimers/methodology | partially_ready | Present; methodology needs watcher-status refresh |
| Release/version/deployment hygiene | ready | Tag/deploy alignment policy established |

---

## Public website

| Field | Detail |
|---|---|
| **Status** | partially_ready |
| **Current evidence** | Astro static site; 100+ routes; home, jurisdictions, sources, records, changes, map, review queue, monitoring, source-discovery, content-review, evidence-export-candidates, exports, methodology, disclaimer, search, watchers, detected-changes, verification |
| **Known limitations** | Many pages show pilot/sample data; review queue 110 items; not all records content-reviewed; simulated detected changes visible |
| **MVP decision** | Accept for **technical MVP candidate** public pilot with prominent disclaimers |
| **Next action** | Refresh methodology page watcher status (v0.9.9); keep `PROJECT_PHASE_LABEL` conservative |

---

## Custom domain / deployment

| Field | Detail |
|---|---|
| **Status** | ready |
| **Current evidence** | https://regulation-watch.caesar.no/ live; `deploy-static-site.yml` workflow_dispatch + `confirm_disclaimers=DEPLOY`; `npm run build:custom-domain`; DEPLOYMENTS.md log through DEPLOY-20260520-015 |
| **Known limitations** | No auto-deploy on push; deploy commit may differ from docs-only commits on main (v0.9.8 tag on `535f635`, main at `05bf80f` includes workflow fix) |
| **MVP decision** | Production pilot hosting acceptable with manual gate |
| **Next action** | v0.9.9 deploy; tag deployed commit; record DEPLOY-20260520-016 |

---

## Source registry

| Field | Detail |
|---|---|
| **Status** | partially_ready |
| **Current evidence** | 35 official sources across 13 jurisdictions; JSON Schema validation; credibility tiers; review_status fields |
| **Known limitations** | 3 sources blocked from automated monitoring (EUR-Lex CELEX HTTP 202, EDPB AI topic HTTP 502, Australia industry.gov.au WAF); not complete global coverage |
| **MVP decision** | Registry usable for pilot; blocked sources documented |
| **Next action** | Human browser verification for blocked URLs before v1.0.0 |

---

## Source discovery

| Field | Detail |
|---|---|
| **Status** | partially_ready |
| **Current evidence** | 26 leads (`source-discovery-leads-2026-05-20.yml`); 24 `official_source_confirmed`; 1 `pending_official_review` (Australia); 1 rejected; public `/source-discovery/` + JSON export |
| **Known limitations** | Competitor-assisted discovery only; no competitor text copied; pending Australia lead |
| **MVP decision** | Discovery layer ready for continued curation; not authoritative |
| **Next action** | Resolve Australia pending lead via human verification |

---

## Law/guidance records

| Field | Detail |
|---|---|
| **Status** | partially_ready |
| **Current evidence** | 2 laws, 19 guidance/policy records; schemas validated; `record_origin: manual_sample` on samples |
| **Known limitations** | `verified_on_source_count: 0` in snapshot; 21 unverified records in review queue; sample dates may be fictionalised |
| **MVP decision** | Records support data-model and governance review; not client-ready |
| **Next action** | Expand content review coverage for priority jurisdictions |

---

## Content review

| Field | Detail |
|---|---|
| **Status** | partially_ready |
| **Current evidence** | Batches through v093; 19 content-reviewed items exported; `/content-review/` page; workflow docs |
| **Known limitations** | Snapshot shows `content_review_not_reviewed: 41` vs `content_reviewed_items_count: 19`; many records lack browser review |
| **MVP decision** | Workflow exists; coverage incomplete |
| **Next action** | Prioritize EU AI Act, Australia, EDPB records for v1.0.0 |

---

## Evidence export candidates

| Field | Detail |
|---|---|
| **Status** | partially_ready |
| **Current evidence** | 5 candidates generated locally; 2 `ready_for_human_review`; 3 `blocked_simulation_only`; `client_use_allowed: 0`; `/evidence-export-candidates/` |
| **Known limitations** | Not final evidence; no caesar-ai-evidence writes; simulated candidates blocked |
| **MVP decision** | Pipeline ready for governance review only |
| **Next action** | None until source verification gaps closed |

---

## Candidate review gate

| Field | Detail |
|---|---|
| **Status** | ready |
| **Current evidence** | `evidence-export-candidate-review-2026-05-20.yml`; 1 `reviewed_for_internal_governance_only`; 1 `needs_more_source_review`; schema + validate-data policy; public JSON export |
| **Known limitations** | Only 2 of 5 candidates reviewed (ready ones); simulated remain blocked |
| **MVP decision** | Gate operational and enforced |
| **Next action** | Re-review EU AI Act candidate after EUR-Lex browser verification |

---

## Monitoring eligibility

| Field | Detail |
|---|---|
| **Status** | ready |
| **Current evidence** | `watcher-eligibility-2026-05-20.yml` — 15 entries, 12 watcher-eligible, 3 manual-only; public `watcher-eligibility.json` |
| **Known limitations** | Eligibility ≠ verified content; blocked sources excluded from live pilot |
| **MVP decision** | Eligibility model ready for pilot operations |
| **Next action** | Re-check EDPB when HTTP 502 resolves |

---

## Deterministic monitoring pack

| Field | Detail |
|---|---|
| **Status** | ready |
| **Current evidence** | `source-configs-2026-05-20-v095.yml` (15 configs); `monitoring-run-2026-05-20-v095.yml`; `npm run monitoring:pack`; 10 snapshots created, 2 no-change, 3 manual/blocked |
| **Known limitations** | Offline/deterministic only; metadata snapshots not full legal text; `change_detected_count: 0` |
| **MVP decision** | Pack suitable for baseline comparison and CI |
| **Next action** | Regenerate pack when source configs change |

---

## Cautious live metadata pilot

| Field | Detail |
|---|---|
| **Status** | partially_ready |
| **Current evidence** | Allowlist v096 (5 URLs); live run v096; change review pack; triage v097 (2 benign, 1 check_artifact); `legal_change_claimed: 0` |
| **Known limitations** | Max 5 URLs; metadata only; UNESCO `check_artifact` unresolved; not scheduled |
| **MVP decision** | Pilot acceptable with human triage; not production monitoring |
| **Next action** | Control Tower confirm UNESCO on official source if substantive |

---

## Manual monitoring artifact workflow

| Field | Detail |
|---|---|
| **Status** | ready |
| **Current evidence** | `manual-live-metadata-review.yml`; test run 26162701373; artifact pack builder; `monitoring:policy-check`; no auto-commit/merge/deploy |
| **Known limitations** | Requires `confirm_live_metadata=RUN`; live network requests in workflow |
| **MVP decision** | Operational manual review path for Control Tower |
| **Next action** | Run on demand when metadata deltas expected |

---

## Public JSON exports

| Field | Detail |
|---|---|
| **Status** | ready |
| **Current evidence** | `regulation-watch-snapshot.json`, jurisdictions, sources, records, review-queue, verifications, content-reviews, evidence candidates/reviews, source-discovery, monitoring exports, live-metadata, triage — 11 export paths in snapshot |
| **Known limitations** | Generated at build time; stale until redeploy |
| **MVP decision** | Machine-readable pilot API surface ready |
| **Next action** | Verify snapshot `version` matches deploy after v0.9.9 |

---

## RSS/feed exports

| Field | Detail |
|---|---|
| **Status** | partially_ready |
| **Current evidence** | `/feeds/changes.xml` — manual sample changes only |
| **Known limitations** | Not live watcher output; no per-jurisdiction feeds |
| **MVP decision** | Sample feed acceptable for MVP candidate |
| **Next action** | Document feed scope in exports page (no change required for v0.9.9) |

---

## Search

| Field | Detail |
|---|---|
| **Status** | ready |
| **Current evidence** | Pagefind index after `npm run build`; `/search/` + `pagefind/pagefind.js` |
| **Known limitations** | Requires full build; indexes static HTML only |
| **MVP decision** | Search ready for pilot |
| **Next action** | None |

---

## Disclaimers / methodology

| Field | Detail |
|---|---|
| **Status** | partially_ready |
| **Current evidence** | `/disclaimer/`, home banner, candidate banners, monitoring warnings, snapshot disclaimer field |
| **Known limitations** | Methodology still says "Future watchers (not implemented)" while watcher prototype exists (v0.7+); some section headers retain old version labels (v0.5.1) |
| **MVP decision** | Disclaimers sufficient; methodology text refresh recommended |
| **Next action** | v0.9.9 methodology update (conservative pilot + watcher prototype status) |

---

## Release / version / deployment hygiene

| Field | Detail |
|---|---|
| **Status** | ready |
| **Current evidence** | Semver tags `regulation-watch-v0.9.0`–`v0.9.8`; DEPLOYMENTS.md; PUBLIC_DEPLOYMENT_BASELINE.md; `verify:dist` stale-label checks; hub versioning standard followed |
| **Known limitations** | Occasional docs-only commits after deploy/tag (v0.9.8 main `05bf80f` vs tag `535f635`) |
| **MVP decision** | Hygiene process mature; tag deployed commit for v0.9.9 |
| **Next action** | Deploy → smoke → tag same commit; avoid post-tag docs-only commits |

---

## Policy confirmation (audit)

| Check | Result |
|---|---|
| `client_use_allowed: true` | **0** in repo data |
| `final_evidence_allowed: true` | **0** |
| `verified_on_source: true` on records | **0** |
| `legal_change_claimed: true` | **0** |
| Final evidence export | **Not implemented** |
| caesar-ai-evidence writes | **None** |
| Scheduled broad crawl in production | **No** (monitoring-cycle artifacts only; live metadata manual) |
| Backend/database/auth | **None** |
| Complete coverage claim | **None** (explicitly disclaimed) |
| Legal advice claim | **None** |

---

## Overall MVP readiness verdict

**Technical MVP candidate — proceed with Control Tower sign-off**, subject to:

1. v0.9.9 deploy and smoke tests pass  
2. v1.0.0 blockers tracked in [V1_MVP_BLOCKERS_AND_DECISIONS.md](V1_MVP_BLOCKERS_AND_DECISIONS.md)  
3. Release checklist in [V1_RELEASE_CANDIDATE_CHECKLIST.md](V1_RELEASE_CANDIDATE_CHECKLIST.md) completed before any v1.0.0 tag  

**Not recommended:** claiming production readiness, legal verification, client evidence readiness, or complete global coverage.
