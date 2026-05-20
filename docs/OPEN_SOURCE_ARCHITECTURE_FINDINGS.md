# Open Source Architecture Findings — Regulation Watch

**Date:** 20 May 2026  
**Sources studied (read-only in `_reference-lab`):**

- `delschlangen/ai-legislation-tracker` — MIT, commit `146d39e`
- `riadeane/airegulationmap` — GPL-3.0, commit `8bb51b1`

No code from these repositories was copied into Caesar product repos for this study.

---

## 1. delschlangen — data model ideas

### Corpus split

Three JSON files by scope:

- `us_federal_actions.json` — executive orders, agency guidance, frameworks
- `us_state_bills.json` — state and NYC local laws
- `international_frameworks.json` — EU, UK, China, OECD, UN, G7, etc.

### Entry schema (conceptual)

Each record is self-contained with:

| Field group | Examples | Caesar mapping |
|-------------|----------|----------------|
| Identity | `id`, `bill_number` / `name` | `law_or_policy_record.id`, official citation |
| Jurisdiction | `state`, `jurisdiction`, `agency` | `jurisdiction_id` |
| Lifecycle | `status`, `date_enacted`, `effective_date` | `legal_status`, milestone dates |
| Narrative | `summary`, `key_provisions[]` | Short `summary` + bullet provisions (Caesar-written) |
| Trust | `source_url`, `last_verified` | `source_ids`, `last_checked_at` |
| Taxonomy | `tags[]` | `topics[]` |
| Enforcement | nested `enforcement` on intl rows | optional `enforcement` block |

**Takeaway:** Small, verified, machine-readable JSON with mandatory official `source_url` and `last_verified` is a strong bootstrap pattern. Caesar should use YAML + JSON exports with the same discipline, fed by automation not manual clone.

---

## 2. delschlangen — filter and search ideas

### CLI query surface (`query_legislation.py`)

- `--tag` — topic taxonomy (employment, comprehensive, genai, …)
- `--status` — enacted, pending, vetoed, rescinded, active
- `--jurisdiction` — filter by state/country name
- `--search` — full-text across title, summary, provisions
- `--count` — aggregation only
- `--list-tags` — discover taxonomy

### Static web UI (`docs/app.js` + `data.js`)

- Searchable table with expandable rows
- Filters by jurisdiction, status, tags
- Mobile-responsive table (not map-first)

**Caesar takeaway:** Expose the same dimensions on the public site: country, region, topic, `update_type`, `legal_status`, date range, confidence. Implement filter state in URL query params for shareable views. Keep heavy search in Pagefind for narrative pages; structured filters for the updates feed.

---

## 3. delschlangen — source-link ideas

- Every entry requires `source_url` pointing to government or official publisher.
- `MAINTENANCE.md` documents verification methodology and reporting corrections.
- `CITATION.md` gives BibTeX/APA templates for **their** dataset — Caesar needs its own citation block for Caesar exports.

**Caesar takeaway:** No publish without `source_urls[]`. Show `last_verified` / `last_checked_at` on country and update cards. Link to Caesar `/sources/{id}` registry row, not raw competitor URLs.

---

## 4. riadeane — map and D3 ideas (reference only)

### Stack

- Vite + vanilla ES modules
- D3 v7 + TopoJSON (`countries-110m.json`)
- No React — modular `src/map/`, `src/panel/`, `src/controls/`

### Map behavior (patterns)

- Choropleth driven by selected **score dimension** (average or single attribute)
- Tooltip on hover; click opens country **side panel**
- Legend endpoints map 1–5 scale to human labels (Minimal ↔ Comprehensive)
- Zoom module; comparison mode with radar chart for multi-select
- URL state sync for shareable map views (`src/controls/url.js`)

**Caesar takeaway:** Implement similar UX in Astro with a Caesar-native map component (consider permissive map library or lightweight SVG). Do **not** import GPL `src/map/*.js` files.

---

## 5. riadeane — country status ideas

### Dual-layer data

1. **`scores.csv`** — numeric 1–5 per dimension: Regulation Status, Policy Lever, Governance Type, Actor Involvement, Enforcement Level, Average Score
2. **`regulation_data.csv`** — long-form narrative per country + Specific Laws + Sources + Confidence

### Pipeline (`scripts/regulation_pipeline/`)

- Config-driven field lists and staleness threshold (`STALENESS_DAYS = 90`)
- Priority country set for refresh ordering
- `history.json` for temporal diffs and timeline UI
- Optional copy normalization flag for LLM-generated descriptions

**Caesar takeaway:** Separate **structured status** (enum/buckets for map color) from **narrative summary** (automation-generated, confidence-labeled). Track `data_version` per jurisdiction snapshot. Use `country_status` entity in Caesar schema (see T048).

---

## 6. License constraints

| Repo | License | Constraint |
|------|---------|------------|
| delschlangen | MIT | May study and optionally reuse with attribution; dataset still needs official re-verification |
| riadeane | GPL-3.0 | **No copy/link** of frontend or combined work into Caesar repo without copyleft compliance |
| riadeane CSV content | Not clearly OSS-licensed separately | Treat narrative text as **untrusted third-party**; rebuild from official sources |

---

## 7. What Caesar can learn (implement natively)

1. Mandatory `source_url` + verification timestamp on every public record.
2. Tag/topic taxonomy with CLI-equivalent public filters.
3. Choropleth map with 6–8 status buckets (simpler than 5×5 score grid for MVP).
4. Country side panel: status, latest updates, key laws, sources, last checked.
5. History/snapshot file for “what changed since last edition.”
6. Static-site architecture: data files → build → GitHub Pages (matches Caesar Astro model).
7. Priority jurisdiction list for adapter rollout order.
8. Staleness policy (90-day re-check) aligned with `SCHEDULED_MONITORING_POLICY.md`.

---

## 8. What Caesar must rewrite (not import)

| riadeane / delschlangen asset | Caesar action |
|------------------------------|---------------|
| All `src/**/*.js` (riadeane) | Clean-room Astro components + TS/lib modules |
| `regulation_data.csv` / JSON rows | Build from official adapters + Caesar summaries |
| `scores.csv` rubric | Define Caesar `country_status` enums; do not copy 1–5 scale labels verbatim |
| Python pipeline scripts | Caesar `scripts/` with monitoring policy checks |
| D3/TopoJSON setup | New dependency only if approved; prefer minimal SVG/canvas for MVP skeleton |
| delschlangen JSON files | Use as **study samples** only; re-key and verify each jurisdiction officially |

---

## 9. Suggested Caesar data entities (from study)

```text
jurisdiction          # ISO + display name + region
country_status        # bucket + optional dimension scores + last_checked_at
regulatory_update     # feed item (FIRST_FULL_MVP_REQUIREMENTS.md)
law_or_policy_record  # stable instrument reference
source                # registry (existing)
topic                 # taxonomy
metric_snapshot       # weekly/monthly rollups for dashboard
```

---

## Related docs

- [COMPETITOR_FEATURE_MATRIX.md](COMPETITOR_FEATURE_MATRIX.md)
- [T048_RECOMMENDED_IMPLEMENTATION_PLAN.md](T048_RECOMMENDED_IMPLEMENTATION_PLAN.md)
- [REFERENCE_LAB_SETUP.md](REFERENCE_LAB_SETUP.md)
