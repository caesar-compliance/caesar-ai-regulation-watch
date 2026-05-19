# Third-Party Acceleration Audit — Caesar AI Regulation Watch

**Prepared:** 19 May 2026  
**Phase:** v0.3.2 — research only; no imports  
**Classification key:** `allowed_reuse_now` · `allowed_dependency_candidate` · `data_seed_candidate` · `api_integration_candidate` · `reference_only` · `blocked_or_unknown`

---

## Summary counts (19 May 2026)

| Classification | Count |
|---|---|
| allowed_reuse_now | 2 |
| allowed_dependency_candidate | 12 |
| data_seed_candidate | 1 |
| api_integration_candidate | 2 |
| reference_only | 9 |
| blocked_or_unknown | 1 |

---

## Competitor / benchmark products

### Techieray Global AI Regulation Tracker

| Field | Value |
|---|---|
| **Classification** | `reference_only` (product); `api_integration_candidate` (paid API) |
| **URL checked** | https://www.techieray.com/GlobalAIRegulationTracker |
| **License / terms** | Proprietary site; API governed by [Commercial Terms of Service](https://docs.google.com/document/d/e/2PACX-1vQnGlGUDn83BHl-fNkQJIQNndktpK-AY2FGwR3z4-PkQQgvDrix-wZnoAOne6BDZw/pub) (updated 10 Nov 2025). PyPI client: `techieray-ai-reg-tracker-api` (usage subject to same terms). |
| **What can be reused** | UX patterns: globe/map entry, country drill-down, newsfeed sections, insights dashboard concept; internal evaluation of API under paid tier |
| **What cannot be reused** | Tracker UI code, branding, proprietary news corpus, API Data redistribution on public tiers (Standard/Pro restrict “public distribution of API Data”), competitive derivative products |
| **Attribution** | N/A for clean-room UX; API use requires subscription and compliance with Developer terms |
| **Risk** | **Medium** (API contract); **Low** (benchmark-only) |
| **Recommendation** | Benchmark map-first UX. If API is ever used: Commercial tier only, internal gap detection, never republish API payloads in Caesar public JSON/RSS without explicit permission. Prefer official sources for Caesar truth. |

### VerifyWise Global AI Regulations Tracker

| Field | Value |
|---|---|
| **Classification** | `reference_only` |
| **URL checked** | https://verifywise.ai/global-ai-regulations · https://github.com/bluewave-labs/verifywise |
| **License / terms** | Business Source License 1.1 + Internal-Only Additional Use Grant ([LICENSE](https://github.com/bluewave-labs/verifywise/blob/develop/LICENSE.md)). Customer-facing / consulting / SaaS reuse restricted without commercial license. |
| **What can be reused** | Feature concepts: status labels, enforcement timelines, regulation cards, change history presentation |
| **What cannot be reused** | Source code, UI components, database schema, marketing copy, curated regulation text |
| **Attribution** | N/A for clean-room |
| **Risk** | **High** if code copied; **Low** as benchmark |
| **Recommendation** | Study status/timeline UX; implement evidence export and control mapping as Caesar differentiators. No VerifyWise code in Caesar repos. |

### DLA Piper — AI Laws of the World

| Field | Value |
|---|---|
| **Classification** | `reference_only` |
| **URL checked** | https://intelligence.dlapiper.com/artificial-intelligence |
| **License / terms** | Proprietary law-firm intelligence content; no open license |
| **What can be reused** | Information architecture ideas: country profile layout, topic grouping |
| **What cannot be reused** | Firm analysis text, ratings, proprietary summaries, design assets |
| **Attribution** | Cite as external reference only if linking; do not republish body text |
| **Risk** | **Medium** (copyright on analysis) |
| **Recommendation** | Use official sources for record content; optional link in “further reading” after legal review |

### OECD AI Policy Navigator

| Field | Value |
|---|---|
| **Classification** | `reference_only` (bulk data); `api_integration_candidate` (policy metadata, if terms allow) |
| **URL checked** | https://oecd.ai/en/dashboards/overview |
| **License / terms** | OECD site terms; data reuse requires verification per dataset/page ([OECD Terms](https://www.oecd.org/termsandconditions/)) |
| **What can be reused** | Taxonomy ideas, official-source linking patterns, dashboard filter concepts |
| **What cannot be reused** | Bulk policy text export without terms check; OECD branding as Caesar content |
| **Attribution** | OECD citation required if data imported |
| **Risk** | **Medium** for automated ingestion |
| **Recommendation** | Manual cross-check for jurisdiction gaps; evaluate OECD API/catalogue terms before watcher |

### IAPP Global AI Law and Policy Tracker

| Field | Value |
|---|---|
| **Classification** | `reference_only` |
| **URL checked** | https://iapp.org/resources/article/global-ai-legislation-tracker |
| **License / terms** | Professional association content; republication restricted |
| **What can be reused** | Tracker table format, practitioner-oriented framing |
| **What cannot be reused** | Article text, legislative summaries, IAPP proprietary updates |
| **Attribution** | Link only |
| **Risk** | **Medium** |
| **Recommendation** | Benchmark for compliance-audience language; pair with Caesar evidence mapping |

### AI Legislation Tracker (GitHub)

| Field | Value |
|---|---|
| **Classification** | `data_seed_candidate` (dataset); `allowed_dependency_candidate` (if tooling adopted later) |
| **URL checked** | https://github.com/delschlangen/ai-legislation-tracker |
| **License / terms** | **MIT License** (Copyright 2024 Del Schlangen) — verified in repo `LICENSE` |
| **What can be reused** | Structured field ideas; optional merge of MIT-licensed dataset rows after mapping to Caesar schema and official-source verification |
| **What cannot be reused** | Blind trust of rows without official URL check; competitor-style marketing claims |
| **Attribution** | MIT copyright notice if code copied; dataset citation in docs/exports |
| **Risk** | **Low** (license); **Medium** (data accuracy — secondary source) |
| **Recommendation** | Use as **gap-finding seed** for US/international coverage; re-verify every instrument against official source before `review_status: reviewed` |

### artificialintelligenceact.eu

| Field | Value |
|---|---|
| **Classification** | `reference_only` |
| **URL checked** | https://artificialintelligenceact.eu/ |
| **License / terms** | Third-party EU AI Act resource site; content not openly licensed for copy |
| **What can be reused** | EU AI Act UX patterns: timeline, topic navigation, checker flow concepts |
| **What cannot be reused** | Site text, tools, graphics, proprietary summaries |
| **Attribution** | Outbound links to official EUR-Lex / EU AI Office preferred over this site as primary |
| **Risk** | **Low** (benchmark); **Medium** if text copied |
| **Recommendation** | Deep EU UX reference; Caesar EU cluster links official sources only |

### Fairly Regulation and Policy Tracker

| Field | Value |
|---|---|
| **Classification** | `blocked_or_unknown` |
| **URL checked** | https://github.com/fairlyAI/fairly-regulation-policy-tracker |
| **License / terms** | **No LICENSE file** found in `main` or `dev` (19 May 2026). Repo appears oriented to feedback/issues for Fairly’s commercial map. |
| **What can be reused** | Public marketing descriptions of color-coded status map (concept only) |
| **What cannot be reused** | Map data, roadmaps, proprietary regulatory content without license |
| **Attribution** | TBD if license clarified |
| **Risk** | **High** until license verified |
| **Recommendation** | Visual/status legend benchmark only. Contact Fairly or treat as blocked for data/code import. |

---

## Reusable technical components

### AI Legislation Tracker repository (tooling)

| Field | Value |
|---|---|
| **Classification** | `allowed_dependency_candidate` |
| **URL** | https://github.com/delschlangen/ai-legislation-tracker |
| **License** | MIT |
| **Reuse** | CLI/query patterns if needed; not required for v0.4 |
| **Risk** | Low |
| **Recommendation** | Evaluate at data-import phase; prefer Caesar-native YAML pipeline |

### Techieray API client / API service

| Field | Value |
|---|---|
| **Classification** | `api_integration_candidate` |
| **URL** | https://pypi.org/project/techieray-ai-reg-tracker-api/ · Terms: Google Doc above |
| **License** | Proprietary API subscription; client code use tied to API ToS |
| **Reuse** | Internal monitoring supplement only under Commercial tier |
| **Cannot** | Redistribute API Data on Standard/Pro; train competing product; public Caesar feed from API without permission |
| **Risk** | Medium–High |
| **Recommendation** | Defer; official-source watchers first |

### Leaflet

| Field | Value |
|---|---|
| **Classification** | `allowed_dependency_candidate` |
| **URL** | https://leafletjs.com/ |
| **License** | BSD-2-Clause |
| **Reuse** | 2D jurisdiction map |
| **Risk** | Low |
| **Recommendation** | Preferred 2D map for static site (v0.3.3+) |

### MapLibre GL JS

| Field | Value |
|---|---|
| **Classification** | `allowed_dependency_candidate` |
| **URL** | https://maplibre.org/ |
| **License** | BSD-3-Clause |
| **Reuse** | Vector map / optional globe-like interaction |
| **Risk** | Low |
| **Recommendation** | Use if vector tiles or performance needed; higher integration cost |

### D3

| Field | Value |
|---|---|
| **Classification** | `allowed_dependency_candidate` |
| **URL** | https://d3js.org/ |
| **License** | ISC |
| **Reuse** | Timelines, custom charts |
| **Risk** | Low |
| **Recommendation** | Timelines and change charts; not required for MVP map |

### Observable Plot

| Field | Value |
|---|---|
| **Classification** | `allowed_dependency_candidate` |
| **URL** | https://observablehq.com/plot/ |
| **License** | ISC |
| **Reuse** | Declarative charts |
| **Risk** | Low |
| **Recommendation** | Alternative to raw D3 for timeline pages |

### Lunr.js

| Field | Value |
|---|---|
| **Classification** | `allowed_dependency_candidate` |
| **URL** | https://lunrjs.com/ |
| **License** | MIT |
| **Reuse** | Client-side search index |
| **Risk** | Low |
| **Recommendation** | Good fit for static site search |

### Pagefind

| Field | Value |
|---|---|
| **Classification** | `allowed_dependency_candidate` |
| **URL** | https://pagefind.app/ |
| **License** | MIT |
| **Reuse** | Static site search at build time |
| **Risk** | Low |
| **Recommendation** | Preferred if using Astro/Eleventy build pipeline |

### FlexSearch

| Field | Value |
|---|---|
| **Classification** | `allowed_dependency_candidate` |
| **URL** | https://github.com/nextapps-de/flexsearch |
| **License** | Apache-2.0 |
| **Reuse** | Fast client search |
| **Risk** | Low |
| **Recommendation** | Alternative to Lunr for large indexes |

### Astro

| Field | Value |
|---|---|
| **Classification** | `allowed_dependency_candidate` |
| **URL** | https://astro.build/ |
| **License** | MIT |
| **Reuse** | Static site generator |
| **Risk** | Low |
| **Recommendation** | **Top pick** for regulations.caesar.no static-first site |

### Next.js (static export)

| Field | Value |
|---|---|
| **Classification** | `allowed_dependency_candidate` |
| **URL** | https://nextjs.org/ |
| **License** | MIT |
| **Reuse** | SSG / hybrid |
| **Risk** | Low (heavier ops) |
| **Recommendation** | Use only if team standard is Next; Astro lighter for YAML-driven site |

### React (via Astro or Vite)

| Field | Value |
|---|---|
| **Classification** | `allowed_dependency_candidate` |
| **License** | MIT |
| **Reuse** | Interactive map components |
| **Risk** | Low |
| **Recommendation** | Islands architecture via Astro |

### JSON Schema validators (ajv, etc.)

| Field | Value |
|---|---|
| **Classification** | `allowed_dependency_candidate` |
| **URL** | e.g. https://github.com/ajv-validator/ajv |
| **License** | MIT |
| **Reuse** | CI validation of `data/` and `schemas/` |
| **Risk** | Low |
| **Recommendation** | **allowed_reuse_now** at CI phase — adopt in v0.3.3 CI, not v0.3.2 |

### YAML parsers (js-yaml, PyYAML)

| Field | Value |
|---|---|
| **Classification** | `allowed_dependency_candidate` |
| **License** | MIT (js-yaml) / MIT (PyYAML) |
| **Reuse** | Build and validation scripts |
| **Risk** | Low |
| **Recommendation** | Adopt with first package manager approval |

### RSS / feed parsers (feedparser, rss-parser)

| Field | Value |
|---|---|
| **Classification** | `allowed_dependency_candidate` |
| **License** | MIT / BSD-2-Clause (verify per package) |
| **Reuse** | v0.4 watchers |
| **Risk** | Low |
| **Recommendation** | Select at watcher implementation |

---

## Official-source and government API candidates

### EUR-Lex / Cellar

| Field | Value |
|---|---|
| **Classification** | `api_integration_candidate` |
| **URL** | https://eur-lex.europa.eu/ · webservice help · legal notice |
| **License / terms** | EU reuse policy (Decision 2011/833/EU); CC on some editorial content; webservice requires registration and acceptance of legal notice |
| **Reuse** | CELEX metadata, change detection for EU acts |
| **Cannot** | Misrepresent as legal advice; ignore rate limits |
| **Risk** | Medium (complexity) |
| **Recommendation** | Pilot watcher #1 for EU legal instruments |

### EU AI Office / European Commission

| Field | Value |
|---|---|
| **Classification** | `allowed_reuse_now` (linking); `api_integration_candidate` (RSS/HTML watch) |
| **URL** | In `data/sources/eu-ai-office.yml` |
| **License** | EU institutional pages — link and reuse per EU copyright/reuse notices |
| **Risk** | Low–Medium |
| **Recommendation** | RSS or HTML check in v0.4 pilot |

### EDPB / EDPS

| Field | Value |
|---|---|
| **Classification** | `allowed_reuse_now` (registry); watcher via RSS/HTML |
| **Risk** | Low |
| **Recommendation** | Pilot order 2–3 |

### Datatilsynet / Regjeringen.no

| Field | Value |
|---|---|
| **Classification** | `allowed_reuse_now` (registry); `api_integration_candidate` |
| **Risk** | Low–Medium |
| **Recommendation** | Norway pilot watchers after EU cluster stable |

### UK legislation.gov.uk / ICO / DSIT

| Field | Value |
|---|---|
| **Classification** | `api_integration_candidate` |
| **URL** | https://www.legislation.gov.uk/ · https://ico.org.uk/ |
| **License** | Open Government Licence (UK) for many datasets |
| **Risk** | Medium |
| **Recommendation** | Phase after EU/Norway pilot |

### US Congress.gov / Federal Register / state legislatures

| Field | Value |
|---|---|
| **Classification** | `api_integration_candidate` |
| **URL** | https://api.congress.gov/ · https://www.federalregister.gov/ |
| **License** | US public domain / API terms per agency |
| **Risk** | Medium–High (volume) |
| **Recommendation** | Complement MIT AI Legislation Tracker seed with official APIs |

### OECD / UNESCO / G7 pages

| Field | Value |
|---|---|
| **Classification** | `reference_only` (pages); selective `api_integration_candidate` |
| **Risk** | Medium |
| **Recommendation** | Policy context links, not primary law records |

---

## Audit method

- Public pages and GitHub `LICENSE` files checked 19 May 2026.
- Techieray API Terms read from published Google Doc linked on PyPI.
- No automated scraping performed.
- Re-verify licenses before any import commit.
