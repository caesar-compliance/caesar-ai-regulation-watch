# Publication gate packet UI (T066)

- Route: `/publication-gate/` — internal publication gate packet `T066-001` for T056 draft pipeline.
- Shows gate checklist, blockers, gates/safety — read-only; no publish/approve/export actions.
- **Not publication** — draft stays internal; excluded from `public/data/regulatory-updates.json`.
- **Not public export** — `public_export_allowed` false.
- **Not client/evidence use** — client/evidence gates false; `verified_on_source` and `legal_change_claimed` false.
