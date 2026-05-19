# Competitor Benchmarks — Caesar AI Regulation Watch

**Prepared:** 19 May 2026  
**Updated:** v0.3.3 — VerifyWise architecture study complete; linked to acceleration policy  
**Purpose:** Study product patterns and feature categories. **Do not copy** code, UI, database schemas, proprietary text, or restricted implementations.

Policy: [THIRD_PARTY_CODE_AND_DATA_POLICY.md](THIRD_PARTY_CODE_AND_DATA_POLICY.md) · Audit: [../research/THIRD_PARTY_ACCELERATION_AUDIT.md](../research/THIRD_PARTY_ACCELERATION_AUDIT.md) · Replication plan: [../research/COMPETITOR_FEATURE_REPLICATION_PLAN.md](../research/COMPETITOR_FEATURE_REPLICATION_PLAN.md)

---

## How to use this document

| Allowed | Not allowed |
|---|---|
| Study UX patterns, feature categories, workflows | Copy competitor code or UI 1:1 |
| Recreate ideas in original Caesar specifications | Present competitor data as our own without attribution |
| Use open datasets per license with attribution | Claim features competitors offer as guarantees we also offer |
| Cite official sources directly with URLs | Republish law firm or paywalled analysis without permission |

---

## Primary benchmarks

### Techieray Global AI Regulation Tracker

- **URL:** https://www.techieray.com/GlobalAIRegulationTracker
- **Type:** Proprietary public product
- **What to study:** Interactive world map/globe, region profiles, search, insights dashboard, newsfeed, API/widget concept, “vibe” or sentiment-style engagement patterns
- **Caesar takeaway:** Map-first navigation and country drill-down; we add governance control/evidence mapping and open data exports
- **Reuse:** UX inspiration only; no code or data copy

### VerifyWise Global AI Regulations Tracker

- **URL:** https://verifywise.ai/global-ai-regulations
- **Repository (platform):** https://github.com/bluewave-labs/verifywise — BSL 1.1, internal-use grant
- **Type:** Proprietary / source-available platform benchmark (BSL-style restrictions on code)
- **v0.3.3 study:** [../research/VERIFYWISE_ARCHITECTURE_STUDY.md](../research/VERIFYWISE_ARCHITECTURE_STUDY.md) — architecture reference only; **no code imported**
- **What to study:** Country coverage presentation, status labels, enforcement timelines, summaries, change history, regulation cards; platform patterns (evidence hub, frameworks, review workflows)
- **Caesar takeaway:** Status badges and timeline UX; evidence-oriented export instead of platform lock-in; static YAML/git instead of SaaS lock-in
- **Reuse:** Benchmark only; clean-room implementation per [CLEAN_ROOM_FEATURE_BACKLOG.md](../research/CLEAN_ROOM_FEATURE_BACKLOG.md)

### DLA Piper — AI Laws of the World

- **URL:** https://intelligence.dlapiper.com/artificial-intelligence
- **Type:** Law firm intelligence content
- **What to study:** Country-by-country profile structure, jurisdiction comparison, legal topic grouping
- **Caesar takeaway:** Profile page information architecture; we anchor on **official sources** rather than firm analysis as primary
- **Reuse:** Content reference for structure only; no text copy; not legal advice

### OECD.AI Policy Navigator

- **URL:** https://oecd.ai/en/dashboards/overview
- **Type:** Public policy repository (80+ jurisdictions)
- **What to study:** Policy taxonomy, official source linking, credibility framing, dashboard filters
- **Caesar takeaway:** Authoritative source linking and policy categorization; verify OECD data reuse terms before bulk import
- **Reuse:** Citation and taxonomy ideas; check data terms for any automated ingestion

### IAPP Global AI Law and Policy Tracker

- **URL:** https://iapp.org/resources/article/global-ai-legislation-tracker
- **Type:** Professional association resource
- **What to study:** Privacy/compliance audience framing, legislative tracker format, jurisdiction selection
- **Caesar takeaway:** Audience-appropriate language and tracker tables; pair with evidence mapping for practitioners
- **Reuse:** Reference only; no content republication without permission

### AI Legislation Tracker (open source)

- **URL:** https://github.com/delschlangen/ai-legislation-tracker
- **Type:** Structured dataset / tooling — **MIT License** (verified 19 May 2026)
- **Classification:** `data_seed_candidate` — see [ACCELERATION_DECISION_MATRIX.md](ACCELERATION_DECISION_MATRIX.md)
- **What to study:** Queryable regulation records, structured fields, global scope data model
- **Caesar takeaway:** Machine-readable registry patterns; merge with Caesar control/evidence layer and official-source-first policy
- **Reuse:** Permitted with attribution; **re-verify every row against official sources** before `reviewed`

### artificialintelligenceact.eu

- **URL:** https://artificialintelligenceact.eu/
- **Type:** Public EU AI Act resource (content site)
- **Classification:** `reference_only`
- **What to study:** AI Act-focused navigation, timeline/checker UX, topic breakdown for EU AI Act
- **Caesar takeaway:** Deep EU AI Act user experience; Caesar covers EU AI Act as **one jurisdiction cluster** within global product
- **Reuse:** Link and cite; do not copy site text or tools; prefer EUR-Lex / EU AI Office as primary

### Fairly Regulation and Policy Tracker

- **URL:** https://github.com/fairlyAI/fairly-regulation-policy-tracker
- **Type:** Feedback repo for Fairly’s commercial global regulatory map
- **Classification:** `blocked_or_unknown` — **no LICENSE file** in repo (19 May 2026)
- **What to study:** Color-coded status legend, sector roadmap presentation
- **Caesar takeaway:** Status color concept only; implement with Caesar taxonomies and original palette
- **Reuse:** **Blocked** for data/code until license clarified; benchmark UX only

### Techieray API (supplement)

- **URL:** https://pypi.org/project/techieray-ai-reg-tracker-api/ · [API Terms](https://docs.google.com/document/d/e/2PACX-1vQnGlGUDn83BHl-fNkQJIQNndktpK-AY2FGwR3z4-PkQQgvDrix-wZnoAOne6BDZw/pub)
- **Classification:** `api_integration_candidate` — proprietary; no public redistribution of API Data on standard tiers
- **Reuse:** Internal evaluation only under subscription; not Caesar primary truth

---

## Secondary references (hub research)

| Resource | URL | Notes |
|---|---|---|
| ETO AGORA | https://agora.eto.tech/ | Broad law/standards catalog; verify reuse terms |
| MAIR | https://github.com/ModelOriented/MAIR | Research/regulation monitoring; verify license |
| White & Case AI Watch | Law firm tracker style | Content reference only |
| NCSL / enterprise trackers | Various | Workflow benchmarks for future OS inbox |

---

## Feature parity targets (conceptual)

Reproduce or improve **in original Caesar form**:

```text
- global map / globe entry
- country / jurisdiction profiles
- status labels and timelines
- change history with source links
- search and region filters
- summaries (with review gate)
- RSS and JSON export
```

Add **Caesar-specific** layers:

```text
- affected controls mapping
- affected evidence suggestions
- caesar-ai-evidence regulation-change export
- consultant review workflow
- Norway / EEA implementation depth
- future Governance OS regulatory inbox
```

---

## Positioning statement (vs benchmarks)

> Benchmark trackers help you **see** regulatory developments. Caesar AI Regulation Watch helps you **see changes, review sources, and connect updates to controls and evidence** in the Caesar governance ecosystem — without claiming compliance or complete global coverage.
