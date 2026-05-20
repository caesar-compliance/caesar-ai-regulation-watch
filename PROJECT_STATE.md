# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

| Field | Value |
|---|---|
| **Current version** | `v1.0.4` |
| **Status** | Live — tag `regulation-watch-v1.0.4` |
| **Deployment** | `DEPLOY-20260520-022` — [26168769688](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26168769688) |
| **URL** | [regulation-watch.caesar.no](https://regulation-watch.caesar.no/) |
| **Phase** | Public Technical MVP (technical base) → automation-first product target |

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

The current **v1.0.4** public technical MVP is the **live technical base**. The next product line moves toward automation-first tracking and public intelligence features. See [docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md](docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md) and [docs/AUTOMATION_FIRST_MVP_ROADMAP.md](docs/AUTOMATION_FIRST_MVP_ROADMAP.md).

## v1.0.4 summary (live technical base)

- **Autonomous official-source verification worker** — `npm run source:verify:autonomous`, schema, allowlist, batch export, `/source-verification/` page.
- **No WAF/bot bypass** — metadata-only fetch, official SPARQL/Cellar attempts, EFTA EEA-Lex official alternative for CELEX identity where EUR-Lex blocked.
- **Browser worker** — not bundled (Playwright pending); documented in workflow.
- `verified_on_source: 0` · `client_use_allowed: 0` · `final_evidence_allowed: 0` unchanged.

## v1.0.3 summary (previous live)

- Manual source verification intake — supplementary placeholders for blocked sources.
- Australia / EUR-Lex / Japan blockers documented; autonomous worker replaces manual-only primary path in v1.0.4.

## Documentation rebase (T046)

Strategy docs added/updated 20 May 2026: automation-first charter, first full MVP requirements, reference-driven build policy, automation-first benchmarks and roadmap. Human-review-first positioning removed from root docs; evidence/export gates remain closed unless separately approved.
