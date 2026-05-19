# Feed watcher candidates (v0.7.4)

**Last updated:** 19 May 2026

Official feed URLs only. Do not use competitor feeds. If a URL is not confidently official, it is **not** enabled in `data/watchers/official-source-watchers.yml`.

| source_id | candidate_feed_url | confidence | reason | next action | recommended watcher_type |
|---|---|---|---|---|---|
| `edpb` | `https://www.edpb.europa.eu/feed/publications_en` | **confirmed** | Official EDPB publications RSS (`application/rss+xml` on HEAD). | Enabled as `watcher-edpb-feed`. | `official_rss_or_feed` |
| `edps` | `https://www.edps.europa.eu/feed/news_en` | **confirmed** | Official EDPS news RSS (`application/rss+xml`; valid XML). v0.7.3 `invalid_feed` was parser entity expansion limit (1026 > 1000), not bad URL. Fixed in v0.7.4 (`maxTotalExpansions: 2048`). | Enabled; live baseline `snap-feed-edps-*`. | `official_rss_or_feed` |
| `datatilsynet` | — | **not_found** | No official RSS/Atom URL identified on datatilsynet.no (newsletter is email-only per public pages). | Keep `watcher-datatilsynet` page metadata watcher; re-check if Datatilsynet publishes RSS. | `official_page_metadata` |
| `eu-ai-office` | — | **not_found** | EU Commission AI framework page has no confirmed dedicated RSS in registry. | Continue page metadata watcher. | `official_page_metadata` |
| `us-federal-register` | `https://www.federalregister.gov/api/v1/documents.json` | **confirmed** (API) | Official Federal Register **API** (JSON), not RSS. Enabled as API watcher in v0.7.4 — see `docs/API_WATCHER_CANDIDATES.md`. | Use `watcher-us-federal-register-api`; RSS remains candidate only. | `official_api_metadata` |
| `us-federal-register` | `https://www.federalregister.gov/documents/search.rss` | **needs_human_review** | Search RSS exists but redirects; term-scoped queries need human review for governance scope. | Do not enable until canonical feed scope approved. | `official_rss_or_feed` |

## Enabled in v0.7.2

- `watcher-edpb-feed` → EDPB publications RSS
- `watcher-edps-feed` → EDPS news RSS

## EDPS investigation (v0.7.4)

| Check | Result |
|---|---|
| HTTP status | 200 |
| Final URL | `https://www.edps.europa.eu/feed/news_en` |
| Content-Type | `application/rss+xml; charset=utf-8` |
| Response shape | Valid RSS XML (not HTML) |
| v0.7.3 error | `invalid_feed` — Entity expansion limit exceeded: 1026 > 1000 |
| Resolution | Raised `maxTotalExpansions` to 2048 in feed adapter; feed diagnostics on future soft-fail |

## Not enabled (by design)

- Datatilsynet — no confirmed feed
- Federal Register RSS — API watcher used instead; RSS search scope not enabled
