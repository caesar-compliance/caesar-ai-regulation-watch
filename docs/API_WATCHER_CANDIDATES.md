# API watcher candidates (v0.7.3)

**Last updated:** 19 May 2026

Official API endpoints only. No competitor APIs. Metadata-only snapshots.

| source_id | api_url | confidence | enabled | reason |
|---|---|---|---|---|
| `us-federal-register` | `https://www.federalregister.gov/api/v1/documents.json?per_page=10&order=newest&conditions%5Bterm%5D=artificial+intelligence` | **confirmed** (official API) | **false** (pilot disabled) | Narrow AI query; enable after Control Tower scope approval. Adapter implemented; use `npm run watch:simulate-api-change` for pipeline test. |

## Scope (Federal Register pilot)

- Official `federalregister.gov` Documents API (JSON).
- `per_page=10`, `order=newest`, `conditions[term]=artificial intelligence`.
- Stores result id, title, publication date, html_url link, metadata hash only.
- Does **not** fetch document HTML bodies or crawl result links.

## Not configured

- Broad unscoped queries
- Non-official mirrors
- Authenticated/private APIs

See also `docs/FEED_WATCHER_CANDIDATES.md`.
