# Evidence Export Contract

**Prepared:** 19 May 2026  
**Phase:** v0.3.1 — contract definition only (no export implementation)

---

## Purpose

This document defines how Caesar AI Regulation Watch **may later** produce **regulation-change** export records for:

- [Caesar AI Evidence](https://github.com/caesar-compliance/caesar-ai-evidence) (structured evidence packs)
- **Caesar AI Governance OS** (future regulatory inbox and client workspaces)

The contract supports **governance review**. It does **not**:

- create client evidence automatically;
- guarantee compliance;
- provide legal advice;
- claim complete regulatory coverage;
- automatically determine legal obligations.

---

## Export type

| Field | Value |
|---|---|
| `export_type` | `regulation_change` (fixed for this contract v0.3.1) |

Future types (e.g. `regulation_timeline_event`) are out of scope until specified.

---

## Record shape

JSON Schema: [schemas/evidence-export-record.schema.json](../schemas/evidence-export-record.schema.json)

Sample file ( **does not write to caesar-ai-evidence** ): [exports/samples/regulation-change-export.sample.yml](../exports/samples/regulation-change-export.sample.yml)

### Required fields

| Field | Description |
|---|---|
| `export_record_id` | Stable export bundle identifier |
| `source_change_id` | Links to `data/changes/<change>.yml` |
| `jurisdiction_id` | EU, Norway, etc. |
| `related_record_id` | Linked law or guidance `record_id` |
| `export_type` | `regulation_change` |
| `summary_for_review` | Human-oriented summary; not legal advice |
| `may_affect_controls` | Draft control refs + rationale + `reference_alignment` |
| `may_affect_evidence` | Draft evidence refs + rationale + `reference_alignment` |
| `suggested_review_actions` | Structured review tasks (verify source, review evidence, etc.) |
| `human_review_required` | Must be `true` for client-facing pipelines in v0.3.1 |
| `legal_safe_note` | Disclaimers |
| `created_from` | Provenance: `manual_sample`, `regulation_watch_mapping`, `future_watcher_pipeline` |
| `review_status` | Uses [review-statuses](../data/taxonomies/review-statuses.yml) taxonomy |

---

## Pipeline (future — not implemented)

```text
Official source (registry)
  → [future watcher] change record
      → mapping (may_affect / suggested_review)
          → export record (this contract)
              → [future] caesar-ai-evidence ingest
                  → [future] Governance OS regulatory inbox
```

**v0.3.1 delivers:** schema + sample YAML only.

---

## Mapping to Caesar AI Evidence

Alignment with `caesar-ai-evidence` **regulation-change** schema is **pending** cross-repo confirmation. Until then:

- Use `regulation_watch.control.*` and `regulation_watch.evidence.*` draft refs.
- Set `reference_alignment: draft_pending_caesar_ai_evidence` on all refs.
- Do not claim fields exist in production evidence validators.

Open coordination: hub Control Tower + `caesar-ai-evidence` maintainers.

---

## Mapping to Caesar AI Governance OS

Future **Regulatory Inbox** may ingest export records to:

- show pending regulatory items per client workspace;
- create tasks from `suggested_review_actions`;
- link to evidence center items after human approval.

No OS implementation in this repository phase.

---

## Review gating

Export records must not be pushed to clients when:

- `review_status` is `draft`, `pending_review`, `needs_update`, or `rejected_for_client_use`;
- `human_review_required` is true and no reviewer has approved (default in v0.3.1);
- `source_change_id` points to `record_origin: manual_sample` unless explicitly marked as production data.

---

## Legal-safe language

Approved phrases: *may affect controls*, *may affect evidence*, *suggested review action*, *supports governance review*, *requires human review before client use*.

Avoid: *compliant*, *non-compliant*, *guarantees*, *complete coverage*, *definitive legal interpretation*.

---

## Related documents

- [TAXONOMY_AND_REVIEW_WORKFLOW.md](TAXONOMY_AND_REVIEW_WORKFLOW.md)
- [SAMPLE_RECORDS_GUIDE.md](SAMPLE_RECORDS_GUIDE.md)
