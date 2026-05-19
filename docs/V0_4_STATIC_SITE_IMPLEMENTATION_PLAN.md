# v0.4.0 Static Site Implementation Plan — Caesar AI Regulation Watch

**Prepared:** 19 May 2026  
**Status:** Plan only — **no implementation in v0.3.3**  
**Prerequisite:** v0.3.3 VerifyWise clean-room study complete; Control Tower approval to add `package.json`  
**Architecture choice:** [NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md](NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md) — **Astro (Option A)**

---

## Goal of v0.4.0

Deliver a **read-only static public site** that renders the existing pilot registry and sample records from `data/` with Caesar-original templates, taxonomy-driven badges, review-status transparency, methodology/disclaimers, and an evidence-export sample page — **without** watchers, backend, database, authentication, or legal claims.

**Success statement:** A stakeholder can browse EU/Norway coverage, official sources, sample laws/guidance/changes, and export contract examples on static HTML, with every factual claim linking to registered official URLs.

---

## Proposed directory structure

```text
caesar-ai-regulation-watch/
├── data/                          # unchanged — source of truth
├── schemas/                       # unchanged
├── mappings/
├── exports/samples/
├── site/                          # NEW — Astro project
│   ├── package.json               # site-scoped deps only
│   ├── astro.config.mjs
│   ├── tsconfig.json
│   ├── public/
│   │   ├── favicon.svg
│   │   └── robots.txt
│   ├── src/
│   │   ├── layouts/
│   │   │   └── BaseLayout.astro
│   │   ├── components/
│   │   │   ├── StatusBadge.astro
│   │   │   ├── ReviewBanner.astro
│   │   │   ├── SourceLink.astro
│   │   │   └── Disclaimer.astro
│   │   ├── lib/
│   │   │   ├── loadYaml.ts        # read ../../data at build time
│   │   │   ├── taxonomies.ts
│   │   │   └── validate.ts        # ajv wrapper (optional prebuild)
│   │   ├── pages/
│   │   │   ├── index.astro
│   │   │   ├── jurisdictions/
│   │   │   │   ├── index.astro
│   │   │   │   ├── eu.astro
│   │   │   │   └── norway.astro
│   │   │   ├── sources/
│   │   │   │   ├── index.astro
│   │   │   │   └── [id].astro
│   │   │   ├── laws/
│   │   │   │   ├── index.astro
│   │   │   │   └── [id].astro
│   │   │   ├── guidance/
│   │   │   │   ├── index.astro
│   │   │   │   └── [id].astro
│   │   │   ├── changes/
│   │   │   │   └── index.astro
│   │   │   ├── export-sample.astro
│   │   │   ├── methodology.astro
│   │   │   └── disclaimer.astro
│   │   └── styles/
│   │       └── global.css
│   └── scripts/
│       └── validate-data.mjs      # ajv all YAML — callable from CI
├── .github/workflows/             # NEW (optional v0.4.0)
│   └── site.yml                   # build + validate on PR
└── (repo root docs unchanged)
```

**Build output:** `site/dist/` (gitignored) deployed to GitHub Pages or CDN.

---

## Proposed dependencies (v0.4.0 only)

| Package | Purpose | License |
|---|---|---|
| `astro` | SSG | MIT |
| `js-yaml` | Load `data/` at build | MIT |
| `ajv` | Schema validation (dev/CI) | MIT |
| `ajv-formats` | URI/date formats | MIT |
| `typescript` | Typecheck site code | Apache-2.0 |

**Deferred to v0.5:** `pagefind`, `leaflet`, `react`, `@astrojs/react`

**Not included:** `next`, `express`, database drivers, VerifyWise/MUI stack

---

## Pages to generate first

| Route | Source data | Priority |
|---|---|---|
| `/` | jurisdictions + recent changes + pilot scope | P0 |
| `/jurisdictions/` | `data/jurisdictions/*.yml` | P0 |
| `/jurisdictions/eu/` | `eu.yml` + related sources/records | P0 |
| `/jurisdictions/norway/` | `norway.yml` + related | P0 |
| `/sources/` | `data/sources/*.yml` | P0 |
| `/sources/[id]/` | per source file | P0 |
| `/laws/` | `data/laws/*.yml` | P0 |
| `/laws/[id]/` | per law | P0 |
| `/guidance/` | `data/guidance/*.yml` | P0 |
| `/guidance/[id]/` | per guidance | P0 |
| `/changes/` | `data/changes/*.yml` | P0 |
| `/export-sample/` | `exports/samples/*.yml` + contract doc | P0 |
| `/methodology/` | static content | P0 |
| `/disclaimer/` | static content | P0 |

**Not in v0.4.0:** map page, search UI, change detail permalinks (optional stub), RSS (v0.5)

---

## Data inputs

| Path | Schema | Usage |
|---|---|---|
| `data/jurisdictions/*.yml` | `jurisdiction.schema.json` | Index + profile pages |
| `data/sources/*.yml` | `source.schema.json` | Source index + detail |
| `data/laws/*.yml` | `law.schema.json` | Law index + detail |
| `data/guidance/*.yml` | `guidance.schema.json` | Guidance index + detail |
| `data/changes/*.yml` | `change.schema.json` | Changes feed |
| `data/taxonomies/*.yml` | `taxonomy.schema.json` | Badge labels/colors |
| `mappings/*.sample.yml` | mapping schemas | Optional section on change/law pages |
| `exports/samples/*.yml` | `evidence-export-record.schema.json` | Export sample page |

**Filtering rule:** Only render records where `review_status` allows public display — default show all with **pending_review banner** (do not hide pilot samples).

---

## Build / validation approach

```text
PR opened
  → npm run validate (site/scripts/validate-data.mjs)
       → ajv validate each YAML against schemas/
  → npm run build (in site/)
       → load YAML → Astro generateStaticPaths → dist/
  → (optional) upload dist artifact / deploy Pages
```

**Local dev:** `cd site && npm run dev` (Astro dev server, hot reload).

**Pre-merge gate:** Validation failure blocks merge if CI enabled.

**No runtime YAML loading in production** — all content baked at build time.

---

## Safety boundaries

| Boundary | Rule |
|---|---|
| Third-party code | No VerifyWise, Techieray, or competitor files in repo |
| Data truth | Official URLs from `data/` only; no scraped competitor text |
| Language | No “compliant”, “guaranteed”, or regulator endorsement |
| Review | Show `review_status` and `record_origin` on samples |
| Scope | State EU + Norway pilot explicitly on home and jurisdiction pages |
| Secrets | No API keys in `site/` or committed env files |
| Legal | Disclaimers on every layout via `BaseLayout` |

---

## Out of scope (v0.4.0)

- Watchers, schedulers, RSS generation, diff engine
- Backend API, PostgreSQL, Redis, auth
- User accounts, comments, analytics with PII
- AI summary generation or chat
- Leaflet map / Pagefind search (v0.5)
- Governance OS inbox integration (v1.0+)
- Copying VerifyWise MUI layout or color system
- New jurisdiction data beyond curation updates in `data/`

---

## Definition of Done

- [ ] Control Tower approves v0.4.0 scope and `site/package.json` dependencies
- [ ] `site/` builds cleanly with `npm run build` producing `dist/`
- [ ] All P0 routes listed above render from `data/` without hardcoded record content
- [ ] `npm run validate` passes for all `data/` and `exports/samples/` against schemas
- [ ] Every law/guidance/source page has prominent external link to `official_url` or registered source URL
- [ ] `review_status: pending_review` shows visible banner on affected pages
- [ ] Methodology and disclaimer pages linked from global footer
- [ ] Export sample page references [EVIDENCE_EXPORT_CONTRACT.md](EVIDENCE_EXPORT_CONTRACT.md)
- [ ] README/PROJECT_STATE updated to v0.4.0
- [ ] No VerifyWise or third-party source trees committed
- [ ] CI workflow green (if enabled)
- [ ] Optional: deployed preview URL (GitHub Pages) for Control Tower sign-off

---

## Rollback strategy

1. **Pre-release:** `site/` is isolated; deleting `site/` and reverting docs restores v0.3.x documentation-only state.
2. **Build failure:** CI blocks merge; no production deploy.
3. **Content error:** Revert data YAML commit or set `review_status` to hide from future builds (policy TBD — default is show with banner).
4. **Dependency issue:** Pin Astro in `package-lock.json`; remove `site/` folder if critical vulnerability without patch.

---

## First implementation prompt outline

Use this outline for the v0.4.0 coding agent task (after Control Tower approval):

```text
Task: Implement v0.4.0 static site for caesar-ai-regulation-watch

Branch: agent/v0.4.0-static-public-site

Constraints:
- Work only in caesar-ai-regulation-watch
- Add site/ Astro project per docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md
- Read data/ at build time; do not duplicate YAML into site/src as source of truth
- Use ajv + existing schemas/ for validate script
- Caesar-original CSS; no VerifyWise/MUI copy
- No watchers, API, DB, auth
- Show review_status banners and disclaimers on all pages

Steps:
1. Create site/ with astro, js-yaml, ajv, typescript
2. Implement loadYaml + taxonomy helpers
3. Implement validate-data.mjs and npm run validate
4. Build BaseLayout with footer links to methodology/disclaimer
5. Implement all P0 pages from plan
6. Add GitHub Actions workflow (validate + build)
7. Update README, PROJECT_STATE, CHANGELOG to v0.4.0
8. Run validate + build; confirm no third-party code committed

DoD: See docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md Definition of Done
```

---

## Related documents

- [NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md](NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md)
- [CLEAN_ROOM_FEATURE_BACKLOG.md](../research/CLEAN_ROOM_FEATURE_BACKLOG.md)
- [UI_UX_VISION.md](UI_UX_VISION.md)
- [THIRD_PARTY_CODE_AND_DATA_POLICY.md](THIRD_PARTY_CODE_AND_DATA_POLICY.md)
