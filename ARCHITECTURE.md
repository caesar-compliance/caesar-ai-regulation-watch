# Architecture — Caesar AI Regulation Watch

**Last updated:** 19 May 2026  
**Status:** v0.2.0 — static registry data foundation documented; ingestion/UI not implemented

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

**v0.2.0 phase:** Layer A populated with static YAML registry (EU/Norway pilot). Layers B–C (watchers) remain deferred.

---

## 5. Repository layout

```text
caesar-ai-regulation-watch/
├── data/                    # curated YAML registry (v0.2.0+)
│   ├── jurisdictions/       # eu.yml, norway.yml
│   ├── sources/             # seven pilot official sources
│   ├── laws/                # planned v0.3
│   ├── guidance/            # planned v0.3
│   ├── changes/             # planned v0.3
│   └── timelines/           # planned v0.3
├── schemas/                 # JSON Schema (jurisdiction, source)
├── mappings/                # future: control & evidence links
├── docs/                    # blueprint, PILOT_SOURCE_REGISTRY
├── site/                    # future: static site source
└── (no package manager; no watcher code)
```

The registry is the **static data foundation**: human-curated files versioned in git. Future ingestion layers read from `data/sources/` definitions but are **not implemented** in v0.2.0.

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

- **Static generation** from data (Eleventy, Astro, or plain HTML — decision deferred).
- **Globe/map** as client-side module; fallback list for accessibility.
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
