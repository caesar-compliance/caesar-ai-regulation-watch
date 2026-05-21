# T075A — Controlled source pilot framework

## Status

- Branch `task/T075A-controlled-source-pilot-framework` — pending Control Tower merge/release.
- Not deployed; no version tag; Supabase not required.

## Delivered

- Controlled pilot registry (2 sources, metadata-only, network disabled)
- Registry + status schemas and validators
- Fixture adapter, snapshot builder, dry-run runner
- Public `source-pilot-status.json` and `/source-pilot/` page
- `automation-runtime` status `source_pilot_framework_ready`

## Safety

- `live_ingestion_enabled`, `scheduled_monitoring_enabled`, `network_execution_enabled`: false
- All evidence/publication gates: false
- No full legal text; no credentials in public exports

## Next

- T075B — connect pilot output to Supabase runtime when credentials available
- T076+ — explicit controlled network check after approval
