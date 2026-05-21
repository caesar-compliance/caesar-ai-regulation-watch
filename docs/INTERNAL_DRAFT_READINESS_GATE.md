# Internal draft readiness gate (T059)

## Purpose

T059 records an **internal readiness gate** after a draft revision packet (T058). It assesses whether a revised internal draft may proceed toward a **future publication review workflow**. It does **not** publish the draft, verify the source, or change legal/evidence/client gates.

## Pilot record

| Field | Value |
|---|---|
| Readiness ID | `T059-001` |
| Draft | `data/regulatory-updates/drafts/T056-001.yml` |
| Promotion | `T056-001` |
| Decision | `T057-001` |
| Revision | `T058-001` |
| Result | `not_ready_for_publication_review` |
| Next step | `source_verification_checklist_packet` |

## Readiness result

For T059 the conservative result is **`not_ready_for_publication_review`** because:

- source verification is not completed;
- final legal review is not completed;
- publication approval has not been granted;
- client/evidence use remains disallowed.

The draft may be considered ready only for a **future source-verification checklist packet** (T060), not for publication or public export.

## Safety invariants

- `gate_scope`: `internal_draft_readiness_only`
- `publication_allowed`, `public_export_allowed`, `evidence_export_allowed`: **false**
- `source_verification_completed`: **false**
- `metadata_only`: **true**; `stores_full_text`: **false**
- All gates (`verified_on_source`, `client_use_allowed`, `client_evidence_allowed`, `final_evidence_allowed`, `legal_change_claimed`): **false**
- No live network request in T059
- T056 draft, T057 decision, T058 revision, and T059 readiness gate are **excluded from public exports**

## Commands

```bash
npm run validate:internal-draft-readiness-gates
npm run build:internal-draft-readiness-summary -- --readiness-id T059-001
```

Local summary: `generated/internal-draft-readiness/T059-001.json` (gitignored).

## Related workflows

- [MANUAL_REVIEW_PROMOTION_PIPELINE.md](MANUAL_REVIEW_PROMOTION_PIPELINE.md) — T056
- [MANUAL_REVIEW_DECISION_WORKFLOW.md](MANUAL_REVIEW_DECISION_WORKFLOW.md) — T057
- [DRAFT_REVISION_PACKET_WORKFLOW.md](DRAFT_REVISION_PACKET_WORKFLOW.md) — T058

## Recommended next

**T060** — source verification checklist packet: prepare source verification steps and evidence notes; do **not** set `verified_on_source` true and do **not** publish.
