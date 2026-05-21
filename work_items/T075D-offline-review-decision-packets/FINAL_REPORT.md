# T075D — Offline review decision packets

## Status

- **Branch:** `task/T075D-offline-review-decision-packets`
- **Merged:** pending Control Tower
- **Deployed:** no (per task scope)

## Delivered

- Offline decision packet export (`source-pilot-decision-packets.json`)
- Schema + validator with safety invariants
- Build script `build:source-pilot-decision-packets`
- `/source-pilot/decision-packets/` operator UI
- `automation-runtime` status `source_pilot_decision_packets_ready`

## Safety

- Fixture-only; metadata-only; all gates false; runtime flags false
- No Supabase migration; DB health `not_configured`
- No Worker deploy; no network execution in build/validate paths

## Next

- Control Tower merge/release if accepted
- T075B when Supabase credentials available
- T076+ controlled network check after approval
