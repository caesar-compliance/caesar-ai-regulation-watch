# Sample Records Guide — Manual v0.3.0 Data

**Prepared:** 19 May 2026  
**Phase:** v0.3.0 — data-model validation (no watchers, no UI)

---

## Purpose

This guide describes **manual sample records** for laws, guidance, detected changes, and control/evidence mappings. They exist **for data-model testing only** before any watcher or UI implementation.

The samples:

- support **governance review** workflows in design;
- use language that **may affect controls** or **may affect evidence**;
- require **human review before client use** (`review_status: pending_review` by default);
- link to the v0.2.0 **official source registry** via `source_id` and `jurisdiction_id`.

They do **not**:

- provide legal advice;
- guarantee compliance;
- claim complete regulatory coverage;
- automatically determine legal obligations;
- represent automated detections (change samples are fictionalised illustrations).

---

## File inventory

### Laws (`data/laws/`)

| File | `record_id` | Links |
|---|---|---|
| [eu-ai-act.yml](../data/laws/eu-ai-act.yml) | `law-eu-ai-act-2024-1689` | `source_id: eu-ai-act`, `jurisdiction_id: eu` |

### Guidance (`data/guidance/`)

| File | `record_id` | Links |
|---|---|---|
| [eu-ai-office-general-purpose-ai.yml](../data/guidance/eu-ai-office-general-purpose-ai.yml) | `guidance-eu-ai-office-gpai` | `source_id: eu-ai-office` |
| [datatilsynet-ai-privacy.yml](../data/guidance/datatilsynet-ai-privacy.yml) | `guidance-datatilsynet-ai-privacy` | `source_id: datatilsynet` |

### Changes (`data/changes/`)

| File | `change_id` | `related_record_id` |
|---|---|---|
| [sample-eu-ai-act-status-change.yml](../data/changes/sample-eu-ai-act-status-change.yml) | `sample-eu-ai-act-status-change` | `law-eu-ai-act-2024-1689` |
| [sample-datatilsynet-guidance-change.yml](../data/changes/sample-datatilsynet-guidance-change.yml) | `sample-datatilsynet-guidance-change` | `guidance-datatilsynet-ai-privacy` |

> Change records are **manual samples**, not watcher output. `detected_date` is illustrative.

### Mappings (`mappings/`)

| File | Contents |
|---|---|
| [change-to-controls.sample.yml](../mappings/change-to-controls.sample.yml) | Two `may_affect_controls` / `suggested_control_review` blocks |
| [change-to-evidence.sample.yml](../mappings/change-to-evidence.sample.yml) | Two `may_affect_evidence` / `suggested_evidence_review` blocks |

Mapping files use a top-level `mappings:` array; each element validates against `schemas/change-control-mapping.schema.json` or `schemas/change-evidence-mapping.schema.json`.

---

## Schemas (`schemas/`)

| Schema | Validates |
|---|---|
| [law.schema.json](../schemas/law.schema.json) | Law YAML in `data/laws/` |
| [guidance.schema.json](../schemas/guidance.schema.json) | Guidance YAML in `data/guidance/` |
| [change.schema.json](../schemas/change.schema.json) | Change YAML in `data/changes/` |
| [change-control-mapping.schema.json](../schemas/change-control-mapping.schema.json) | Each item under `mappings:` in control mapping files |
| [change-evidence-mapping.schema.json](../schemas/change-evidence-mapping.schema.json) | Each item under `mappings:` in evidence mapping files |

---

## Entity relationships (pilot)

```text
Jurisdiction (eu | norway)
    └── Source (registry)
            └── Law / Guidance record
                    └── Change record (manual sample)
                            ├── Control mapping (may_affect / suggested_review)
                            └── Evidence mapping (may_affect / suggested_review)
```

---

## Field quick reference

### Law

`record_id`, `record_type` (`law`), `title`, `jurisdiction_id`, `source_id`, `legal_status`, `official_url`, `summary_for_review`, `key_dates`, `affected_topics`, `review_status`, `legal_safe_note`

### Guidance

`record_id`, `record_type` (`guidance`), `title`, `jurisdiction_id`, `source_id`, `guidance_status`, `official_url`, `summary_for_review`, `affected_topics`, `review_status`, `legal_safe_note`

### Change

`change_id`, `related_record_id`, `source_id`, `jurisdiction_id`, `detected_date`, `change_type`, `change_summary_for_review`, `confidence_level`, `requires_human_review`, `possible_impact`, `review_status`, `legal_safe_note`

### Control mapping

`mapping_id`, `change_id`, `may_affect_controls`, `suggested_control_review`, `human_review_required`, `legal_safe_note`

### Evidence mapping

`mapping_id`, `change_id`, `may_affect_evidence`, `suggested_evidence_review`, `human_review_required`, `legal_safe_note`

---

## Control and evidence refs (sample taxonomy)

Pilot refs are **placeholders** until aligned with `caesar-ai-evidence` and hub control taxonomy:

| Ref | Meaning (operational) |
|---|---|
| `ctrl_regulatory_tracking` | Process for tracking applicable regulation |
| `ctrl_ai_system_inventory` | AI system register control |
| `ctrl_risk_management_lifecycle` | Risk management for AI systems |
| `ctrl_privacy_and_data_protection` | Privacy / GDPR-aligned controls |
| `ctrl_transparency_and_notices` | Transparency to users/data subjects |
| `ctrl_human_oversight_documentation` | Human oversight evidence |
| `ev_ai_system_register` | AI system register evidence |
| `ev_governance_memo` | Governance memo / policy summary |
| `ev_compliance_calendar` | Internal regulatory date tracking |
| `ev_dpia` | Data protection impact assessment |
| `ev_privacy_notice` | Privacy notice / policy |
| `ev_transparency_documentation` | AI transparency artefacts |

---

## Review workflow

1. Control Tower confirms sample content is acceptable for internal testing.
2. Verify `official_url` and dates on live sources where samples reference real instruments.
3. Set `review_status: reviewed` only when appropriate for your use case.
4. Do not export to clients without review.

---

## Validation (local)

When PyYAML and jsonschema are available:

```bash
# From repository root (illustrative; not a committed script)
python3 -c "
import json, yaml, jsonschema
from pathlib import Path
# ... validate each file against matching schema
"
```

See v0.2.0 validation approach in [PILOT_SOURCE_REGISTRY.md](PILOT_SOURCE_REGISTRY.md).

---

## Next steps

- Align control/evidence refs with hub taxonomy and `caesar-ai-evidence`.
- Add timeline YAML (optional v0.3.1).
- Static site read of `data/` (v0.3 / v0.5 — requires approval).
- Watchers (v0.4 only after explicit approval).

See [NEXT_ACTIONS.md](../NEXT_ACTIONS.md).
