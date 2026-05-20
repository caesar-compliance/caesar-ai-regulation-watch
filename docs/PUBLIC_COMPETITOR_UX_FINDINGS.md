# Public Competitor UX Findings — Regulation Watch

**Date:** 20 May 2026  
**Method:** Read capture **notes** in `_reference-lab/regulation-watch/site-captures/` (not competitor HTML in Caesar repo).  
**Benchmarks:** Techieray, The Legal Wire, IAPP, DLA Piper, Bird & Bird.

---

## 1. Techieray — UX and product patterns

**Positioning:** Public, map-first “Global AI Regulation Tracker” with multiple dashboard tabs.

| Pattern | Observation | Caesar-native response |
|---------|-------------|------------------------|
| Map entry | SVG world map (`svgMap`), pan/zoom, jurisdiction coloring | Build interactive status map (Phase 1 skeleton → Phase 2 choropleth) |
| Search | “Search a jurisdiction…” | Global jurisdiction typeahead on map + home |
| Detail panel | Click region → detail card | Country drawer: status, laws, sources, latest updates |
| Tabs | Insights, vibe meter, newsfeed, compare, embed, chatbot | MVP: **Updates + Metrics + Map**; defer chatbot/embed |
| Newsfeed | Curated legal/policy news module | `regulatory_update` feed from automation adapters |
| Metrics | “Vibe meter” + Plotly/D3 insights | Metrics cards: active jurisdictions, updates this week, top topics |
| Compare | `compareCountries.js` side-by-side | Phase 2: compare 2–5 selected jurisdictions |
| Embed | Widget tab | Phase 3: JSON/RSS widgets only if policy approves |

**Do not copy:** `regdata.js`, dist bundles, marketing copy, AdSense/Stripe/chatbot integrations.

**Caesar should do better:** Source transparency on every feed item; automation confidence labels; official-source registry link; no proprietary dataset lock-in.

---

## 2. The Legal Wire — UX and product patterns

**Positioning:** AI regulation tracker embedded in legal media site (WordPress + `aitracker` plugin).

| Pattern | Observation | Caesar response |
|---------|-------------|-----------------|
| Map + cards | Global map + per-country cards (flag, name, detail, source) | Country list + map; card component with ISO flag |
| Source discipline | Detail and source links per jurisdiction | Required `source_urls` on every country page |
| Editorial split | Tracker product vs newsroom | Caesar: app at `regulation-watch.caesar.no`; changelog/blog separate |
| Launch narrative | Dedicated launch article | Use Caesar `PROJECT_STATE` / release notes, not competitor article text |

**Do not copy:** WP theme, `aitracker` assets, country copy, images.

**Caesar should do better:** Automation-first feed without paywalled journalism; structured exports for integrators.

---

## 3. IAPP — legal tracker patterns

**Positioning:** Professional association **resource article** framing global AI law tracker.

| Pattern | Observation | Caesar response |
|---------|-------------|-----------------|
| Trust framing | Association-grade credibility, resource library placement | Methodology page: last updated, editorial policy, citation guidance |
| Audience | Privacy/compliance practitioners | Plain-language labels; link to Evidence/Governance OS later |
| Tracker UI | Hydrates client-side (limited in static capture) | Pair **docs article** + **live tool** entry points |
| Membership | Implicit gating for some IAPP resources | Caesar public tier default; optional future premium |

**Do not copy:** IAPP logos, article text, Contentstack assets.

**Caesar should do better:** Machine-readable JSON/RSS public exports; explicit automation methodology.

---

## 4. DLA Piper — comparison and legal guide patterns

**Positioning:** “AI Laws of the World” Intelligence guide — 40+ jurisdictions, compare frameworks.

| Pattern | Observation | Caesar response |
|---------|-------------|-----------------|
| Country picker | Long checkbox list → filtered guide views | Multi-select jurisdiction filter + “compare selected” |
| Compare | Hero promises cross-framework comparison | Phase 2 comparison view (status + key deltas) |
| Editions | “2025 Q3 snapshot” versioned research | `metric_snapshot` / `baseline_edition` label on exports |
| Login tier | Deeper Intelligence behind login (not accessed) | Document public vs authenticated tiers if needed later |
| Map vs list | Landing emphasizes filter sidebar over live map | Caesar leads with **map** but adopts strong filter sidebar |

**Do not copy:** Legal summaries, checkbox list as dataset, Intelligence CSS/JS.

**Caesar should do better:** Primary truth from official URLs, not firm analysis; real-time update feed vs static quarterly PDF model.

---

## 5. Bird & Bird — horizon tracker patterns

**Positioning:** Law-firm “AI Regulatory Horizon Tracker” — 22 jurisdictions, risk-based view.

| Pattern | Observation | Caesar response |
|---------|-------------|-----------------|
| Hub layout | Index with jurisdiction buttons, no world map on hub | `/jurisdictions/` hub + optional matrix table |
| Status matrix | Color-coded summary table (image on page) | Caesar-owned HTML table from `country_status` data |
| Per-country pages | `/…/ai-regulatory-horizon-tracker/{country}` | `/jurisdictions/{id}/` with sections: adopted, proposed, guidance, enforcement |
| CTA | Contact for deeper inquiries | Keep professional CTA out of public data layer |
| Coverage count | “22 jurisdictions” as trust signal | Show automation coverage metrics honestly |

**Do not copy:** Table image, write-ups, Sitecore HTML, slug content.

**Caesar should do better:** Broader jurisdiction coverage over time; automated “last checked” vs static firm updates.

---

## 6. Cross-cutting UX themes (map / list / filter / newsfeed / metrics)

| Theme | Best references | Caesar MVP priority |
|-------|-----------------|---------------------|
| **Map** | Techieray, riadeane, Legal Wire | P0 — status choropleth skeleton |
| **List** | Legal Wire cards, Bird & Bird hub | P0 — sortable jurisdiction list with status badges |
| **Filter** | DLA Piper multi-select, delschlangen tags | P0 — region, status, topic on feed |
| **Newsfeed** | Techieray | P0 — chronological `regulatory_update` |
| **Metrics** | Techieray insights, Bird & Bird matrix | P0 — home + `/metrics/` cards |
| **Timeline** | riadeane history, DLA editions | P1 |
| **Compare** | Techieray, DLA Piper | P1 |
| **AI chat** | Techieray | P3 — defer |

---

## 7. What Caesar should do better (summary)

1. **Automation-first updates** with visible `automation_method` and confidence — competitors often hide curation cadence.
2. **Official-source registry** as first-class navigation — most competitors blend secondary commentary.
3. **Structured public exports** (JSON today; RSS/API in roadmap) — law-firm sites rarely offer this.
4. **No evidence overclaim** — separate public tracker from closed evidence gates.
5. **Global coverage path** — start with priority jurisdictions + honest “not monitored” bucket.
6. **Clean-room implementation** — no GPL/proprietary contamination.
7. **Optional human review** later for premium assurance, not blocking public feed.

---

## Related docs

- [COMPETITOR_FEATURE_MATRIX.md](COMPETITOR_FEATURE_MATRIX.md)
- [AUTOMATION_FIRST_IMPLEMENTATION_BACKLOG.md](AUTOMATION_FIRST_IMPLEMENTATION_BACKLOG.md)
- [FIRST_FULL_MVP_REQUIREMENTS.md](FIRST_FULL_MVP_REQUIREMENTS.md)
