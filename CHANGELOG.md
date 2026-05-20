# Changelog

All notable changes to the Caesar AI Regulation Watch project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

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
