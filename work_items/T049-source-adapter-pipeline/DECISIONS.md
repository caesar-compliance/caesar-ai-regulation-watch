# T049 — Decisions

## D1 — Offline-only adapter

**Decision:** T049 reads **repository-local YAML/JSON metadata only**. No new HTTP requests in the adapter script.

**Rationale:** Control Tower boundaries: no scrape, no crawl, no WAF bypass. Bridges monitoring artifacts to the public feed without claiming live automation.

## D2 — `offline_metadata_adapter` method label

**Decision:** Generated records use `automation_method: offline_metadata_adapter` (schema enum extended).

**Rationale:** Distinguishes from `manual_seed` and future live `api` / `rss` / `official_feed` adapters.

## D3 — Single generated batch file

**Decision:** Output `data/regulatory-updates/generated-from-metadata.yml` with an `items:` array; loaders expand batch + per-file seeds.

**Rationale:** Keeps manual_seed files unchanged; regeneration is one command before validate/build.

## D4 — Input sources

**Decision:** Adapter inputs limited to:

- `data/detected-changes/`
- `data/changes/`
- `data/monitoring/change-review-pack-*.yml`
- `data/monitoring/metadata-review-triage-*.yml`
- `data/source-discovery/source-discovery-leads-*.yml`
- `data/sources/` (URL resolution)

**Rationale:** P2-10 monitoring integration without competitor data or _reference-lab content.
