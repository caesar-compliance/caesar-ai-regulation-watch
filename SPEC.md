# Specification — Caesar AI Regulation Watch

**Last updated:** 19 May 2026  
**Status:** v0.3.0 — full-scale spec, static registry, and manual sample records (no watchers or UI)

---

## 1. Product summary

**Caesar AI Regulation Watch** is a global AI regulation monitoring product that tracks **official and authoritative sources**, helps **identify regulatory changes**, and **supports governance review** by mapping updates to **controls** and **evidence** in the Caesar AI Governance Hub ecosystem.

**Public phrasing:** AI regulatory changes mapped to controls and evidence.

**Future URL:** `regulations.caesar.no`

---

## 2. Purpose

Organizations need a structured way to:

1. See which AI-related laws and official guidance exist in jurisdictions they care about.
2. Notice when **tracked sources** change.
3. Understand **what may need internal review** (not what is legally required — that requires professional judgment).
4. Connect changes to **governance controls** and **evidence items**.
5. Export records for consulting workflows and future **Caesar AI Governance OS** integration.

---

## 3. Target users

| User | Goals |
|---|---|
| Legal / compliance | Monitor developments; source-linked briefings |
| AI governance leads | Control and evidence impact awareness |
| Consultants | Client memos and evidence pack updates |
| SMEs | Affordable jurisdiction visibility |
| Integrators | RSS/JSON and evidence-format exports |

---

## 4. Full-scale functional requirements

### 4.1 Global monitoring

- Curated registry of jurisdictions (not claimed exhaustive).
- Incremental expansion of tracked countries and regions.
- Topic tags: risk, transparency, GPAI, enforcement, implementation, etc.

### 4.2 Global map / globe

- Primary navigation surface on public site.
- Jurisdiction markers with status-derived styling.
- Search and regional filters.

### 4.3 Jurisdiction profiles

- Country/region metadata, regulators, coverage notes.
- Linked laws, guidance, timelines, and sources.
- `last_reviewed` curation metadata.

### 4.4 Official source registry

- Canonical URLs, fetch method, cadence, credibility tier.
- Attribution and license notes per source.

### 4.5 Law and guidance records

- Structured records with citations, status, dates, summaries (reviewed where published).
- Links to official sources (primary truth).

### 4.6 Regulatory timelines

- Curated milestones plus detected change events.
- Deadline markers labeled as tracked dates requiring verification.

### 4.7 Change history

- Snapshots, diffs where permitted, change types, detection timestamps.
- Review workflow: pending → reviewed.

### 4.8 Status labels

Controlled vocabulary: `proposed`, `adopted`, `in_force`, `guidance`, `voluntary`, `withdrawn`, `monitoring`.

### 4.9 Source credibility

Tiers: `official_primary`, `official_secondary`, `authoritative_reference` (see [docs/DATA_MODEL_DRAFT.md](docs/DATA_MODEL_DRAFT.md)).

### 4.10 AI summary layer

- Draft summaries for changes and records.
- Public publish requires human review (default policy).
- Disclaimers on all AI-assisted content.

### 4.11 Affected controls

- Map `ChangeRecord` → control taxonomy refs with `may_affect` / `suggested_review`.
- No automated “must implement” legal obligations.

### 4.12 Affected evidence

- Suggest evidence types to review or update (system register, vendor review, memos, etc.).
- Exportable with regulation-change bundles.

### 4.13 RSS / API / export

| Output | v1 target |
|---|---|
| RSS feed | Global and per-jurisdiction |
| JSON export | Static files in repo or CDN |
| Evidence export | `regulation-change` compatible JSON |
| Authenticated API | Future (Governance OS) |

### 4.14 Public website

- Static or static-first site: globe, profiles, feeds, methodology, disclaimers.
- GitHub link and Caesar ecosystem CTAs.

### 4.15 Caesar AI Governance OS (future)

- Regulatory inbox module.
- Client-specific jurisdiction sets and tasks.
- Import regulation-change exports.

---

## 5. Initial jurisdiction focus (pilot)

Not exclusive — first depth priority:

| Area | Examples |
|---|---|
| **EU** | AI Act, EUR-Lex, EU AI Office |
| **Norway** | Implementation, Datatilsynet |
| **EEA context** | Where relevant to Norway clients |
| **UK / US** | Selected official sources (phased) |

Additional jurisdictions added via registry entries, not marketing claims of total coverage.

---

## 6. Pilot registry data (v0.2.0 — delivered)

Machine-readable pilot registry for **EU and Norway only** (curated subset; not exhaustive):

| Path | Contents |
|---|---|
| `data/jurisdictions/eu.yml` | EU jurisdiction profile |
| `data/jurisdictions/norway.yml` | Norway jurisdiction profile |
| `data/sources/*.yml` | Seven official source entries (AI Act, AI Office, EUR-Lex, EDPB, EDPS, Norway implementation, Datatilsynet) |
| `schemas/jurisdiction.schema.json` | Jurisdiction record validation |
| `schemas/source.schema.json` | Source record validation |
| [docs/PILOT_SOURCE_REGISTRY.md](docs/PILOT_SOURCE_REGISTRY.md) | Registry index and review workflow |

Static YAML only: no crawlers, watchers, APIs, schedulers, or automated monitoring in v0.2.0.

---

## 7. Sample records (v0.3.0 — delivered)

Manual sample data for data-model testing (not watcher output):

| Path | Contents |
|---|---|
| `data/laws/eu-ai-act.yml` | Sample EU AI Act law record |
| `data/guidance/*.yml` | EU AI Office GPAI pointer; Datatilsynet AI/privacy pointer |
| `data/changes/*.yml` | Two illustrative change records |
| `mappings/*.sample.yml` | Control and evidence mapping samples |
| `schemas/law.schema.json`, etc. | Validation for sample entity types |
| [docs/SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md) | Guide and review workflow |

All samples use `review_status: pending_review` unless Control Tower updates them.

---

## 8. MVP scope (next implementation phases)

1. ~~**Source registry** (YAML) for pilot jurisdictions.~~ **Done (v0.2.0).**
2. ~~**Sample law/guidance/change records** and mapping samples.~~ **Done (v0.3.0 manual).**
3. **Regulatory change schema** alignment with `caesar-ai-evidence` export shape.
4. **Timeline file** per pilot jurisdiction.
5. **Static site skeleton** reading `data/` (no watcher automation).

---

## 9. Future scope (post-MVP)

- Automated fetchers for RSS/HTML pilot sources.
- Diff engine and snapshot store.
- AI summary generation with review queue.
- Full public site at `regulations.caesar.no`.
- Client-specific alerts (paid / OS).
- Comparison views and enforcement date calendars.

---

## 10. Non-goals

| Non-goal | Reason |
|---|---|
| Legal advice | Requires qualified professionals |
| Compliance guarantees | Tool supports review only |
| Complete global coverage claim | Dishonest and unmaintainable |
| Automatic statutory interpretation as binding | Requires legal review |
| Regulatory filing submission | Out of scope |
| Codebase scanning | belongs to `caesar-ai-scan` |
| Copying competitor code or UI | License and originality policy |

---

## 11. Inputs and outputs

### Inputs

- Curated **source registry** definitions.
- Official RSS/HTML/API endpoints (pilot).
- Human curation and review decisions.
- Control/evidence taxonomy references from hub standards.
- Optional licensed open datasets (e.g. AI Legislation Tracker) with attribution.

### Outputs

- Public HTML pages (static site).
- **RSS** feeds.
- **JSON** export files.
- **regulation-change** evidence exports.
- Consultant-ready **change summaries** (reviewed).
- Future: Governance OS inbox payloads.

---

## 12. Quality and legal-safe language

All user-facing text must:

- Link primary sources.
- Avoid “compliant”, “non-compliant”, “approved by regulator”.
- Use “helps identify”, “supports governance review”, “may affect”, “suggested update”.
- State coverage limits on jurisdiction pages.

---

## 13. Hub alignment

| Hub document | Relevance |
|---|---|
| `specs/caesar-ai-regulation-watch.md` | Ecosystem role |
| `docs/FULL_SCALE_COMPETITOR_FEATURE_MAP.md` | Section 8 — regulation watch |
| `docs/PRODUCT_VISION_MAP.md` | Product 6 |
| `docs/QUALITY_GATES.md` | Review and language gates |
| `docs/DEFINITION_OF_DONE.md` | Phase completion criteria |

---

## 14. Related repository docs

- [docs/FULL_SCALE_PRODUCT_BLUEPRINT.md](docs/FULL_SCALE_PRODUCT_BLUEPRINT.md)
- [docs/COMPETITOR_BENCHMARKS.md](docs/COMPETITOR_BENCHMARKS.md)
- [docs/DATA_MODEL_DRAFT.md](docs/DATA_MODEL_DRAFT.md)
- [docs/UI_UX_VISION.md](docs/UI_UX_VISION.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [docs/SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md)
- [ROADMAP.md](ROADMAP.md)
