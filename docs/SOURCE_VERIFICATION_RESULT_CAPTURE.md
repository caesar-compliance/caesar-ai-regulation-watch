# Source verification result capture (T061)

Records item-level manual pass / needs-follow-up / fail outcomes for T060 checklist items.

## Scope

- One pilot result: `T061-001` linked to checklist `T060-001` and T056 draft.
- Data: `data/source-adapters/source-verification-results.yml`
- Summary: `npm run build:source-verification-result-summary -- --result-id T061-001`

## Not in scope

- Does **not** set `verified_on_source` true.
- Does **not** claim final source verification complete.
- Does **not** publish draft to public exports.
- Does **not** open client/evidence/legal gates.

## Commands

```bash
npm run validate:source-verification-results
npm run build:source-verification-result-summary -- --result-id T061-001
```
