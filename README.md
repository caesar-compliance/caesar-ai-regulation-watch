# Caesar AI Regulation Watch

**Global AI regulation monitoring for governance teams** — part of the [Caesar AI Governance Hub](https://github.com/caesar-compliance/caesar-ai-governance-hub) ecosystem.

**Last updated:** 19 May 2026  
**Status:** v0.3.2 — third-party acceleration policy and adoption plan (static data only; no third-party code imported; no watchers, UI, APIs, or automated monitoring)

---

## What this product is

**Caesar AI Regulation Watch** helps teams monitor AI-related laws, official guidance, and authoritative regulatory sources across jurisdictions. It is designed to:

- track **official and authoritative sources** (not unofficial commentary as primary truth);
- help **identify regulatory changes** that may require governance review;
- maintain **jurisdiction profiles**, timelines, and change history;
- **map changes to controls and evidence** for structured governance workflows;
- export structured records for **Caesar AI Evidence** and future **Caesar AI Governance OS** integration.

It is **not** legal advice, **not** a compliance guarantee, and **not** a claim of complete global legal coverage. Coverage grows incrementally by curated source registry and human review.

---

## Full-scale product vision (summary)

At maturity, Caesar AI Regulation Watch becomes a public intelligence layer and data product:

```text
Global map / globe
  → jurisdiction profiles (country, region, bloc)
    → official source registry
      → law & guidance records
        → regulatory timelines & change history
          → status labels & source credibility
            → AI-assisted summaries (reviewed)
              → affected controls & affected evidence
                → RSS / JSON API / export
                  → public website (regulations.caesar.no)
                    → Caesar AI Governance OS regulatory inbox
```

**Positioning:** Open tools for turning AI regulatory change into governance evidence — not another static AI Act checklist.

---

## Who it is for

| Audience | Need |
|---|---|
| **Compliance / legal teams** | See what changed, where, and what may need review |
| **AI governance consultants** | Client memos, impact notes, evidence update suggestions |
| **SMEs operating across borders** | Practical jurisdiction awareness without enterprise GRC cost |
| **Developers / policy leads** | Machine-readable feeds and ecosystem integration |

---

## Core capabilities (target)

| Capability | Description |
|---|---|
| **Global map / globe** | Visual entry point to jurisdictions; filter by region, status, topic |
| **Jurisdiction profiles** | Country/region pages: regulators, laws, guidance, timelines, sources |
| **Official source registry** | Canonical URLs, document types, fetch cadence, credibility tier |
| **Law & guidance records** | Structured entries for instruments and official guidance |
| **Regulatory timelines** | Adoption, entry into force, deadlines, implementation milestones |
| **Change history** | Detected updates with diffs, summaries, and review status |
| **Status labels** | e.g. proposed, adopted, in force, guidance, voluntary, withdrawn |
| **Source credibility** | Official vs authoritative secondary; last verified; attribution |
| **AI summary layer** | Draft summaries flagged for human review; never sole legal basis |
| **Affected controls** | Links regulatory change to control library concepts |
| **Affected evidence** | Suggests evidence items that may need refresh or review |
| **RSS / API / export** | Public feeds and JSON for tools and consultants |
| **Public website** | Search, filters, timelines, source transparency |
| **Governance OS** | Future regulatory inbox, client workspaces, tasks, alerts |

---

## How it fits the Caesar ecosystem

```text
caesar-ai-regulation-watch
  → tracks official sources (future: helps identify regulatory changes)
  → maps to controls & evidence suggestions (curated; human review)
  → exports regulation-change records (caesar-ai-evidence; planned)
  → future import into caesar-ai-governance-os (regulatory inbox)
```

Sibling tools: [caesar-ai-evidence](https://github.com/caesar-compliance/caesar-ai-evidence), [caesar-ai-vendor-watch](https://github.com/caesar-compliance/caesar-ai-vendor-watch), [caesar-ai-scan](https://github.com/caesar-compliance/caesar-ai-scan), [caesar-ai-governance-os](https://github.com/caesar-compliance/caesar-ai-governance-os) (planned).

---

## Competitor benchmarks (study only)

We study product patterns from these resources; we do **not** copy their code, UI, or proprietary data:

| Resource | URL |
|---|---|
| Techieray Global AI Regulation Tracker | https://www.techieray.com/GlobalAIRegulationTracker |
| VerifyWise Global AI Regulations Tracker | https://verifywise.ai/global-ai-regulations |
| DLA Piper AI Laws of the World | https://intelligence.dlapiper.com/artificial-intelligence |
| OECD AI Policy Navigator | https://oecd.ai/en/dashboards/overview |
| IAPP Global AI Law and Policy Tracker | https://iapp.org/resources/article/global-ai-legislation-tracker |
| AI Legislation Tracker (open dataset) | https://github.com/delschlangen/ai-legislation-tracker |
| artificialintelligenceact.eu | https://artificialintelligenceact.eu/ |
| Fairly Regulation and Policy Tracker | https://github.com/fairlyAI/fairly-regulation-policy-tracker |

Details: [docs/COMPETITOR_BENCHMARKS.md](docs/COMPETITOR_BENCHMARKS.md). Competitor features are **benchmark inputs only** — see [docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md](docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md).

---

## Pilot registry (v0.2.0)

Curated **EU and Norway** official source registry (not complete legal coverage):

- [docs/PILOT_SOURCE_REGISTRY.md](docs/PILOT_SOURCE_REGISTRY.md) — index and review workflow
- `data/jurisdictions/` — `eu.yml`, `norway.yml`
- `data/sources/` — seven pilot official sources
- `schemas/` — JSON Schema for jurisdiction and source records

## Sample records (v0.3.0)

Manual **law, guidance, change, and mapping** samples for data-model testing only:

- [docs/SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md) — index and field reference
- `data/laws/`, `data/guidance/`, `data/changes/`
- `mappings/` — control and evidence mapping samples
- `schemas/law.schema.json`, `guidance.schema.json`, `change.schema.json`, and mapping schemas

## Third-party acceleration plan (v0.3.2)

Policy and research for faster delivery using **permissive open source**, **official sources**, and **licensed APIs** — without importing competitor code or data in this release:

- [docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md](docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md)
- [docs/ACCELERATION_DECISION_MATRIX.md](docs/ACCELERATION_DECISION_MATRIX.md)
- [research/THIRD_PARTY_ACCELERATION_AUDIT.md](research/THIRD_PARTY_ACCELERATION_AUDIT.md)
- [research/OPEN_SOURCE_COMPONENT_SHORTLIST.md](research/OPEN_SOURCE_COMPONENT_SHORTLIST.md)
- [research/COMPETITOR_FEATURE_REPLICATION_PLAN.md](research/COMPETITOR_FEATURE_REPLICATION_PLAN.md)
- [research/OFFICIAL_SOURCE_INGESTION_CANDIDATES.md](research/OFFICIAL_SOURCE_INGESTION_CANDIDATES.md)

Future implementation may adopt approved open-source dependencies and official-source ingestion per the matrix. **No package managers or third-party source trees in v0.3.2.**

## Taxonomy and export contract (v0.3.1)

Canonical values, review workflow, and future evidence export shape:

- [docs/TAXONOMY_AND_REVIEW_WORKFLOW.md](docs/TAXONOMY_AND_REVIEW_WORKFLOW.md)
- [docs/EVIDENCE_EXPORT_CONTRACT.md](docs/EVIDENCE_EXPORT_CONTRACT.md)
- `data/taxonomies/` — allowed values (statuses, topics, draft refs)
- `exports/samples/regulation-change-export.sample.yml` — sample export only (no client evidence created)
- `schemas/taxonomy.schema.json`, `schemas/evidence-export-record.schema.json`

---

## Documentation map

| Document | Purpose |
|---|---|
| [docs/PILOT_SOURCE_REGISTRY.md](docs/PILOT_SOURCE_REGISTRY.md) | Pilot EU/Norway registry guide |
| [docs/SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md) | Manual sample law/guidance/change records |
| [docs/TAXONOMY_AND_REVIEW_WORKFLOW.md](docs/TAXONOMY_AND_REVIEW_WORKFLOW.md) | Taxonomies and review statuses |
| [docs/EVIDENCE_EXPORT_CONTRACT.md](docs/EVIDENCE_EXPORT_CONTRACT.md) | Future regulation-change export contract |
| [docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md](docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md) | Reuse, attribution, clean-room rules |
| [docs/ACCELERATION_DECISION_MATRIX.md](docs/ACCELERATION_DECISION_MATRIX.md) | Prioritised acceleration decisions |
| [docs/FULL_SCALE_PRODUCT_BLUEPRINT.md](docs/FULL_SCALE_PRODUCT_BLUEPRINT.md) | End-to-end product blueprint |
| [SPEC.md](SPEC.md) | Requirements, scope, inputs/outputs |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Layers, data flow, integrations |
| [docs/DATA_MODEL_DRAFT.md](docs/DATA_MODEL_DRAFT.md) | Entity and field draft |
| [docs/UI_UX_VISION.md](docs/UI_UX_VISION.md) | Public site and globe UX |
| [ROADMAP.md](ROADMAP.md) | Phased delivery plan |
| [PROJECT_STATE.md](PROJECT_STATE.md) | Current phase and boundaries |
| [NEXT_ACTIONS.md](NEXT_ACTIONS.md) | Prioritized next steps |
| [docs/DECISION_LOG.md](docs/DECISION_LOG.md) | Architecture decisions |
| [docs/RESEARCH_CONTEXT.md](docs/RESEARCH_CONTEXT.md) | Domain research (preserved) |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

---

## Important disclaimer

> **No compliance guarantees.** Caesar AI Regulation Watch supports governance review by surfacing tracked official sources, change history, and suggested control/evidence links. It does **not** guarantee regulatory compliance, legal outcomes, or complete coverage of all jurisdictions. All outputs require professional review where appropriate. Automated summaries are assistive only.

---

## Project status

**v0.3.2** defines third-party acceleration policy and adoption research (19 May 2026). v0.3.1 taxonomies and export contract remain the data foundation. No third-party code imported; competitor features are benchmarks only. No automated monitoring or UI yet.

See [PROJECT_STATE.md](PROJECT_STATE.md) and [NEXT_ACTIONS.md](NEXT_ACTIONS.md).
