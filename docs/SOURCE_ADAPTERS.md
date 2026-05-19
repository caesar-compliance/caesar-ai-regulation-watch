# Source adapters (v0.7.4)

**Last updated:** 19 May 2026

Caesar AI Regulation Watch uses **source adapters** to fetch and diff official sources in a consistent, review-gated way. Adapters are manually executed via CLI only — not CI, not production scheduling.

## Adapter types

| Adapter ID | Purpose |
|---|---|
| `official_page_metadata` | HTTP metadata + content hash of a single official HTML page |
| `official_rss_or_feed` | RSS/Atom feed entry metadata (title, link, date, id) |
| `official_api_metadata` | Official JSON API metadata (Federal Register pilot in v0.7.4) |
| `manual_only` | No automated fetch; human-curated updates only |

---

### `official_page_metadata`

| Aspect | Detail |
|---|---|
| **Purpose** | Detect possible changes on one official landing page when no reliable feed exists |
| **Inputs** | `official_url`, timeout, storage policy |
| **Output snapshot** | `source-snapshot` — HTTP status, title, hashes, no body |
| **Diff strategy** | Hash/title/URL/metadata comparison (`scripts/lib/watcher-diff.mjs`) |
| **Risk profile** | Medium — coarse hash signals; not semantic legal diff |
| **When to use** | Official page without confirmed RSS/Atom feed |
| **What not to do** | Crawl links, store HTML bodies, infer legal impact |

### `official_rss_or_feed`

| Aspect | Detail |
|---|---|
| **Purpose** | Monitor structured official feeds where available |
| **Inputs** | `feed_url`, `feed_format`, entry identity/date fields, `max_entries_per_check` |
| **Output snapshot** | `feed-snapshot` — feed title, entry list (id, title, link, date, entry_hash), aggregate hash |
| **Diff strategy** | New/removed/changed entries; feed unreachable/redirect (`scripts/lib/feed-diff.mjs`) |
| **Risk profile** | Medium — feed rotation may look like removals; new items need human confirmation |
| **When to use** | Confirmed official RSS/Atom from authority site |
| **What not to do** | Fetch article bodies, scrape item links, use competitor feeds |

### `official_api_metadata`

| Aspect | Detail |
|---|---|
| **Purpose** | Official JSON APIs (e.g. Federal Register Documents API) with metadata-only result fields |
| **Inputs** | `api_url`, `max_results_per_check`, query scope note |
| **Output snapshot** | `api-snapshot` — result id, title, link, publication date, result_hash; response hash only (no body storage) |
| **Diff strategy** | New/removed/changed results (`scripts/lib/api-diff.mjs`) |
| **Risk profile** | Medium — search term may return tangential documents; human review required |
| **When to use** | Confirmed official API with narrow, approved query scope |
| **What not to do** | Fetch document HTML bodies, crawl result links, run broad queries, treat API listings as legal conclusions |

**v0.7.4 pilot:** `watcher-us-federal-register-api` — `per_page=10`, `term=artificial intelligence`, enabled after scope approval. First run = baseline only.

### Feed diagnostics (`official_rss_or_feed`)

On parse/fetch soft-fail, adapter attaches `feed_diagnostics` to run logs (status, content-type, final URL, parse note, prefix hash). No full feed body stored. See `docs/WATCHER_RELIABILITY_POLICY.md`.

### `manual_only`

| Aspect | Detail |
|---|---|
| **Purpose** | Registry entries updated by human editors only |
| **Diff strategy** | N/A — no watcher execution |
| **What not to do** | Run automated fetch for these sources |

---

## Policy

- **RSS/feed watchers are preferred** where official feeds are confidently identified.
- **HTML metadata watchers are fallback** when no official feed URL is confirmed.
- **No broad crawling** — one URL or one feed per watcher.
- **No legal conclusions** — all detected changes are `pending_review`, `client_use_allowed: false`.
- **No full page or article body storage** in the repository.

## Related docs

- `docs/WATCHER_PROTOTYPE.md`
- `docs/FEED_WATCHER_CANDIDATES.md`
- `docs/SNAPSHOT_AND_DIFF_POLICY.md`
- `docs/WATCHER_DIFF_VALIDATION.md`
