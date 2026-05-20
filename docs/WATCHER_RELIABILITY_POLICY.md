# Watcher reliability policy (v0.9.7)

**Last updated:** 20 May 2026

## Live metadata pilot (v0.9.7)

- One request per allowlisted URL; metadata headers/title only; see `docs/METADATA_COMPARISON_POLICY.md`.
- Weak headers (`Last-Modified`, `ETag` null→present vs deterministic baseline) classified as benign when triaged; not regulatory change signals.
- Triage batch `metadata-review-triage-*.yml` must keep `legal_change_claimed: false` and `client_use_allowed: false`.

## Principles

- **Conservative retries** — low `retry_count`, increasing `retry_delay_ms`; no aggressive polling.
- **Soft fail** — failed checks do not overwrite `latest.yml` successful snapshots.
- **No whole-run crash** — one watcher failure does not stop other watchers.
- **Classified errors** — `error_category` for review queue and run logs (not legal conclusions).
- **Rate limits** — HTTP 429 logged as `rate_limited`; never treated as content change.
- **Review-gated** — push/PR CI does not run live watchers; use `npm run monitoring:cycle` or GitHub `monitoring-cycle.yml` (artifacts only, no auto-merge).

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

## Feed diagnostics (v0.7.4)

On feed fetch/parse soft-fail, run logs may include `feed_diagnostics` (metadata only):

| Field | Purpose |
|---|---|
| `response_status` | HTTP status |
| `response_content_type` | Content-Type header |
| `final_url` | URL after redirects |
| `parse_error_code` | e.g. `invalid_feed` |
| `diagnostic_note` | Short parse/classification note |
| `diagnostic_prefix_hash` | SHA-256 of first ≤300 chars (whitespace-normalized) |
| `diagnostic_prefix` | Prefix text only when safe XML (no HTML error page) |
| `response_appears_xml` / `response_appears_html` | Shape hints |

Full feed bodies are **not** stored in snapshots or run logs.

## XML parser limits (feed adapter)

Official EDPS news RSS triggered `Entity expansion limit exceeded: 1026 > 1000` with fast-xml-parser defaults (valid `application/rss+xml`). v0.7.4 sets `maxTotalExpansions: 2048` and `maxExpandedLength: 8192` — conservative raise for known official feeds; not unbounded.

## Related docs

- `docs/SOURCE_ADAPTERS.md`
- `docs/WATCHER_PROTOTYPE.md`
- `docs/WATCHER_DIFF_VALIDATION.md`
