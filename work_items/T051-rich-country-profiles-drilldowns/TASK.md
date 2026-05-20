# T051 — Richer country profiles + regional/topic drilldowns

**Branch:** `task/T051-rich-country-profiles-drilldowns`  
**Depends on:** T050 merged; v1.0.7 deployed (`f5f13bc` / tag `regulation-watch-v1.0.7`).

## Goal

Upgrade jurisdiction pages to automation-first tracker profiles and add regional/topic drilldown surfaces with public JSON exports.

## Scope

- Richer `/jurisdictions/[id]/` profiles (status hero, metrics, topics, updates, sources, laws/guidance, timelines, safety panel, compare links).
- `/regions/` index + `/regions/[slug]/` detail pages from pilot seeds.
- `/topics/` index + `/topics/[id]/` detail pages from `data/topics/`.
- JSON exports: `jurisdiction-profiles.json`, `region-drilldowns.json`, `topic-drilldowns.json`.
- Version bump to v1.0.8; nav Regions/Topics; verify-dist checks.

## Out of scope

- Scraping/crawling; live API/RSS adapters; competitor copy.
- Full legal text storage; final evidence export; caesar-ai-evidence integration.
- Opening evidence gates (`verified_on_source`, `client_use_allowed`, etc.).
- Deploy/tag/merge (Control Tower gated separately).
