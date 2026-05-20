# T057 — Manual reviewer decision workflow

## Goal

Add metadata-only reviewer decision records for the T056 draft regulatory update.

## Scope

- Schema and registry for manual review decisions
- Validation cross-checking T056 promotion and draft
- Local summary builder under `generated/manual-review-decisions/`
- Read-only `/source-adapters/` section

## Out of scope

- Publication to `public/data`
- Source verification
- Live network requests
- Opening legal/evidence/client gates
- Full legal text storage

## Pilot

- Decision `T057-001` for promotion `T056-001`
- Outcome: `request_changes` (conservative default)
