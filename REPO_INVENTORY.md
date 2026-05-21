# Repository Inventory — Caesar AI Regulation Watch

**Last updated:** 21 May 2026 (T075E offline operator handoff — branch)

## T075E — Offline operator handoff export

| Path | Role |
|---|---|
| **schemas/source-pilot-operator-handoff.schema.json** | Operator handoff export schema |
| **scripts/validate-source-pilot-operator-handoff.mjs** | Handoff validator |
| **scripts/runtime/source-pilot/build-operator-handoff.mjs** | Build handoff JSON + markdown report |
| **public/data/source-pilot-operator-handoff.json** | Public offline operator handoff export |
| **public/reports/source-pilot-operator-handoff.md** | Printable/static markdown handoff report |
| **src/pages/source-pilot/operator-handoff/index.astro** | Operator handoff summary UI |

## T075D — Offline review decision packets (v1.0.25)

| Path | Role |
|---|---|
| **schemas/source-pilot-decision-packets.schema.json** | Decision packets export schema |
| **scripts/validate-source-pilot-decision-packets.mjs** | Decision packets validator |
| **scripts/runtime/source-pilot/build-decision-packets.mjs** | Build packets from review candidates |
| **public/data/source-pilot-decision-packets.json** | Public offline decision packet export |
| **src/pages/source-pilot/decision-packets/index.astro** | Operator decision packet UI |

## T075C — Offline source pilot reviewer UI (v1.0.24)

| Path | Role |
|---|---|
| **schemas/source-pilot-review-candidates.schema.json** | Review candidates export schema |
| **scripts/validate-source-pilot-review-candidates.mjs** | Review candidates validator |
| **scripts/runtime/source-pilot/build-review-candidates.mjs** | Build review candidates from fixture diffs |
| **public/data/source-pilot-review-candidates.json** | Public offline review candidate export |
| **src/pages/source-pilot/index.astro** | Pilot overview + readiness summary |
| **src/pages/source-pilot/review/index.astro** | Filterable review candidate table |

## T075A — Controlled source pilot framework (v1.0.23)

| Path | Role |
|---|---|
| **data/runtime/source-pilot-registry.yml** | Allowlisted pilot sources (metadata-only) |
| **schemas/source-pilot-registry.schema.json** | Registry schema |
| **schemas/source-pilot-status.schema.json** | Public status export schema |
| **scripts/validate-source-pilot-registry.mjs** | Registry validator |
| **scripts/validate-source-pilot-status.mjs** | Status export validator |
| **scripts/runtime/source-pilot/** | Fixture adapter, snapshot build, dry-run |
| **fixtures/runtime/source-pilot/** | Local metadata snapshot fixtures |
| **public/data/source-pilot-status.json** | Public pilot readiness export |
| **src/pages/source-pilot/index.astro** | Operator source pilot page |

## T074 — Backend bootstrap & runtime health (v1.0.22)

| Path | Role |
|---|---|
| **.env.runtime.example** | Runtime env placeholders (no secrets) |
| **ops/supabase/README.md** | Supabase setup steps |
| **scripts/runtime/check-runtime-db-health.mjs** | DB health → public JSON |
| **scripts/runtime/apply-supabase-schema.mjs** | Manual schema apply (flag-gated) |
| **schemas/runtime-db-health.schema.json** | Public health export schema |
| **scripts/validate-runtime-db-health.mjs** | Health JSON validator |
| **public/data/runtime-db-health.json** | Public safe DB health metadata |
| **src/pages/runtime-health/index.astro** | Operator runtime health page |

## T073 — Automation runtime foundation (v1.0.21)

| Path | Role |
|---|---|
| **data/runtime/automation-runtime.yml** | Runtime config; ingestion disabled |
| **schemas/automation-runtime.schema.json** | Config schema |
| **ops/supabase/001_regulation_watch_runtime_schema.sql** | Postgres tables plan (not auto-applied) |
| **ops/cloudflare-workers/regulation-watch-monitor/** | Worker scaffold (not deployed) |
| **scripts/validate-automation-runtime.mjs** | Safety + scaffold checks |
| **scripts/build-automation-runtime-manifest.mjs** | Public manifest builder |
| **public/data/automation-runtime-manifest.json** | Public runtime manifest |
| **src/pages/automation/index.astro** | Operator status page |
| **docs/AUTOMATION_RUNTIME_STRATEGY.md** | Product pivot summary |

---

## Root documentation

| File | Role |
|---|---|
| **README.md** | Public entry; regulation-watch.caesar.no + npm commands |
| **DEPLOYMENTS.md** | Public deployment event log (Deployment ID vs product version) |
| **SPEC.md** | Requirements through static site |
| **ARCHITECTURE.md** | Data layers + Astro publishing |
| **ROADMAP.md** | v0.6.1 URL verification + review queue |
| **CHANGELOG.md** | Semver history |
| **REPO_INVENTORY.md** | This file |
| **PROJECT_STATE.md** | v1.0.0 Public Technical MVP (approved with limitations) |
| **docs/MVP_READINESS_AUDIT.md** | Module readiness assessment (v0.9.9) |
| **docs/V1_TECHNICAL_MVP_SCOPE_FREEZE.md** | v1.0.0 technical MVP scope freeze |
| **docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md** | v1.0.0 final Control Tower decision (APPROVED_WITH_LIMITATIONS) |
| **docs/V1_RELEASE_CANDIDATE_DECISION_RECORD.md** | v1.0.0-rc1 Control Tower decision record |
| **docs/V1_MVP_BLOCKERS_AND_DECISIONS.md** | v1.0.0 blocker classification |
| **docs/V1_RELEASE_CANDIDATE_CHECKLIST.md** | Pre-v1.0.0 / RC sign-off checklist |
| **docs/COMPETITOR_ASSISTED_SOURCE_DISCOVERY_POLICY.md** | Competitor-as-lead-only rules (v0.9.1) |
| **NEXT_ACTIONS.md** | Control Tower URL verification |
| **docs/SOURCE_VERIFICATION_WORKFLOW.md** | Verification process |
| **docs/RECORD_EXPANSION_GAPS.md** | Deferred records log |

---

## data/taxonomies/ (v0.3.1)

| File | Role |
|---|---|
| **regulatory-statuses.yml** | Law/guidance operational status labels |
| **source-credibility-levels.yml** | Source credibility tiers |
| **review-statuses.yml** | Review workflow states |
| **change-types.yml** | Change classification |
| **confidence-levels.yml** | Change confidence |
| **affected-topics.yml** | Topic tags (pilot subset) |
| **control-reference-types.yml** | Draft `regulation_watch.control.*` refs |
| **evidence-reference-types.yml** | Draft `regulation_watch.evidence.*` refs |

---

## data/ (registry and samples)

See v0.2.0 jurisdictions/sources and v0.3.0 laws/guidance/changes in prior inventory sections. Sample entities include `record_origin: manual_sample`.

### T048–T050 automation-first tracker (v1.0.5–T050 branch)

| Directory | Role |
|-----------|------|
| **data/country-status/** | Per-jurisdiction regulation status seeds (`status_bucket`, source_ids, topic_tags) |
| **data/regulatory-updates/** | Manual seed updates + `generated-from-metadata.yml` (`offline_metadata_adapter`, T049) |
| **scripts/build-regulatory-updates-from-metadata.mjs** | T049 offline adapter — repo metadata → regulatory_update batch |
| **scripts/lib/tracker-scoring.mjs** | T050 scoring for JSON exports |
| **src/lib/tracker-scoring.ts** | T050 scoring for Astro pages |
| **src/components/TrackerChoroplethMap.astro** | T050 choropleth-style status panel |
| **src/pages/compare/** | T050 jurisdiction comparison |
| **data/topics/** | Tracker topic tags for filters (distinct from `data/taxonomies/`) |

### T051 profiles + drilldowns (v1.0.8 on main)

| Path | Role |
|------|------|
| **src/lib/tracker-drilldown.ts** | Region/topic aggregates, slug helper, profile export builders |
| **scripts/lib/tracker-drilldown.mjs** | Mirror for static JSON exports |
| **src/pages/regions/** | Region index + `[slug]` drilldown pages |
| **src/pages/topics/** | Topic index + `[id]` drilldown pages |
| **src/pages/jurisdictions/[id].astro** | Richer jurisdiction profile (T051) |
| **public/data/jurisdiction-profiles.json** | Profile export (generated) |
| **public/data/region-drilldowns.json** | Region drilldown export (generated) |
| **public/data/topic-drilldowns.json** | Topic drilldown export (generated) |

---

## mappings/ & exports/

| File | Role |
|---|---|
| **mappings/change-to-controls.sample.yml** | Draft control mappings |
| **mappings/change-to-evidence.sample.yml** | Draft evidence mappings |
| **exports/samples/regulation-change-export.sample.yml** | Sample export contract payloads |

---

## schemas/

| File | Role |
|---|---|
| **jurisdiction.schema.json** | Jurisdiction YAML |
| **source.schema.json** | Source YAML |
| **law.schema.json** | Law samples (+ `record_origin`) |
| **guidance.schema.json** | Guidance samples |
| **change.schema.json** | Change samples |
| **country-status.schema.json** | T048 country regulation status |
| **regulatory-update.schema.json** | T048 regulatory update feed items |
| **topic.schema.json** | T048 tracker topic tags |
| **change-control-mapping.schema.json** | Control mapping items |
| **change-evidence-mapping.schema.json** | Evidence mapping items |
| **taxonomy.schema.json** | Taxonomy files |
| **evidence-export-record.schema.json** | Export contract record |
| **timeline.schema.json** | Timeline YAML (v0.5.0) |
| **watcher-config.schema.json** | Watcher registry |
| **source-snapshot.schema.json** | Page metadata snapshot |
| **feed-snapshot.schema.json** | Feed metadata snapshot |
| **api-snapshot.schema.json** | API metadata snapshot |
| **watcher-run.schema.json** | Watcher run log (incl. feed_diagnostics) |
| **detected-change.schema.json** | Pending detected change (+ content review fields v0.8.2) |
| **content-review.schema.json** | Content review batch (v0.8.2) |
| **evidence-export-candidate.schema.json** | Gated export candidate batch (v0.8.3) |

---

## data/evidence-export-candidates/ (v0.8.3)

| Path | Role |
|---|---|
| **evidence-export-candidates-2026-05-20.yml** | Generated candidate batch (5 items) |
| **scripts/generate-evidence-export-candidates.mjs** | `npm run generate:evidence-candidates` |
| **docs/EVIDENCE_EXPORT_CANDIDATE_PIPELINE.md** | Pipeline scope and policy |
| **src/pages/evidence-export-candidates/index.astro** | Read-only candidate dashboard |
| **public/data/evidence-export-candidates.json** | Generated static export |

---

## data/verifications/ (v0.8.2+ content review; v1.0.3 manual intake)

| Pattern | Role |
|---|---|
| **content-review-*.yml** | Human content review batches (summary, dates, detected changes) |
| **autonomous-source-verification-allowlist-*.yml** | Allowlist for autonomous verification worker (v1.0.4) |
| **autonomous-source-verification-*.yml** | Autonomous machine verification results batch (v1.0.4) |
| **schemas/autonomous-source-verification.schema.json** | Autonomous verification batch schema |
| **scripts/run-autonomous-source-verification.mjs** | Autonomous worker CLI (`npm run source:verify:autonomous`) |
| **public/data/autonomous-source-verifications.json** | Public autonomous verification export |
| **manual-source-verification-intake-*.yml** | Supplementary human browser intake for blocked sources (v1.0.3) |
| **docs/CONTENT_REVIEW_WORKFLOW.md** | Process |
| **docs/MANUAL_SOURCE_VERIFICATION_INTAKE_GUIDE.md** | Reviewer guide for intake observations |
| **docs/VERIFIED_ON_SOURCE_POLICY.md** | Control Tower gate for `verified_on_source: true` |
| **schemas/manual-source-verification-intake.schema.json** | Intake batch schema |
| **public/data/manual-source-verification-intake.json** | Public intake status export (no private reviewer notes) |
| **src/pages/source-verification/** | Manual intake summary page |
| **docs/CONTENT_REVIEW_CHECKLIST.md** | Reviewer checklist |
| **src/pages/content-review/index.astro** | Static content review dashboard |
| **public/data/content-reviews.json** | Generated export |

---

## data/watchers/ & monitoring (v0.8.1)

| Path | Role |
|---|---|
| **data/watchers/official-source-watchers.yml** | Watcher config (5 watchers) |
| **data/snapshots/** | Metadata-only snapshots per source |
| **data/watcher-runs/** | Watcher run logs |
| **data/monitoring/** | Watcher eligibility batch + deterministic monitoring runs (v0.9.4) |
| **data/monitoring-runs/** | Monitoring cycle reports |
| **schemas/watcher-eligibility.schema.json** | Watcher eligibility validation |
| **schemas/watcher-monitoring-run.schema.json** | Deterministic monitoring run validation |
| **schemas/monitoring-source-config.schema.json** | Monitoring adapter/config pack validation |
| **data/monitoring/source-configs-2026-05-20-v095.yml** | v0.9.5 adapter pack (15 sources) |
| **data/monitoring/monitoring-run-2026-05-20-v095.yml** | v0.9.5 deterministic pack run |
| **schemas/live-metadata-pilot.schema.json** | Live metadata pilot allowlist validation |
| **schemas/live-metadata-run.schema.json** | Live metadata pilot run validation |
| **schemas/change-review-pack.schema.json** | Metadata change review pack validation |
| **data/monitoring/live-metadata-pilot-allowlist-2026-05-20-v096.yml** | v0.9.6 pilot allowlist (max 5 sources) |
| **data/monitoring/live-metadata-run-2026-05-20-v096.yml** | v0.9.6 live metadata run |
| **data/monitoring/change-review-pack-2026-05-20-v096.yml** | v0.9.6 change review pack (v0.9.7 triage notes) |
| **data/monitoring/metadata-review-triage-2026-05-20-v097.yml** | v0.9.7 live metadata review triage |
| **schemas/metadata-review-triage.schema.json** | Triage batch schema |
| **docs/METADATA_COMPARISON_POLICY.md** | Live metadata compare + triage policy |
| **scripts/run-monitoring-pack.mjs** | `npm run monitoring:pack` — regenerate pack run |
| **scripts/run-live-metadata-pilot.mjs** | `npm run monitoring:live-metadata` — cautious live pilot |
| **scripts/build-live-metadata-review-artifact.mjs** | `npm run monitoring:live-artifact` — tmp artifact pack (v0.9.8) |
| **scripts/check-monitoring-policy.mjs** | `npm run monitoring:policy-check` — policy gate |
| **.github/workflows/manual-live-metadata-review.yml** | Manual live metadata review (workflow_dispatch + RUN) |
| **public/data/monitoring-source-configs.json** | Static export of adapter configs |
| **public/data/live-metadata-runs.json** | Static export of live metadata pilot runs |
| **public/data/change-review-packs.json** | Static export of change review packs |
| **public/data/watcher-eligibility.json** | Static export of eligibility entries |
| **data/detected-changes/** | Pending human review diffs |
| **scripts/run-official-source-watchers.mjs** | `npm run watch:official` |
| **scripts/run-monitoring-cycle.mjs** | `npm run monitoring:cycle` |
| **scripts/summarize-monitoring-changes.mjs** | `npm run monitoring:summary` |
| **data/monitoring-runs/latest-monitoring-diff-summary.json** | PR gating / triage summary |
| **.github/workflows/monitoring-cycle.yml** | Scheduled artifacts; optional manual review PR |
| **docs/MONITORING_PR_REVIEW_CHECKLIST.md** | Human review checklist for monitoring PRs |
| **docs/SCHEDULED_MONITORING_POLICY.md** | Monitoring policy |
| **docs/MONITORING_RUNBOOK.md** | Operator runbook |
| **docs/WATCHER_PROTOTYPE.md** | Watcher scope and usage |

## T052 — Source adapter allowlist (v1.0.8 on main)

| Path | Role |
|---|---|
| **schemas/source-adapter-allowlist.schema.json** | Allowlist entry validation |
| **data/source-adapters/source-adapter-allowlist.yml** | Draft/disabled pilot adapters (9 entries) |
| **docs/SOURCE_ADAPTER_ALLOWLIST.md** | Allowlist policy |
| **docs/RSS_API_ADAPTER_SAFETY_MODEL.md** | RSS/API safety model |
| **scripts/validate-source-adapter-allowlist.mjs** | `npm run validate:source-adapters` |
| **scripts/parse-source-adapter-fixture.mjs** | `npm run build:source-adapter-fixtures` |
| **fixtures/source-adapters/** | Local RSS/Atom XML fixtures (no network) |
| **generated/source-adapter-fixture-candidates.json** | Build output (gitignored) |
| **public/data/source-adapter-allowlist.json** | Redacted public export |
| **src/pages/source-adapters/index.astro** | Read-only registry page |

## T053 — Manual source intake runner (v1.0.8 on main)

| Path | Role |
|---|---|
| **schemas/manual-source-intake-run.schema.json** | Manual intake run validation |
| **data/source-adapters/manual-intake-runs.yml** | Pilot run `T053-001` (fixture_only) |
| **docs/MANUAL_SOURCE_INTAKE_RUNNER.md** | Fixture-first workflow |
| **scripts/validate-manual-source-intake-runs.mjs** | `npm run validate:manual-source-intake` |
| **scripts/run-manual-source-intake.mjs** | `npm run run:manual-source-intake` (CLI; no network) |
| **generated/source-intake-candidates/T053-001.json** | Per-run output (gitignored) |

## T054 — Network dry-run approval architecture (v1.0.8 on main)

| Path | Role |
|---|---|
| **schemas/network-dry-run-approval.schema.json** | Approval packet validation |
| **data/source-adapters/network-dry-run-approvals.yml** | Pilot approval `T054-001` (planning_only) |
| **docs/NETWORK_DRY_RUN_APPROVAL_MODEL.md** | Planning-only workflow; T055 execution gate |
| **scripts/validate-network-dry-run-approvals.mjs** | `npm run validate:network-dry-run-approvals` |
| **scripts/build-network-dry-run-plan.mjs** | `npm run build:network-dry-run-plan` (no network) |
| **scripts/run-approved-network-dry-run.mjs** | Guarded one-off network runner (T055) |
| **generated/network-dry-run-plans/T054-001.json** | Plan output (gitignored) |

## T055 — Single-source network dry-run execution (merged to main)

| Path | Purpose |
|---|---|
| **schemas/single-network-dry-run-execution.schema.json** | Execution record validation |
| **data/source-adapters/single-network-dry-run-executions.yml** | Pilot execution `T055-001` |
| **scripts/validate-single-network-dry-run-executions.mjs** | `npm run validate:single-network-dry-run-executions` |
| **docs/SINGLE_SOURCE_NETWORK_DRY_RUN.md** | T055 execution model |
| **generated/network-dry-run-candidates/T054-001.json** | Candidate output (gitignored) |
| **generated/network-dry-run-reports/T055-001.json** | Dry-run report (gitignored) |

## T056 — Manual review promotion pipeline (v1.0.8, merged)

| Path | Purpose |
|---|---|
| **schemas/manual-review-promotion.schema.json** | Promotion packet validation |
| **schemas/draft-regulatory-update.schema.json** | Draft update validation |
| **data/source-adapters/manual-review-promotions.yml** | Pilot promotion `T056-001` |
| **data/regulatory-updates/drafts/T056-001.yml** | Draft update (excluded from public export) |
| **scripts/validate-manual-review-promotions.mjs** | `npm run validate:manual-review-promotions` |
| **scripts/build-manual-review-promotion.mjs** | `npm run build:manual-review-promotion` |
| **docs/MANUAL_REVIEW_PROMOTION_PIPELINE.md** | T056 promotion model |
| **fixtures/promotion/T054-001-candidate.json** | Fixture candidate when generated output missing |

## T057 — Manual reviewer decision workflow (v1.0.8, merged)

| Path | Purpose |
|---|---|
| **schemas/manual-review-decision.schema.json** | Decision record validation |
| **data/source-adapters/manual-review-decisions.yml** | Pilot decision `T057-001` (`request_changes` for T056 draft) |
| **scripts/validate-manual-review-decisions.mjs** | `npm run validate:manual-review-decisions` |
| **scripts/build-manual-review-decision-summary.mjs** | `npm run build:manual-review-decision-summary` |
| **docs/MANUAL_REVIEW_DECISION_WORKFLOW.md** | T057 decision model |
| **generated/manual-review-decisions/T057-001.json** | Local summary (gitignored) |

## T058 — Draft revision packet (v1.0.8, merged PR #18)

| Path | Purpose |
|---|---|
| **schemas/draft-regulatory-update-revision.schema.json** | Revision packet validation |
| **data/source-adapters/draft-regulatory-update-revisions.yml** | Pilot revision `T058-001` |
| **data/regulatory-updates/drafts/T056-001.yml** | Revised draft (metadata-only) |
| **scripts/validate-draft-regulatory-update-revisions.mjs** | `npm run validate:draft-regulatory-update-revisions` |
| **scripts/build-draft-revision-summary.mjs** | `npm run build:draft-revision-summary` |
| **docs/DRAFT_REVISION_PACKET_WORKFLOW.md** | T058 revision model |
| **generated/draft-revisions/T058-001.json** | Local summary (gitignored) |

## T059 — Internal draft readiness gate (v1.0.8, merged)

| Path | Purpose |
|---|---|
| **schemas/internal-draft-readiness-gate.schema.json** | Readiness gate validation |
| **data/source-adapters/internal-draft-readiness-gates.yml** | Pilot gate `T059-001` |
| **scripts/validate-internal-draft-readiness-gates.mjs** | `npm run validate:internal-draft-readiness-gates` |
| **scripts/build-internal-draft-readiness-summary.mjs** | `npm run build:internal-draft-readiness-summary` |
| **docs/INTERNAL_DRAFT_READINESS_GATE.md** | T059 readiness model |
| **generated/internal-draft-readiness/T059-001.json** | Local summary (gitignored) |

## T060 — Source verification cockpit (v1.0.8, deployed)

| Path | Purpose |
|---|---|
| **schemas/source-verification-checklist.schema.json** | Checklist validation |
| **data/source-adapters/source-verification-checklists.yml** | Pilot checklist `T060-001` |
| **scripts/validate-source-verification-checklists.mjs** | `npm run validate:source-verification-checklists` |
| **scripts/build-source-verification-summary.mjs** | `npm run build:source-verification-summary` |
| **src/pages/source-verification/index.astro** | Cockpit UI |
| **docs/SOURCE_VERIFICATION_COCKPIT.md** | T060 model |

## T061 — Source verification result capture (v1.0.9, deployed)

| Path | Purpose |
|---|---|
| **schemas/source-verification-result.schema.json** | Result validation |
| **data/source-adapters/source-verification-results.yml** | Pilot result `T061-001` |
| **scripts/validate-source-verification-results.mjs** | `npm run validate:source-verification-results` |
| **scripts/build-source-verification-result-summary.mjs** | `npm run build:source-verification-result-summary` |
| **docs/SOURCE_VERIFICATION_RESULT_CAPTURE.md** | T061 model |

## T062 — Final legal review packet UI (v1.0.10, deployed)

| Path | Purpose |
|---|---|
| **schemas/final-legal-review-packet.schema.json** | Packet validation |
| **data/source-adapters/final-legal-review-packets.yml** | Pilot packet `T062-001` |
| **scripts/validate-final-legal-review-packets.mjs** | `npm run validate:final-legal-review-packets` |
| **scripts/build-final-legal-review-packet-summary.mjs** | `npm run build:final-legal-review-packet-summary` |
| **src/pages/legal-review/index.astro** | Packet UI |
| **docs/FINAL_LEGAL_REVIEW_PACKET_UI.md** | T062 model |

## T063 — Final legal reviewer decision capture (v1.0.11, deployed)

| Path | Purpose |
|---|---|
| **schemas/final-legal-review-decision.schema.json** | Decision validation |
| **data/source-adapters/final-legal-review-decisions.yml** | Pilot decision `T063-001` |
| **scripts/validate-final-legal-review-decisions.mjs** | `npm run validate:final-legal-review-decisions` |
| **scripts/build-final-legal-review-decision-summary.mjs** | `npm run build:final-legal-review-decision-summary` |
| **docs/FINAL_LEGAL_REVIEW_DECISION_CAPTURE.md** | T063 model |

## T064 — Legal review revision response UI (v1.0.12)

| Path | Purpose |
|---|---|
| **schemas/final-legal-review-revision-response.schema.json** | Revision response validation |
| **data/source-adapters/final-legal-review-revision-responses.yml** | Pilot response `T064-001` |
| **scripts/validate-final-legal-review-revision-responses.mjs** | `npm run validate:final-legal-review-revision-responses` |
| **scripts/build-final-legal-review-revision-response-summary.mjs** | `npm run build:final-legal-review-revision-response-summary` |
| **docs/FINAL_LEGAL_REVIEW_REVISION_RESPONSE.md** | T064 model |

## T065 — Final reviewer re-check packet (v1.0.13)

| Path | Purpose |
|---|---|
| **schemas/final-reviewer-recheck.schema.json** | Re-check validation |
| **data/source-adapters/final-reviewer-rechecks.yml** | Pilot re-check `T065-001` |
| **scripts/validate-final-reviewer-rechecks.mjs** | `npm run validate:final-reviewer-rechecks` |
| **scripts/build-final-reviewer-recheck-summary.mjs** | `npm run build:final-reviewer-recheck-summary` |
| **docs/FINAL_REVIEWER_RECHECK_PACKET.md** | T065 model |

## T066 — Publication gate packet UI (v1.0.14)

| Path | Purpose |
|---|---|
| **schemas/publication-gate-packet.schema.json** | Publication gate packet validation |
| **data/source-adapters/publication-gate-packets.yml** | Pilot packet `T066-001` |
| **scripts/validate-publication-gate-packets.mjs** | `npm run validate:publication-gate-packets` |
| **scripts/build-publication-gate-packet-summary.mjs** | `npm run build:publication-gate-packet-summary` |
| **src/pages/publication-gate/index.astro** | `/publication-gate/` UI |
| **docs/PUBLICATION_GATE_PACKET_UI.md** | T066 model |

## T067 — Publication gate decision capture (v1.0.15)

| Path | Purpose |
|---|---|
| **schemas/publication-gate-decision.schema.json** | Publication gate decision validation |
| **data/source-adapters/publication-gate-decisions.yml** | Pilot decision `T067-001` |
| **scripts/validate-publication-gate-decisions.mjs** | `npm run validate:publication-gate-decisions` |
| **scripts/build-publication-gate-decision-summary.mjs** | `npm run build:publication-gate-decision-summary` |
| **docs/PUBLICATION_GATE_DECISION_CAPTURE.md** | T067 model |

---

## T068 — Publication staging preview UI (v1.0.16)

| Path | Purpose |
|---|---|
| **schemas/publication-staging-preview.schema.json** | Staging preview validation |
| **data/source-adapters/publication-staging-previews.yml** | Pilot preview `T068-001` |
| **src/pages/publication-staging/index.astro** | Internal staging preview UI |
| **scripts/validate-publication-staging-previews.mjs** | `npm run validate:publication-staging-previews` |
| **scripts/build-publication-staging-preview-summary.mjs** | `npm run build:publication-staging-preview-summary` |
| **docs/PUBLICATION_STAGING_PREVIEW_UI.md** | T068 model |

## T069 — Public export release gate (v1.0.17)

| Path | Purpose |
|---|---|
| **schemas/public-export-release-gate.schema.json** | Release gate validation |
| **data/source-adapters/public-export-release-gates.yml** | Pilot gate `T069-001` |
| **src/pages/public-export-gate/index.astro** | Internal public export release gate UI |
| **scripts/validate-public-export-release-gates.mjs** | `npm run validate:public-export-release-gates` |
| **scripts/build-public-export-release-gate-summary.mjs** | `npm run build:public-export-release-gate-summary` |
| **docs/PUBLIC_EXPORT_RELEASE_GATE.md** | T069 model |

## T070 — Public export approval decision (v1.0.18)

| Path | Purpose |
|---|---|
| **schemas/public-export-approval-decision.schema.json** | Approval decision validation |
| **data/source-adapters/public-export-approval-decisions.yml** | Pilot decision `T070-001` |
| **scripts/validate-public-export-approval-decisions.mjs** | `npm run validate:public-export-approval-decisions` |
| **scripts/build-public-export-approval-decision-summary.mjs** | `npm run build:public-export-approval-decision-summary` |
| **scripts/build-non-public-export-preview.mjs** | `npm run build:non-public-export-preview` |
| **docs/PUBLIC_EXPORT_APPROVAL_DECISION.md** | T070 model |

## T071 — Public update release decision (v1.0.19)

| Path | Purpose |
|---|---|
| **schemas/public-update-release-decision.schema.json** | Release decision validation |
| **data/source-adapters/public-update-release-decisions.yml** | Pilot decision `T071-001` |
| **scripts/validate-public-update-release-decisions.mjs** | `npm run validate:public-update-release-decisions` |
| **scripts/build-public-update-release-decision-summary.mjs** | `npm run build:public-update-release-decision-summary` |
| **docs/PUBLIC_UPDATE_RELEASE_DECISION.md** | T071 model |

## T072 — Explicit publication release approval packet (v1.0.20)

| Path | Purpose |
|---|---|
| **schemas/explicit-publication-release-approval-packet.schema.json** | Approval packet validation |
| **data/source-adapters/explicit-publication-release-approval-packets.yml** | Pilot packet `T072-001` |
| **scripts/validate-explicit-publication-release-approval-packets.mjs** | `npm run validate:explicit-publication-release-approval-packets` |
| **scripts/build-explicit-publication-release-approval-packet-summary.mjs** | `npm run build:explicit-publication-release-approval-packet-summary` |
| **src/pages/publication-release/index.astro** | Operator confirmation screen |
| **docs/EXPLICIT_PUBLICATION_RELEASE_APPROVAL_PACKET.md** | T072 model |

---

## data/timelines/ (v0.5.0)

| File | Role |
|---|---|
| **eu-ai-act.yml** | Sample EU AI Act milestone timeline |
| **global-ai-regulation-watch.sample.yml** | Sample cross-jurisdiction timeline |

---

## docs/ (v0.5.0 additions)

| File | Role |
|---|---|
| **docs/TIMELINE_MODEL.md** | Timeline data model and review workflow |
| **docs/GLOBAL_COVERAGE_EXPANSION.md** | v0.5.0 global expansion scope |
| **docs/CI_VALIDATION.md** | GitHub Actions CI description |

---

## docs/ (v0.8.5 deployment)

| File | Role |
|---|---|
| **STATIC_DEPLOYMENT_ARCHITECTURE.md** | GitHub Pages architecture, boundaries, rollback |
| **PUBLIC_RELEASE_CHECKLIST.md** | Pre-deploy human gate |
| **POST_DEPLOY_SMOKE_TESTS.md** | URL/path checks after deploy |
| **PUBLIC_DEPLOYMENT_BASELINE.md** | First public deploy record (URL, run ID, smoke tests) |

---

## .github/workflows/

| File | Role |
|---|---|
| **validate-and-build.yml** | PR/push: generate:evidence-candidates → validate:data → build |
| **deploy-static-site.yml** | Manual GitHub Pages deploy (`workflow_dispatch`, `DEPLOY` confirm) |
| **monitoring-cycle.yml** | Scheduled/watchers (no deploy) |

---

## scripts/ (v0.8.4)

| File | Role |
|---|---|
| **verify-dist-output.mjs** | `npm run verify:dist` — post-build path checks |
| **rewrite-dist-base-path.mjs** | Prefix `href`/`src` in HTML for GitHub Pages base path |

---

## research/ (v0.3.2–v0.3.3)

| File | Role |
|---|---|
| **research/THIRD_PARTY_ACCELERATION_AUDIT.md** | Per-source reuse classification |
| **research/OPEN_SOURCE_COMPONENT_SHORTLIST.md** | Map, site, search, validation picks |
| **research/COMPETITOR_FEATURE_REPLICATION_PLAN.md** | Clean-room feature plan |
| **research/OFFICIAL_SOURCE_INGESTION_CANDIDATES.md** | Future watcher table |
| **research/VERIFYWISE_ARCHITECTURE_STUDY.md** | VerifyWise architecture reference (v0.3.3) |
| **research/CLEAN_ROOM_FEATURE_BACKLOG.md** | Prioritized implementation backlog (v0.3.3) |

---

## Frontend (v0.4.0)

| Path | Role |
|---|---|
| **package.json** | astro, js-yaml, ajv, pagefind |
| **scripts/generate-static-exports.mjs** | JSON + RSS generation |
| **public/data/** | Generated JSON exports |
| **public/feeds/changes.xml** | Sample changes RSS |
| **src/pages/search.astro** | Pagefind search UI |
| **src/pages/methodology.astro** | Methodology |
| **src/pages/disclaimer.astro** | Disclaimer |
| **astro.config.mjs** | Static site config |
| **src/pages/** | Generated routes (home, jurisdictions, sources, records, changes, exports) |
| **src/components/** | Badges, cards, review banners |
| **src/lib/data.ts** | YAML loaders (build time) |
| **scripts/validate-data.mjs** | ajv CI validation |
| **scripts/check-official-urls.mjs** | Manual technical URL check (`npm run check:urls`; not CI) |
| **docs/URL_VERIFICATION_POLICY.md** | Technical vs content review policy |
| **docs/URL_REMEDIATION_LOG.md** | v0.6.2 URL fix log |
| **data/verifications/source-identity-review-2026-05-19.yml** | Source identity review batch |
| **schemas/url-verification.schema.json** | URL check batch schema |

## docs/ (v0.3.3–v0.4.0)

| File | Role |
|---|---|
| **docs/NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md** | SSG option comparison; Astro recommended |
| **docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md** | v0.4.0 plan (skeleton delivered) |

## docs/

| File | Role |
|---|---|
| **docs/PILOT_SOURCE_REGISTRY.md** | v0.2.0 registry |
| **docs/SAMPLE_RECORDS_GUIDE.md** | v0.3.0 samples |
| **docs/TAXONOMY_AND_REVIEW_WORKFLOW.md** | v0.3.1 taxonomies and review |
| **docs/EVIDENCE_EXPORT_CONTRACT.md** | v0.3.1 export contract |
| **docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md** | v0.3.2 reuse policy |
| **docs/ACCELERATION_DECISION_MATRIX.md** | v0.3.2 decision matrix |
| **docs/DECISION_LOG.md** | Decisions through DEC-013 |
| **docs/COMPETITOR_BENCHMARKS.md** | Benchmarks incl. Fairly |
| **docs/FULL_SCALE_PRODUCT_BLUEPRINT.md** | Master blueprint |
| **docs/RESEARCH_CONTEXT.md** | Domain research (preserve) |
