# Caesar AI Regulation Watch

> Automation-first global AI regulation tracker and news intelligence dashboard.

**Live site:** [regulation-watch.caesar.no](https://regulation-watch.caesar.no/)

| | |
|---|---|
| **Status** | v1.0.8 (T051–T059 merged; T060 in progress); live v1.0.7 `DEPLOY-20260520-025` — deploy after T060 |
| **Hosting** | GitHub Pages — static site (Astro) |
| **Scope** | AI regulation tracking, country profiles, latest updates, source monitoring, metrics and structured exports |
| **Safety** | Not legal advice; source transparency and automation confidence labels apply |

Part of the [Caesar AI Governance Hub](https://github.com/caesar-compliance/caesar-ai-governance-hub) ecosystem.

---

## What it does

- Tracks **AI law, regulatory guidance, consultations, enforcement and official policy signals** across jurisdictions.
- Presents regulation status through a **world map**, country profiles, **update feed**, filters and metrics.
- Monitors official and authoritative sources using **automation-first adapters** where safe and permitted.
- Publishes **structured JSON/RSS/API-ready exports** for downstream use.
- Shows **source links, detection metadata and confidence labels** instead of unsupported legal conclusions.
- Keeps public data **static and build-time generated** (Astro) — no runtime backend in the technical base.
- Fits the **Caesar AI Governance ecosystem** (Evidence, Scan, Vendor Watch, Governance OS).

## What it is not

- **Not legal advice** — outputs support awareness and review, not compliance guarantees.
- **Not a complete legal database** — coverage grows incrementally by curated source registry and automation.
- **Not a competitor content mirror** — benchmarks inform Caesar-native implementation only.
- **Not a broad uncontrolled scraping product** — ingestion follows [docs/REFERENCE_DRIVEN_BUILD_POLICY.md](docs/REFERENCE_DRIVEN_BUILD_POLICY.md) and monitoring policy.
- **Not a client evidence product** in the first full MVP.

## Human review and evidence (future optional layer)

Human review is an **optional future assurance layer** for premium legal/evidence workflows. It is **not** the foundation of the first full MVP. The core product direction is automated tracking, updates, metrics, filtering and source-linked country intelligence. Evidence export and `verified_on_source` gates remain closed unless Control Tower approves separately.

---

## What this product is

**Caesar AI Regulation Watch** automatically tracks AI-related laws, official guidance, and authoritative regulatory signals across jurisdictions. It is designed to:

- track **official and authoritative sources** (not unofficial commentary as primary truth);
- surface **latest updates** in a newsfeed-style feed with filters and metrics;
- maintain **jurisdiction profiles**, map coverage, timelines, and change history;
- publish **machine-readable exports** (JSON, RSS) for tools and integrators;
- optionally connect to **controls, evidence and Governance OS** in later assurance phases.

It is **not** legal advice, **not** a compliance guarantee, and **not** a claim of complete global legal coverage. Coverage grows through curated registry and scheduled automation where source policy allows.

---

## Full-scale product vision (summary)

At maturity, Caesar AI Regulation Watch becomes a public intelligence layer and data product:

```text
Official sources / feeds / APIs
  → automated detection & classification
    → regulatory updates & country status
      → global map + country profiles + newsfeed
        → filters, metrics, timelines
          → JSON / RSS / API exports
            → public website (regulation-watch.caesar.no)
              → optional human/evidence assurance layer
                → future Caesar AI Governance OS regulatory inbox
```

**Positioning:** Automation-first global AI regulation tracker and news intelligence — Techieray / Legal Wire style public product with Caesar-native automation, transparency and governance integration later.

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
| The Legal Wire AI Regulation Tracker | https://thelegalwire.ai/ai-regulation-tracker/ |
| VerifyWise Global AI Regulations Tracker | https://verifywise.ai/global-ai-regulations |
| AI regulation map (open source, GPL reference) | https://github.com/riadeane/airegulationmap |
| DLA Piper AI Laws of the World | https://intelligence.dlapiper.com/artificial-intelligence |
| OECD AI Policy Navigator | https://oecd.ai/en/dashboards/overview |
| IAPP Global AI Law and Policy Tracker | https://iapp.org/resources/article/global-ai-legislation-tracker |
| AI Legislation Tracker (open dataset) | https://github.com/delschlangen/ai-legislation-tracker |
| artificialintelligenceact.eu | https://artificialintelligenceact.eu/ |
| Fairly Regulation and Policy Tracker | https://github.com/fairlyAI/fairly-regulation-policy-tracker |

Details: [docs/COMPETITOR_BENCHMARKS.md](docs/COMPETITOR_BENCHMARKS.md) · [docs/COMPETITOR_OPEN_SOURCE_BENCHMARKS_AUTOMATION_FIRST.md](docs/COMPETITOR_OPEN_SOURCE_BENCHMARKS_AUTOMATION_FIRST.md). Competitor features are **benchmark inputs only** — see [docs/REFERENCE_DRIVEN_BUILD_POLICY.md](docs/REFERENCE_DRIVEN_BUILD_POLICY.md), [docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md](docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md) and [docs/COMPETITOR_ASSISTED_SOURCE_DISCOVERY_POLICY.md](docs/COMPETITOR_ASSISTED_SOURCE_DISCOVERY_POLICY.md).

---

## Pilot registry (v0.2.0)

Curated **global static** official source registry starting from EU/Norway pilot plus 11 jurisdictions (not complete legal coverage):

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

## VerifyWise clean-room study (v0.3.3)

Architecture reference study and implementation planning — **no VerifyWise code imported**:

- [research/VERIFYWISE_ARCHITECTURE_STUDY.md](research/VERIFYWISE_ARCHITECTURE_STUDY.md) — structure and patterns (reference only)
- [research/CLEAN_ROOM_FEATURE_BACKLOG.md](research/CLEAN_ROOM_FEATURE_BACKLOG.md) — prioritized Caesar-original features
- [docs/NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md](docs/NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md) — Astro vs Next vs plain generator
- [docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md](docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md) — next implementation plan (not built yet)

## Public pilot site (v0.8.5)

**URL:** https://caesar-compliance.github.io/caesar-ai-regulation-watch/

Manual deploy only (`workflow_dispatch`, `confirm_disclaimers: DEPLOY`). Baseline: [docs/PUBLIC_DEPLOYMENT_BASELINE.md](docs/PUBLIC_DEPLOYMENT_BASELINE.md).

## Static site preview (local)

Read-only Astro site generated from `data/` at build time:

```bash
npm install
npm run validate:data      # ajv — all YAML vs schemas/
npm run generate:evidence-candidates  # local gated export candidates (no network)
npm run build:pages          # build with GitHub Pages base path (deploy parity)
npm run verify:dist          # after build:pages — required paths in dist/
npm run watch:official     # single watcher pass
npm run monitoring:cycle   # watchers + validate + exports + build + report
npm run monitoring:report  # report from existing state (no network)
npm run generate:exports   # public/data/*.json + public/feeds/changes.xml
npm run dev                # local preview (search needs full build)
npm run build              # dist/ + Pagefind search index
npm run preview            # serve dist/
```

**Pages:** home, search, jurisdictions, sources, source discovery, records, changes, exports, methodology, disclaimer.
**Data:** `/data/*.json`, `/feeds/changes.xml` (generated; sample-only).
**Product preview only** — supports governance review, not legal advice.

## Third-party acceleration plan (v0.3.2)

Policy and research for faster delivery using **permissive open source**, **official sources**, and **licensed APIs** — without importing competitor code or data:

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
| [docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md](docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md) | Automation-first product north star (T046) |
| [docs/FIRST_FULL_MVP_REQUIREMENTS.md](docs/FIRST_FULL_MVP_REQUIREMENTS.md) | First full MVP requirements |
| [docs/AUTOMATION_FIRST_MVP_ROADMAP.md](docs/AUTOMATION_FIRST_MVP_ROADMAP.md) | Post-rebase phased roadmap |
| [docs/REFERENCE_DRIVEN_BUILD_POLICY.md](docs/REFERENCE_DRIVEN_BUILD_POLICY.md) | Reference-driven build and license rules |
| [docs/PILOT_SOURCE_REGISTRY.md](docs/PILOT_SOURCE_REGISTRY.md) | Pilot EU/Norway registry guide |
| [docs/SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md) | Manual sample law/guidance/change records |
| [docs/TAXONOMY_AND_REVIEW_WORKFLOW.md](docs/TAXONOMY_AND_REVIEW_WORKFLOW.md) | Taxonomies and review statuses |
| [docs/EVIDENCE_EXPORT_CONTRACT.md](docs/EVIDENCE_EXPORT_CONTRACT.md) | Future regulation-change export contract |
| [docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md](docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md) | Reuse, attribution, clean-room rules |
| [docs/ACCELERATION_DECISION_MATRIX.md](docs/ACCELERATION_DECISION_MATRIX.md) | Prioritised acceleration decisions |
| [research/VERIFYWISE_ARCHITECTURE_STUDY.md](research/VERIFYWISE_ARCHITECTURE_STUDY.md) | VerifyWise architecture study (v0.3.3) |
| [docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md](docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md) | v0.4.0 static site plan |
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
| [docs/MVP_READINESS_AUDIT.md](docs/MVP_READINESS_AUDIT.md) | v0.9.9 module readiness assessment |
| [docs/V1_MVP_BLOCKERS_AND_DECISIONS.md](docs/V1_MVP_BLOCKERS_AND_DECISIONS.md) | v1.0.0 blocker classification |
| [docs/V1_TECHNICAL_MVP_SCOPE_FREEZE.md](docs/V1_TECHNICAL_MVP_SCOPE_FREEZE.md) | v1.0.0 technical MVP scope freeze |
| [docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md](docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md) | **Final v1.0.0 decision** — pending CT sign-off |
| [docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md](docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md) | v1.0.0 final Control Tower decision (APPROVED_WITH_LIMITATIONS) |
| [docs/V1_RELEASE_CANDIDATE_DECISION_RECORD.md](docs/V1_RELEASE_CANDIDATE_DECISION_RECORD.md) | v1.0.0-rc1 Control Tower decision record |
| [docs/V1_RELEASE_CANDIDATE_CHECKLIST.md](docs/V1_RELEASE_CANDIDATE_CHECKLIST.md) | Pre-v1.0.0 / RC sign-off checklist |

---

## Important disclaimer

> **No compliance guarantees.** Caesar AI Regulation Watch supports governance review by surfacing tracked official sources, change history, and suggested control/evidence links. It does **not** guarantee regulatory compliance, legal outcomes, or complete coverage of all jurisdictions. All outputs require professional review where appropriate. Automated summaries are assistive only.

---

## Project status

**v1.0.8 (main)** — T051 richer jurisdiction profiles, `/regions/` and `/topics/` drilldowns, JSON exports. T052 source adapter allowlist (`/source-adapters/`). T053 manual source intake runner (merged PR #13, fixture-first). T054 network dry-run approval (merged PR #14, planning-only). T055 one approved EDPB RSS network dry-run executed locally (merged PR #15, squash `10bdc4c`) — metadata-only `generated/` output; [docs/SINGLE_SOURCE_NETWORK_DRY_RUN.md](docs/SINGLE_SOURCE_NETWORK_DRY_RUN.md). Not published; gates unchanged. Tag `regulation-watch-v1.0.8` and deploy pending future Control Tower approval.

**v1.0.7 (live)** — [regulation-watch.caesar.no](https://regulation-watch.caesar.no/) (`DEPLOY-20260520-025`, tag `regulation-watch-v1.0.7`). T050 map/compare + T049 feed.

**T056 (merged):** Manual review promotion from one local generated T055 dry-run candidate into a draft regulatory update record — [docs/MANUAL_REVIEW_PROMOTION_PIPELINE.md](docs/MANUAL_REVIEW_PROMOTION_PIPELINE.md). Draft excluded from public exports; no new live network in T056. Not verified; not exported; not client/evidence use.

**T057 (merged):** Manual reviewer decision workflow for T056 draft — [docs/MANUAL_REVIEW_DECISION_WORKFLOW.md](docs/MANUAL_REVIEW_DECISION_WORKFLOW.md). `T057-001` / `request_changes`; metadata-only; internal-draft-only; no publication or source verification; no live network in T057.

**T058 (merged):** Draft revision packet after T057 request-changes — [docs/DRAFT_REVISION_PACKET_WORKFLOW.md](docs/DRAFT_REVISION_PACKET_WORKFLOW.md). PR #18 squash `3e5dce8`; `T058-001` revises T056 draft metadata-only; excluded from public exports; no live network in T058.

**T059 (merged):** Internal draft readiness gate — [docs/INTERNAL_DRAFT_READINESS_GATE.md](docs/INTERNAL_DRAFT_READINESS_GATE.md). PR #19 squash `d25247d`; `T059-001`; not ready for publication review.

**T060 (in progress):** Source verification cockpit — [docs/SOURCE_VERIFICATION_COCKPIT.md](docs/SOURCE_VERIFICATION_COCKPIT.md). `/source-verification/`; checklist `T060-001`; pending verification only; not published.

See [PROJECT_STATE.md](PROJECT_STATE.md) and [docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md](docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md).
