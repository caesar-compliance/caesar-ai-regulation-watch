# T082 — Decisions

## Static-first operator decisions

Operator triage remains in `data/runtime/operator-review-decisions.yml`. The public site is read-only; rebuild exports after edits.

## Decision → review_status mapping

| Decision | Export status |
|----------|----------------|
| `keep_review_required` | `review_required` |
| `mark_in_review` | `in_review` |
| `dismiss_noise` | `dismissed` |
| `accept_for_tracking` | `accepted_for_tracking` |
| `needs_source_check` | `needs_source_check` |
| `needs_legal_review` | `needs_legal_review` |

Latest decision per `candidate_id` wins (by `decided_at`).

## Gates

All `gate_overrides` must remain false in routine triage. `validate:operator-decisions` enforces this.

## accept_for_tracking

Exported with `tracking_only` label: “Tracking only — not legal verification. Gates remain closed.” Never presented as verified legal change.

## Sample decisions

Four pilot rows only — clearly non-legal, all gates false, no personal email in `reviewer_label`.

## Cron / ingestion

Unchanged from T081: scheduled monitoring and cron remain disabled.
