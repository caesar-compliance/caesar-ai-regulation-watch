# API watcher candidates (v0.7.4)

**Last updated:** 19 May 2026

Official API endpoints only. No competitor APIs. Metadata-only snapshots.

| source_id | api_url | confidence | enabled | reason |
|---|---|---|---|---|
| `us-federal-register` | `https://www.federalregister.gov/api/v1/documents.json?per_page=10&order=newest&conditions%5Bterm%5D=artificial+intelligence` | **confirmed** (official API) | **true** (v0.7.4) | Narrow AI term query; live baseline created. Real detected changes only after a prior successful API snapshot and metadata diff. |

## Scope (Federal Register pilot)

- Official `federalregister.gov` Documents API (JSON).
- `per_page=10`, `order=newest`, `conditions[term]=artificial intelligence`.
- Stores result id, title, publication date, `html_url` link, metadata hash only.
- Does **not** fetch document HTML bodies or crawl result links.
- Does **not** run broad/unscoped queries.

## Why metadata-only

- Governance review needs **signals** (new/changed listing metadata), not full rule text in-repo.
- Avoids storing large document bodies and reduces legal-summary risk.
- Human reviewers follow `html_url` to official source when content review is needed.

## When real detected changes appear

1. A prior successful API snapshot exists (`latest.yml` without `fetch_error`).
2. A subsequent manual `npm run watch:official` run returns different result ids or metadata hashes.
3. Adapter creates `detected-*` records with `human_review_required: true` and `simulation: false`.

First enabled run creates **baseline only** (no detected change).

## Operational posture

- **Manual CLI only** — `npm run watch:official`; not in CI; no production scheduler.
- Conservative retry (`retry_count: 1`); soft-fail preserves last good snapshot.
- Use `npm run watch:simulate-api-change` for pipeline validation without live API.

## Not configured

- Broad unscoped queries
- Non-official mirrors
- Authenticated/private APIs

See also `docs/FEED_WATCHER_CANDIDATES.md`, `docs/SOURCE_ADAPTERS.md`.
