# T082 — Operator Decision Loop and Review State Publishing

**Version target:** v1.0.33  
**Date:** 22 May 2026  
**Branch:** `task/T082-operator-decision-loop-review-state-publishing`

## Goal

Turn T081’s review queue into a practical operator workflow with YAML decisions, validation, export-derived states, and UI visibility — without opening legal/evidence/client gates.

## Deliverables

- Extended `operator-review-decisions.yml` schema and 4 pilot sample decisions
- `validate:operator-decisions` and enriched `validate:review-queue`
- Build pipeline merges decisions into queue, summary, packets, tracker-summary
- UI: `/review-queue/`, `/tracker/`, `/jurisdictions/[id]/`, `/runtime-health/`
- `docs/OPERATOR_REVIEW_WORKFLOW.md`

## Out of scope

- Cron enablement, live ingestion, Supabase writes, Worker deploy
- Legal verification claims or gate opens
