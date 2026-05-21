# T075D — Offline review decision packet export

**Date:** 21 May 2026  
**Branch:** `task/T075D-offline-review-decision-packets`

## Goal

Create an offline/static review decision packet layer for source pilot candidates so operators understand what must be reviewed manually before any monitored item could become evidence/publication/client-usable later.

## Scope

- `public/data/source-pilot-decision-packets.json` from review candidates + status + registry
- Schema + validator with safety invariants
- Build script `build:source-pilot-decision-packets`
- `/source-pilot/decision-packets/` UI
- `automation-runtime` status `source_pilot_decision_packets_ready`

## Out of scope

- Supabase schema apply; Worker deploy; network execution; live ingestion; legal verification; publication approval; version bump; deploy; tag.

## Safety

All runtime flags and evidence/publication gates remain `false`. Metadata only; fixture only.
