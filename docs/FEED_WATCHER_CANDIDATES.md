# Feed watcher candidates (v0.7.2)

**Last updated:** 19 May 2026

Official feed URLs only. Do not use competitor feeds. If a URL is not confidently official, it is **not** enabled in `data/watchers/official-source-watchers.yml`.

| source_id | candidate_feed_url | confidence | reason | next action | recommended watcher_type |
|---|---|---|---|---|---|
| `edpb` | `https://www.edpb.europa.eu/feed/publications_en` | **confirmed** | Official EDPB publications RSS (`application/rss+xml` on HEAD). | Enabled as `watcher-edpb-feed`. | `official_rss_or_feed` |
| `edps` | `https://www.edps.europa.eu/feed/news_en` | **confirmed** | Official EDPS news RSS (`application/rss+xml` on HEAD). | Enabled as `watcher-edps-feed`. | `official_rss_or_feed` |
| `datatilsynet` | — | **not_found** | No official RSS/Atom URL identified on datatilsynet.no (newsletter is email-only per public pages). | Keep `watcher-datatilsynet` page metadata watcher; re-check if Datatilsynet publishes RSS. | `official_page_metadata` |
| `eu-ai-office` | — | **not_found** | EU Commission AI framework page has no confirmed dedicated RSS in registry. | Continue page metadata watcher. | `official_page_metadata` |
| `us-federal-register` | `https://www.federalregister.gov/api/v1/documents.json` | **needs_human_review** | Official Federal Register **API** (JSON), not RSS. RSS search URLs redirect; API is official but needs scope/rate-limit policy before adapter work. | Control Tower: approve `official_api_metadata` pilot or document RSS canonical URL. | `official_api_metadata` |
| `us-federal-register` | `https://www.federalregister.gov/documents/search.rss` | **needs_human_review** | Search RSS exists but redirects; term-scoped queries need human review for governance scope. | Do not enable until canonical feed scope approved. | `official_rss_or_feed` |

## Enabled in v0.7.2

- `watcher-edpb-feed` → EDPB publications RSS
- `watcher-edps-feed` → EDPS news RSS

## Not enabled (by design)

- Datatilsynet — no confirmed feed
- Federal Register — API/RSS needs Control Tower scope approval
