# Architecture — Caesar AI Regulation Watch

**Last updated:** 19 May 2026  
**Status:** v0.8.1 — static registry + monitoring cycle + optional review PR branch; scheduled monitoring artifacts-only; push/PR CI validate/build; read-only Astro site; no backend API/database/auth/deploy/auto-merge

---

## 1. Architectural goals

1. **Official-source-first** — registry defines what we monitor; pages link out to authority.
2. **Separation of concerns** — ingestion, storage, mapping, publishing, and review are distinct.
3. **Static-first public site** — low cost, fast, auditable; dynamic features added deliberately.
4. **Evidence-oriented exports** — same pipeline pattern as vendor-watch and hub standards.
5. **Safe language by design** — review gates before public publish of AI text.

---

## 2. System context

```text
                    ┌─────────────────────────────┐
                    │  Official sources (web/RSS) │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   Ingestion & snapshots     │
                    │   (future watchers)         │
                    └──────────────┬──────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Core data      │    │  Change & diff   │    │  Review queue   │
│  (jurisdictions,│    │  detection       │    │  (human + AI)   │
│   laws, sources)│    │                  │    │                 │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  Governance mapping layer │
                    │  controls + evidence links  │
                    └──────────────┬──────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Static site    │    │  RSS / JSON     │    │ caesar-ai-      │
│  generator      │    │  feeds          │    │ evidence export │
└─────────────────┘    └─────────────────┘    └────────┬────────┘
                                                            │
                                              ┌─────────────▼─────────────┐
                                              │ caesar-ai-governance-os   │
                                              │ (future regulatory inbox) │
                                              └───────────────────────────┘
```

---

## 3. Layered modules (planned)

### Layer A — Source registry & catalog

- Maintains `OfficialSource`, `Jurisdiction`, `LawRecord`, `GuidanceRecord`.
- Human-edited YAML/JSON in repo (phase 1).
- Validates required fields: URL, credibility tier, attribution.

### Layer B — Ingestion (future)

- Scheduled jobs per `fetch_method`.
- Produces `SourceSnapshot` with content hash.
- Respects robots.txt and rate limits; no aggressive scraping without approval.

### Layer C — Change detection (future)

- Compares snapshots → `ChangeRecord`.
- Optional diff artifacts stored with license-aware excerpt rules.

### Layer D — Summary & review

- AI draft → `SummaryRecord` with `review_status`.
- Human approval required for public site (default).
- Disclaimers injected at render time.

### Layer E — Governance mapping

- Rules or curated tables: change topics → `AffectedControlLink`, `AffectedEvidenceLink`.
- Versioned mapping files under `mappings/`.
- Relationship strength: `may_affect`, `suggested_review` only.

### Layer F — Publishing

- **Static site builder** reads data → HTML (globe, profiles, feeds).
- **RSS builder** from approved changes.
- **JSON export** full or filtered dumps.
- **Evidence exporter** emits regulation-change bundles.

### Layer G — Integration gateway (future)

- Webhook or pull API for Governance OS.
- Idempotent change IDs for inbox deduplication.

---

## 4. Data flow (steady state)

```text
[Registry update] ──> validate schema ──> commit to data/
                                              │
[Scheduler tick] ──> fetch source ──> snapshot ──> diff? ──> change record
                                              │                    │
                                              │                    ▼
                                              │            [Review queue]
                                              │                    │
                                              ▼                    ▼
                                    [Mapping engine] <── approved summary
                                              │
                                              ▼
                              [Site build | RSS | JSON | Evidence export]
```

**v0.8.1 phase:** Layer B — `run-monitoring-cycle.mjs` + `summarize-monitoring-changes.mjs`. GitHub `monitoring-cycle.yml`: scheduled = artifacts only; manual `create_pr=true` opens `monitoring/results-YYYY-MM-DD` when meaningful changes exist (human merge). Push/PR CI remains fetch-free. **v0.6.x:** verifications, URL checks, 15 curated records. **v0.5.x:** static SVG map and review queue. Site build does not run watchers. **Deferred:** production scheduling, broad watcher fleet, Layers B–C full ingestion.

---

## 5. Repository layout

```text
caesar-ai-regulation-watch/
├── data/                    # curated YAML registry (v0.2.0+)
│   ├── jurisdictions/       # eu.yml, norway.yml
│   ├── sources/             # seven pilot official sources
│   ├── laws/                # v0.3.0 sample (eu-ai-act.yml)
│   ├── guidance/            # v0.3.0 samples
│   ├── changes/             # v0.3.0 manual change samples
│   └── timelines/           # v0.5.0 sample timelines
├── schemas/                 # entity + taxonomy + evidence-export-record
├── data/taxonomies/         # v0.3.1 canonical values
├── mappings/                # v0.3.0 sample control & evidence links
├── exports/samples/         # v0.3.1 export contract samples (no runtime export)
├── docs/                    # blueprint, policies, PILOT_SOURCE_REGISTRY
├── research/                # acceleration audit + VerifyWise study
├── src/                     # v0.4.0 Astro pages, components, lib
├── scripts/validate-data.mjs
├── package.json             # astro, js-yaml, ajv
├── astro.config.mjs
├── dist/                    # build output (gitignored)
└── scripts/run-official-source-watchers.mjs  # manual CLI only (v0.7.0 pilot)
```

The registry and sample records form the **static data foundation**: human-curated YAML in git only. Change samples are **not** watcher output. Future ingestion layers read from `data/sources/` definitions but are **not implemented**.

---

## 6. Integration with caesar-ai-evidence

| Export type | Use |
|---|---|
| `regulation-change` | Point-in-time regulatory change event |
| Control refs | Align with shared control taxonomy when defined |
| Evidence suggestions | Populate evidence gap / update hints |

Coordination required before field names are frozen. This repo documents intent; evidence repo owns schema authority.

---

## 7. Integration with caesar-ai-governance-os (future)

| OS module | Data from regulation-watch |
|---|---|
| Regulatory Inbox | Approved `ChangeRecord` stream |
| Client workspace | Filtered jurisdictions |
| Tasks | From affected evidence suggestions |
| Reports | Selected changes + sources appendix |

Import mechanism: file drop, git submodule, or API — **TBD** at OS spec time.

---

## 8. Public site architecture

- **Static generation** from data — **Astro** recommended ([research/OPEN_SOURCE_COMPONENT_SHORTLIST.md](research/OPEN_SOURCE_COMPONENT_SHORTLIST.md)).
- **Map** — **Leaflet** (2D) recommended; 3D globe deferred; fallback list for accessibility.
- **CDN/GitHub Pages** hosting until `regulations.caesar.no` routed.
- No server-side legal logic in v1.

---

## 9. Security and compliance posture

- No storage of user PII in public data repo.
- Secrets only in future CI (not in v0.2.0).
- Source fetch from CI with pinned URLs.
- Audit log of review actions (future, OS or repo).

---

## 10. Observability (future)

- Fetch success/failure per source.
- Stale source alerts (no successful fetch in N days).
- Review queue depth metrics.

---

## 11. Architecture decisions

See [docs/DECISION_LOG.md](docs/DECISION_LOG.md) for ADRs including official-source-first and static-first publishing.

---

## 12. Related documents

- [docs/FULL_SCALE_PRODUCT_BLUEPRINT.md](docs/FULL_SCALE_PRODUCT_BLUEPRINT.md)
- [docs/DATA_MODEL_DRAFT.md](docs/DATA_MODEL_DRAFT.md)
- [docs/UI_UX_VISION.md](docs/UI_UX_VISION.md)
- [SPEC.md](SPEC.md)
