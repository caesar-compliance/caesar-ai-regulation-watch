# Public export release gate (T069)

- Route: `/public-export-gate/` — internal release gate UI for pilot gate `T069-001`.
- **Not publication** — does not add drafts to `public/data/regulatory-updates.json`.
- **Not public export** — `public_export_allowed` remains false.
- **Approval review only** — `ready_for_public_export_approval` means a separate public export approval decision is required (`public_export_approval_decision`).
- Client/evidence and legal-change gates remain closed; `verified_on_source` and `legal_change_claimed` remain false.
