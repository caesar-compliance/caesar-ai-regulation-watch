# Public export approval decision (T070)

Internal decision capture for non-public export preview artifact only.

- `T070-001` approves `approve_non_public_export_preview` for gate `T069-001`.
- Generates preview artifact path `generated/public-export-preview/T070-001.json` (local build; not committed).
- Does **not** publish, add to `public/data/regulatory-updates.json`, or create `/updates/update-edpb-t056-001/`.
- `publication_allowed`, `public_export_allowed`, client/evidence gates remain false.
- Next step: `public_update_release_decision`.
