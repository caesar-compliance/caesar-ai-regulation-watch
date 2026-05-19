# Repository Inventory — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Root documentation

| File | Role |
|---|---|
| **README.md** | Public entry; v0.6.1 status + npm commands |
| **SPEC.md** | Requirements through static site |
| **ARCHITECTURE.md** | Data layers + Astro publishing |
| **ROADMAP.md** | v0.6.1 URL verification + review queue |
| **CHANGELOG.md** | Semver history |
| **REPO_INVENTORY.md** | This file |
| **PROJECT_STATE.md** | v0.6.1 phase |
| **NEXT_ACTIONS.md** | Control Tower URL verification |
| **docs/SOURCE_VERIFICATION_WORKFLOW.md** | Verification process |
| **docs/RECORD_EXPANSION_GAPS.md** | Deferred records log |

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
| **timeline.schema.json** | Timeline YAML (v0.5.0) |

---

## data/timelines/ (v0.5.0)

| File | Role |
|---|---|
| **eu-ai-act.yml** | Sample EU AI Act milestone timeline |
| **global-ai-regulation-watch.sample.yml** | Sample cross-jurisdiction timeline |

---

## docs/ (v0.5.0 additions)

| File | Role |
|---|---|
| **docs/TIMELINE_MODEL.md** | Timeline data model and review workflow |
| **docs/GLOBAL_COVERAGE_EXPANSION.md** | v0.5.0 global expansion scope |
| **docs/CI_VALIDATION.md** | GitHub Actions CI description |

---

## .github/workflows/

| File | Role |
|---|---|
| **validate-and-build.yml** | PR/push: validate:data → generate:exports → build |

---

## research/ (v0.3.2–v0.3.3)

| File | Role |
|---|---|
| **research/THIRD_PARTY_ACCELERATION_AUDIT.md** | Per-source reuse classification |
| **research/OPEN_SOURCE_COMPONENT_SHORTLIST.md** | Map, site, search, validation picks |
| **research/COMPETITOR_FEATURE_REPLICATION_PLAN.md** | Clean-room feature plan |
| **research/OFFICIAL_SOURCE_INGESTION_CANDIDATES.md** | Future watcher table |
| **research/VERIFYWISE_ARCHITECTURE_STUDY.md** | VerifyWise architecture reference (v0.3.3) |
| **research/CLEAN_ROOM_FEATURE_BACKLOG.md** | Prioritized implementation backlog (v0.3.3) |

---

## Frontend (v0.4.0)

| Path | Role |
|---|---|
| **package.json** | astro, js-yaml, ajv, pagefind |
| **scripts/generate-static-exports.mjs** | JSON + RSS generation |
| **public/data/** | Generated JSON exports |
| **public/feeds/changes.xml** | Sample changes RSS |
| **src/pages/search.astro** | Pagefind search UI |
| **src/pages/methodology.astro** | Methodology |
| **src/pages/disclaimer.astro** | Disclaimer |
| **astro.config.mjs** | Static site config |
| **src/pages/** | Generated routes (home, jurisdictions, sources, records, changes, exports) |
| **src/components/** | Badges, cards, review banners |
| **src/lib/data.ts** | YAML loaders (build time) |
| **scripts/validate-data.mjs** | ajv CI validation |
| **scripts/check-official-urls.mjs** | Manual technical URL check (`npm run check:urls`; not CI) |
| **docs/URL_VERIFICATION_POLICY.md** | Technical vs content review policy |
| **docs/URL_REMEDIATION_LOG.md** | v0.6.2 URL fix log |
| **data/verifications/source-identity-review-2026-05-19.yml** | Source identity review batch |
| **schemas/url-verification.schema.json** | URL check batch schema |

## docs/ (v0.3.3–v0.4.0)

| File | Role |
|---|---|
| **docs/NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md** | SSG option comparison; Astro recommended |
| **docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md** | v0.4.0 plan (skeleton delivered) |

## docs/

| File | Role |
|---|---|
| **docs/PILOT_SOURCE_REGISTRY.md** | v0.2.0 registry |
| **docs/SAMPLE_RECORDS_GUIDE.md** | v0.3.0 samples |
| **docs/TAXONOMY_AND_REVIEW_WORKFLOW.md** | v0.3.1 taxonomies and review |
| **docs/EVIDENCE_EXPORT_CONTRACT.md** | v0.3.1 export contract |
| **docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md** | v0.3.2 reuse policy |
| **docs/ACCELERATION_DECISION_MATRIX.md** | v0.3.2 decision matrix |
| **docs/DECISION_LOG.md** | Decisions through DEC-013 |
| **docs/COMPETITOR_BENCHMARKS.md** | Benchmarks incl. Fairly |
| **docs/FULL_SCALE_PRODUCT_BLUEPRINT.md** | Master blueprint |
| **docs/RESEARCH_CONTEXT.md** | Domain research (preserve) |
