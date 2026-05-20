# Manual review decision workflow (T057)

T057 adds **metadata-only reviewer decision records** for draft regulatory updates promoted via [MANUAL_REVIEW_PROMOTION_PIPELINE.md](MANUAL_REVIEW_PROMOTION_PIPELINE.md) (T056).

## Purpose

- Record reviewer outcomes: `approve_internal_draft`, `reject`, or `request_changes`.
- Keep an auditable decision trail without publishing drafts.
- Scope all decisions to **internal draft progression only** — not public publication.

## Safety invariants

| Rule | Value |
|---|---|
| `decision_scope` | `internal_draft_only` only |
| `publication_allowed` | `false` |
| `public_export_allowed` | `false` |
| `evidence_export_allowed` | `false` |
| `source_verification_completed` | `false` |
| `metadata_only` | `true` |
| `stores_full_text` | `false` |
| `requires_followup_before_publication` | `true` |
| Legal/evidence/client gates | all `false` |

`approve_internal_draft`, when used, means **approved for internal draft progression only**. Publication requires a separate future Control Tower–approved task.

## Data and scripts

| Asset | Path |
|---|---|
| Registry | `data/source-adapters/manual-review-decisions.yml` |
| Schema | `schemas/manual-review-decision.schema.json` |
| Validate | `npm run validate:manual-review-decisions` |
| Summary builder | `npm run build:manual-review-decision-summary -- --decision-id T057-001` |
| Local summary | `generated/manual-review-decisions/T057-001.json` (gitignored) |

## T057 pilot

- **Decision:** `T057-001` for promotion `T056-001` / draft `t056-001-draft-edpb-network-dry-run`
- **Outcome:** `request_changes` (conservative default — draft not implied ready for publication)
- **No network** — decisions do not trigger fetches or crawls
- **No public export** — draft and decision identifiers excluded from `public/data/`

## Related

- [SINGLE_SOURCE_NETWORK_DRY_RUN.md](SINGLE_SOURCE_NETWORK_DRY_RUN.md) — T055 execution lineage
- [NETWORK_DRY_RUN_APPROVAL_MODEL.md](NETWORK_DRY_RUN_APPROVAL_MODEL.md) — T054 approval lineage
