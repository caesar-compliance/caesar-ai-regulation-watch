# T057 — Decisions

## request_changes as default

`T057-001` uses `request_changes` rather than `approve_internal_draft` to avoid implying the T056 draft is ready for publication or internal progression without human edits.

## No draft mutation

The summary builder writes only to `generated/manual-review-decisions/`. The draft YAML under `data/regulatory-updates/drafts/T056-001.yml` is not mutated by T057 scripts.

## internal_draft_only scope

All decisions use `decision_scope: internal_draft_only`. Publication remains a separate future task.

## No network

T057 does not rerun T055 or any live fetch. Lineage references (`T055-001`, `T054-001`) are registry metadata only.
