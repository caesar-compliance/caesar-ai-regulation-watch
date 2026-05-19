# Snapshot and diff policy (v0.7.1)

**Last updated:** 19 May 2026

## Storage policy

**`metadata_only_no_body_storage`** — snapshots persist only:

- Identifiers (`snapshot_id`, `watcher_id`, `source_id`, `jurisdiction_id`)
- Timestamps and URLs (`checked_at`, `original_url`, `final_url`)
- HTTP metadata (`http_status`, `content_type`, `etag`, `last_modified`, `content_length`)
- Optional page title (extracted in memory, not stored as HTML)
- Cryptographic hashes (`content_hash`, `normalized_text_hash`) computed during fetch then **discarded source body**

Full HTML or PDF bodies are **never** written to `data/snapshots/`.

## Snapshot kinds

| Kind | Meaning |
|---|---|
| `baseline` | First successful snapshot for a source |
| `periodic_check` | Subsequent successful check |
| `error_placeholder` | Reserved for dry-run/skip-network only (not written on live fetch failure) |

On **network failure**, the watcher logs the error in the run log and **does not** replace `latest.yml` or delete prior snapshots.

## Meaningful change detection (v0.7.1)

Compared fields (when previous snapshot exists):

- `normalized_text_hash` (preferred content signal)
- `content_hash`
- `title`
- `final_url`
- `http_status`
- `etag` / `last_modified` / `content_length`

Each detected change records:

- `changed_fields` — typed change list (e.g. `title_changed`, `normalized_text_hash_changed`)
- `significance_level` — `low` | `medium` | `high`
- `previous_value_summary` / `current_value_summary` — short metadata summaries only
- `ignored_fields` / `volatile_field_note` — noise control for HTTP-only churn
- `minimum_change_policy` — high significance requires content or URL/status signals

First run after baseline: **no** detected change (nothing to compare).

**Prototype only** — not final semantic diff; human must confirm on official source.

## Detected change records

- Written only when a previous snapshot exists and diff signals fire (or via `watch:simulate-change` for pipeline tests).
- `change_summary_for_review` describes technical signals only — **not** legal impact.
- `significance_level` reflects metadata signals, not legal certainty.
- Always `human_review_required: true` and `client_use_allowed: false`.
- Simulated changes: `simulation: true` and separate review queue reason.

## Review queue integration

Detected changes and watcher errors appear in the human review queue with reasons such as:

- `detected_change_pending_review`
- `watcher_error`
- `human_review_required`

No write actions from the static site.
