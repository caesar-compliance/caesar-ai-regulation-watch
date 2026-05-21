# T075A — Controlled source pilot framework

**Date:** 21 May 2026  
**Branch:** `task/T075A-controlled-source-pilot-framework`

## Goal

Build offline/manual foundation for first allowlisted official-source pilot: registry, schemas, fixture adapters, dry-run, public status export and page. No live ingestion, network execution, Supabase apply, or deploy.

## Deliverables

- `data/runtime/source-pilot-registry.yml` (2 pilot sources, metadata-only)
- Schemas + validators for registry and status export
- `scripts/runtime/source-pilot/*` fixture adapter and dry-run
- `public/data/source-pilot-status.json` + `/source-pilot/`
- `automation-runtime.yml` status `source_pilot_framework_ready`

## Out of scope

- Supabase credentials / schema apply
- Cloudflare Worker deploy
- Live or scheduled monitoring
- Real source crawling
