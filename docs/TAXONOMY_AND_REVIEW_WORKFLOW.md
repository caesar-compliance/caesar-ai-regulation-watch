# Taxonomy and Review Workflow

**Prepared:** 19 May 2026  
**Phase:** v0.3.1 — taxonomy, review workflow, and evidence-export contract foundation

---

## Purpose

This document defines **canonical allowed values** and the **review workflow** for Caesar AI Regulation Watch data. Taxonomies support governance review; they do **not** define legal obligations or guarantee compliance.

Machine-readable taxonomies live in `data/taxonomies/`. JSON Schema: `schemas/taxonomy.schema.json`.

---

## Data boundaries

| Boundary | Location | `record_origin` / role |
|---|---|---|
| **Official source registry** | `data/jurisdictions/`, `data/sources/` | Registry definitions of what may be monitored later; not law text |
| **Manual sample records** | `data/laws/`, `data/guidance/`, `data/changes/` | `record_origin: manual_sample` — for data-model testing only |
| **Future watcher output** | (not implemented) | `record_origin: future_watcher_output` — automated detections when approved |
| **Mappings** | `mappings/*.yml` | Curated links from change → controls/evidence; always review-gated |
| **Export contract samples** | `exports/samples/` | Illustrative export payloads; **no client evidence created** |

Never treat manual samples or export samples as confirmed regulatory facts without verifying official sources.

---

## Taxonomy files

| File | `taxonomy_id` | Used for |
|---|---|---|
| [regulatory-statuses.yml](../data/taxonomies/regulatory-statuses.yml) | `regulatory-statuses` | `legal_status`, `guidance_status` on law/guidance records |
| [source-credibility-levels.yml](../data/taxonomies/source-credibility-levels.yml) | `source-credibility-levels` | `credibility_level` on sources |
| [review-statuses.yml](../data/taxonomies/review-statuses.yml) | `review-statuses` | `review_status` on all curated entities |
| [change-types.yml](../data/taxonomies/change-types.yml) | `change-types` | `change_type` on change records |
| [confidence-levels.yml](../data/taxonomies/confidence-levels.yml) | `confidence-levels` | `confidence_level` on change records |
| [affected-topics.yml](../data/taxonomies/affected-topics.yml) | `affected-topics` | `affected_topics`, `related_topics` tags (pilot subset) |
| [control-reference-types.yml](../data/taxonomies/control-reference-types.yml) | `control-reference-types` | Draft `regulation_watch.control.*` refs |
| [evidence-reference-types.yml](../data/taxonomies/evidence-reference-types.yml) | `evidence-reference-types` | Draft `regulation_watch.evidence.*` refs |

---

## Review workflow

```text
draft
  → pending_review
      → reviewed
      → needs_update → pending_review (after edit)
      → rejected_for_client_use
      → archived
```

| Status | Meaning |
|---|---|
| `draft` | Work in progress |
| `pending_review` | Ready for human review (default for new samples) |
| `reviewed` | Checked for internal use; still not legal advice |
| `needs_update` | Source or content stale; refresh before use |
| `rejected_for_client_use` | Do not use in client deliverables |
| `archived` | Historical only |

All mappings and export contract records require `human_review_required: true` until policy changes.

---

## Draft control and evidence references

Pattern ( **not** confirmed in `caesar-ai-evidence` yet):

```text
regulation_watch.control.<slug>
regulation_watch.evidence.<slug>
```

Each mapping/export item includes `reference_alignment: draft_pending_caesar_ai_evidence` until cross-repo alignment.

See [control-reference-types.yml](../data/taxonomies/control-reference-types.yml) and [evidence-reference-types.yml](../data/taxonomies/evidence-reference-types.yml).

---

## Regulatory status labels (operational)

Values include: `proposed`, `adopted`, `in_force`, `guidance`, `implementation_update`, `voluntary`, `withdrawn`, `monitoring`, `unknown`.

These are **tracked operational labels** — verify status on official sources; not definitive legal classification.

---

## Related documents

- [EVIDENCE_EXPORT_CONTRACT.md](EVIDENCE_EXPORT_CONTRACT.md)
- [SAMPLE_RECORDS_GUIDE.md](SAMPLE_RECORDS_GUIDE.md)
- [PILOT_SOURCE_REGISTRY.md](PILOT_SOURCE_REGISTRY.md)
