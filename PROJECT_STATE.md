# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

| Field | Value |
|---|---|
| **Current version** | `v1.0.7` (release prep — deploy pending) |
| **Status** | Release branch — tag `regulation-watch-v1.0.7` after deploy |
| **Deployment** | `DEPLOY-20260520-025` — run TBD |
| **URL** | [regulation-watch.caesar.no](https://regulation-watch.caesar.no/) |
| **Phase** | Public Technical MVP + tracker map/compare (T050) |

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

The **v1.0.7** release adds T050 choropleth-style tracker map and jurisdiction comparison on top of the **v1.0.6** offline metadata adapter feed. See [docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md](docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md) and [docs/AUTOMATION_FIRST_MVP_ROADMAP.md](docs/AUTOMATION_FIRST_MVP_ROADMAP.md).

## v1.0.7 summary (T050 — map + compare)

- **Choropleth-style tracker map** — `/tracker/` regional status panel with legend; heuristic maturity/activity indices on jurisdiction tiles.
- **Compare jurisdictions** — `/compare/` for 2–4 pilot jurisdictions; side-by-side tracker metadata; max-4 selection notice.
- **JSON exports** — enriched `country-status.json`, `jurisdiction-comparison.json`, `automation-first-metrics.json` with `compare_route` and scoring fields.
- **Deploy** — `DEPLOY-20260520-025`, commit and run TBD until workflow completes; tag `regulation-watch-v1.0.7` after smoke pass.
- **No scraping/crawling** — Caesar-native CSS/SVG only; no GPL map libraries; evidence gates unchanged.
- **Recommended next** — T051 richer country profile pages and regional/topic drilldowns.

### Remaining limitations (v1.0.7)

- Heuristic tracker metadata only — not legal certainty or compliance scoring.
- Abstract regional panel — not precise geographic choropleth.
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
