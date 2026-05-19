# Clean-Room Feature Backlog — Caesar AI Regulation Watch

**Prepared:** 19 May 2026  
**Phase:** v0.3.3 — planning only; no implementation  
**Rule:** Every item is a **Caesar-original** task inspired by benchmarks (VerifyWise, Techieray, DLA Piper, OECD, IAPP, etc.). No competitor code, schemas, or proprietary data.

**Phase key:** v0.4.0 = static public site · v0.4.1 = schema CI · v0.5 = map/search/feeds · v0.6+ = watchers · v1.0+ = Governance OS

---

## Priority legend

| Field | Meaning |
|---|---|
| **Inspiration** | Benchmark source for the *pattern* only |
| **Caesar-specific version** | What we actually build |
| **Difficulty** | Low / Medium / High |
| **Dependency risk** | Risk of blocking deps or cross-repo alignment |
| **License risk** | Low unless noted |
| **Data dependency** | What YAML/data must exist first |

---

## P0 — v0.4.0 static site (build first)

### 1. Static site from existing YAML

| Field | Value |
|---|---|
| **Inspiration** | VerifyWise tracker cards; Techieray public tracker; Caesar DEC-005 static-first |
| **Caesar-specific version** | Astro (recommended) project under `site/` generating HTML from `data/**/*.yml` at build time |
| **Earliest safe phase** | v0.4.0 |
| **Difficulty** | Medium |
| **Dependency risk** | Low (Astro MIT; needs Control Tower approval for `package.json`) |
| **License risk** | Low |
| **Data dependency** | Existing registry + samples + taxonomies |
| **Why it accelerates** | Makes pilot data visible; unblocks stakeholder review without watchers |

### 2. Home / overview page

| Field | Value |
|---|---|
| **Inspiration** | Techieray map-first entry; VerifyWise tracker landing |
| **Caesar-specific version** | Pilot scope summary, links to EU/Norway, latest changes list, disclaimers |
| **Earliest safe phase** | v0.4.0 |
| **Difficulty** | Low |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | Jurisdictions, changes |
| **Why it accelerates** | Single entry point for demos and Control Tower review |

### 3. Jurisdictions index page

| Field | Value |
|---|---|
| **Inspiration** | VerifyWise country grid; DLA Piper country selector |
| **Caesar-specific version** | Table/cards from `data/jurisdictions/*.yml` with `monitoring_priority`, `review_status` |
| **Earliest safe phase** | v0.4.0 |
| **Difficulty** | Low |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | `eu.yml`, `norway.yml` |
| **Why it accelerates** | Core navigation shell for all profile pages |

### 4. EU jurisdiction profile page

| Field | Value |
|---|---|
| **Inspiration** | DLA Piper country profile; OECD jurisdiction dashboard |
| **Caesar-specific version** | Tabbed or sectioned profile: overview, linked sources, laws, guidance, changes; EEA note via `related_frameworks` |
| **Earliest safe phase** | v0.4.0 |
| **Difficulty** | Medium |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | `eu.yml`, filtered sources/laws/guidance/changes |
| **Why it accelerates** | Primary pilot jurisdiction depth |

### 5. Norway jurisdiction profile page

| Field | Value |
|---|---|
| **Inspiration** | Same as EU; Norway implementation focus |
| **Caesar-specific version** | Profile with `parent_jurisdiction: null`, `related_frameworks: [eu, eea]`; Datatilsynet sources prominent |
| **Earliest safe phase** | v0.4.0 |
| **Difficulty** | Medium |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | `norway.yml`, Norway sources and samples |
| **Why it accelerates** | Second pilot market for consulting demos |

### 6. Official sources index

| Field | Value |
|---|---|
| **Inspiration** | OECD official linking; VerifyWise source transparency |
| **Caesar-specific version** | Sortable list of seven pilot sources with credibility tier, fetch cadence, `official_url` |
| **Earliest safe phase** | v0.4.0 |
| **Difficulty** | Low |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | `data/sources/*.yml` |
| **Why it accelerates** | Proves official-source-first positioning on the public site |

### 7. Source detail pages

| Field | Value |
|---|---|
| **Inspiration** | Registry transparency patterns |
| **Caesar-specific version** | One page per `source_id`; monitoring scope, attribution, link-out CTA |
| **Earliest safe phase** | v0.4.0 |
| **Difficulty** | Low |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | Source schema fields |
| **Why it accelerates** | Audit trail for what Caesar monitors |

### 8. Laws / guidance index

| Field | Value |
|---|---|
| **Inspiration** | VerifyWise regulation cards; artificialintelligenceact.eu topic list |
| **Caesar-specific version** | Index of `data/laws/` and `data/guidance/` with status badges from taxonomy |
| **Earliest safe phase** | v0.4.0 |
| **Difficulty** | Low |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | Sample law + guidance YAML |
| **Why it accelerates** | Validates entity model in UI |

### 9. Law / guidance detail pages

| Field | Value |
|---|---|
| **Inspiration** | VerifyWise regulation cards; Caesar UI_UX_VISION record page |
| **Caesar-specific version** | Metadata, `regulatory_status`, topics, official source button, related changes, draft control/evidence chips |
| **Earliest safe phase** | v0.4.0 |
| **Difficulty** | Medium |
| **Dependency risk** | Medium (mapping display optional v0.4.0) |
| **License risk** | Low |
| **Data dependency** | Law/guidance schemas, taxonomies, mappings samples |
| **Why it accelerates** | Core governance-oriented differentiation vs plain trackers |

### 10. Changes index (timeline feed)

| Field | Value |
|---|---|
| **Inspiration** | VerifyWise change history; Techieray newsfeed (official-source variant) |
| **Caesar-specific version** | Chronological list from `data/changes/` with `change_type`, `confidence_level`, `review_status` |
| **Earliest safe phase** | v0.4.0 |
| **Difficulty** | Low |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | Change samples |
| **Why it accelerates** | Shows change workflow before watchers exist |

### 11. Status and credibility badges

| Field | Value |
|---|---|
| **Inspiration** | VerifyWise status labels; Fairly color legend (concept only) |
| **Caesar-specific version** | Shared badge component driven by `regulatory-statuses.yml` and `source-credibility-levels.yml` |
| **Earliest safe phase** | v0.4.0 |
| **Difficulty** | Low |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | Taxonomies |
| **Why it accelerates** | Consistent visual language across all pages |

### 12. Review-status display

| Field | Value |
|---|---|
| **Inspiration** | VerifyWise approval/review workflows (concept) |
| **Caesar-specific version** | Visible `review_status` on every entity; banner when `pending_review` |
| **Earliest safe phase** | v0.4.0 |
| **Difficulty** | Low |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | `review-statuses.yml` |
| **Why it accelerates** | Legal-safe transparency; no implied approval |

### 13. Evidence export contract sample page

| Field | Value |
|---|---|
| **Inspiration** | VerifyWise reporting/export; Caesar Evidence ecosystem |
| **Caesar-specific version** | Human-readable rendering of `exports/samples/regulation-change-export.sample.yml` with field glossary link |
| **Earliest safe phase** | v0.4.0 |
| **Difficulty** | Low |
| **Dependency risk** | Medium (may update after evidence repo alignment) |
| **License risk** | Low |
| **Data dependency** | Export sample + contract doc |
| **Why it accelerates** | Differentiates from tracker-only competitors |

### 14. Methodology and disclaimer pages

| Field | Value |
|---|---|
| **Inspiration** | IAPP practitioner framing; VerifyWise trust center tone |
| **Caesar-specific version** | Static pages: not legal advice, coverage limits, official-source policy, `record_origin` explanation |
| **Earliest safe phase** | v0.4.0 |
| **Difficulty** | Low |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | None (markdown content) |
| **Why it accelerates** | Required for public publish quality gate |

### 15. JSON Schema CI (ajv)

| Field | Value |
|---|---|
| **Inspiration** | VerifyWise schema discipline (concept); Caesar schemas already exist |
| **Caesar-specific version** | `npm` script validating all `data/` against `schemas/` on PR |
| **Earliest safe phase** | v0.4.1 (same implementation wave as site, if approved) |
| **Difficulty** | Low |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | All YAML |
| **Why it accelerates** | Prevents broken builds when site goes live |

---

## P1 — v0.5 public enhancements

### 16. Jurisdiction map (Leaflet)

| Field | Value |
|---|---|
| **Inspiration** | Techieray globe; VerifyWise geography |
| **Caesar-specific version** | 2D map with pilot markers; list fallback for accessibility |
| **Earliest safe phase** | v0.5 |
| **Difficulty** | Medium |
| **Dependency risk** | Low |
| **License risk** | Low (BSD Leaflet) |
| **Data dependency** | Geo IDs in jurisdiction YAML (may need extension) |
| **Why it accelerates** | Map-first UX without 3D cost |

### 17. Pagefind search

| Field | Value |
|---|---|
| **Inspiration** | Techieray search; OECD filters |
| **Caesar-specific version** | Build-time index over generated pages |
| **Earliest safe phase** | v0.5 |
| **Difficulty** | Low |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | Static site pages exist |
| **Why it accelerates** | Findability as registry grows |

### 18. RSS / JSON export endpoints (static files)

| Field | Value |
|---|---|
| **Inspiration** | Techieray API; VerifyWise platform lock-in inverse |
| **Caesar-specific version** | Generated `feed.xml` and `export.json` from approved records only |
| **Earliest safe phase** | v0.5 |
| **Difficulty** | Medium |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | Review policy for public fields |
| **Why it accelerates** | Integrator and consultant workflows |

### 19. Regulatory timelines (`data/timelines/`)

| Field | Value |
|---|---|
| **Inspiration** | VerifyWise enforcement timelines; artificialintelligenceact.eu |
| **Caesar-specific version** | Per-jurisdiction milestone YAML with `official_url` per event |
| **Earliest safe phase** | v0.5 |
| **Difficulty** | Medium |
| **Dependency risk** | Low |
| **License risk** | Low |
| **Data dependency** | Curated dates (manual) |
| **Why it accelerates** | High-value UX from benchmark study |

### 20. Change detail pages

| Field | Value |
|---|---|
| **Inspiration** | Vendor Watch change pages; VerifyWise change history |
| **Caesar-specific version** | Full change record + mapping summary + export download link |
| **Earliest safe phase** | v0.5 |
| **Difficulty** | Medium |
| **Dependency risk** | Medium |
| **License risk** | Low |
| **Data dependency** | Changes + mappings |
| **Why it accelerates** | Completes change workflow UX |

---

## P2 — v0.6+ watchers and automation

### 21. Pilot RSS/HTML watchers

| Field | Value |
|---|---|
| **Inspiration** | VerifyWise automation concept; official sources only |
| **Caesar-specific version** | EU AI Office + Datatilsynet first; `record_origin: future_watcher_output` |
| **Earliest safe phase** | v0.6 |
| **Difficulty** | High |
| **Dependency risk** | High (infra, rate limits, legal) |
| **License risk** | Low |
| **Data dependency** | `data/sources/` fetch config |
| **Why it accelerates** | Moves from manual samples to live monitoring |

### 22. Internal watcher dashboard

| Field | Value |
|---|---|
| **Inspiration** | VerifyWise executive dashboard; Techieray insights |
| **Caesar-specific version** | Private dashboard: fetch health, pending review queue (not public v0.4) |
| **Earliest safe phase** | v0.6+ |
| **Difficulty** | High |
| **Dependency risk** | High |
| **License risk** | Low |
| **Data dependency** | Watchers running |
| **Why it accelerates** | Operations for curators |

---

## P3 — v1.0+ Governance OS

### 23. Regulatory inbox import

| Field | Value |
|---|---|
| **Inspiration** | VerifyWise Governance OS route (concept) |
| **Caesar-specific version** | Approved `ChangeRecord` → `caesar-ai-governance-os` inbox via export bundle |
| **Earliest safe phase** | v1.0+ |
| **Difficulty** | High |
| **Dependency risk** | High (OS spec) |
| **License risk** | Low |
| **Data dependency** | Frozen export contract with Evidence |
| **Why it accelerates** | Closes ecosystem loop |

### 24. Client workspace jurisdiction filters

| Field | Value |
|---|---|
| **Inspiration** | VerifyWise project scoping |
| **Caesar-specific version** | Per-client subset of registry in OS |
| **Earliest safe phase** | v1.0+ |
| **Difficulty** | High |
| **Dependency risk** | High |
| **License risk** | Low |
| **Data dependency** | Multi-tenant OS |
| **Why it accelerates** | Consulting delivery model |

---

## Explicitly deferred (not in backlog execution order)

- 3D globe (Techieray-style)
- VerifyWise framework annex import
- Techieray API-powered public feed
- Fairly map data (blocked — no LICENSE)
- AI-generated summaries without review queue
- Authenticated multi-tenant Regulation Watch API

---

## Related documents

- [VERIFYWISE_ARCHITECTURE_STUDY.md](VERIFYWISE_ARCHITECTURE_STUDY.md)
- [COMPETITOR_FEATURE_REPLICATION_PLAN.md](COMPETITOR_FEATURE_REPLICATION_PLAN.md)
- [docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md](../docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md)
