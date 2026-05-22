# T081 — Decisions

## Static-first operator workflow

Operator decisions live in `data/runtime/operator-review-decisions.yml`. The public site is read-only; rebuild exports after local edits.

## Review queue layer

`regulation-review-queue.json` maps `regulation-review-candidates.json` into operator-facing cards with `review_status`, `priority`, and closed gates. Counts align with `tracker-summary.json` after export rebuild.

## Source freshness

Computed from monitoring pilot registry + `regulation-source-runs.json`:

- `fresh` — automated source with completed run ≤7 days
- `aging` — 8–30 days or automated without recent run but has review items
- `stale` — >30 days or failed run
- `manual_review_needed` / `not_automated` — manual registry sources

## `/review-queue/` route

T081 regulation monitoring queue is primary on `/review-queue/`. Legacy registry human review remains via `review-queue.json` and `/content-review/` (linked from page footer section).

## Supabase

`ops/supabase/004_review_queue_operator_workflow.sql` is additive only; not applied unless local dev path explicitly runs it.

## Safety

All gates default false. `scheduled_monitoring_enabled` and cron remain false in exports and UI.
