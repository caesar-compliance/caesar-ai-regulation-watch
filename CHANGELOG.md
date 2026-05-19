# Changelog

All notable changes to the Caesar AI Regulation Watch project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.3.1] - 19 May 2026

### Added

- Defined regulation taxonomy and export contract foundation.
- Eight taxonomy files under `data/taxonomies/`.
- `schemas/taxonomy.schema.json`, `schemas/evidence-export-record.schema.json`.
- `exports/samples/regulation-change-export.sample.yml` (sample only; no client evidence created).
- [docs/TAXONOMY_AND_REVIEW_WORKFLOW.md](docs/TAXONOMY_AND_REVIEW_WORKFLOW.md), [docs/EVIDENCE_EXPORT_CONTRACT.md](docs/EVIDENCE_EXPORT_CONTRACT.md).

### Changed

- Mappings use draft `regulation_watch.control.*` and `regulation_watch.evidence.*` refs with `reference_alignment`.
- Sample law/guidance/change records include `record_origin: manual_sample`.
- Entity schemas: expanded `review_status` enum; `record_origin` on law/guidance/change; `implementation_update` on change types and regulatory statuses.

---

## [0.3.0] - 19 May 2026

### Added

- Added manual sample law, guidance, change, and mapping records.
- `data/laws/eu-ai-act.yml`; `data/guidance/` (EU AI Office GPAI, Datatilsynet); `data/changes/` (two manual samples).
- `mappings/change-to-controls.sample.yml`, `mappings/change-to-evidence.sample.yml`.
- Schemas: `law`, `guidance`, `change`, `change-control-mapping`, `change-evidence-mapping`.
- [docs/SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md).

### Changed

- README, SPEC, ARCHITECTURE, ROADMAP, PROJECT_STATE, NEXT_ACTIONS, REPO_INVENTORY, DECISION_LOG updated for v0.3.0.

### Notes

- Change records are fictionalised manual samples, not watcher output. All entries default to `pending_review`.

---

### Changed (v0.2.0 cleanup — 19 May 2026)

- Aligned README, SPEC, ARCHITECTURE, ROADMAP, PROJECT_STATE, and NEXT_ACTIONS on v0.2.0 static-registry state (removed “in progress” / blueprint-only wording where contradictory).
- Norway jurisdiction: `parent_jurisdiction: null` with `related_frameworks: [eu, eea]` instead of EU parent linkage.
- Extended `schemas/jurisdiction.schema.json` with optional `related_frameworks` field.

---

## [0.2.0] - 19 May 2026

### Added

- Added pilot EU/Norway official source registry foundation.
- `data/jurisdictions/eu.yml`, `data/jurisdictions/norway.yml` — pilot jurisdiction profiles.
- Seven official source records under `data/sources/` (EU AI Act, EU AI Office, EUR-Lex, EDPB, EDPS, Norway implementation, Datatilsynet).
- `schemas/jurisdiction.schema.json`, `schemas/source.schema.json` — JSON Schema for pilot records.
- [docs/PILOT_SOURCE_REGISTRY.md](docs/PILOT_SOURCE_REGISTRY.md) — registry index, gaps, and review workflow.

### Changed

- Updated README, SPEC, ARCHITECTURE, ROADMAP, PROJECT_STATE, NEXT_ACTIONS, REPO_INVENTORY, and DECISION_LOG for v0.2.0.

### Notes

- All registry entries use `review_status: pending_review`. No watchers or automation in this release.

---

## [0.1.0] - 19 May 2026

### Added

- **Full-scale AI regulation monitoring product blueprint** covering global map, jurisdiction profiles, official source registry, law/guidance records, timelines, change history, status labels, source credibility, AI summary layer, affected controls/evidence, RSS/API/export, public website, and Governance OS integration path.
- [docs/FULL_SCALE_PRODUCT_BLUEPRINT.md](docs/FULL_SCALE_PRODUCT_BLUEPRINT.md) — master product blueprint.
- [docs/COMPETITOR_BENCHMARKS.md](docs/COMPETITOR_BENCHMARKS.md) — benchmark references (Techieray, VerifyWise, DLA Piper, OECD, IAPP, AI Legislation Tracker, artificialintelligenceact.eu).
- [docs/DATA_MODEL_DRAFT.md](docs/DATA_MODEL_DRAFT.md) — entity and field draft.
- [docs/UI_UX_VISION.md](docs/UI_UX_VISION.md) — public site and globe UX direction.
- Expanded [README.md](README.md), [SPEC.md](SPEC.md), [ARCHITECTURE.md](ARCHITECTURE.md), [ROADMAP.md](ROADMAP.md), [PROJECT_STATE.md](PROJECT_STATE.md), [NEXT_ACTIONS.md](NEXT_ACTIONS.md), [docs/DECISION_LOG.md](docs/DECISION_LOG.md), [REPO_INVENTORY.md](REPO_INVENTORY.md).

### Changed

- Repositioned product from “EU/Norway crawler MVP” wording to **global regulation monitoring** with honest coverage limits and governance-evidence differentiation.
- Roadmap rephased for v0.2 registry through v1.0 pilot release.

### Notes

- Initial repository foundation (scaffolding files) was established earlier on 19 May 2026; this entry records the blueprint upgrade on the same date.
