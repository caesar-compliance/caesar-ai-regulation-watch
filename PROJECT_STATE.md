# Project State — Caesar AI Regulation Watch

**Last updated:** 21 May 2026

| Field | Value |
|---|---|
| **Current version** | `v1.0.18` (T070 — public export approval decision) |
| **Live version** | `v1.0.17` — tag `regulation-watch-v1.0.17` |
| **Status** | T070 in progress; live site v1.0.17 until v1.0.18 deploy |
| **Last deployment** | `DEPLOY-20260521-035` — commit `9a4e848`, run [26233675974](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26233675974) |
| **URL** | [regulation-watch.caesar.no](https://regulation-watch.caesar.no/) |
| **Phase** | Public Technical MVP + profiles/drilldowns (T051) |

## Product strategy decision — 20 May 2026

The product direction is now **automation-first**.

The first full MVP target is a Techieray / The Legal Wire style AI regulation tracker:

- world map;
- country profiles;
- latest updates/newsfeed;
- source-linked update records;
- filters and groupings;
- metrics dashboard;
- structured JSON/RSS/API-ready exports;
- scheduled automation for official and authoritative sources.

Human review is no longer the foundation of the MVP roadmap. It remains an optional future assurance layer for premium legal, client evidence and Caesar AI Evidence / Governance OS workflows.

The **v1.0.8** codebase on main adds T051 richer jurisdiction profiles and regional/topic drilldowns on top of **v1.0.7** map/compare. Live site remains **v1.0.7** until a future deploy is approved. See [docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md](docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md) and [docs/AUTOMATION_FIRST_MVP_ROADMAP.md](docs/AUTOMATION_FIRST_MVP_ROADMAP.md).

## v1.0.8 summary (T051 — profiles + drilldowns)

- **Jurisdiction profiles** — `/jurisdictions/[id]/` tracker hero, metrics, topics, updates, sources, laws/guidance, timelines, safety panel, compare links.
- **Region drilldowns** — `/regions/` and `/regions/[slug]/` from pilot region metadata.
- **Topic drilldowns** — `/topics/` and `/topics/[id]/` from `data/topics/`.
- **JSON exports** — `jurisdiction-profiles.json`, `region-drilldowns.json`, `topic-drilldowns.json`.
- **T052 source adapter allowlist (merged)** — Schema, draft allowlist, validation, fixture-only parser, `/source-adapters/` page, public JSON export. No live collection; no scheduled crawl.
- **T053 manual source intake runner (merged)** — `manual-intake-runs.yml`, validation, fixture-first CLI runner (`edpb-publications-rss` pilot), output under `generated/source-intake-candidates/`. No live network; no scheduling; gates closed. PR #13 squash `0469a9e`.
- **T054 network dry-run approval (merged)** — `network-dry-run-approvals.yml`, validation, planning-only plan generator, guarded runner. Linked to T053-001 / `edpb-publications-rss`. PR #14 squash `78a00be`.
- **T055 single-source network dry-run (merged)** — PR #15 squash `10bdc4c`; `single-network-dry-run-executions.yml` (`T055-001`); exactly one approved EDPB RSS GET executed locally; output under `generated/network-dry-run-candidates/` and `generated/network-dry-run-reports/` (local/gitignored, not committed or published). No scheduling; gates unchanged; no tag/deploy/closeout.
- **T056 manual review promotion (merged)** — PR #16 squash `74e04aa`; `manual-review-promotions.yml` (`T056-001`); one manual-review-only draft from local generated T055 dry-run output under `data/regulatory-updates/drafts/`; draft excluded from public exports; generated network outputs remain local/gitignored; no new live network in T056; not verified; not published; gates unchanged; no tag/deploy/closeout.
- **T057 manual reviewer decision (merged)** — PR #17 squash `413b87f`; `manual-review-decisions.yml` (`T057-001` / `request_changes` for T056 draft); internal-draft-only; no publication; no source verification; no live network in T057; gates unchanged; no tag/deploy/closeout.
- **T058 draft revision packet (merged)** — PR #18 squash `3e5dce8`; `draft-regulatory-update-revisions.yml` (`T058-001`); metadata-only draft edits after T057 `request_changes`; `review_status: revised_after_request_changes`; T056 draft, T057 decision, and T058 revision excluded from public exports; no live network in T058; gates unchanged; no tag/deploy/closeout.
- **T059 internal draft readiness gate (merged)** — PR #19 squash `d25247d`; `internal-draft-readiness-gates.yml` (`T059-001`); result `not_ready_for_publication_review`; next step source verification checklist; no tag/deploy yet.
- **T060 source verification cockpit (merged)** — PR #20 squash `d05f846`; checklist `T060-001`; cockpit `/source-verification/`; pending verification only; no publication.
- **Recommended next** — T061 manual source URL verification result capture (item pass/fail; keep verified_on_source false).

### Remaining limitations (v1.0.8)

- 13 pilot jurisdictions — not complete global coverage.
- Tracker metadata only — not legal advice or verified legal change.
- Simplified map unchanged from T050.
- T055 executed one metadata-only network dry-run locally; not ongoing ingestion; not published to live site.
- Evidence gates remain closed.

## v1.0.7 summary (T050 — map + compare) — live

- **Choropleth-style tracker map** — `/tracker/` regional status panel with legend; heuristic maturity/activity indices on jurisdiction tiles.
- **Compare jurisdictions** — `/compare/` for 2–4 pilot jurisdictions; side-by-side tracker metadata; max-4 selection notice.
- **JSON exports** — enriched `country-status.json`, `jurisdiction-comparison.json`, `automation-first-metrics.json` with `compare_route` and scoring fields.
- **Deploy** — `DEPLOY-20260520-025`, commit `86c9262`, run [26189934284](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26189934284), tag `regulation-watch-v1.0.7`; public smoke pass on `/`, `/tracker/`, `/updates/`, `/countries/`, `/compare/`, `/compare/?ids=eu&ids=uk&ids=us-federal`, and tracker JSON exports.
- **No scraping/crawling** — Caesar-native CSS/SVG only; no GPL map libraries; evidence gates unchanged.
### Remaining limitations (v1.0.7 — live)

- Heuristic tracker metadata only — not legal certainty or compliance scoring.
- Simplified choropleth-style map — not full precise geographic coverage.
- Compare limited to 4 jurisdictions.
- Offline metadata adapter only — not live API/RSS fetch automation.
- 13 pilot jurisdictions — not complete global coverage.
- Not legal advice; not final evidence; not verified legal change; `verified_on_source`, `client_use_allowed`, `final_evidence_allowed`, and `legal_change_claimed` remain closed.

## v1.0.6 summary (previous live — T049)

- **Source adapter pipeline (offline)** — 33 regulatory updates (`manual_seed`: 15, `offline_metadata_adapter`: 18).
- **Deployed** — commit `1e8b7f0`, tag `regulation-watch-v1.0.6`, deploy run [26187837019](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26187837019).

## v1.0.5 summary (previous live — T048)

- **Automation-first tracker skeleton** — `/tracker/`, `/updates/`, `/countries/`.
- **Deployed** — commit `a153043`, tag `regulation-watch-v1.0.5`.

## v1.0.4 summary (previous live technical base)

- **Autonomous official-source verification worker** — metadata-only fetch; evidence gates unchanged.

## Documentation rebase (T046)

Strategy docs added/updated 20 May 2026: automation-first charter, first full MVP requirements, reference-driven build policy, automation-first benchmarks and roadmap. Human-review-first positioning removed from root docs; evidence/export gates remain closed unless separately approved.
