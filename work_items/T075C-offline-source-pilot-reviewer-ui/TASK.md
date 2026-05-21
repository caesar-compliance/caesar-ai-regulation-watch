# T075C — Offline source pilot reviewer UI

**Branch:** `task/T075C-offline-source-pilot-reviewer-ui`

## Goal

Improve offline/operator reviewer experience for controlled source pilot candidates using fixture-only metadata. No Supabase, no network, no live ingestion.

## Deliverables

- `public/data/source-pilot-review-candidates.json` + build/validate scripts
- Enhanced `/source-pilot/` and `/source-pilot/review/` pages
- `automation-runtime` status `source_pilot_reviewer_ready`
- Work item docs and minimal project doc updates

## Out of scope

- Supabase schema apply, Worker deploy, network execution, version bump, deploy, tag
