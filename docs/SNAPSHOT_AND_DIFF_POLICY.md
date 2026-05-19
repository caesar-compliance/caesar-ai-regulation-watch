# Snapshot and diff policy (v0.7.0)

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

## Meaningful change detection

Compared fields (when previous snapshot exists):

- `content_hash` / `normalized_text_hash`
- `title`
- `final_url` (redirect)
- `http_status`
- `etag` / `last_modified` (when both sides present)

First run after baseline: **no** detected change (nothing to compare).

## Detected change records

- Written only when a previous snapshot exists and diff signals fire.
- `change_summary_for_review` describes technical signals only — **not** legal impact.
- `confidence_level` is `low` or `medium` (metadata signals, not legal certainty).
- Always `human_review_required: true`.

## Review queue integration

Detected changes and watcher errors appear in the human review queue with reasons such as:

- `detected_change_pending_review`
- `watcher_error`
- `human_review_required`

No write actions from the static site.
