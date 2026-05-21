# T069 — Public export release gate

## Status

- Merged and deployed v1.0.17 (PR #29 squash `ea87496`; `DEPLOY-20260521-035` commit `9a4e848`, run [26233675974](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26233675974), tag `regulation-watch-v1.0.17`).

## Delivered

- `/public-export-gate/` UI and `T069-001` gate record linked to `T068-001` staging preview.
- Validator and summary builder; draft metadata updated on `T056-001`.
- No public update route; no `public/data` inclusion; gates closed.

## Safety

- `public_export_gate_ready` / `ready_for_public_export_approval` true (internal next step only).
- `publication_allowed`, `public_export_allowed`, client/evidence gates false.

## Next

- T070 — public export approval decision (approve/reject/request-changes); still no automatic publish.
