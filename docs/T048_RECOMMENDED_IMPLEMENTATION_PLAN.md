# T048 — Recommended Implementation Plan

**Recommended task:** T048 — Automation-first map + country status + updates feed skeleton  
**Date:** 20 May 2026  
**Depends on:** T046 merged to `main`; T047 study docs merged or on docs branch.

---

## 1. Scope

Build the **minimum credible automation-first tracker UX** on top of Caesar v1.0.4 technical base:

1. **Data model** for `country_status`, `regulatory_update`, and `topic` (schemas + sample YAML).
2. **Public world map skeleton** — jurisdiction click → country page; status coloring from `country_status`.
3. **Country status list** — filterable jurisdiction index with status badges.
4. **Updates/newsfeed skeleton** — `/updates/` (or extend `/changes/`) showing `regulatory_update` records.
5. **Basic filters** — region, status bucket, topic on feed (query-string state).
6. **Metrics cards** — home dashboard + compact metrics section (counts from seed data).

**Out of scope for T048:**

- New npm dependencies (map library approval separate task if needed).
- Production adapter fleet (Phase 2).
- AI summaries, chatbot, RSS, widgets.
- Evidence export, human review queue redesign, `verified_on_source` changes.
- Competitor data import.
- Deploy/tag (separate release task).

---

## 2. Files likely touched

| Area | Paths (indicative) |
|------|-------------------|
| Schemas | `schemas/country-status.schema.json`, `schemas/regulatory-update.schema.json`, `schemas/topic.schema.json` |
| Seed data | `data/country-status/*.yml`, `data/regulatory-updates/*.yml`, `data/topics/*.yml` |
| Build/lib | `src/lib/country-status.ts`, `src/lib/regulatory-updates.ts`, extend `src/lib/data.ts` |
| Public JSON | `public/data/country-status.json`, `public/data/regulatory-updates.json` (build output) |
| Pages | `src/pages/map.astro`, `src/pages/index.astro`, `src/pages/jurisdictions/index.astro`, `src/pages/jurisdictions/[id].astro`, new `src/pages/updates/index.astro` |
| Components | `src/components/CoverageMap.astro` (extend or replace), new `CountryStatusMap.astro`, `UpdateFeedCard.astro`, `MetricsStrip.astro` |
| Scripts | `scripts/build-public-data.mjs` (or existing data build pipeline) |
| Docs | `PROJECT_STATE.md`, `NEXT_ACTIONS.md` — brief T048 status only |
| Tests/validate | `package.json` scripts — ensure `validate:data` covers new schemas |

---

## 3. Data model needed

### `country_status`

```yaml
jurisdiction_id: eu
status_bucket: adopted | proposed | consultation | guidance | enforcement | strategy | none | unknown
headline_summary: ""   # Caesar-written, short
topics: [eu-ai-act, high-risk]
last_checked_at: 2026-05-20
confidence_score: high | medium | low | blocked
source_ids: [eu-ai-office]
automation_method: manual_seed   # T048 seed only
```

### `regulatory_update`

Per `FIRST_FULL_MVP_REQUIREMENTS.md` §4.1 — minimum fields: `id`, `title`, `summary`, `jurisdiction_id`, `update_type`, `legal_status`, `topics`, `detected_at`, `source_urls`, `confidence_score`, `automation_method`, `requires_human_review: false`.

### `topic`

```yaml
id: eu-ai-act
label: EU AI Act
parent: eu-regulation
```

**Status buckets (map colors):** adopted/in force, proposed, consultation, guidance, enforcement, strategy/policy, none, unknown.

---

## 4. Validation

```bash
npm run validate:data
npm run build
git diff --check
```

Manual checks:

- Map page loads; clicking a seeded jurisdiction navigates to country page.
- Feed shows ≥10 sample updates with source links.
- Filters narrow feed without JS errors.
- Metrics cards reflect seed counts.
- No competitor text in YAML or components.
- Home banner reflects automation-first (optional small copy tweak in T048).

---

## 5. Safety boundaries

| Rule | T048 enforcement |
|------|------------------|
| No competitor copy | Summaries written for Caesar seed only |
| No GPL/MIT code paste | Map component clean-room |
| No new dependencies | Skeleton SVG/CSS or existing stack only |
| Evidence gates closed | `client_evidence_allowed: false` on all seeds |
| Human review optional | `requires_human_review: false`; do not expand review queue UI |
| Reference lab read-only | No `_reference-lab` commits |
| Official sources | Every `source_urls` entry must be allowlisted official URL |

---

## 6. What not to build yet

- Full choropleth with TopoJSON/D3 (unless zero-dep SVG path is trivial — otherwise stub with list+map markers colored by status).
- RSS, public API routes, embed widgets.
- Automated adapter scheduling beyond existing watchers.
- Compare-countries view.
- AI-generated summaries.
- riadeane-style 1–5 score dimensions (use simpler buckets first).
- Migration of all legacy `changes/` records — optional bridge, not required for skeleton.

---

## 7. Suggested PR title and exit

**Title:** `feat(T048): automation-first map, country status, and updates feed skeleton`

**Exit:** Stakeholder can demo map + feed + metrics with seed data; validation green; ready for Phase 2 adapters (T049+).

---

## Related docs

- [AUTOMATION_FIRST_IMPLEMENTATION_BACKLOG.md](AUTOMATION_FIRST_IMPLEMENTATION_BACKLOG.md) — Phase 1 items P1-01–P1-10
- [FIRST_FULL_MVP_REQUIREMENTS.md](FIRST_FULL_MVP_REQUIREMENTS.md)
- [OPEN_SOURCE_ARCHITECTURE_FINDINGS.md](OPEN_SOURCE_ARCHITECTURE_FINDINGS.md)
- [PUBLIC_COMPETITOR_UX_FINDINGS.md](PUBLIC_COMPETITOR_UX_FINDINGS.md)
