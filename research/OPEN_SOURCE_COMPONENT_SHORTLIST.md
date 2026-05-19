# Open-Source Component Shortlist — Caesar AI Regulation Watch

**Prepared:** 19 May 2026  
**Phase:** v0.3.2 — recommendations only; **nothing installed**

Selection criteria: permissive license, static-site fit, alignment with [ARCHITECTURE.md](../ARCHITECTURE.md) static-first design, minimal ops, and Caesar evidence-oriented differentiation.

---

## Map / globe

| Option | License | Integration difficulty | Best fit for Caesar | Recommendation |
|---|---|---|---|---|
| **Leaflet** | BSD-2-Clause | **Low** | 2D jurisdiction map, markers by `regulatory_status`, accessible list fallback | **Primary 2D map** for v0.5 public site |
| **MapLibre GL JS** | BSD-3-Clause | **Medium** | Vector tiles, smoother zoom, optional pseudo-globe | Use if design requires vector base map |
| **D3 + topojson** | ISC | **Medium–High** | Custom choropleth without tile server | Fallback for simple world overview |
| **Three.js / globe.gl** | MIT | **High** | 3D globe “wow” factor like Techieray | **Defer** — accessibility and bundle cost; 2D first |

**Caesar recommendation:** Start with **Leaflet** + YAML-driven GeoJSON jurisdiction layer. Add MapLibre only if vector styling is required. Do not ship 3D globe in pilot.

---

## Static site / public frontend

| Option | License | Integration difficulty | Best fit for Caesar | Recommendation |
|---|---|---|---|---|
| **Astro** | MIT | **Low–Medium** | YAML → pages, RSS, fast static output, React islands for map | **Top pick** |
| **Eleventy** | MIT | **Low** | Pure static, no JS default | Good if team wants zero framework |
| **Next.js (static export)** | MIT | **Medium–High** | Familiar React ecosystem | Only if org standard is Next |
| **Vite + vanilla/React** | MIT | **Medium** | Custom minimal site | More manual than Astro |

**Caesar recommendation:** **Astro** reading `data/` at build time; deploy to GitHub Pages then `regulations.caesar.no`. Match hub static patterns.

---

## Search

| Option | License | Integration difficulty | Best fit for Caesar | Recommendation |
|---|---|---|---|---|
| **Pagefind** | MIT | **Low** (with SSG) | Build-time index of generated HTML | **Top pick with Astro** |
| **Lunr.js** | MIT | **Low–Medium** | Client JSON index from `data/` export | Good for no-build-step search bundle |
| **FlexSearch** | Apache-2.0 | **Medium** | Larger jurisdiction sets | If index grows past ~500 records |

**Caesar recommendation:** **Pagefind** at site build; export `search-index.json` from YAML for optional API consumers later.

---

## Data validation

| Option | License | Integration difficulty | Best fit for Caesar | Recommendation |
|---|---|---|---|---|
| **ajv** (JSON Schema) | MIT | **Low** | Validate all `data/` + `schemas/` in CI | **First CI dependency** (v0.3.3) |
| **@redocly/openapi-core** / similar | MIT | Medium | If OpenAPI added later | Defer |
| **check-jsonschema** (CLI) | Apache-2.0 | **Low** | No Node app — CI only | Alternative if Python CI preferred |
| **yamllint** | GPL-3.0 | Low | Syntax only, not semantic | Style only; **avoid as runtime dep** (copyleft) |

**Caesar recommendation:** **ajv** + existing JSON Schemas in `schemas/`; validate on PR before any watcher code.

---

## RSS / feed parsing (v0.4 watchers)

| Option | License | Integration difficulty | Notes |
|---|---|---|---|
| **rss-parser** (Node) | MIT | Low | Pilot EU/Norway RSS sources |
| **feedparser** (Python) | MIT | Low | If watchers are Python |
| **atoma** / stdlib | varies | Medium | Prefer established MIT libs |

**Caesar recommendation:** Choose when watcher language is decided; do not add in v0.3.2.

---

## Implementation order (safe)

1. **ajv** CI validation (no public site yet)
2. **Astro** static skeleton (v0.3.3)
3. **Leaflet** map on jurisdiction index
4. **Pagefind** search
5. **rss-parser** or equivalent in v0.4 watchers only

---

## Explicitly not shortlisted for pilot

| Component | Reason |
|---|---|
| Elasticsearch / Algolia | Ops cost, not needed for pilot scale |
| Proprietary map tiles without license review | Use open tile providers with attribution |
| Techieray API client | Proprietary data; official-source-first |
| VerifyWise codebase | BSL — blocked |

See [docs/ACCELERATION_DECISION_MATRIX.md](../docs/ACCELERATION_DECISION_MATRIX.md) for phased actions.
