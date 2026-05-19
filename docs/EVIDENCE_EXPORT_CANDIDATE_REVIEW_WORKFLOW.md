# Evidence Export Candidate Review Workflow

**Phase:** v0.8.7 — governance/export-readiness gate (not final evidence export)

---

## Purpose

Human **governance review** of evidence export **candidates** that are already `ready_for_human_review` in the v0.8.3+ pipeline. This layer answers:

- Is the candidate understandable for internal reviewers?
- Does a content review exist for the related source item?
- Are suggested control/evidence prompts plausible as **internal review prompts** only?
- Are disclaimers and blocking semantics consistent?
- Should the candidate stay blocked pending source or mapping work?

This is **not**:

- Final evidence export
- Writes to `caesar-ai-evidence`
- Client-ready or compliance-approved output
- Legal advice or official interpretation

---

## Data location

| Artifact | Path |
|---|---|
| JSON Schema | `schemas/evidence-export-candidate-review.schema.json` |
| Review batch (YAML) | `data/verifications/evidence-export-candidate-review-*.yml` |
| Generated candidates | `data/evidence-export-candidates/*.yml` |
| Public JSON export | `public/data/evidence-export-candidate-reviews.json` |
| Public candidate JSON | `public/data/evidence-export-candidates.json` (includes `candidate_review_status` when reviewed) |

Regenerate public JSON: `npm run generate:exports`.

---

## Safe review statuses

| Status | Meaning |
|---|---|
| `reviewed_for_internal_governance_only` | Passed governance/export-readiness review for **internal** use only; still not client evidence |
| `needs_more_source_review` | Candidate blocked on official-source verification; complete content/source review first |
| `needs_mapping_review` | Source OK enough for governance pass but draft control/evidence mapping needs human review |
| `rejected_for_export_candidate_use` | Do not use this candidate even internally without rework |
| `review_not_applicable` | Reserved for simulation-blocked or non-export-ready candidates (not used in v0.8.7 batch) |

Every reviewed entry must keep:

- `client_use_allowed: false`
- `final_evidence_allowed: false`
- `human_review_required: true`
- `qualified_advisor_review_required: true`
- `legal_safe_note` (non-advice, no compliance guarantee)

---

## v0.8.7 batch (20 May 2026)

| Candidate ID | Pipeline status | Review status |
|---|---|---|
| `candidate-change-sample-datatilsynet-guidance-change` | `ready_for_human_review` | `reviewed_for_internal_governance_only` |
| `candidate-change-sample-eu-ai-act-status-change` | `ready_for_human_review` | `needs_more_source_review` |

Simulated detected-change candidates remain `blocked_simulation_only` and were **not** reviewed for export readiness.

**Counts after batch:** 2 reviewed; 0 `client_use_allowed`; 0 `final_evidence_allowed`.

---

## Validation policy (`npm run validate:data`)

- Review YAML must validate against schema.
- `client_use_allowed` must be `false` on every review entry.
- `final_evidence_allowed` must be `false`.
- `candidate_id` must exist in the latest evidence export candidate batch.
- Simulated (`blocked_simulation_only`) candidates cannot be marked `reviewed_for_internal_governance_only`.
- Batch and entry `legal_safe_note` required; no compliance-guarantee language.

---

## Next steps (Control Tower)

1. EUR-Lex deep read / human source verification for EU AI Act candidate.
2. Mapping review against draft `regulation_watch.*` refs (design alignment with future `caesar-ai-evidence` contract — **no implementation** without approval).
3. Second candidate review batch after additional content reviews or real (non-simulated) detected changes.

Do **not** implement final evidence export or cross-repo ingest without explicit approval.
