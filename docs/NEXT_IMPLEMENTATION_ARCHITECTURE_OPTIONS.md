# Next Implementation Architecture Options — Caesar AI Regulation Watch

**Prepared:** 19 May 2026  
**Phase:** v0.3.3 planning (post–VerifyWise clean-room study)  
**Decision context:** Choose stack for **v0.4.0 read-only static public site** from existing YAML. No watchers, backend, or auth in this wave.

---

## Requirements summary

| Requirement | Weight |
|---|---|
| Read `data/**/*.yml` at build time | Must |
| Generate ~15 pilot pages (see [V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md](V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md)) | Must |
| Validate against existing JSON Schema | Should (v0.4.1 or same PR) |
| Deploy to GitHub Pages / static CDN | Must |
| Future Pagefind search | Should |
| Future Leaflet map island | Should |
| Future watcher/API layer separate from public site | Must |
| Minimal license risk | Must |
| No VerifyWise or competitor code | Must |

---

## Option A — Astro static site (YAML → pages)

### Description

Add `site/` Astro project. Build step loads YAML (via `js-yaml` or prebuild script), validates with **ajv**, generates routes for jurisdictions, sources, laws, guidance, changes, and static markdown pages.

### Evaluation

| Criterion | Assessment |
|---|---|
| **Speed** | **Fast** — content collections pattern fits YAML; many examples for static data sites |
| **Maintainability** | **High** — clear `src/pages/` + `src/content/` layout; islands for map later |
| **Risk** | **Low** — MIT license; small dependency footprint |
| **Fit with current repo** | **Excellent** — data stays in `data/`; site is thin consumer |
| **Fit with future public website** | **Excellent** — Astro is already DEC-013 direction |
| **Fit with future watcher/API** | **Good** — watchers write YAML; site rebuilds on commit; API can be separate service later |
| **Recommended dependencies** | `astro`, `@astrojs/check` (optional), `js-yaml`, `ajv` (dev), `pagefind` (v0.5), `leaflet` + `react` island (v0.5) |
| **What not to build yet** | SSR, auth, database, admin UI, API routes in Astro |

---

## Option B — Next.js static export (YAML → JSON → pages)

### Description

Add Next.js app with `output: 'export'`. Prebuild script converts YAML to JSON in `public/data/`. Pages use `getStaticProps` equivalent (App Router: `generateStaticParams` + build-time imports).

### Evaluation

| Criterion | Assessment |
|---|---|
| **Speed** | **Medium** — more boilerplate for a read-only site; team must know Next conventions |
| **Maintainability** | **Medium–High** — fine if org standard is Next; heavier than needed here |
| **Risk** | **Low** (MIT) but **higher ops** — React 19/Next upgrades, larger `node_modules` |
| **Fit with current repo** | **Good** — JSON intermediate is explicit |
| **Fit with future public website** | **Good** if Caesar standardizes on Next ecosystem-wide |
| **Fit with future watcher/API** | **Good** — Next API routes tempting (avoid until approved); watchers still separate |
| **Recommended dependencies** | `next`, `react`, `react-dom`, `js-yaml`, `ajv` |
| **What not to build yet** | Server components with DB, auth, ISR to private API |

---

## Option C — Plain static HTML generator (YAML → HTML, minimal JS)

### Description

Node or Python script reads YAML and emits HTML via templates (EJS, Nunjucks, or Jinja). No framework; optional small CSS bundle.

### Evaluation

| Criterion | Assessment |
|---|---|
| **Speed** | **Fastest initial** — single script can emit all pages in one pass |
| **Maintainability** | **Low–Medium** — grows painful with shared layouts, badges, i18n, map islands |
| **Risk** | **Low** — few dependencies |
| **Fit with current repo** | **Good** for one-off; weak for product evolution |
| **Fit with future public website** | **Fair** — map/search need custom JS anyway |
| **Fit with future watcher/API** | **Good** — decoupled |
| **Recommended dependencies** | `js-yaml`, `ajv`, template engine only |
| **What not to build yet** | Hand-rolled component system, duplicate layout logic |

---

## Comparison matrix

| Dimension | A — Astro | B — Next export | C — Plain generator |
|---|---|---|---|
| Time to v0.4.0 MVP | ★★★★ | ★★★ | ★★★★★ (short-term only) |
| Long-term maintainability | ★★★★★ | ★★★★ | ★★ |
| Pagefind integration | Native fit | Possible | Manual |
| Leaflet / React island | Built-in islands | Native React | Custom embed |
| CI schema validation | Shared `ajv` script | Shared `ajv` script | Shared `ajv` script |
| Bundle size / complexity | Low–medium | Medium–high | Lowest |
| Team learning curve | Low | Medium | Low |

---

## Recommendation

**Adopt Option A — Astro static site** for v0.4.0.

### Rationale

1. Already approved in [DEC-013](DECISION_LOG.md) and [research/OPEN_SOURCE_COMPONENT_SHORTLIST.md](../research/OPEN_SOURCE_COMPONENT_SHORTLIST.md).
2. Best balance of speed, maintainability, and future **Pagefind** + **Leaflet** without adopting VerifyWise-scale SPA complexity.
3. Keeps `data/` as single source of truth; no duplicate JSON layer required (YAML can load at build time).
4. Option B is justified only if the wider Caesar org mandates Next.js for all public products.
5. Option C is a dead-end for governance UX (badges, shared layouts, export sample formatting) within two release cycles.

### Implementation sequence

1. **v0.4.0** — Astro skeleton + pilot pages + disclaimers (no map, no search).
2. **v0.4.1** — ajv CI on `data/` (can land in same PR if Control Tower approves `package.json`).
3. **v0.5** — Pagefind + Leaflet + RSS/JSON static exports + timelines.

---

## What not to build in any option (v0.4)

- PostgreSQL or VerifyWise-style API backend
- User authentication
- Watcher/crawler logic inside the site project
- Copying VerifyWise UI or component libraries (MUI theme, etc.)
- AI-generated summaries on public pages without review gate
- Techieray API or proprietary tracker data ingestion

---

## Related documents

- [V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md](V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md)
- [VERIFYWISE_ARCHITECTURE_STUDY.md](../research/VERIFYWISE_ARCHITECTURE_STUDY.md)
- [CLEAN_ROOM_FEATURE_BACKLOG.md](../research/CLEAN_ROOM_FEATURE_BACKLOG.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)
