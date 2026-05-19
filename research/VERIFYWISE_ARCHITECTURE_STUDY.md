# VerifyWise Architecture Study — Caesar AI Regulation Watch

**Prepared:** 19 May 2026  
**Phase:** v0.3.3 — architecture reference only (clean-room)  
**Study location:** Temporary local sandbox outside Caesar repos (`/tmp/caesar-verifywise-study/verifywise`, shallow clone)  
**Public benchmark URL:** https://verifywise.ai/global-ai-regulations  
**Source repository reviewed:** https://github.com/bluewave-labs/verifywise (develop branch, shallow clone)

---

## What was reviewed

| Area | Method | Notes |
|---|---|---|
| Repository top-level layout | Directory listing, README, LICENSE | Monorepo; multiple product modules |
| License and reuse boundaries | `LICENSE.md`, `LICENSING-FAQ.md` | BSL 1.1 + Internal-Only Additional Use Grant |
| Technology stack | `package.json` (root, Clients, Servers), `docker-compose.yml`, `Clean_Architecture.md` | PERN + Docker/Kubernetes |
| Frontend structure | `Clients/src/` layer folders, `application/config/routes.tsx` | Clean Architecture + React Router |
| Backend structure | `Servers/routes/`, `Servers/database/migrations/`, `index.ts` | Express + Sequelize + PostgreSQL |
| Product modules | README feature list, route names, user-guide config | Full AI governance platform |
| Compliance / evidence patterns | User-guide articles (EU AI Act, evidence collection, assessments) | Control–evidence linking concepts |
| GRSModule | `GRSModule/README.md` | **Not** the public regulations tracker — LLM scenario generator for evals |
| Global regulations tracker (marketing) | Referenced in Caesar benchmarks; **not** found as a standalone module in the cloned repo | Tracker UX studied via Caesar benchmark docs + platform patterns |

No VerifyWise source files, schemas, UI assets, or proprietary text were copied into Caesar. This document contains **summaries only**.

---

## License boundary note

VerifyWise is **source-available** under **Business Source License 1.1** with an **Internal-Only Additional Use Grant** (BlueWave Labs). Production use, customer-facing SaaS, consulting delivery, and redistribution of the licensed work or derivatives to third parties are restricted without a commercial license.

**For Caesar:**

- **Allowed:** Study architecture and UX patterns; document clean-room requirements; benchmark the public Global AI Regulations Tracker product concept.
- **Not allowed:** Copy or adapt VerifyWise source, UI, database schemas, curated regulation content, marketing copy, or implement derivative works from their codebase in Caesar client-facing products without compatible license.

See [docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md](../docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md) and hub `LICENSE_AND_CODE_POLICY.md`.

---

## Repository structure summary

```text
verifywise/                          # Monorepo root
├── Clients/                         # React SPA (Vite, TypeScript, MUI)
│   └── src/
│       ├── domain/                  # Models, enums (incl. framework-specific)
│       ├── application/             # Hooks, DTOs, Redux, routes config
│       ├── infrastructure/          # API clients
│       └── presentation/            # Pages, components, structures
├── Servers/                         # Node/Express API
│   ├── routes/                      # ~90+ route modules
│   ├── controllers/, services/
│   ├── database/migrations/         # Sequelize (50+ migrations observed)
│   └── structures/                  # Framework templates (EU AI Act, ISO 42001, etc.)
├── GRSModule/                       # Python — governance readiness scenario generator (LLM eval)
├── EvalServer/, EvaluationModule/   # LLM evaluation pipeline
├── AIGateway/, agents/              # AI gateway, agent tooling
├── shared/user-guide-content/       # In-app help articles
├── docs/, kubernetes/, docker-compose*.yml
└── CodeRules/                       # Internal engineering standards
```

**Important distinction:** The GitHub monorepo is primarily an **enterprise AI governance OS** (projects, frameworks, evidence, risks, vendors, policies). The **Global AI Regulations Tracker** marketed at verifywise.ai is a **separate public intelligence surface**; Caesar should treat tracker UX as a **benchmark**, not assume it lives in the same code paths as the compliance dashboard.

---

## Technology stack observed

| Layer | Technology | Implication for Caesar |
|---|---|---|
| Frontend | React 18+, TypeScript, Vite, SWC, MUI, Emotion, React Router, TanStack Query, Redux Toolkit | Heavy SPA — overkill for Caesar v0.4 read-only public site |
| Backend | Node.js, Express 5, Sequelize, PostgreSQL, BullMQ, Redis | Full multi-tenant API — Caesar defers to static YAML + future watchers |
| Auth | JWT, OAuth (Google, Entra ID enterprise), RBAC | Not needed for v0.4 public static site |
| AI | Multiple AI SDK integrations, advisor, eval servers, Python modules | Caesar AI summaries remain review-gated and later-phase |
| Deploy | Docker Compose, Kubernetes manifests, nginx front-end | Caesar v0.4: static hosting (GitHub Pages / CDN) |
| Testing | Jest (server), Vitest/Playwright (client) | Caesar: ajv schema CI first |
| Docs | Swagger (large OpenAPI surface), internal user-guide TS content | Caesar: markdown docs + generated static pages |

---

## Product modules observed (platform)

Modules relevant as **pattern references** (not feature parity targets for v0.4):

| Module | Observed purpose | Caesar analogue (clean-room) |
|---|---|---|
| Frameworks / compliance | EU AI Act, ISO 42001, NIST AI RMF, ISO 27001 assessments | Future Governance OS; not Regulation Watch v0.4 |
| Project / use-case view | Per-AI-system workspace with tabs | Jurisdiction profile tabs (laws, guidance, sources, changes) |
| Evidence Hub | Central document store; link evidence to controls | `regulation_watch.evidence.*` mapping + export contract |
| Risk / vendor / model inventory | Entity registers with change history | Source registry + law/guidance records |
| Dashboard | Executive and operating views | Future internal review queue (post-static-site) |
| Reporting | PDF/DOCX export | `regulation-change` YAML/JSON export (already drafted) |
| Approval workflows | Human sign-off on entities | `review_status` taxonomy + Control Tower gate |
| Change history | Per-entity audit trail | `data/changes/` + future watcher output |
| AI Trust Center (public) | External read-only transparency page | Inspiration for public static site tone and structure |
| WatchTower (UI name) | **Event Tracker** — platform audit logs, not regulatory watch | Do not confuse with Caesar Regulation Watch |
| Governance OS route | In-app governance hub | Future `caesar-ai-governance-os` regulatory inbox |

---

## Architecture patterns useful for Caesar

1. **Layered separation** — Domain concepts separated from API and UI; Caesar mirrors this in repo layout (`data/`, `schemas/`, future `site/`, future `watchers/`) rather than in a monolith.
2. **Framework → control → evidence chain** — Assessments link controls to evidence documents; Caesar maps **regulatory change → control ref → evidence ref** via `mappings/` and export contract (already designed).
3. **Entity-centric detail pages** — Records have metadata, status, linked evidence, and history; Caesar law/guidance/change detail pages should follow similar **information hierarchy** with official-source CTA first.
4. **Review-gated publication** — Platform assumes human completion of assessments and approvals; Caesar `review_status` and `record_origin` align with this pattern.
5. **Lazy-loaded route modules** — Large SPA splits pages; Caesar static site achieves similar performance via **build-time page generation** (no runtime router needed for v0.4).
6. **Multi-framework structures** — Backend holds framework-specific control trees; Caesar uses **taxonomy YAML** instead of copying their annex structures.
7. **Public vs authenticated surfaces** — Trust Center and public intake routes exist beside protected dashboard; Caesar v0.4 is **public read-only only**.
8. **Export and reporting as first-class outputs** — PDF/DOCX for auditors; Caesar prioritises **git-friendly YAML/JSON** for consultants and Evidence integration.

---

## UX / workflow patterns useful for Caesar

| Pattern | VerifyWise / benchmark observation | Caesar clean-room use |
|---|---|---|
| Status badges | Regulation cards use operational status labels | `regulatory-statuses.yml` + badge component (original styling) |
| Jurisdiction / geography grouping | Use cases and bias audits list jurisdictions | `data/jurisdictions/` index and profile pages |
| Timeline / milestones | Enforcement and framework timelines in marketing tracker | Planned `data/timelines/`; each milestone links `official_url` |
| Change feed | Platform change history on entities | `data/changes/` index sorted by date |
| Source-linked primary CTA | Assessments emphasize evidence attachments | **View official source** button on every law/guidance page |
| Tabbed profile | Project view: Frameworks, risks, evidence | Jurisdiction tabs: Overview, Laws, Guidance, Sources, Changes |
| Credibility / tier framing | Official vs secondary sources in governance flows | `source-credibility-levels.yml` on source pages |
| Dashboard density | Executive dashboard with many widgets | **Defer** — Caesar home stays simple: pilot scope + latest changes |
| Grid / map entry | Global regulations tracker (benchmark) | Leaflet map in v0.5+; list-first in v0.4 |

---

## Governance / control / evidence ideas relevant to Caesar

- **Controls are framework-scoped** in VerifyWise; Caesar uses draft `regulation_watch.control.*` refs pending hub alignment.
- **Evidence is reusable** across assessments; Caesar suggests evidence **review** via `may_affect` / `suggested_review` on change records.
- **No automatic legal conclusions** — assessments require user answers; Caesar must keep **non-mandatory** mapping language.
- **Activity and audit trails** support enterprise customers; Caesar public site shows **curation metadata** (`last_reviewed`, `review_status`) instead of internal audit logs.
- **Integrations** (webhooks, plugins) are platform-scale; Caesar defers to RSS/JSON export and Evidence bundles.

---

## What must not be copied

| Category | Reason |
|---|---|
| Any file from `verifywise` repository | BSL / internal-use restrictions |
| React components, MUI theme, CSS, layouts | Derivative UI risk |
| Sequelize models, migrations, SQL | Wrong stack; proprietary schema |
| Framework control trees (EU AI Act annex structs, etc.) | Licensed structure + not regulation-watch scope |
| User-guide prose, marketing text, tool lists | Copyright |
| Curated regulation summaries from tracker | Proprietary data |
| GRSModule obligation YAML or scenario configs | Separate product module; not Caesar data model |
| Docker/Kubernetes deployment recipes as-is | Ops coupling to their stack |

---

## Caesar clean-room interpretation

Caesar AI Regulation Watch is **not** a VerifyWise clone. It is:

1. **Official-source-first** public intelligence (YAML in git, not SaaS-curated copy-paste).
2. **Evidence-oriented** — every change can export to `caesar-ai-evidence` with draft control/evidence refs.
3. **Static-first** — v0.4 generates HTML from existing `data/` without PostgreSQL or auth.
4. **Honestly scoped** — EU + Norway pilot; no false global-completeness claims.
5. **Benchmark-informed UX** — status badges, timelines, jurisdiction profiles inspired by category leaders, implemented with Caesar taxonomy and original templates.

The VerifyWise **platform** teaches enterprise governance patterns (evidence hub, frameworks, review). The VerifyWise **tracker** teaches public discovery patterns (cards, timelines, geography). Caesar takes pattern (2) for the public site and pattern (1) for future Governance OS integration.

---

## Practical lessons for v0.4 static site and later Governance OS

### v0.4.0 static public site

- **Do not** replicate VerifyWise SPA complexity; use **Astro** + YAML at build time.
- **Do** replicate information architecture from [docs/UI_UX_VISION.md](../docs/UI_UX_VISION.md): home → jurisdictions → records → sources → changes.
- **Do** show `review_status`, `regulatory_status`, and credibility on every entity page.
- **Do** add methodology/disclaimer pages (VerifyWise uses trust center and legal framing; Caesar uses explicit non-advice copy).
- **Defer** map/globe, search (Pagefind), and authenticated features.

### Later Governance OS integration

- Map approved `ChangeRecord` stream to a **regulatory inbox** (VerifyWise has `governanceOs` route — concept only).
- Align control/evidence refs when hub taxonomy is frozen.
- Optional internal **review queue dashboard** inspired by their executive dashboard — built in OS repo, not Regulation Watch static site.

---

## Study limitations

- Shallow clone; develop branch; study date 19 May 2026.
- Global AI Regulations Tracker may be hosted or data-driven outside the main modules reviewed; Caesar relies on benchmark docs plus platform patterns for tracker-specific UX.
- No runtime inspection of verifywise.ai production UI in this phase (structure study only).

---

## Related Caesar documents

- [research/CLEAN_ROOM_FEATURE_BACKLOG.md](CLEAN_ROOM_FEATURE_BACKLOG.md)
- [docs/NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md](../docs/NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md)
- [docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md](../docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md)
- [research/THIRD_PARTY_ACCELERATION_AUDIT.md](THIRD_PARTY_ACCELERATION_AUDIT.md)
