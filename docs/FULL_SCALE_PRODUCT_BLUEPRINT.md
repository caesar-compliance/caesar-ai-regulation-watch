# Full-Scale Product Blueprint — Caesar AI Regulation Watch

**Prepared:** 19 May 2026  
**Status:** Strategic product blueprint (documentation only; no implementation)

---

## 1. Product mission

Build an **open, evidence-oriented global AI regulation monitoring product** that:

1. Surfaces **tracked official and authoritative sources** by jurisdiction.
2. Helps teams **identify regulatory changes** worth governance review.
3. **Supports governance review** with timelines, status labels, and change history.
4. **Maps changes to controls and evidence** for Caesar ecosystem workflows.
5. Publishes a **public website** and **machine-readable exports** (RSS, JSON).
6. Integrates later with **Caesar AI Governance OS** as the regulatory inbox.

### What we do not claim

- Legal advice or interpretation as authoritative truth.
- Compliance guarantees or “audit-ready” status from the tool alone.
- Complete global legal coverage on day one.
- Replacement for qualified legal counsel or national competent authorities.

### Preferred language

Use: *tracked*, *helps identify*, *supports governance review*, *may affect*, *suggested evidence update*, *requires review*.

Avoid: *guarantees compliance*, *fully compliant*, *complete global coverage*, *legal conclusion*.

---

## 2. Problem statement

Organizations using AI across borders face:

- Fragmented official sources (EU, EEA, UK, US federal/state, and others).
- Fast-moving guidance from regulators and AI offices.
- Difficulty connecting **legal change** to **internal controls and evidence**.
- Expensive enterprise trackers that stop at information, not governance workflows.

Caesar’s differentiation: **regulation change → governance meaning → evidence update → client action**, aligned with [caesar-ai-evidence](https://github.com/caesar-compliance/caesar-ai-evidence) and future Governance OS.

---

## 3. User journeys

### 3.1 Compliance / legal reviewer

1. Opens global map or search.
2. Filters to relevant jurisdictions (e.g. EU, Norway, UK).
3. Reviews latest changes and status labels.
4. Reads source-linked summary (human-reviewed where required).
5. Exports impact note or JSON for internal records.

### 3.2 Consultant (Caesar Compliance)

1. Monitors regulatory inbox feed for client-relevant jurisdictions.
2. Selects change record with affected controls/evidence tags.
3. Generates client memo draft (manual edit required).
4. Updates client evidence pack checklist in Caesar AI Evidence format.

### 3.3 Developer / integrator

1. Subscribes to RSS or polls JSON export.
2. Ingests `regulation-change` records into internal GRC or custom dashboard.
3. Future: webhook or API key access via Governance OS.

### 3.4 Future Governance OS user

1. Regulatory updates appear in **Regulatory Inbox**.
2. Tasks assigned to owners with linked controls and evidence gaps.
3. Report export for management or audit preparation (review still required).

---

## 4. Capability map

### 4.1 Global map / globe

- Interactive world map as primary navigation (inspired by map-first trackers; original Caesar UX).
- Color or badge encoding by **status** (e.g. active legislation, guidance only, monitoring).
- Click-through to **jurisdiction profile**.
- Search: country name, regulation title, topic tag, regulator.
- Optional comparison view (2–3 jurisdictions side by side).

### 4.2 Jurisdiction profiles

Each profile includes:

- Identity: country, region, economic bloc (EU, EEA, etc.).
- **Regulators** and official portals (linked, not scraped text republished without license care).
- **Laws & instruments** in scope for AI governance.
- **Guidance** from competent authorities and AI offices.
- **Timeline** of key dates and detected changes.
- **Source credibility** summary for the profile.
- **Last reviewed** metadata (human curation).

Initial depth focus (not exclusive): **EU AI Act**, **EU AI Office**, **Norway implementation**, **Datatilsynet**, **EDPB/EDPS** where relevant — expanded incrementally.

### 4.3 Official source registry

Canonical registry of sources to monitor:

| Field | Purpose |
|---|---|
| `source_id` | Stable identifier |
| `jurisdiction_id` | Link to profile |
| `title` | Human label |
| `url` | Official or authoritative URL |
| `source_type` | law portal, regulator, standards body, gazette, RSS, API |
| `document_types` | law, regulation, guidance, FAQ, implementation note |
| `credibility_tier` | official_primary, official_secondary, authoritative_reference |
| `fetch_method` | RSS, HTML snapshot, API, manual |
| `cadence` | daily, weekly, on publication |
| `attribution` | Required citation text |
| `license_notes` | Reuse constraints for summaries and excerpts |

### 4.4 Law and guidance records

Structured catalog entries:

- **Law / instrument record:** title, citation, jurisdiction, status, effective dates, source URL, topic tags.
- **Guidance record:** issuer, date, scope, related instruments, source URL.
- Optional links to standards references where **legally safe to reference** (cite source; no unauthorized reproduction).

### 4.5 Regulatory timelines

- Milestones: proposed → adopted → published → in force → enforcement phases.
- Jurisdiction-specific implementation dates (e.g. Norway transposition).
- Deadline markers for known obligation windows (labeled as *tracked dates, requires verification*).
- Timeline merges **curated milestones** with **detected change events**.

### 4.6 Change history

For each monitored source:

- Detection timestamp, prior snapshot reference, change type (content, metadata, new document).
- Human-readable change summary (AI draft + review status).
- Link to official source; optional diff artifact for permitted content.
- **Review status:** pending, reviewed, disputed, archived.

### 4.7 Status labels

Controlled vocabulary (extensible):

| Label | Meaning (operational, not legal advice) |
|---|---|
| `proposed` | Tracked as under legislative process |
| `adopted` | Tracked as adopted text available |
| `in_force` | Tracked as effective per official source |
| `guidance` | Official guidance or FAQ |
| `voluntary` | Voluntary framework or code |
| `withdrawn` | Tracked as repealed or withdrawn |
| `monitoring` | Jurisdiction watched; limited instrument detail |

### 4.8 Source credibility

Tiering model:

1. **Official primary** — legislature, gazette, regulator primary site.
2. **Official secondary** — EU institutions, AI Office, coordinated portals.
3. **Authoritative reference** — OECD, IAPP-style trackers, law firm matrices (cite only; not primary truth).
4. **Community dataset** — e.g. AI Legislation Tracker (verify license; attribute).

Every public page shows **source URL**, **last fetched**, **last human review**.

### 4.9 AI summary layer

- Generates **draft** plain-language summaries from detected changes.
- Default: **requires human review** before “published” on public site.
- Disclaimers on all AI-assisted text.
- No automated legal classification as binding obligation without review.

### 4.10 Affected controls

Maps change records to a **Caesar control taxonomy** (aligned with evidence format):

- Example areas: risk management, transparency, human oversight, data governance, GPAI documentation, vendor review, incident reporting.
- Tags: `may_affect`, `suggested_review`, not `must_comply`.

### 4.11 Affected evidence

Suggests evidence items that **may need update**:

- AI system register, vendor questionnaire, governance memo, training records, DPIA references, model documentation, etc.
- Exported as structured suggestions in `caesar-ai-evidence` regulation-change shape.

### 4.12 RSS / API / export

| Channel | Audience |
|---|---|
| **RSS** | Consultants, power users, feed readers |
| **JSON export** | Static site build, GitHub raw data, integrations |
| **Future API** | Governance OS, authenticated clients |
| **Evidence export** | `regulation-change` bundles per event |

### 4.13 Public website

Target: `regulations.caesar.no` (or GitHub Pages until domain ready).

Pages: home (globe), jurisdiction, regulation/guidance detail, change feed, search, about/sources methodology, disclaimers.

### 4.14 Caesar AI Governance OS integration (future)

```text
regulation-watch (public + data repo)
  → regulation-change export
    → governance-os Regulatory Inbox
      → client workspace tasks
        → evidence center links
          → report builder
```

Modules: regulatory inbox, client-specific jurisdiction sets, review assignments, alert subscriptions (paid tier candidate).

---

## 5. Differentiation vs benchmarks

| Theme | Typical benchmark | Caesar approach |
|---|---|---|
| Coverage | Broad country counts marketed | Incremental **curated** official sources; honest coverage notes |
| Map UX | Globe + country pages | Same pattern; add **control/evidence** layer |
| Summaries | AI or editorial | AI draft + **mandatory review** for public publish |
| Legal depth | Law firm analysis | Link to official text; summaries assist review only |
| Output | PDF/report or dashboard only | **Evidence export** + OS inbox path |
| Norway / EEA | Often US/EU centric | **Premium local depth** for Norway and EEA implementation |

---

## 6. Phasing (documentation-level)

| Phase | Focus |
|---|---|
| **0.1** | Repo + blueprint (current) |
| **0.2** | Source registry + data model YAML/JSON (no watchers) |
| **0.3** | Pilot jurisdictions + sample records + static site skeleton |
| **0.4** | Change detection for pilot sources + review workflow |
| **0.5** | Public site, RSS/JSON, control/evidence mapping v1 |
| **1.0** | Stable pilot + evidence export + OS integration spec |

See [ROADMAP.md](../ROADMAP.md).

---

## 7. Quality and safety gates

- No compliance guarantee language in UI or docs.
- Source attribution on every record.
- Human review gate for AI summaries on public pages.
- License check before reusing third-party datasets (e.g. AI Legislation Tracker).
- Defamation and overclaim avoidance in summaries.

Hub references: Caesar AI Governance Hub `docs/QUALITY_GATES.md`, `docs/DEFINITION_OF_DONE.md`.

---

## 8. Related documents

- [COMPETITOR_BENCHMARKS.md](COMPETITOR_BENCHMARKS.md)
- [DATA_MODEL_DRAFT.md](DATA_MODEL_DRAFT.md)
- [UI_UX_VISION.md](UI_UX_VISION.md)
- [../SPEC.md](../SPEC.md)
- [../ARCHITECTURE.md](../ARCHITECTURE.md)
