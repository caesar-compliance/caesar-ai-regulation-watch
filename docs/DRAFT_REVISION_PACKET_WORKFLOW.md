# Draft revision packet workflow (T058)

T058 records **metadata-only revision packets** after a T057 reviewer `request_changes` decision on a draft regulatory update from [MANUAL_REVIEW_PROMOTION_PIPELINE.md](MANUAL_REVIEW_PROMOTION_PIPELINE.md) (T056).

## Purpose

- Apply safe metadata edits to internal drafts in response to reviewer feedback.
- Track which requested changes were addressed vs. still remaining.
- Keep source verification and publication as separate future tasks.

## Safety invariants

| Rule | Value |
|---|---|
| `revision_scope` | `internal_draft_metadata_only` only |
| `reviewer_followup_required` | `true` |
| `publication_allowed` | `false` |
| `public_export_allowed` | `false` |
| `evidence_export_allowed` | `false` |
| `source_verification_completed` | `false` |
| `metadata_only` | `true` |
| `stores_full_text` | `false` |
| `requires_followup_before_publication` | `true` |
| Legal/evidence/client gates | all `false` |

Revisions do **not** verify content on source, do **not** approve publication, and do **not** change legal/evidence/client gates.

## Data and scripts

| Asset | Path |
|---|---|
| Registry | `data/source-adapters/draft-regulatory-update-revisions.yml` |
| Revised draft | `data/regulatory-updates/drafts/T056-001.yml` |
| Schema | `schemas/draft-regulatory-update-revision.schema.json` |
| Validate | `npm run validate:draft-regulatory-update-revisions` |
| Summary builder | `npm run build:draft-revision-summary -- --revision-id T058-001` |
| Local summary | `generated/draft-revisions/T058-001.json` (gitignored) |

## T058 pilot

- **Revision:** `T058-001` after decision `T057-001` / promotion `T056-001`
- **Draft:** `t056-001-draft-edpb-network-dry-run` at `data/regulatory-updates/drafts/T056-001.yml`
- **Draft `review_status`:** `revised_after_request_changes`
- **No network** — revisions do not trigger fetches or crawls
- **No public export** — draft, decision, and revision identifiers excluded from `public/data/`

## Publication path

Publication, source verification, and client/evidence use require separate future Control Tower–approved tasks. T058 only closes the revision loop at the metadata layer.

## Related

- [MANUAL_REVIEW_DECISION_WORKFLOW.md](MANUAL_REVIEW_DECISION_WORKFLOW.md) — T057 decision lineage
- [MANUAL_REVIEW_PROMOTION_PIPELINE.md](MANUAL_REVIEW_PROMOTION_PIPELINE.md) — T056 promotion lineage
