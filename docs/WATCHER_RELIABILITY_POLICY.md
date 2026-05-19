# Watcher reliability policy (v0.7.3)

**Last updated:** 19 May 2026

## Principles

- **Conservative retries** — low `retry_count`, increasing `retry_delay_ms`; no aggressive polling.
- **Soft fail** — failed checks do not overwrite `latest.yml` successful snapshots.
- **No whole-run crash** — one watcher failure does not stop other watchers.
- **Classified errors** — `error_category` for review queue and run logs (not legal conclusions).
- **Rate limits** — HTTP 429 logged as `rate_limited`; never treated as content change.
- **Manual CLI only** — not in CI; not production scheduling.

## Per-watcher fields

| Field | Purpose |
|---|---|
| `timeout_ms` | Fetch timeout |
| `retry_count` | Extra attempts after first try |
| `retry_delay_ms` | Backoff between retries |
| `soft_fail` | Preserve last good snapshot on error |
| `notes` | Operator context |

## Default posture

| Adapter | retry_count | Notes |
|---|---|---|
| Page metadata | 1 | Single HTML fetch |
| RSS/feed | 2 | Official feeds may rate-limit |
| API metadata | 1 | Official JSON API only |

## Error categories

`timeout`, `dns_error`, `rate_limited`, `forbidden`, `server_error`, `invalid_feed`, `invalid_api_response`, `network_error`, `unknown_error`

## Related docs

- `docs/SOURCE_ADAPTERS.md`
- `docs/WATCHER_PROTOTYPE.md`
- `docs/WATCHER_DIFF_VALIDATION.md`
