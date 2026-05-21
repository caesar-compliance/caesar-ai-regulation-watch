# T058 — Draft revision packet after request-changes

## Goal

Record a metadata-only revision packet for the T056 draft after T057-001 `request_changes`, applying safe draft metadata edits without publication, source verification, or gate changes.

## Scope

- One revision record: `T058-001`
- Revised draft: `data/regulatory-updates/drafts/T056-001.yml`
- Source decision: `T057-001`
- Source promotion: `T056-001`

## Non-goals

- No live network
- No public export
- No source verification claim
- No publication approval
- No legal/evidence/client gate changes

## Deliverables

- `schemas/draft-regulatory-update-revision.schema.json`
- `data/source-adapters/draft-regulatory-update-revisions.yml`
- `scripts/validate-draft-regulatory-update-revisions.mjs`
- `scripts/build-draft-revision-summary.mjs`
- [docs/DRAFT_REVISION_PACKET_WORKFLOW.md](../../docs/DRAFT_REVISION_PACKET_WORKFLOW.md)
- Read-only `/source-adapters/` section
