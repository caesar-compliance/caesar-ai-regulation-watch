# Evidence Export Candidate Pipeline

**Prepared:** 20 May 2026  
**Phase:** v0.8.3 — gated local candidates only (not final evidence export)

---

## Purpose

This pipeline produces **evidence export candidates** from existing local Regulation Watch data:

- manual sample change records in `data/changes/`;
- detected changes in `data/detected-changes/`;
- content review status from `data/verifications/content-review-*.yml`;
- draft control/evidence mappings and export contract samples.

Candidates support **governance review**. They are **not** final evidence exports.

---

## What this is not

- **Not** final evidence export to [caesar-ai-evidence](https://github.com/caesar-compliance/caesar-ai-evidence).
- **Not** client-ready output — `client_use_allowed` remains **false** for every candidate in v0.8.3.
- **Not** legal advice, compliance certification, complete coverage, or official legal interpretation.
- **Not** remote monitoring — the generator does not fetch URLs or call external APIs.
- **Not** a write path to any external repository.

---

## Data model

| Artifact | Location |
|---|---|
| JSON Schema | `schemas/evidence-export-candidate.schema.json` |
| Generated batch YAML | `data/evidence-export-candidates/evidence-export-candidates-YYYY-MM-DD.yml` |
| Static JSON export | `public/data/evidence-export-candidates.json` |
| Read-only page | `/evidence-export-candidates/` |

### Candidate status values

| Status | Meaning |
|---|---|
| `blocked_pending_content_review` | Latest content review is `not_checked` or content not reviewed |
| `blocked_simulation_only` | Source is a simulated detected change |
| `ready_for_human_review` | Passed local gates; still requires human export review (no client use) |
| `rejected_for_client_use` | Explicitly rejected for client pipelines |

### Hard policy (v0.8.3)

- `client_use_allowed` must always be **false**.
- `human_review_required` must always be **true**.
- `verified_on_source_required` is **true** — candidates do not claim source verification unless upstream data explicitly supports it (none do in the pilot batch).
- Simulated detected changes cannot be `ready_for_human_review`.
- `ready_for_human_review` cannot coexist with non-empty `blocking_reasons` (validated in `validate-data.mjs`).

---

## Generator

```bash
npm run generate:evidence-candidates
```

Script: `scripts/generate-evidence-export-candidates.mjs`

**Inputs (local YAML only):**

- `data/changes/`
- `data/detected-changes/`
- `data/verifications/content-review-*.yml`
- `mappings/change-to-controls.sample.yml`, `mappings/change-to-evidence.sample.yml`
- `exports/samples/regulation-change-export.sample.yml` (manual changes only)

**Output:** deterministic batch file under `data/evidence-export-candidates/`.

**Gating logic (summary):**

1. Manual sample changes → candidates with `created_from: manual_sample`; blocked when related record content review is `not_checked`.
2. Real detected changes → `watcher_detected_change`; blocked on content review; `related_record_id` omitted with blocking reason when missing.
3. Simulated detected changes → `simulated_detected_change`; status `blocked_simulation_only`.

---

## Validation and build

```bash
npm run validate:data          # schema + policy checks on candidate YAML
npm run generate:exports       # includes evidence-export-candidates.json
npm run build                  # generate candidates → validate → exports → Astro → Pagefind
```

Policy failures include `client_use_allowed: true`, missing `legal_safe_note`, compliance-guarantee language, and inconsistent status vs blocking reasons.

---

## Static export and snapshot

`scripts/generate-static-exports.mjs` writes `public/data/evidence-export-candidates.json` with summary counts:

- `total`
- `ready_for_human_review`
- `blocked_pending_content_review`
- `blocked_simulation_only`
- `client_use_allowed` (must be **0**)

`public/data/regulation-watch-snapshot.json` includes candidate counts and a link in `data_files.evidence_export_candidates`.

---

## Human review workflow (Control Tower)

1. Complete content review on priority records (`docs/CONTENT_REVIEW_WORKFLOW.md`).
2. Regenerate candidates after YAML updates.
3. Review `/evidence-export-candidates/` and JSON export.
4. Do **not** treat candidates as evidence packs or client deliverables.
5. Future phase (not v0.8.3): approved final export records and caesar-ai-evidence ingest — see `docs/EVIDENCE_EXPORT_CONTRACT.md`.

---

## Related documents

- [EVIDENCE_EXPORT_CONTRACT.md](EVIDENCE_EXPORT_CONTRACT.md) — final export contract (future)
- [CONTENT_REVIEW_WORKFLOW.md](CONTENT_REVIEW_WORKFLOW.md)
- [TAXONOMY_AND_REVIEW_WORKFLOW.md](TAXONOMY_AND_REVIEW_WORKFLOW.md)
