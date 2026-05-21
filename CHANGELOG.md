# Changelog

All notable changes to the Caesar AI Regulation Watch project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- **T075E offline source pilot operator handoff** — `source-pilot-operator-handoff.json`, markdown report, build/validate scripts, `/source-pilot/operator-handoff/` summary UI. Fixture-only chain summary; gates remain closed.

### Changed

- **automation-runtime** — status `source_pilot_operator_handoff_ready` (offline operator handoff export; not live monitoring).

---

## [1.0.25] - 21 May 2026

### Added

- **T075D offline source pilot decision packets** — `source-pilot-decision-packets.json`, build/validate scripts, `/source-pilot/decision-packets/` operator UI with checklist and placeholder decisions. Fixture-only; gates remain closed.

### Changed

- **automation-runtime** — status `source_pilot_decision_packets_ready` (offline decision packet export; not live monitoring).

### Merged

- Fast-forward merge `e6fa1ff` — T075D offline source pilot decision packets.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-043`, commit `0f8091d`, run [26243535039](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26243535039), tag `regulation-watch-v1.0.25`. `/source-pilot/decision-packets/` live; fixture-only decision packets; runtime flags remain disabled; DB health `not_configured`.

---

## [1.0.24] - 21 May 2026

### Added

- **T075C offline source pilot reviewer UI** — `source-pilot-review-candidates.json`, build/validate scripts, `/source-pilot/review/` filter table, enhanced `/source-pilot/` overview. Fixture-only; gates remain closed.

### Changed

- **automation-runtime** — status `source_pilot_reviewer_ready` (offline reviewer export; not live monitoring).

### Merged

- Fast-forward merge `b46a1af` — T075C offline source pilot reviewer UI.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-042`, commit `8124799`, run [26242929134](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26242929134), tag `regulation-watch-v1.0.24`. `/source-pilot/review/` live; fixture-only review candidates; runtime flags remain disabled; DB health `not_configured`.

---

## [1.0.23] - 21 May 2026

### Added

- **T075A controlled source pilot framework** — `source-pilot-registry.yml`, fixture adapter dry-run, public `source-pilot-status.json`, `/source-pilot/`, validators. Metadata-only; network and ingestion remain disabled.

### Changed

- **automation-runtime** — status `source_pilot_framework_ready` (framework only; not live monitoring).

### Merged

- Fast-forward merge `1d18a6c` — T075A controlled source pilot framework.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-041`, commit `0024497`, run [26242192121](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26242192121), tag `regulation-watch-v1.0.23`. `/source-pilot/` live; fixture-only pilot status; runtime flags remain disabled; DB health `not_configured`.

---

## [1.0.22] - 21 May 2026

### Added

- **T074 backend bootstrap** — `.env.runtime.example`, `ops/supabase/README.md`, runtime DB health check/validator, public `runtime-db-health.json`, `/runtime-health/`, `runtime:db:health` and `runtime:supabase:apply` scripts (apply gated by local flag). `pg` devDependency for Postgres health when `psql` is absent.

### Changed

- **monitoring-cycle.yml** — cron schedule removed; `workflow_dispatch` only; schedule guard retained.
- **automation-runtime** — status `backend_bootstrap_ready`; scheduled/live/network flags remain false.

### Merged

- Fast-forward merge `5371b52` — T074 backend bootstrap runtime health.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-040`, commit `2b7bdd4`, run [26239052890](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26239052890), tag `regulation-watch-v1.0.22`. `/runtime-health/` live; runtime DB health `not_configured`; live ingestion still disabled.

---

## [1.0.21] - 21 May 2026

### Added

- **T073 automation runtime foundation** — Runtime config (`data/runtime/automation-runtime.yml`), schema, validators, public manifest, `/automation/` status page; Supabase schema plan `ops/supabase/001_regulation_watch_runtime_schema.sql`; Cloudflare Worker scaffold `ops/cloudflare-workers/regulation-watch-monitor/`; [docs/AUTOMATION_RUNTIME_STRATEGY.md](docs/AUTOMATION_RUNTIME_STRATEGY.md). Live ingestion, scheduled monitoring, and network execution remain disabled.

### Changed

- Product direction docs pivot toward real automated monitoring (hosted data, snapshots, detected changes); approval-chain pages no longer primary focus.

### Merged

- PR #33 — squash merge `6061a9b`.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-039`, commit `13149e8`, run [26236472664](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26236472664), tag `regulation-watch-v1.0.21`. `/automation/` live; automation runtime manifest live; live ingestion still disabled.

---

## [1.0.20] - 21 May 2026

### Added

- **T072 explicit publication release approval packet** — `schemas/explicit-publication-release-approval-packet.schema.json`, `T072-001` packet; `/publication-release/` operator confirmation screen; [docs/EXPLICIT_PUBLICATION_RELEASE_APPROVAL_PACKET.md](docs/EXPLICIT_PUBLICATION_RELEASE_APPROVAL_PACKET.md); approval packet only; no publication; gates unchanged.

### Merged

- PR #32 — squash merge `fdaf827`.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-038`, commit `bbfefcc`, run [26235902808](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26235902808), tag `regulation-watch-v1.0.20`. Snapshot version 1.0.20; gate counts 0; explicit approval packet prepared; publication not authorized.

---

## [1.0.19] - 21 May 2026

### Added

- **T071 public update release decision** — `schemas/public-update-release-decision.schema.json`, `T071-001` hold decision; `/public-export-gate/` release decision UI; [docs/PUBLIC_UPDATE_RELEASE_DECISION.md](docs/PUBLIC_UPDATE_RELEASE_DECISION.md); publication held; no public route/data; gates unchanged.

### Merged

- PR #31 — squash merge `e871b02`.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-037`, commit `2f987d8`, run [26235173843](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26235173843), tag `regulation-watch-v1.0.19`. Snapshot version 1.0.19; gate counts 0; publication held pending explicit release approval.

---

## [1.0.18] - 21 May 2026

### Added

- **T070 public export approval decision** — `schemas/public-export-approval-decision.schema.json`, `T070-001` decision; non-public preview artifact builder; `/public-export-gate/` decision UI; [docs/PUBLIC_EXPORT_APPROVAL_DECISION.md](docs/PUBLIC_EXPORT_APPROVAL_DECISION.md); preview only; no publication; gates unchanged.

### Merged

- PR #30 — squash merge `30634da`.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-036`, commit `d3a0653`, run [26234369673](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26234369673), tag `regulation-watch-v1.0.18`. Snapshot version 1.0.18; gate counts 0.

---

## [1.0.17] - 21 May 2026

### Added

- **T069 public export release gate** — `schemas/public-export-release-gate.schema.json`, `T069-001` gate; `/public-export-gate/`; [docs/PUBLIC_EXPORT_RELEASE_GATE.md](docs/PUBLIC_EXPORT_RELEASE_GATE.md); internal gate only; ready for public export approval review; no public/data inclusion; gates unchanged.

### Merged

- PR #29 — squash merge `ea87496`.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-035`, commit `9a4e848`, run [26233675974](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26233675974), tag `regulation-watch-v1.0.17`. Snapshot version 1.0.17; gate counts 0.

---

## [1.0.16] - 21 May 2026

### Added

- **T068 publication staging preview UI** — `schemas/publication-staging-preview.schema.json`, `T068-001` preview; `/publication-staging/`; [docs/PUBLICATION_STAGING_PREVIEW_UI.md](docs/PUBLICATION_STAGING_PREVIEW_UI.md); internal preview only; no public export; gates unchanged.

### Merged

- PR #28 — squash merge `4f2e95c`.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-034`, commit `f86b137`, run [26232558906](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26232558906), tag `regulation-watch-v1.0.16`. Snapshot version 1.0.16; gate counts 0.

---

## [1.0.15] - 21 May 2026

### Added

- **T067 publication gate decision capture** — `schemas/publication-gate-decision.schema.json`, `T067-001` approve_for_publication_staging; `/publication-gate/` decision section; [docs/PUBLICATION_GATE_DECISION_CAPTURE.md](docs/PUBLICATION_GATE_DECISION_CAPTURE.md); internal staging only; no publication; gates unchanged.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-033`, commit `a13de3c`, run [26231604878](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26231604878), tag `regulation-watch-v1.0.15`. Snapshot version 1.0.15; gate counts 0.

---

## [1.0.14] - 21 May 2026

### Added

- **T066 publication gate packet UI** — `schemas/publication-gate-packet.schema.json`, `T066-001` packet; `/publication-gate/` checklist and blockers; [docs/PUBLICATION_GATE_PACKET_UI.md](docs/PUBLICATION_GATE_PACKET_UI.md); internal gate only; no publication; gates unchanged.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-032`, commit `c542e1d`, run [26230646170](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26230646170), tag `regulation-watch-v1.0.14`. Snapshot version 1.0.14; gate counts 0.

---

## [1.0.13] - 21 May 2026

### Added

- **T065 final reviewer re-check packet** — `schemas/final-reviewer-recheck.schema.json`, `T065-001` re-check of `T064-001`; `/legal-review/` re-check section; [docs/FINAL_REVIEWER_RECHECK_PACKET.md](docs/FINAL_REVIEWER_RECHECK_PACKET.md); internal `ready_for_publication_gate_review` only; no publication; gates unchanged.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-031`, commit `de3d8c8`, run [26229668487](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26229668487), tag `regulation-watch-v1.0.13`. Snapshot version 1.0.13; gate counts 0.

---

## [1.0.12] - 21 May 2026

### Added

- **T064 legal review revision response UI** — `schemas/final-legal-review-revision-response.schema.json`, `T064-001` response to `T063-001` on `/legal-review/`; [docs/FINAL_LEGAL_REVIEW_REVISION_RESPONSE.md](docs/FINAL_LEGAL_REVIEW_REVISION_RESPONSE.md); ready for reviewer re-check only; no publication; gates unchanged.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-030`, commit `38af753`, run [26229033479](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26229033479), tag `regulation-watch-v1.0.12`. Snapshot version 1.0.12; gate counts 0.

---

## [1.0.11] - 21 May 2026

### Added

- **T063 final legal reviewer decision capture** — `schemas/final-legal-review-decision.schema.json`, `T063-001` `request_changes` on `/legal-review/`; [docs/FINAL_LEGAL_REVIEW_DECISION_CAPTURE.md](docs/FINAL_LEGAL_REVIEW_DECISION_CAPTURE.md); workflow record only; no publication; gates unchanged.

### Deployed

- 21 May 2026 — `DEPLOY-20260521-029`, commit `121f1d2`, run [26228221533](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26228221533), tag `regulation-watch-v1.0.11`. Snapshot version 1.0.11; gate counts 0.

---

## [Unreleased]

### Added

- **T062 final legal review packet UI** — `schemas/final-legal-review-packet.schema.json`, `data/source-adapters/final-legal-review-packets.yml` (`T062-001`), draft metadata on T056, `npm run validate:final-legal-review-packets`, `npm run build:final-legal-review-packet-summary`, [docs/FINAL_LEGAL_REVIEW_PACKET_UI.md](docs/FINAL_LEGAL_REVIEW_PACKET_UI.md), packet at `/legal-review/`. Pending internal review only; not approved; not published; gates unchanged.
- **T061 source verification result capture** — `schemas/source-verification-result.schema.json`, `data/source-adapters/source-verification-results.yml` (`T061-001`), draft metadata on T056, `npm run validate:source-verification-results`, `npm run build:source-verification-result-summary`, [docs/SOURCE_VERIFICATION_RESULT_CAPTURE.md](docs/SOURCE_VERIFICATION_RESULT_CAPTURE.md), results section on `/source-verification/`. Item-level manual outcomes only; `verified_on_source` false; no publication.
- **T060 source verification cockpit** — `schemas/source-verification-checklist.schema.json`, `data/source-adapters/source-verification-checklists.yml` (`T060-001`), `npm run validate:source-verification-checklists`, `npm run build:source-verification-summary`, [docs/SOURCE_VERIFICATION_COCKPIT.md](docs/SOURCE_VERIFICATION_COCKPIT.md), cockpit at `/source-verification/`. Pending verification only; no publication; gates unchanged.
- **T059 internal draft readiness gate** — `schemas/internal-draft-readiness-gate.schema.json`, `data/source-adapters/internal-draft-readiness-gates.yml` (`T059-001` for revised T056 draft), readiness metadata on draft, `npm run validate:internal-draft-readiness-gates`, `npm run build:internal-draft-readiness-summary`, [docs/INTERNAL_DRAFT_READINESS_GATE.md](docs/INTERNAL_DRAFT_READINESS_GATE.md), readiness section on `/source-adapters/`. Result `not_ready_for_publication_review`; next step source verification checklist; no publication; no source verification claim; gates unchanged; no network.
- **T058 draft revision packet workflow** — `schemas/draft-regulatory-update-revision.schema.json`, `data/source-adapters/draft-regulatory-update-revisions.yml` (`T058-001` after T057 `request_changes`), revised draft `data/regulatory-updates/drafts/T056-001.yml`, `npm run validate:draft-regulatory-update-revisions`, `npm run build:draft-revision-summary`, [docs/DRAFT_REVISION_PACKET_WORKFLOW.md](docs/DRAFT_REVISION_PACKET_WORKFLOW.md), draft revision section on `/source-adapters/`. Metadata-only; no publication; no source verification; gates unchanged; no network.
- **T057 manual reviewer decision workflow** — `schemas/manual-review-decision.schema.json`, `data/source-adapters/manual-review-decisions.yml` (`T057-001` / `request_changes` for T056 draft), `npm run validate:manual-review-decisions`, `npm run build:manual-review-decision-summary`, [docs/MANUAL_REVIEW_DECISION_WORKFLOW.md](docs/MANUAL_REVIEW_DECISION_WORKFLOW.md), manual review decisions section on `/source-adapters/`. Internal-draft-only; no publication; no source verification; gates unchanged; no network.
- **T056 manual review promotion pipeline** — `schemas/manual-review-promotion.schema.json`, `schemas/draft-regulatory-update.schema.json`, `data/source-adapters/manual-review-promotions.yml` (`T056-001`), draft `data/regulatory-updates/drafts/T056-001.yml`, `npm run validate:manual-review-promotions`, `npm run build:manual-review-promotion`, [docs/MANUAL_REVIEW_PROMOTION_PIPELINE.md](docs/MANUAL_REVIEW_PROMOTION_PIPELINE.md), manual review section on `/source-adapters/`. Draft excluded from public exports; gates unchanged; no new network request.
- **T055 single-source network dry-run execution** — `schemas/single-network-dry-run-execution.schema.json`, `data/source-adapters/single-network-dry-run-executions.yml` (`T055-001`), `npm run validate:single-network-dry-run-executions`, guarded `npm run run:approved-network-dry-run` (one approved EDPB RSS GET when env/flags present), [docs/SINGLE_SOURCE_NETWORK_DRY_RUN.md](docs/SINGLE_SOURCE_NETWORK_DRY_RUN.md), execution controls on `/source-adapters/`. Output under `generated/network-dry-run-candidates/` and `generated/network-dry-run-reports/` (gitignored; not `public/data/`).
- **T054 network dry-run approval architecture** — `schemas/network-dry-run-approval.schema.json`, `data/source-adapters/network-dry-run-approvals.yml` (pilot `T054-001` linked to `T053-001`), `npm run validate:network-dry-run-approvals`, `npm run build:network-dry-run-plan`, guarded `npm run run:approved-network-dry-run` (refuses in T054), [docs/NETWORK_DRY_RUN_APPROVAL_MODEL.md](docs/NETWORK_DRY_RUN_APPROVAL_MODEL.md), network approval section on `/source-adapters/`.
- **T053 manual source intake runner** — `schemas/manual-source-intake-run.schema.json`, `data/source-adapters/manual-intake-runs.yml` (pilot `T053-001` / `edpb-publications-rss`), `npm run validate:manual-source-intake`, `npm run run:manual-source-intake` (fixture-only CLI), [docs/MANUAL_SOURCE_INTAKE_RUNNER.md](docs/MANUAL_SOURCE_INTAKE_RUNNER.md), manual intake section on `/source-adapters/`.
- **T052 source adapter allowlist architecture** — `schemas/source-adapter-allowlist.schema.json`, `data/source-adapters/source-adapter-allowlist.yml`, safety docs, `npm run validate:source-adapters`, fixture-only RSS/Atom parser (`npm run build:source-adapter-fixtures`), public export `/data/source-adapter-allowlist.json`, page `/source-adapters/`.

### Notes

- T062 merged and deployed v1.0.10 (PR #22 squash `9befed0`; deploy `DEPLOY-20260521-028` commit `1f77822`). Packet `T062-001` at `/legal-review/`; pending only; gates closed; snapshot counts 0.
- T061 merged and deployed v1.0.9 (PR #21 squash `71bd4ef`; deploy `DEPLOY-20260521-027` commit `df2d8d5`). Result `T061-001` item-level manual checks; gates closed; snapshot counts 0.
- T060 merged and deployed v1.0.8 (PR #20 squash `d05f846`; deploy `DEPLOY-20260521-026` commit `299464a`). Source verification cockpit; checklist pending; gates closed.
- T059 merged to main (PR #19, squash `d25247d`). Internal draft readiness gate `T059-001` for revised T056 draft; result `not_ready_for_publication_review`; no publication; no source verification claim; live site remains v1.0.7; no tag/deploy/closeout in T059.
- T058 merged to main (PR #18, squash `3e5dce8`). One metadata-only draft revision (`T058-001`) after T057 `request_changes`; T056 draft, T057 decision, and T058 revision excluded from public exports; no live network in T058; live site remains v1.0.7; no tag/deploy/closeout in T058.
- T057 merged to main (PR #17, squash `413b87f`). One metadata-only `request_changes` decision (`T057-001`) for T056 draft; draft and decision excluded from public exports; no live network in T057; live site remains v1.0.7; no tag/deploy/closeout in T057.
- T056 merged to main (PR #16, squash `74e04aa`). One local dry-run candidate promoted to draft manual-review update; draft excluded from public exports; generated network outputs local/gitignored; not published; not source verified; no new live network in T056; live site remains v1.0.7; no tag/deploy/closeout in T056.
- T055 merged to main (PR #15, squash `10bdc4c`). Exactly one live network GET for EDPB publications RSS executed locally; metadata-only; `generated/` not published; no scheduling; gates unchanged; live site remains v1.0.7; no tag/deploy/closeout in T055.
- T054 merged to main (PR #14, squash commit `78a00be`). Planning-only dry-run approval; no live network; no scheduling; plan under `generated/network-dry-run-plans/` (gitignored). Live site remains v1.0.7; no tag/deploy/closeout in T054.
- T053 merged to main (PR #13, squash commit `0469a9e`). Fixture-first intake; no live network; no scheduling; output under `generated/source-intake-candidates/` (gitignored). Live site remains v1.0.7; no tag/deploy/closeout in T053.
- T052 merged to main (PR #12, squash commit `f3d2055`). No live source collection; adapters disabled/draft/manual-gated.

---

## [1.0.10] - 21 May 2026

### Added

- **T062 final legal review packet UI** — `T062-001` internal packet at `/legal-review/`; pending only; not approved; not published; gates unchanged.

### Notes

- **Deployed** 21 May 2026 — `DEPLOY-20260521-028`, commit `1f77822`, run [26227702669](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26227702669), tag `regulation-watch-v1.0.10`. Snapshot version 1.0.10; gate counts 0.

---

## [1.0.9] - 21 May 2026

### Added

- **T061 source verification result capture** — `T061-001` item-level manual pass/needs-follow-up results; `/source-verification/` results table; `verified_on_source` remains false.

### Notes

- **Deployed** 21 May 2026 — `DEPLOY-20260521-027`, commit `df2d8d5`, run [26227191257](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26227191257), tag `regulation-watch-v1.0.9`. Snapshot version 1.0.9; gate counts 0.

---

## [1.0.8] - 20 May 2026

### Added

- **T051 richer jurisdiction profiles** — Status hero, metrics strip, topic links, latest updates, sources, laws/guidance, timelines, safety/gates panel, and compare shortcuts on `/jurisdictions/[id]/`.
- **T051 region drilldowns** — `/regions/` index and `/regions/[slug]/` detail pages from pilot country-status regions.
- **T051 topic drilldowns** — `/topics/` index and `/topics/[id]/` detail pages from `data/topics/`.
- **JSON exports** — `/data/jurisdiction-profiles.json`, `/data/region-drilldowns.json`, `/data/topic-drilldowns.json`.
- **Nav** — Regions and Topics in main navigation.

### Changed

- **Product version** — `v1.0.8`.

### Notes

- **Deployed** 21 May 2026 — `DEPLOY-20260521-026`, commit `299464a`, run [26226676314](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26226676314), tag `regulation-watch-v1.0.8`. Smoke pass on `/`, `/tracker/`, `/updates/`, `/source-adapters/`, `/source-verification/`; snapshot version 1.0.8; gate counts 0.
- T051–T060 on main including source verification cockpit; internal draft not in public exports; not verified on source.

---

## [1.0.7] - 20 May 2026

### Added

- **T050 choropleth-style tracker map** — Regional status panel with colored jurisdiction tiles, heuristic maturity/activity indices, and legend on `/tracker/`.
- **T050 compare jurisdictions** — `/compare/` for 2–4 pilot jurisdictions; side-by-side tracker metadata table with source links; max-4 selection notice.
- **Tracker scoring metadata** — `regulation_maturity_score`, `activity_score`, `status_weight`, `comparison_summary` on enriched country status exports.
- **JSON export** — `/data/jurisdiction-comparison.json`; scoring fields on `/data/country-status.json`; `choropleth_map_available` and `compare_route` on metrics.

### Changed

- **Product version** — `v1.0.7`.

### Notes

- Caesar-native Astro/CSS/SVG only; no GPL map libraries. Heuristic tracker metadata — not legal advice, not legal certainty, not final evidence. Evidence gates remain closed.
- **Deployed** 20 May 2026 — `DEPLOY-20260520-025`, commit `86c9262`, run [26189934284](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26189934284), tag `regulation-watch-v1.0.7`. Public smoke pass on `/`, `/tracker/`, `/updates/`, `/countries/`, `/compare/`, `/compare/?ids=eu&ids=uk&ids=us-federal`, `/data/country-status.json`, `/data/jurisdiction-comparison.json`, `/data/automation-first-metrics.json`, `/data/regulation-watch-snapshot.json`.

---

## [1.0.6] - 20 May 2026

### Added

- **T049 source adapter pipeline (offline)** — `scripts/build-regulatory-updates-from-metadata.mjs` generates `regulatory_update` candidates from repository monitoring/registry metadata (`offline_metadata_adapter`); `npm run build:regulatory-updates`; feed filter by automation method on `/updates/`; JSON export method counts; metadata adapter badges on tracker/update surfaces.

### Changed

- **Regulatory updates feed** — 33 total updates (`manual_seed`: 15, `offline_metadata_adapter`: 18); `data/regulatory-updates/generated-from-metadata.yml` checked in.
- **Product version** — `v1.0.6`.

### Notes

- No live scraping, crawling, or new network adapters. All evidence gates remain closed. Not legal advice. Not final evidence. Not complete coverage. Not verified legal change.
- **Deployed** 20 May 2026 — `DEPLOY-20260520-024`, commit `1e8b7f0`, run [26187837019](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26187837019), tag `regulation-watch-v1.0.6`. Public smoke pass on `/`, `/tracker/`, `/updates/`, `/countries/`, `/data/regulatory-updates.json`, `/data/automation-first-metrics.json`, `/data/regulation-watch-snapshot.json`.

---

## [1.0.5] - 20 May 2026

### Added

- **T048 automation-first tracker skeleton** — Country status and regulatory update YAML models with JSON Schema validation; seed data for 13 pilot jurisdictions and 15 source-linked updates; public pages `/tracker/`, `/updates/`, `/countries/` with metrics, filters, and CSS/SVG map skeleton; exports `country-status.json`, `regulatory-updates.json`, `automation-first-metrics.json`, `tracker-topics.json`. No scraping; evidence gates remain closed.

### Changed

- **Repository presentation polish** — Updated GitHub About description, added topics (regulatory-intelligence, governance, evidence, source-verification, static-site), polished README top section with clear status table, "What it does" / "What it is not" sections, and updated project status block.
- **Home and navigation** — Automation-first tracker entry points; jurisdiction profiles show tracker status when seeded.
- **Product version** — `v1.0.5`.

### Notes

- Manual seed data only (`automation_method: manual_seed`); adapters deferred to T049. Not legal advice. Not complete coverage. `verified_on_source`, `client_use_allowed`, and `final_evidence_allowed` remain closed.
- **Deployed** 20 May 2026 — `DEPLOY-20260520-023`, commit `a153043`, run [26184820086](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26184820086), tag `regulation-watch-v1.0.5`. Public smoke pass on `/`, `/tracker/`, `/updates/`, `/countries/`, and tracker JSON exports.

---

## [1.0.4] - 20 May 2026

### Added

- **Autonomous official-source verification worker** — `schemas/autonomous-source-verification.schema.json`, allowlist, `scripts/run-autonomous-source-verification.mjs`, `npm run source:verify:autonomous`.
- **Verification batch** — `autonomous-source-verification-2026-05-20-v103.yml` (Australia, EUR-Lex CELEX, Japan METI).
- **Public export** — `/data/autonomous-source-verifications.json`, snapshot counts (`autonomous_source_verification_count`, `machine_verified_identity_count`, `blocked_by_waf_or_bot_gate_count`, etc.).
- **Site** — `/source-verification/` shows autonomous attempts, policy warnings, supplementary manual intake table.

### Changed

- **Source verification workflow** — autonomous machine attempts are primary for blocked sources; manual intake supplementary.
- **EU AI Act** — EFTA EEA-Lex official alternative confirms CELEX 32024R1689 identity (metadata snippet); EUR-Lex primary URL remains bot-gated.
- **Product version** — `v1.0.4`.

### Notes

- No WAF bypass, no full text storage, no `verified_on_source: true`, no client/final evidence. Playwright browser worker not enabled in repo yet.

---

## [1.0.3] - 20 May 2026

### Added

- **Manual source verification intake** — `schemas/manual-source-verification-intake.schema.json`, batch `manual-source-verification-intake-2026-05-20-v103.yml` (Australia, EUR-Lex, Japan METI placeholders).
- **Policy gate** — [VERIFIED_ON_SOURCE_POLICY.md](docs/VERIFIED_ON_SOURCE_POLICY.md), [MANUAL_SOURCE_VERIFICATION_INTAKE_GUIDE.md](docs/MANUAL_SOURCE_VERIFICATION_INTAKE_GUIDE.md).
- **Public export** — `/data/manual-source-verification-intake.json`, snapshot counts (`manual_source_verification_intake_count`, `pending_human_browser_input_count`, `verified_on_source_approved_count: 0`).
- **Site page** — `/source-verification/` (manual intake summary + policy warning).

### Changed

- **Source verification workflow** — blocked sources route to manual intake, not automated retry loops.
- **Product version** — `v1.0.3`.

### Notes

- No `verified_on_source: true`, no client/final evidence, no legal advice. Human browser input still pending for AU/EUR-Lex/Japan.

---

## [1.0.2] - 20 May 2026

### Added

- **Human/browser verification sprint** — `source-verification-2026-05-20-v102.yml` (Australia, EUR-Lex, Canada, Japan, OPC).
- **Content review batch** — `content-review-2026-05-20-v102.yml` (8 entries: Canada confirmed HTTP 200; expansion for OECD, NIST RMF, Norway, EU AI Office).

### Changed

- **Canada** — official responsible-use-of-AI page HTTP 200 re-confirmed (resolves v1.0.1 timeout limitation).
- **Australia** — human/browser pass documented (403/timeout); remains `pending_official_review`.
- **EUR-Lex** — browser bot gate documented; EU AI Act candidate stays `needs_more_source_review`.
- **Japan METI** — timeout/403 documented; human browser still required.
- **Product version** — `v1.0.2`.

### Notes

- Post-MVP hardening only — no new scope, allowlist, or client/final evidence.
- `verified_on_source: 0`; `client_use_allowed: 0`; not legal advice.

---

## [1.0.1] - 20 May 2026

### Added

- **Source verification sprint** — `source-verification-2026-05-20-v101.yml` (Australia, EUR-Lex, EDPB, UNESCO re-check).
- **Content review batch** — `content-review-2026-05-20-v101.yml` (9 records; EDPB refresh + 8 new high-level reviews).

### Changed

- **EDPB AI topic** — HTTP 200 re-check; watcher eligibility updated; source `reviewed_source_identity_only`.
- **UNESCO metadata triage** — `check_artifact` reclassified to `benign_metadata_change`.
- **Content review coverage** — expanded (public snapshot counts updated on deploy).
- **Product version** — `v1.0.1` / package `1.0.1`.

### Notes

- Post-MVP hygiene only — no new jurisdictions, monitoring allowlist, or product features.
- Australia HTML still blocked (timeout); EUR-Lex still HTTP 202; EU AI Act candidate stays `needs_more_source_review`.
- Not legal advice; not complete coverage; `client_use_allowed: 0`; `verified_on_source: 0`.

---

## [1.0.0] - 20 May 2026

### Added

- **Final v1.0.0 release** — Public Technical MVP with Control Tower **APPROVED_WITH_LIMITATIONS**.

### Changed

- **Control Tower decision** — `docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md` signed APPROVED_WITH_LIMITATIONS (20 May 2026).
- **Product version** — `v1.0.0` across `project-version.ts`, public snapshot, and project docs; `package.json` `1.0.0`.
- **Public phase label** — "Public Technical MVP" (not production legal tracker; not client evidence).
- **Release docs** — PROJECT_STATE, NEXT_ACTIONS, README, REPO_INVENTORY, V1_RELEASE_CANDIDATE_CHECKLIST, scope freeze.

### Notes

- Public Technical MVP only — no new product features, jurisdictions, or monitoring allowlist expansion.
- Accepted limitations: Australia WAF, EUR-Lex HTTP 202, EDPB 502, UNESCO `check_artifact`, `verified_on_source: 0`, incomplete content review.
- Not legal advice; not complete coverage; no client-use evidence; no final evidence export; no caesar-ai-evidence integration.
- `client_use_allowed: 0`; `final_evidence_allowed: 0`; `legal_change_claimed: 0`; tag after deploy on main.

---

## [1.0.0-rc1] - 20 May 2026

### Added

- **Technical MVP scope freeze** — `docs/V1_TECHNICAL_MVP_SCOPE_FREEZE.md` (exact v1.0.0 in/out scope).
- **Release candidate decision record** — `docs/V1_RELEASE_CANDIDATE_DECISION_RECORD.md` (Control Tower sign-off gate).

### Changed

- **Product version** — `v1.0.0-rc1` across `project-version.ts`, public snapshot, and project docs; `package.json` `1.0.0-rc.1`.
- **Public phase label** — "Public technical MVP candidate" (release candidate — not final v1.0.0).
- **Release candidate checklist** — status markers (pass / pending CT review / blocked / post-MVP).

### Notes

- Release candidate only — no new product features, jurisdictions, or monitoring allowlist expansion.
- Control Tower sign-off required before final `regulation-watch-v1.0.0` tag.
- No legal advice; no complete coverage; no client-use evidence; no final evidence export; no caesar-ai-evidence integration.
- `client_use_allowed: 0`; `legal_change_claimed: 0`; tag after deploy on main.

---

## [0.9.9] - 20 May 2026

### Added

- **MVP readiness audit** — `docs/MVP_READINESS_AUDIT.md` (module-by-module status for technical MVP candidate).
- **v1.0.0 blockers** — `docs/V1_MVP_BLOCKERS_AND_DECISIONS.md` (must / should / post-MVP classification).
- **Release candidate checklist** — `docs/V1_RELEASE_CANDIDATE_CHECKLIST.md` (Control Tower sign-off gate).

### Changed

- **Product version** — `v0.9.9` across `package.json`, `project-version.ts`, and project docs.
- **Public phase label** — "Public pilot · Technical MVP candidate" (not production-ready).
- **Methodology page** — watcher prototype and live metadata pilot status; conservative MVP candidate wording.

### Notes

- Readiness/audit/release-candidate pack only — no new product features, jurisdictions, or monitoring allowlist expansion.
- No legal advice; no complete coverage; no client-use evidence; no final evidence export; no caesar-ai-evidence integration.
- `client_use_allowed: 0`; `legal_change_claimed: 0`; tag after deploy on main.

---

## [0.9.8] - 20 May 2026

### Added

- **Manual-gated live metadata review workflow** — `.github/workflows/manual-live-metadata-review.yml` (`workflow_dispatch` + `confirm_live_metadata=RUN`; artifact upload only).
- **Artifact pack builder** — `scripts/build-live-metadata-review-artifact.mjs` (`npm run monitoring:live-artifact`); outputs to `tmp/live-metadata-review-pack/`.
- **Monitoring policy gate** — `scripts/check-monitoring-policy.mjs` (`npm run monitoring:policy-check`).
- **Pilot output dir** — `LIVE_METADATA_OUTPUT_DIR` on `run-live-metadata-pilot.mjs` for non-repo writes.

### Changed

- **Monitoring page** — manual artifact workflow section; no scheduled production monitoring implied.
- **Docs** — MONITORING_RUNBOOK, SCHEDULED_MONITORING_POLICY, METADATA_COMPARISON_POLICY, WATCHER_RELIABILITY_POLICY.

### Notes

- No schedule, auto-commit, auto-merge, deploy, client evidence, or final evidence from this workflow; tag after deploy on main.

---

## [0.9.7] - 20 May 2026

### Added

- **Live metadata review triage** — `data/monitoring/metadata-review-triage-2026-05-20-v097.yml` classifies 3 v0.9.6 pilot candidates (benign vs check_artifact).
- **Schema** — `metadata-review-triage.schema.json`; validation policy for `legal_change_claimed`, `human_review_required` by classification.
- **Public export** — `metadata-review-triage.json`; snapshot triage counts; review queue respects triage (`benign` items removed from queue).
- **Docs** — `docs/METADATA_COMPARISON_POLICY.md`; hardened comparison in `run-live-metadata-pilot.mjs` (weak headers, title normalization).

### Changed

- **Change review pack v096** — triage notes; `human_review_required: false` for benign NIST/UK GOV items.
- **Monitoring page** — live metadata triage section with legal-change warning.

### Notes

- Metadata changes are not legal/regulatory change claims; no scheduled crawl; no full legal text; `client_use_allowed: 0`; tag after deploy on main.

---

## [0.9.6] - 20 May 2026

### Added

- **Cautious live metadata pilot** — allowlist (5 official sources), `scripts/run-live-metadata-pilot.mjs` (`npm run monitoring:live-metadata`), live run + change review pack YAML.
- **Schemas** — `live-metadata-pilot`, `live-metadata-run`, `change-review-pack`.
- **Public exports** — `live-metadata-runs.json`, `change-review-packs.json`; snapshot counts; review queue items for metadata review outcomes.
- **Monitoring page** — live pilot section (allowlist, latest run, warnings).

### Notes

- Max one HEAD/GET per allowlisted source; metadata only; no full legal text; compares to v0.9.5 deterministic baseline; not scheduled broad crawl; `client_use_allowed: 0`; no final evidence export.

---

## [0.9.5] - 20 May 2026

### Added

- **Monitoring adapter/config pack** — `schemas/monitoring-source-config.schema.json`, `data/monitoring/source-configs-2026-05-20-v095.yml` (15 sources: 12 fetchable static_page adapters + 3 manual/blocked).
- **Deterministic monitoring pack run** — `data/monitoring/monitoring-run-2026-05-20-v095.yml`, `scripts/run-monitoring-pack.mjs` (`npm run monitoring:pack`).
- **Public export** — `public/data/monitoring-source-configs.json`; extended `monitoring-runs.json` summary counts.
- **Monitoring page** — v0.9.5 adapter pack, latest pack run metrics, blocked/manual-only section.
- **Snapshots policy note** — `data/monitoring/snapshots/README.md`.

### Changed

- **watcher-monitoring-run schema** — `adapter_type`, `fetch_scope`, `metadata_snapshot_created`, `fetch_failed_needs_review`, `product_version`, config batch link.

### Notes

- Deterministic local run only; no scheduled broad crawl; no full legal text storage; not legal advice; `client_use_allowed: 0`; no final evidence export.

---

## [0.9.4] - 20 May 2026

### Added

- **Watcher eligibility model** — `schemas/watcher-eligibility.schema.json`, `data/monitoring/watcher-eligibility-2026-05-20.yml` (15 confirmed/blocked official sources from discovery registry).
- **Deterministic local monitoring run** — `data/monitoring/monitoring-run-2026-05-20-v094.yml`, `schemas/watcher-monitoring-run.schema.json`.
- **Public exports** — `public/data/watcher-eligibility.json`; `monitoring-runs.json` extended with `latest_watcher_monitoring_run`.
- **Monitoring page** — watcher eligibility counts, v0.9.4 run summary, review-queue items for manual/blocked sources.

### Notes

- Monitoring infrastructure expansion only; no broad scraping; no live scheduled monitoring expansion; not legal advice; not complete coverage; `client_use_allowed: 0`; no final evidence export.

---

## [0.9.3] - 20 May 2026

### Added

- **Targeted source verification batch** — `data/verifications/source-verification-2026-05-20-v093.yml` (Australia industry.gov.au, EUR-Lex CELEX 32024R1689, EDPB AI topic).
- **v0.9.3 content review follow-up** — `data/verifications/content-review-2026-05-20-v093.yml` (Australia ethics framework record, EU AI Act law, EDPB AI topic index).

### Changed

- **Australia** — discovery lead and registry notes document continued WAF/403 on HTML publication; lead remains `pending_official_review`.
- **EUR-Lex / EU AI Act** — HTTP 202 bot protection unchanged; export candidate stays `needs_more_source_review`; EC digital-strategy corroboration only.
- **EDPB AI topic** — HTTP 502 transient outage on edpb.europa.eu in v0.9.3 pass; prior v0.9.1 lead confirmation not re-validated live.

### Notes

- Targeted human/browser verification pass; not legal advice; no complete coverage; `client_use_allowed: 0`; no final evidence export.

---

## [0.9.2] - 20 May 2026

### Changed

- **Pending source discovery leads** — White House EO lead resolved to Federal Register EO 14110 (official_source_confirmed); Canada responsible-ai confirmed (HTTP 200); Australia industry principles remains pending (industry.gov.au bot/WAF on automated fetch).
- **EUR-Lex focused pass** — EU AI Act law record and export candidate review notes refreshed; EUR-Lex HTTP 202 limitation unchanged; `needs_more_source_review` retained.
- **First content review batch for v0.9.1 records** — `data/verifications/content-review-2026-05-20-v092.yml` (6 new minimal records + EUR-Lex follow-up); `content_review_status: reviewed_content_summary` on promoted records; `verified_on_source_after_check` remains false.

### Notes

- Not legal advice; no complete coverage; `client_use_allowed: 0`; no final evidence export.

---

## [0.9.1] - 20 May 2026

### Added

- **Competitor-assisted source discovery policy** — `docs/COMPETITOR_ASSISTED_SOURCE_DISCOVERY_POLICY.md`.
- **Source discovery data layer** — `data/source-discovery/source-discovery-leads-2026-05-20.yml` (26 leads), `schemas/source-discovery-lead.schema.json`.
- **Registry expansion** — 9 new official sources (EU AI Act Service Desk, EC European approach, EDPB AI topic, EDPS technology monitoring, UK DSIT, UK AI assurance intro, NIST AI portal, Singapore AI Verify Foundation, Japan PPC).
- **Minimal records** — 6 sample law/guidance/policy pointers from official URLs only (`pending_review`, `verified_on_source: false`).
- **Public page** — `/source-discovery/` and `public/data/source-discovery-leads.json`.

### Notes

- Competitor trackers used as discovery leads only; no competitor text copied; `client_use_allowed: 0`; no final evidence.

---

## [0.9.0] - 20 May 2026

### Added

- **DEPLOYMENTS.md** — deployment event log (Deployment ID, product version, commit, run ID, URL, smoke result) separate from work items and product version.
- **`npm run build:custom-domain`** — site root `/` at `https://regulation-watch.caesar.no/`.

### Changed

- **Product version** — `v0.9.0` across `package.json`, `project-version.ts`, public snapshot, and docs.
- **Deploy workflow** — `deploy-static-site.yml` builds with custom domain (no `/caesar-ai-regulation-watch/` base path); RSS/export URLs use `regulation-watch.caesar.no`.
- **Ecosystem alignment** — follows hub [Versioning and Deployment Standard](https://github.com/caesar-compliance/caesar-ai-governance-hub/blob/main/docs/VERSIONING_AND_DEPLOYMENT_STANDARD.md).

### Notes

- Public pilot only; not final/client evidence; `client_use_allowed: 0`; DNS CNAME already configured by Control Tower.

---

## [0.8.9] - 20 May 2026

### Changed

- **EU AI Act deep source verification** — v0.8.9 pass documents EUR-Lex CELEX HTTP 202 (bot protection); European Commission AI Act overview corroborates CELEX 32024R1689 at high level only. Candidate review remains `needs_more_source_review`; `verified_on_source_after_check` stays false.
- **Datatilsynet AI/privacy source pointer** — `guidance-datatilsynet-ai-privacy` now links official theme hub (`kunstig-intelligens`); content review and URL check updated. Candidate review remains `reviewed_for_internal_governance_only`.

### Notes

- Public pilot only; not final/client evidence; `client_use_allowed: 0`; simulated candidates unchanged.

---

## [0.8.8] - 20 May 2026

### Fixed

- **Public HTML/version consistency** — home banner, footer, and evidence candidates page now always match `package.json` / `src/lib/project-version.ts` after build; `verify:dist` fails on stale labels (v0.5.1 product preview, v0.8.4 footer, v0.8.3 pipeline wording).
- **Evidence candidates JSON batch note** — generator uses current project version instead of hardcoded v0.8.3 text.

### Changed

- **Build scripts** — `generate-static-exports.mjs` and `generate-evidence-export-candidates.mjs` read version from `package.json` via `scripts/lib/read-project-version.mjs`.
- **Evidence export candidates page** — dedicated governance review gate section with machine-readable `candidate_review_status` values in static HTML.

### Notes

- Redeploy ensures public HTML and JSON are built from the same commit. Still public pilot; not final/client evidence; `client_use_allowed: 0`.

---

## [0.8.7] - 20 May 2026

### Added

- **Export-candidate governance review gate** — schema, YAML batch (`evidence-export-candidate-review-2026-05-20.yml`), workflow doc, public `evidence-export-candidate-reviews.json`.
- **Validation policy** for candidate reviews (no `client_use_allowed` / `final_evidence_allowed`; simulated candidates cannot pass governance review).

### Changed

- **Public version labels** — centralized `src/lib/project-version.ts` (`v0.8.7`); home banner and footer no longer show stale v0.5.1 / v0.8.4 strings.
- **Evidence export candidates page** — shows governance review gate status; links to review JSON export.
- **Static exports** — candidates JSON includes `candidate_review_status`; snapshot `version` `0.8.7`.

### Notes

- Reviewed 2 `ready_for_human_review` manual sample candidates: 1 `reviewed_for_internal_governance_only`, 1 `needs_more_source_review`.
- Still not final evidence; still no caesar-ai-evidence writes; `client_use_allowed: 0`.

---

## [0.8.6] - 20 May 2026

### Added

- **First human source/content review batch** — all 9 entries in `content-review-2026-05-19.yml` reviewed with source access notes (access date 20 May 2026).

### Changed

- **Evidence export candidates** — 2 manual sample change candidates moved to `ready_for_human_review` (from `blocked_pending_content_review`); 3 simulated detected changes remain `blocked_simulation_only`.
- **Generator** — clears `blocking_reasons` when status is `ready_for_human_review` (aligns with `validate-data.mjs` policy).
- Project docs updated for v0.8.6 (`PROJECT_STATE.md`, `NEXT_ACTIONS.md`, `README.md`, `REPO_INVENTORY.md`, pipeline/review docs).

### Notes

- Not legal advice; not final evidence export; `client_use_allowed: 0`; `verified_on_source_after_check: false` on all reviewed items.
- EUR-Lex CELEX page hit bot-protection in automated review — partial review only for EU AI Act law record.
- Public redeploy required after merge (prior live deploy was commit `6f28ade`, behind docs-only `1f31b6d`).

---

## [0.8.5] - 20 May 2026

### Added

- **First public GitHub Pages deploy** — live pilot at `https://caesar-compliance.github.io/caesar-ai-regulation-watch/`.
- **Deployment baseline** — `docs/PUBLIC_DEPLOYMENT_BASELINE.md` (commit, workflow run, smoke test record).

### Changed

- GitHub Pages enabled with **GitHub Actions** source (one-time, 20 May 2026).
- Project docs updated for v0.8.5 public pilot status (`PROJECT_STATE.md`, `NEXT_ACTIONS.md`, `README.md`, `REPO_INVENTORY.md`, `POST_DEPLOY_SMOKE_TESTS.md`).

### Notes

- First deploy workflow run: [26130431228](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26130431228); deployed commit `57acfcf`.
- Post-deploy smoke tests passed (pages, JSON, RSS, Pagefind; base path correct).
- **No** custom domain, DNS, secrets, auto-deploy on push, caesar-ai-evidence integration, or `client_use_allowed: true`.
- Evidence export candidates: 5 total; `client_use_allowed: 0`.

---

## [0.8.4] - 20 May 2026

### Added

- **Static deployment readiness** — `docs/STATIC_DEPLOYMENT_ARCHITECTURE.md`, `docs/PUBLIC_RELEASE_CHECKLIST.md`, `docs/POST_DEPLOY_SMOKE_TESTS.md`.
- **Deploy workflow** — `.github/workflows/deploy-static-site.yml` (`workflow_dispatch` only; `confirm_disclaimers: DEPLOY`; official GitHub Pages actions; no secrets).
- **Build helpers** — `npm run build:pages`, `npm run verify:dist`; `scripts/verify-dist-output.mjs`.
- **Astro base path** — optional `ASTRO_BASE_PATH` / `ASTRO_SITE` for GitHub Pages project site.

### Changed

- `astro.config.mjs` — supports GitHub Pages base `/caesar-ai-regulation-watch/` when env set; default local/CI unchanged.
- Project docs updated for v0.8.4 deployment phase.

### Notes

- **No automatic production deploy** on merge to `main`.
- **No** custom domain, DNS, Cloudflare, Coolify, or secrets.
- Expected preview URL after manual deploy: `https://caesar-compliance.github.io/caesar-ai-regulation-watch/`
- Control Tower must enable Pages → GitHub Actions source once.

---

## [0.8.3] - 20 May 2026

### Added

- **Evidence export candidate pipeline** — `schemas/evidence-export-candidate.schema.json`, `scripts/generate-evidence-export-candidates.mjs`, `npm run generate:evidence-candidates`.
- **Data** — `data/evidence-export-candidates/evidence-export-candidates-2026-05-20.yml` (5 gated candidates from changes + detected changes).
- **Docs** — `docs/EVIDENCE_EXPORT_CANDIDATE_PIPELINE.md`; updated `docs/EVIDENCE_EXPORT_CONTRACT.md`.
- **Site** — `/evidence-export-candidates/` page; nav link.
- **Exports** — `public/data/evidence-export-candidates.json`; candidate counts on `regulation-watch-snapshot.json`.

### Changed

- `scripts/validate-data.mjs` — candidate schema + policy validation (`client_use_allowed`, blocking vs status, legal-safe language).
- `npm run build` — runs candidate generation before validate/exports.
- CI `validate-and-build.yml` — generates candidates before validate; build step includes full pipeline.

### Notes

- Candidates are **not** final evidence; **no** writes to caesar-ai-evidence.
- All candidates: `client_use_allowed: false`, `human_review_required: true`.
- Counts: 2 blocked (content review), 3 blocked (simulation), 0 ready for human review.
- No backend, database, auth, or write UI.
- **Merged to `main`:** 20 May 2026 (`merge: v0.8.3 evidence export candidate pipeline`, `3e4fc97`).

---

## [0.8.2] - 19 May 2026

### Added

- **Content review workflow** — `schemas/content-review.schema.json`, `data/verifications/content-review-2026-05-19.yml` (9-item pilot batch).
- **Docs** — `docs/CONTENT_REVIEW_WORKFLOW.md`, `docs/CONTENT_REVIEW_CHECKLIST.md`.
- **Site** — `/content-review/` page; nav/footer link.
- **Exports** — `public/data/content-reviews.json`; content review fields on `verifications.json`, `review-queue.json`, `regulation-watch-snapshot.json`.

### Changed

- Priority records and simulated detected changes include `content_review_status`, `last_content_review_id` (batch placeholders; browser review pending).
- Review queue reasons: `content_review_needs_update`, `source_support_unclear`, `detected_change_needs_content_review`.

### Notes

- All pilot content reviews logged as `not_checked` — human browser review required.
- `client_use_allowed` remains false. No `verified_on_source: true` on records.
- No backend, database, auth, or write UI.

---

## [0.8.1] - 19 May 2026

### Added

- **Monitoring diff summary** — `scripts/summarize-monitoring-changes.mjs`, `npm run monitoring:summary`, `data/monitoring-runs/latest-monitoring-diff-summary.json`.
- **Optional monitoring review PR** — `workflow_dispatch` inputs `create_pr`, `commit_snapshots`, `commit_exports`; branch `monitoring/results-YYYY-MM-DD`; uses `GITHUB_TOKEN` + `gh` CLI.
- **Docs** — `docs/MONITORING_PR_REVIEW_CHECKLIST.md`; updated `SCHEDULED_MONITORING_POLICY.md`, `MONITORING_RUNBOOK.md`.

### Changed

- Scheduled monitoring remains **artifact-only** (no PR on cron).
- Static exports and `/monitoring/` show latest diff summary when present.

### Notes

- No auto-merge. No deploy. No secrets.
- PR created only when `has_meaningful_changes` is true.

---

## [0.8.0] - 19 May 2026

### Added

- **Monitoring cycle orchestrator** — `scripts/run-monitoring-cycle.mjs` with `dry_run`, `write`, `report_only` modes and lock file.
- **Monitoring reports** — `data/monitoring-runs/monitoring-cycle-*.yml`, `schemas/monitoring-run.schema.json`.
- **npm scripts** — `monitoring:cycle`, `monitoring:cycle:dry-run`, `monitoring:report`.
- **GitHub Actions** — `.github/workflows/monitoring-cycle.yml` (`workflow_dispatch` + daily schedule; artifacts only).
- **Docs** — `docs/SCHEDULED_MONITORING_POLICY.md`, `docs/MONITORING_RUNBOOK.md`.
- **Site** — `/monitoring/` page; nav link.

### Changed

- Static exports include `public/data/monitoring-runs.json` and monitoring fields on `regulation-watch-snapshot.json`.
- Review queue: `watcher_soft_error`, `monitoring_run_failed` reasons.

### Notes

- No auto-commit/merge to main from monitoring workflow.
- No deployment workflow added.
- CI `validate-and-build.yml` unchanged (no live fetches on push/PR).

---

## [0.7.4] - 19 May 2026

### Added

- **Feed diagnostics** — `response_status`, `response_content_type`, `final_url`, `parse_error_code`, `diagnostic_note`, `diagnostic_prefix_hash` (and safe prefix when XML) on feed soft-fail; no full body stored.
- **Live API baseline** — first successful Federal Register API metadata snapshot (`snap-api-us-federal-register-*`).
- **Live EDPS feed baseline** — EDPS news RSS snapshot after parser fix.

### Changed

- **EDPS feed** — classified v0.7.3 `invalid_feed` as fast-xml-parser entity expansion limit on valid RSS XML (`application/rss+xml`); raised `maxTotalExpansions` to 2048.
- **Federal Register API watcher** — `enabled: true` with unchanged narrow scope (`per_page=10`, term `artificial intelligence`, metadata-only).
- **Watcher run log** — `feed_diagnostics` on error results; v0.7.4 run: 5 checked, 0 errors.
- **Site** — watcher detail pages show feed/API URLs, diagnostics, feed/API snapshot counts.

### Notes

- No real detected changes from live run (baselines only; prior snapshot required for API/feed diff).
- Watchers remain manual CLI only; not in CI.

---

## [0.7.3] - 19 May 2026

### Added

- **Watcher reliability** — conservative retry/backoff, `error_category`, soft-fail (preserve `latest.yml`).
- **API metadata adapter** — `scripts/lib/source-adapters/api-metadata-adapter.mjs`, `schemas/api-snapshot.schema.json`.
- **Federal Register API watcher** — configured but **disabled by default** (`watcher-us-federal-register-api`).
- **Simulation** — `npm run watch:simulate-api-change`.
- **Docs** — `docs/WATCHER_RELIABILITY_POLICY.md`, `docs/API_WATCHER_CANDIDATES.md`.

### Changed

- Feed/page adapters use shared `fetchWithRetry`; run logs include `errors_by_category`.
- Detected changes support `source_adapter_type`, `api_results_affected`.

---

## [0.7.2] - 19 May 2026

### Added

- **Source adapters** — `official_page_metadata`, `official_rss_or_feed` (`scripts/lib/source-adapters/`).
- **Feed watchers** — EDPB publications RSS, EDPS news RSS (`watcher-edpb-feed`, `watcher-edps-feed`).
- **Feed snapshot schema** — `schemas/feed-snapshot.schema.json`; entry metadata only.
- **Feed diff** — `new_feed_entry`, `removed_feed_entry`, `changed_feed_entry_metadata`, `feed_unreachable`, `feed_redirected`.
- **Simulation** — `npm run watch:simulate-feed-change`, `test-fixtures/feed-snapshots/`.
- **Docs** — `docs/SOURCE_ADAPTERS.md`, `docs/FEED_WATCHER_CANDIDATES.md`.
- **Dependency** — `fast-xml-parser` for RSS/Atom parsing.

### Notes

- Datatilsynet: no confirmed official RSS (page watcher retained).
- Federal Register: candidate log only (API/RSS needs Control Tower scope).
- Watchers not in CI; no article body storage.

---

## [0.7.1] - 19 May 2026

### Added

- **Hardened watcher diff** — `scripts/lib/watcher-diff.mjs` with `changed_fields`, `significance_level`, value summaries, noise control (`ignored_fields`, `volatile_field_note`, `minimum_change_policy`).
- **Simulation command** — `npm run watch:simulate-change`, fixtures in `test-fixtures/watcher-snapshots/`.
- **Docs** — `docs/WATCHER_DIFF_VALIDATION.md`.

### Changed

- Detected change and watcher run schemas (`run_mode`, `simulation`, `detected_change_ids`, `error_summaries`).
- Static pages and exports show run mode, simulation badge, significance, changed fields.
- Review queue distinguishes simulated vs real detected changes.

### Notes

- Simulation proves end-to-end flow without overwriting live `latest.yml`.
- Watchers remain manual; not in CI.

---

## [0.7.0] - 19 May 2026

### Added

- **Official source watcher prototype** — `scripts/run-official-source-watchers.mjs`, `npm run watch:official` (manual CLI only; not in CI).
- **Watcher config** — `data/watchers/official-source-watchers.yml` (pilot: `eu-ai-office`, `datatilsynet`).
- **Schemas** — `watcher-config`, `source-snapshot`, `watcher-run`, `detected-change`.
- **Metadata snapshots** — `data/snapshots/<source_id>/` (hashes and HTTP metadata only; no full body storage).
- **Watcher run logs** — `data/watcher-runs/`.
- **Detected changes** — `data/detected-changes/` (pending review only; no automatic record updates).
- **Static exports** — `watchers.json`, `snapshots.json`, `watcher-runs.json`, `detected-changes.json`.
- **Site pages** — `/watchers/`, `/detected-changes/`.
- **Docs** — `docs/WATCHER_PROTOTYPE.md`, `docs/SNAPSHOT_AND_DIFF_POLICY.md`.

### Changed

- Review queue includes detected changes and watcher errors.
- `regulation-watch-snapshot.json` includes watcher counts and latest run metadata.
- Validation covers watcher config, snapshots, runs, and detected changes.

### Notes

- First baseline run: 2 snapshots, 0 detected changes, 0 errors.
- No `verified_on_source: true` or `client_use_allowed: true`.
- Production scheduling and CI execution explicitly deferred.

---

## [0.6.2] - 19 May 2026

### Added

- **URL remediation log** — `docs/URL_REMEDIATION_LOG.md` documents v0.6.1 problematic URL fixes.
- **Source identity review batch** — `data/verifications/source-identity-review-2026-05-19.yml` (26 sources; identity only).

### Changed

- Remediated official URLs for Australia (Industry, OAIC), Japan METI, Norway, South Korea PIPC, G7 (MIC host), EDPB, EDPS.
- `/verification/` separates technical URL checks, source identity review, and record content review.
- Review queue reasons: `technical_url_fixed`, `source_identity_reviewed_only`, `legal_review_not_done`.
- Schema: `reviewed_source_identity_only` and `needs_human_review` on verification entries.

### Notes

- No `verified_on_source: true` or `client_use_allowed: true`.
- Congress.gov kept with bot-block note; Japan METI uses general English policy index.
- Re-ran `npm run check:urls` after remediation.

---

## [0.6.1] - 19 May 2026

### Added

- **Technical URL verification** — `schemas/url-verification.schema.json`, `docs/URL_VERIFICATION_POLICY.md`, `scripts/check-official-urls.mjs`, `npm run check:urls`.
- **URL check batch** — `data/verifications/url-check-2026-05-19.yml` (41 official URLs; first automated HEAD/GET pass).
- Export: `public/data/url-checks.json`.
- Review queue filters for technical URL status, content review, unreachable, redirected, and not-checked URLs.

### Changed

- `/verification/` shows technical URL summary and human source verification separately.
- Source and record pages show technical URL status when a check exists.
- Review queue uses `review_reasons` (technical vs content vs client-use).
- Snapshot v0.6.1 includes URL check counts; validation includes url-check YAML.

### Notes

- Live URL checks are **not** in CI (`validate-and-build.yml` unchanged).
- Reachable URL does not set `verified_on_source: true` or `client_use_allowed: true`.
- First pass: 26 reachable, 3 redirected, 10 unreachable, 2 DNS errors (41 total).

---

## [0.6.0] - 19 May 2026

### Added

- **12 curated law/guidance/policy records** across UK, US federal, China, Canada, Australia, Singapore, Japan, South Korea, OECD, UNESCO, G7, and Norway implementation tracking.
- **Source verification workflow** — `docs/SOURCE_VERIFICATION_WORKFLOW.md`, `schemas/source-verification.schema.json`, `data/verifications/source-verification-2026-05-19.yml` (12 entries, `not_checked`).
- **Record expansion gaps log** — `docs/RECORD_EXPANSION_GAPS.md`.
- **3 timelines** — UK AI regulation, US federal AI policy, international AI frameworks.
- **Official source** — `china-cac-generative-ai` for CAC generative AI interim measures.
- **Site page** `/verification/` — read-only verification summary.
- Export: `public/data/verifications.json`.

### Changed

- Guidance schema supports `policy_framework` and `implementation_update` record types; optional `verified_on_source` on records.
- Review queue includes unverified records and pending source verifications (85 items in export).
- Jurisdiction pages show coverage summary (sources, records, timelines, pending review).
- Record pages show verification status, related timelines, and record type labels.
- Snapshot version `0.6.0`; 74 static routes.

### Notes

- No live URL verification performed in this release; all new records `verified_on_source: false`.
- No `client_use_allowed: true` in verification batch.
- Watchers, APIs, database, and auth remain not implemented.

---

## [0.5.1] - 19 May 2026

### Added

- **Map metadata** on all 13 jurisdiction YAML files (`map` object with display coordinates).
- **Global coverage map** (`/map/`) — static SVG projection, no Leaflet, no remote tiles.
- **Human review queue** (`/review-queue/`) — read-only aggregated review list with client-side filters.
- Exports: `public/data/map-coverage.json`, `public/data/review-queue.json`.

### Changed

- Snapshot JSON includes map marker count and review queue summary counts.
- Navigation, homepage, methodology, disclaimer, jurisdiction detail pages updated.

### Notes

- Map markers are display aids only — not legal boundary claims.
- Review queue does not update data or mark items reviewed.

---

## [0.5.0] - 19 May 2026

### Added

- **11 global jurisdiction profiles** (UK, US federal, China, Canada, Australia, Singapore, Japan, South Korea, OECD, UNESCO, G7).
- **~20 official source registry entries** for expanded jurisdictions and international bodies.
- **Timeline layer**: `data/timelines/`, `schemas/timeline.schema.json`, `/timelines/` pages, `public/data/timelines.json`.
- **GitHub Actions CI** (`.github/workflows/validate-and-build.yml`) — validate, generate exports, build on push/PR.
- Docs: `docs/TIMELINE_MODEL.md`, `docs/GLOBAL_COVERAGE_EXPANSION.md`, `docs/CI_VALIDATION.md`.

### Changed

- Jurisdiction index grouped by **region**; sources index grouped by **region and jurisdiction**.
- Snapshot JSON v0.5.0 counts include timelines; homepage stats and navigation updated.
- Source schema allows `official_url: null` with `needs_update` workflow.

### Notes

- Still static manual YAML — no watchers, APIs, database, auth, or runtime remote fetch.
- All new data `pending_review` unless explicitly reviewed; not complete global coverage.

---

## [0.4.1] - 19 May 2026

### Added

- **Pagefind** static search (`/search/`) indexing built HTML pages.
- **Methodology** and **disclaimer** pages with Caesar-original legal-safe wording.
- `scripts/generate-static-exports.mjs` — JSON under `public/data/` and RSS at `public/feeds/changes.xml`.
- Client-side **filters** on records, sources, and changes index pages.
- **Developers panel** with links to snapshot JSON and RSS.
- Grouped sources/changes by jurisdiction.

### Changed

- Improved navigation, footer, homepage, card spacing, mobile styles.
- Build pipeline: `generate:exports` → `build:site` → `build:search`.

### Notes

- No watchers, APIs, database, auth, or remote fetch.
- Search requires full `npm run build` (Pagefind indexes `dist/`).

---

## [0.4.0] - 19 May 2026

### Added

- Read-only **Astro** static site skeleton generated from `data/` YAML at build time.
- `package.json` with `astro`, `js-yaml`, `ajv`, `ajv-formats`.
- `src/` pages: home, jurisdictions, sources, records (laws/guidance), changes, exports.
- Components: status, credibility, review badges; review/sample banners.
- `src/lib/data.ts`, `src/lib/format.ts` — local YAML loaders (no remote fetch).
- `scripts/validate-data.mjs` — validates jurisdictions, sources, laws, guidance, changes, taxonomies, mappings, export samples.

### Changed

- README, SPEC, ARCHITECTURE, ROADMAP, PROJECT_STATE, NEXT_ACTIONS, REPO_INVENTORY, DECISION_LOG, V0_4 plan updated for v0.4.0.
- `.gitignore` — `node_modules/`, `dist/`, `.astro/`.

### Notes

- Product preview for governance review support only — not legal advice.
- No VerifyWise or competitor code imported.
- No watchers, APIs, database, authentication, map, or search yet.

---

## [0.3.3] - 19 May 2026

### Added

- VerifyWise clean-room architecture study and v0.4.0 implementation planning (documentation only).
- [research/VERIFYWISE_ARCHITECTURE_STUDY.md](research/VERIFYWISE_ARCHITECTURE_STUDY.md) — repository structure, stack, patterns (reference only; no code copied).
- [research/CLEAN_ROOM_FEATURE_BACKLOG.md](research/CLEAN_ROOM_FEATURE_BACKLOG.md) — prioritized Caesar-original feature backlog.
- [docs/NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md](docs/NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md) — Astro vs Next.js vs plain generator comparison.
- [docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md](docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md) — v0.4.0 static site Definition of Done and rollout plan.

### Changed

- README, SPEC, ARCHITECTURE, ROADMAP, PROJECT_STATE, NEXT_ACTIONS, REPO_INVENTORY, COMPETITOR_BENCHMARKS, THIRD_PARTY_CODE_AND_DATA_POLICY, ACCELERATION_DECISION_MATRIX, DECISION_LOG updated for v0.3.3.
- ROADMAP renumbered: v0.4.0 = static public site; v0.5 = map/search/feeds; v0.6 = watchers.

### Notes

- VerifyWise studied in temporary sandbox only; **no VerifyWise files, code, or package managers committed**.
- Recommended next phase: v0.4.0 Astro read-only static site from existing YAML (pending Control Tower approval).
- Official-source-first data policy unchanged.

---

## [0.3.2] - 19 May 2026

### Added

- Third-party acceleration policy and adoption plan (documentation only).
- [docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md](docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md) — reuse, clean-room, attribution, checklist.
- [docs/ACCELERATION_DECISION_MATRIX.md](docs/ACCELERATION_DECISION_MATRIX.md) — prioritised candidates and phases.
- [research/THIRD_PARTY_ACCELERATION_AUDIT.md](research/THIRD_PARTY_ACCELERATION_AUDIT.md) — competitor, OSS, and official-source classifications.
- [research/OPEN_SOURCE_COMPONENT_SHORTLIST.md](research/OPEN_SOURCE_COMPONENT_SHORTLIST.md) — map, site, search, validation recommendations.
- [research/COMPETITOR_FEATURE_REPLICATION_PLAN.md](research/COMPETITOR_FEATURE_REPLICATION_PLAN.md) — clean-room feature replication.
- [research/OFFICIAL_SOURCE_INGESTION_CANDIDATES.md](research/OFFICIAL_SOURCE_INGESTION_CANDIDATES.md) — future watcher planning table.

### Changed

- README, SPEC, ARCHITECTURE, ROADMAP, PROJECT_STATE, NEXT_ACTIONS, REPO_INVENTORY, COMPETITOR_BENCHMARKS, DECISION_LOG updated for v0.3.2.
- ROADMAP: static site moved to v0.3.3; v0.3.2 is acceleration audit.

### Notes

- No third-party code, package managers, crawlers, or competitor datasets imported.
- Competitor features remain benchmark inputs only.

---

## [0.3.1] - 19 May 2026

### Added

- Defined regulation taxonomy and export contract foundation.
- Eight taxonomy files under `data/taxonomies/`.
- `schemas/taxonomy.schema.json`, `schemas/evidence-export-record.schema.json`.
- `exports/samples/regulation-change-export.sample.yml` (sample only; no client evidence created).
- [docs/TAXONOMY_AND_REVIEW_WORKFLOW.md](docs/TAXONOMY_AND_REVIEW_WORKFLOW.md), [docs/EVIDENCE_EXPORT_CONTRACT.md](docs/EVIDENCE_EXPORT_CONTRACT.md).

### Changed

- Mappings use draft `regulation_watch.control.*` and `regulation_watch.evidence.*` refs with `reference_alignment`.
- Sample law/guidance/change records include `record_origin: manual_sample`.
- Entity schemas: expanded `review_status` enum; `record_origin` on law/guidance/change; `implementation_update` on change types and regulatory statuses.

---

## [0.3.0] - 19 May 2026

### Added

- Added manual sample law, guidance, change, and mapping records.
- `data/laws/eu-ai-act.yml`; `data/guidance/` (EU AI Office GPAI, Datatilsynet); `data/changes/` (two manual samples).
- `mappings/change-to-controls.sample.yml`, `mappings/change-to-evidence.sample.yml`.
- Schemas: `law`, `guidance`, `change`, `change-control-mapping`, `change-evidence-mapping`.
- [docs/SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md).

### Changed

- README, SPEC, ARCHITECTURE, ROADMAP, PROJECT_STATE, NEXT_ACTIONS, REPO_INVENTORY, DECISION_LOG updated for v0.3.0.

### Notes

- Change records are fictionalised manual samples, not watcher output. All entries default to `pending_review`.

---

### Changed (v0.2.0 cleanup — 19 May 2026)

- Aligned README, SPEC, ARCHITECTURE, ROADMAP, PROJECT_STATE, and NEXT_ACTIONS on v0.2.0 static-registry state (removed “in progress” / blueprint-only wording where contradictory).
- Norway jurisdiction: `parent_jurisdiction: null` with `related_frameworks: [eu, eea]` instead of EU parent linkage.
- Extended `schemas/jurisdiction.schema.json` with optional `related_frameworks` field.

---

## [0.2.0] - 19 May 2026

### Added

- Added pilot EU/Norway official source registry foundation.
- `data/jurisdictions/eu.yml`, `data/jurisdictions/norway.yml` — pilot jurisdiction profiles.
- Seven official source records under `data/sources/` (EU AI Act, EU AI Office, EUR-Lex, EDPB, EDPS, Norway implementation, Datatilsynet).
- `schemas/jurisdiction.schema.json`, `schemas/source.schema.json` — JSON Schema for pilot records.
- [docs/PILOT_SOURCE_REGISTRY.md](docs/PILOT_SOURCE_REGISTRY.md) — registry index, gaps, and review workflow.

### Changed

- Updated README, SPEC, ARCHITECTURE, ROADMAP, PROJECT_STATE, NEXT_ACTIONS, REPO_INVENTORY, and DECISION_LOG for v0.2.0.

### Notes

- All registry entries use `review_status: pending_review`. No watchers or automation in this release.

---

## [0.1.0] - 19 May 2026

### Added

- **Full-scale AI regulation monitoring product blueprint** covering global map, jurisdiction profiles, official source registry, law/guidance records, timelines, change history, status labels, source credibility, AI summary layer, affected controls/evidence, RSS/API/export, public website, and Governance OS integration path.
- [docs/FULL_SCALE_PRODUCT_BLUEPRINT.md](docs/FULL_SCALE_PRODUCT_BLUEPRINT.md) — master product blueprint.
- [docs/COMPETITOR_BENCHMARKS.md](docs/COMPETITOR_BENCHMARKS.md) — benchmark references (Techieray, VerifyWise, DLA Piper, OECD, IAPP, AI Legislation Tracker, artificialintelligenceact.eu).
- [docs/DATA_MODEL_DRAFT.md](docs/DATA_MODEL_DRAFT.md) — entity and field draft.
- [docs/UI_UX_VISION.md](docs/UI_UX_VISION.md) — public site and globe UX direction.
- Expanded [README.md](README.md), [SPEC.md](SPEC.md), [ARCHITECTURE.md](ARCHITECTURE.md), [ROADMAP.md](ROADMAP.md), [PROJECT_STATE.md](PROJECT_STATE.md), [NEXT_ACTIONS.md](NEXT_ACTIONS.md), [docs/DECISION_LOG.md](docs/DECISION_LOG.md), [REPO_INVENTORY.md](REPO_INVENTORY.md).

### Changed

- Repositioned product from “EU/Norway crawler MVP” wording to **global regulation monitoring** with honest coverage limits and governance-evidence differentiation.
- Roadmap rephased for v0.2 registry through v1.0 pilot release.

### Notes

- Initial repository foundation (scaffolding files) was established earlier on 19 May 2026; this entry records the blueprint upgrade on the same date.
