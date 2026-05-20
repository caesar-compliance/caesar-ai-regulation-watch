# T049 — Source adapter pipeline for regulatory updates feed

**Branch:** `feature/T049-source-adapter-pipeline`  
**Depends on:** T048 merged and v1.0.5 deployed.

## Goal

Replace manual_seed-only updates feed with a safe **offline metadata adapter** that generates `regulatory_update` records from existing repository monitoring and registry metadata.

## Scope

- `scripts/build-regulatory-updates-from-metadata.mjs`
- `data/regulatory-updates/generated-from-metadata.yml`
- Validation, static exports, `/updates/` filter by `automation_method`
- No live network fetch; no scraping; gates remain closed.

## Out of scope

- Live API/RSS adapters (P2-01)
- Scheduled monitoring expansion
- Deploy / tag in this task
