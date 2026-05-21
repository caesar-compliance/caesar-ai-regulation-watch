# T070 — Public export approval decision

## Status

- Merged to main v1.0.18 (PR #30 squash `30634da`); deploy pending.

## Delivered

- `T070-001` decision: `approve_non_public_export_preview` for gate `T069-001`.
- Validator, summary builder, non-public preview artifact builder.
- `/public-export-gate/` shows decision, preview metadata, blockers, next step.

## Safety

- No publication; no public/data inclusion; no public update route.
- Gates unchanged (`verified_on_source`, client/evidence, `legal_change_claimed` false).

## Next

- T071 — public update release decision.
