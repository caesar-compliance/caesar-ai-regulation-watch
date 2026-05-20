# T050 — Decisions

## Map implementation

**Decision:** Caesar-native CSS/SVG regional panel + per-jurisdiction tiles colored by `status_bucket`, not GPL TopoJSON/D3 choropleth.

**Rationale:** Reference lab maps (e.g. riadeane) are GPL; pilot has 13 jurisdictions; abstract panel meets UX goal without dependency or license risk.

## Scoring model

**Decision:** Compute `regulation_maturity_score` and `activity_score` at build/export time from status bucket weights + update counts/recency — not stored in YAML seeds.

**Rationale:** Keeps YAML stable; scores are explicitly tracker metadata, not legal certainty.

## Compare route

**Decision:** `/compare/` with GET multi-select `ids` (max 4), static Astro table.

**Rationale:** No client framework required; matches existing filter/query patterns.
