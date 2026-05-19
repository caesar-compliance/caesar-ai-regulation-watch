# Pilot Source Registry — EU & Norway

**Prepared:** 19 May 2026  
**Phase:** v0.2.0 — data foundation (no watchers, no UI)

---

## Purpose

This document describes the **first pilot official source registry** for Caesar AI Regulation Watch. It lists **tracked official and authoritative sources** for the **European Union** and **Norway** only.

The registry:

- helps **identify regulatory changes** when monitoring is implemented in a later phase;
- **supports governance review** with explicit scope and credibility metadata;
- may indicate topics that **may affect controls or evidence** after human review;
- requires **human review before client use** for all entries (`review_status: pending_review`).

It does **not**:

- provide legal advice;
- guarantee compliance;
- claim complete EU or Norway legal coverage;
- replace reading official sources or qualified counsel.

---

## Registry contents

### Jurisdictions (`data/jurisdictions/`)

| File | `jurisdiction_id` | Summary |
|---|---|---|
| [eu.yml](../data/jurisdictions/eu.yml) | `eu` | EU supranational bloc — AI Act, Commission/AI Office, EUR-Lex cluster |
| [norway.yml](../data/jurisdictions/norway.yml) | `norway` | Norway — EEA-linked implementation, government pages, Datatilsynet |

Norway lists `parent_jurisdiction: eu` to reflect **monitoring linkage** (EEA AI Act relevance), not a legal conclusion about sovereignty.

### Official sources (`data/sources/`)

| File | `source_id` | Jurisdiction | Credibility |
|---|---|---|---|
| [eu-ai-act.yml](../data/sources/eu-ai-act.yml) | `eu-ai-act` | `eu` | official_primary |
| [eu-ai-office.yml](../data/sources/eu-ai-office.yml) | `eu-ai-office` | `eu` | official_primary |
| [eur-lex.yml](../data/sources/eur-lex.yml) | `eur-lex` | `eu` | official_primary |
| [edpb.yml](../data/sources/edpb.yml) | `edpb` | `eu` | official_primary |
| [edps.yml](../data/sources/edps.yml) | `edps` | `eu` | official_primary |
| [norway-ai-act-implementation.yml](../data/sources/norway-ai-act-implementation.yml) | `norway-ai-act-implementation` | `norway` | official_primary |
| [datatilsynet.yml](../data/sources/datatilsynet.yml) | `datatilsynet` | `norway` | official_primary |

**Total:** 2 jurisdictions, 7 sources (pilot subset only).

---

## Schemas (`schemas/`)

| Schema | Validates |
|---|---|
| [jurisdiction.schema.json](../schemas/jurisdiction.schema.json) | Jurisdiction YAML records |
| [source.schema.json](../schemas/source.schema.json) | Source YAML records |

YAML files should be convertible to JSON and validated against these schemas when a validator is available. No CI validator is wired in v0.2.0.

---

## Field reference (pilot)

### Jurisdiction

`jurisdiction_id`, `name`, `type`, `region`, `parent_jurisdiction`, `regulatory_focus`, `monitoring_priority`, `notes`, `review_status`

### Source

`source_id`, `title`, `jurisdiction_id`, `source_type`, `credibility_level`, `official_url`, `monitoring_scope`, `expected_update_types`, `related_topics`, `review_status`, `notes`

See also [DATA_MODEL_DRAFT.md](DATA_MODEL_DRAFT.md) for the broader entity model.

---

## Review workflow (current)

All pilot entries use `review_status: pending_review`.

**Control Tower** should:

1. Verify each `official_url` is current and correct.
2. Confirm monitoring scope wording is accurate and not overbroad.
3. Set `review_status: reviewed` after approval.
4. Reject or archive entries that should not be monitored.

No automated fetching is configured in this phase.

---

## Explicit gaps (not yet registered)

Examples of sources **not** in this pilot wave:

- EU member-state national implementations (27+ regimes)
- ENISA, sector regulators (EBA, EMA, etc.)
- Lovdata.no as a separate statute mirror
- UK, US, or other jurisdictions
- Standards bodies (CEN/CENELEC) unless added later
- Open datasets (AI Legislation Tracker, OECD) — license review required

Expansion is registry-driven; absence here is not a statement that a source is unimportant.

---

## Next steps after pilot approval

1. Control Tower review of URLs and scope text.
2. Sample law/guidance and change records (v0.3).
3. Control/evidence mapping samples under `mappings/`.
4. Optional validation script (no new package manager without approval).

See [NEXT_ACTIONS.md](../NEXT_ACTIONS.md).
