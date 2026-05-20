# T052 — API/RSS source adapter planning + allowlist architecture

**Branch:** `task/T052-api-rss-allowlist-architecture`  
**Depends on:** T051 merged to main (`3cb86e0`); package `1.0.8`.

## Goal

Prepare the safe technical foundation for future API/RSS source ingestion **without** enabling live crawling, scraping, or scheduled monitoring.

## Scope

- JSON Schema + draft YAML allowlist for official/public source candidates already in Caesar registry.
- Safety documentation and validation script with invariant checks beyond schema.
- Fixture-only RSS/Atom metadata parser prototype (no network).
- Conservative public JSON export and read-only `/source-adapters/` page.
- Work item docs and main project doc updates.

## Out of scope

- Live network collection; scheduled source monitoring; broad crawl.
- Full legal text storage; final evidence export; caesar-ai-evidence integration.
- Opening gates (`verified_on_source`, `client_use_allowed`, etc.).
- Deploy; tag; merge to main (Control Tower gated).

## Safety

All adapters `disabled` or `draft`; `collection_mode` is `fixture_only` or `manual_network_disabled` only.
