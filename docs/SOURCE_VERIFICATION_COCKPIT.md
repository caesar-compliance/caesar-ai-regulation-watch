# Source Verification Cockpit (T060)

Internal read-only page at `/source-verification/` for draft source verification checklists.

## Scope

- One pilot checklist (`T060-001`) linked to revised T056 draft.
- Shows pipeline timeline (T055–T060), checklist items, blockers, and closed gates.
- No run buttons, no network execution, no publication.

## Data

- `data/source-adapters/source-verification-checklists.yml`
- `schemas/source-verification-checklist.schema.json`

## Commands

```bash
npm run validate:source-verification-checklists
npm run build:source-verification-summary -- --checklist-id T060-001
```

## Safety

- `verified_on_source` remains false.
- Checklist status `pending_source_verification` only.
- Draft excluded from `public/data/regulatory-updates.json`.
- Not legal advice.
