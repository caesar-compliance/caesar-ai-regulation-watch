# T047 — Findings summary

**Date:** 20 May 2026  
**Study method:** Read-only review of `_reference-lab/regulation-watch` notes and repo structure (no HTML/dataset paste into Caesar repo).

---

## State guard

| Check | Result |
|-------|--------|
| `main` commit at study start | `d0fc3966aec4350cb57e1c51311867dc68b74bf8` |
| T046 docs on `main` | **Missing** — merge T046 before production on default branch |
| T047 branch base | `docs/T046-automation-first-rebase` (contains T046 docs) |

---

## Top product findings (abbreviated; see docs for detail)

1. Map-first entry is the dominant pattern across Techieray, Legal Wire, and riadeane.
2. Jurisdiction search + click-to-detail panel is table stakes.
3. Curated newsfeed beside map (Techieray) matches Caesar automation-first MVP.
4. Metrics/insights cards (“vibe meter,” dashboards) improve at-a-glance comprehension.
5. Compare-two-or-more jurisdictions is a high-value analyst workflow (Techieray, DLA Piper).
6. Country snapshot pages with source links are the Legal Wire core pattern.
7. Law-firm trackers use hub + per-country pages without always using a live map (Bird & Bird).
8. Multi-checkbox jurisdiction filters work for guide-style products (DLA Piper).
9. Edition/snapshot labeling (e.g. Q3 2025) signals research freshness.
10. Color-coded status matrix communicates risk posture quickly.
11. delschlangen proves a small, verifiable JSON corpus + CLI can bootstrap trust.
12. riadeane shows multi-dimensional scores (policy lever, enforcement, governance) for choropleth.
13. IAPP frames tracker as professional resource with association trust signals.
14. Public embed/widget tabs exist but are optional for Caesar MVP.
15. Caesar v1.0.4 already has jurisdictions, sources, records, changes, timelines, search — but not competitor-grade map/feed/metrics UX.
16. Caesar map today is marker/coverage display, not status choropleth.
17. Human-review-heavy UI on live site conflicts with automation-first target — reposition in docs/UI.
18. Official-source registry and watchers are Caesar differentiators vs most competitors.
19. Structured JSON exports exist in Caesar; RSS/API widgets are competitor gaps to close later.
20. First MVP should ship skeleton map + status + feed before AI summaries or evidence layer.

---

## Top architecture findings

1. delschlangen: three JSON corpora (federal, state, international) with shared entry schema.
2. delschlangen: `last_verified`, `source_url`, `tags`, `key_provisions` as first-class fields.
3. delschlangen: stdlib Python query CLI (`--tag`, `--status`, `--search`, `--jurisdiction`).
4. delschlangen: static `docs/` dashboard generated from data (no backend).
5. riadeane: dual CSV model — narrative `regulation_data.csv` + numeric `scores.csv`.
6. riadeane: `history.json` for temporal comparison and timeline scrubber.
7. riadeane: D3 + TopoJSON 110m world map with score selector driving choropleth.
8. riadeane: side panel normalization layer for LLM-generated copy cleanup.
9. riadeane: Python `regulation_pipeline` for refresh, staleness (90d), priority countries.
10. Caesar should use YAML/git + Astro build pipeline, not GPL frontend modules.

---

## License / reuse risks

| Source | Risk | Mitigation |
|--------|------|------------|
| riadeane (GPL-3.0) | Copyleft if code linked | Reference-only; clean-room map |
| delschlangen (MIT) | Attribution if code/data reused | Rewrite; verify rows officially |
| Techieray / Legal Wire | Proprietary UI + `regdata.js` | Pattern study only |
| DLA Piper / Bird & Bird / IAPP | Proprietary summaries | Structure ideas only |
| riadeane CSV text | Appears LLM-generated narratives | Do not import text; build from official sources |

---

## Confirmation

- No third-party code, HTML, CSS, JS, competitor text, or datasets were copied into `caesar-ai-regulation-watch` during T047.
- `_reference-lab` was read-only.
