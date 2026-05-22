# T083 — Decisions

## Deterministic rules in YAML

Signal scoring uses `data/runtime/signal-quality-rules.yml` only — no runtime LLM or paid API. Keyword groups, noise penalties, source weights, and dedupe normalization are versioned (`rules_version: 1.0.0`).

## Operator decision precedence

When `operator-review-decisions.yml` applies to a candidate:

- `review_status` and priority follow the operator decision mapping (T082).
- Signal fields (`signal_score`, `recommended_operator_action`, etc.) remain on the card for transparency.

Without an operator decision, `priority` derives from `signal_score` thresholds.

## No automatic dismiss

Candidates are never removed from the queue export. Noise items are downgraded (priority/relevance/action) but kept with `reason_codes`.

## EDPS RSS noise bias

`edps-news-rss` has `noise_bias` and `default_relevance_cap: low` because the pilot queue is dominated by newsletters and generic privacy items; AI Act titles still score via keyword groups.
