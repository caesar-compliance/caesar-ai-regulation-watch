# Repository Inventory — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Root documentation

| File | Role |
|---|---|
| **README.md** | Public entry; v0.3.1 status |
| **SPEC.md** | Requirements through taxonomy and export contract |
| **ARCHITECTURE.md** | Static data layers including taxonomies and exports |
| **ROADMAP.md** | Phases through v0.3.1 |
| **CHANGELOG.md** | Semver history |
| **REPO_INVENTORY.md** | This file |
| **PROJECT_STATE.md** | v0.3.1 phase |
| **NEXT_ACTIONS.md** | Cross-repo evidence alignment |

---

## data/taxonomies/ (v0.3.1)

| File | Role |
|---|---|
| **regulatory-statuses.yml** | Law/guidance operational status labels |
| **source-credibility-levels.yml** | Source credibility tiers |
| **review-statuses.yml** | Review workflow states |
| **change-types.yml** | Change classification |
| **confidence-levels.yml** | Change confidence |
| **affected-topics.yml** | Topic tags (pilot subset) |
| **control-reference-types.yml** | Draft `regulation_watch.control.*` refs |
| **evidence-reference-types.yml** | Draft `regulation_watch.evidence.*` refs |

---

## data/ (registry and samples)

See v0.2.0 jurisdictions/sources and v0.3.0 laws/guidance/changes in prior inventory sections. Sample entities include `record_origin: manual_sample`.

---

## mappings/ & exports/

| File | Role |
|---|---|
| **mappings/change-to-controls.sample.yml** | Draft control mappings |
| **mappings/change-to-evidence.sample.yml** | Draft evidence mappings |
| **exports/samples/regulation-change-export.sample.yml** | Sample export contract payloads |

---

## schemas/

| File | Role |
|---|---|
| **jurisdiction.schema.json** | Jurisdiction YAML |
| **source.schema.json** | Source YAML |
| **law.schema.json** | Law samples (+ `record_origin`) |
| **guidance.schema.json** | Guidance samples |
| **change.schema.json** | Change samples |
| **change-control-mapping.schema.json** | Control mapping items |
| **change-evidence-mapping.schema.json** | Evidence mapping items |
| **taxonomy.schema.json** | Taxonomy files |
| **evidence-export-record.schema.json** | Export contract record |

---

## docs/

| File | Role |
|---|---|
| **docs/PILOT_SOURCE_REGISTRY.md** | v0.2.0 registry |
| **docs/SAMPLE_RECORDS_GUIDE.md** | v0.3.0 samples |
| **docs/TAXONOMY_AND_REVIEW_WORKFLOW.md** | v0.3.1 taxonomies and review |
| **docs/EVIDENCE_EXPORT_CONTRACT.md** | v0.3.1 export contract |
| **docs/DECISION_LOG.md** | Decisions through DEC-012 |
| **docs/FULL_SCALE_PRODUCT_BLUEPRINT.md** | Master blueprint |
| **docs/RESEARCH_CONTEXT.md** | Domain research (preserve) |
