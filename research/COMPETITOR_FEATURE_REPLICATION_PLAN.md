# Competitor Feature Replication Plan — Clean-Room

**Prepared:** 19 May 2026  
**Rule:** Replicate **patterns**, not code, UI, text, or proprietary datasets. All implementation must follow [docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md](../docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md).

**Priority scale:** P0 (next phases) · P1 (v0.5) · P2 (post-pilot)

---

## Techieray Global AI Regulation Tracker

| Feature pattern | Caesar clean-room replication | Must not copy | Caesar-specific improvement | Priority |
|---|---|---|---|---|
| Global map / globe entry | 2D Leaflet map → jurisdiction profile (defer 3D globe) | Globe UI assets, Techieray news taxonomy, API data | Control/evidence mapping on every profile; official-source URLs only | P1 |
| Region / country profiles | `data/jurisdictions/*.yml` + profile template | Country blurbs, proprietary sector tags | `related_frameworks`, EEA/Norway depth, `review_status` | P0 |
| Search & filters | Pagefind + topic/status filters from taxonomies | Search ranking on proprietary corpus | Filter by `affected_topics`, `regulatory_status` | P1 |
| Insights dashboard | Internal “review queue” dashboard (future OS) | “Vibe meter”, sentiment widgets | Governance impact: pending changes → controls/evidence | P2 |
| Newsfeed sections | `ChangeRecord` feed from official watchers | Techieray news text and categorization | Source-linked diffs with `confidence_level` | P1 |
| API / widget | JSON/RSS export from Caesar `data/` | Embedded Techieray widget, API Data | `regulation-change` evidence export | P1 |

---

## VerifyWise Global AI Regulations Tracker

| Feature pattern | Caesar replication | Must not copy | Caesar improvement | Priority |
|---|---|---|---|---|
| Regulation cards | Law/guidance cards from YAML | Card layout/CSS, BSL code | Evidence suggestions on card | P1 |
| Status labels | `data/taxonomies/regulatory-statuses.yml` | VerifyWise enum values verbatim | `implementation_update` for Norway/EU | P0 |
| Enforcement timelines | `data/timelines/` (planned) | Their timeline data | Link each milestone to `official_url` | P0 |
| Change history | `data/changes/` + future watcher | Their change records | `record_origin`, export contract | P0 |
| Summaries | Review-gated `SummaryRecord` | Unreviewed marketing summaries | Disclaimers + human review default | P1 |
| Platform lock-in | Open JSON/YAML in git | SaaS-only access | Consultant-friendly git + Evidence export | P0 |

---

## DLA Piper AI Laws of the World

| Feature pattern | Caesar replication | Must not copy | Caesar improvement | Priority |
|---|---|---|---|---|
| Country-by-country matrix | Jurisdiction index page | Firm analysis paragraphs | Official-source-first citations | P1 |
| Topic grouping | `affected_topics` taxonomy | DLA topic names/copy | Map topics → controls | P0 |
| Comparison view | Side-by-side jurisdiction YAML compare (future) | Comparison prose | Evidence impact column | P2 |

---

## OECD AI Policy Navigator

| Feature pattern | Caesar replication | Must not copy | Caesar improvement | Priority |
|---|---|---|---|---|
| Policy taxonomy | Extend taxonomies from OECD categories (original IDs) | OECD labels bulk paste | Official link per policy item | P2 |
| Dashboard filters | Public site filters | OECD dashboard code | Filter → export bundle | P1 |
| Credibility framing | `source-credibility-levels.yml` | OECD branding | Distinguish official vs authoritative_reference | P0 |

---

## IAPP Global AI Law and Policy Tracker

| Feature pattern | Caesar replication | Must not copy | Caesar improvement | Priority |
|---|---|---|---|---|
| Legislative tracker table | Sortable change table on site | IAPP article text | RSS + JSON for practitioners | P1 |
| Privacy/compliance framing | Methodology page language | IAPP copyrighted content | Evidence-oriented positioning | P1 |
| Jurisdiction picker | Map + dropdown from registry | — | Pilot EU/Norway first, honest scope | P0 |

---

## AI Legislation Tracker (open source)

| Feature pattern | Caesar replication | Must not copy | Caesar improvement | Priority |
|---|---|---|---|---|
| Structured global records | Caesar law schema + optional MIT seed merge | Their schema 1:1 | Official URL verification required | P1 |
| Queryable dataset | YAML in git + JSON export | Bulk unverified import | `regulation_watch.*` control/evidence refs | P1 |
| US state coverage | Registry expansion after official check | State list without sources | Norway/EU depth first (pilot) | P2 |

---

## artificialintelligenceact.eu

| Feature pattern | Caesar replication | Must not copy | Caesar improvement | Priority |
|---|---|---|---|---|
| EU AI Act timeline | EU timeline YAML + milestone page | Site copy, checker logic | Part of global product, not single-act silo | P0 |
| Topic breakdown | Topic pages from `affected_topics` | Their topic text | Link EUR-Lex + AI Office | P1 |
| Compliance checker | **Out of scope** as auto-legal tool | Checker UX and rules engine | Governance review hints only (`may_affect`) | P2 (defer) |

---

## Fairly Regulation and Policy Tracker

| Feature pattern | Caesar replication | Must not copy | Caesar improvement | Priority |
|---|---|---|---|---|
| Color-coded status map | Status → color in map legend (original palette) | Fairly colors/branding/data | Credibility tier + review status in legend | P2 |
| Sector roadmaps | `regulatory_focus` on jurisdictions | Fairly roadmap content | Official roadmap URLs only | P2 |
| Global regulatory map | Leaflet choropleth | Unknown-license dataset | Blocked until license clear | **Blocked** |

---

## Cross-cutting Caesar features (not competitor copies)

| Feature | Description | Priority |
|---|---|---|
| **Governance impact mapping** | `mappings/` → controls & evidence | P0 |
| **Evidence export contract** | `regulation-change` YAML/JSON | P0 |
| **Source transparency** | Every page: `official_url`, `last_verified` | P0 |
| **Review workflow** | `review_status` gates public publish | P0 |
| **Methodology & disclaimer** | Hub-safe language | P0 |

---

## Implementation sequence (clean-room)

```text
P0  Taxonomies + timelines + registry (done / in progress)
    → Cross-repo evidence alignment
P0  Static site reading YAML (v0.3.3)
P0  CI schema validation (ajv)
P1  Leaflet map + Pagefind + RSS export
P1  Pilot watchers on official RSS (v0.4)
P1  Optional MIT dataset merge with verification
P2  Expanded jurisdictions, comparison views, OS inbox
```

---

## Quality gate before any public feature ships

- [ ] No competitor text in templates
- [ ] No proprietary dataset in `data/`
- [ ] Design review against [docs/UI_UX_VISION.md](../docs/UI_UX_VISION.md) only
- [ ] Control Tower approves `review_status` for pilot content
