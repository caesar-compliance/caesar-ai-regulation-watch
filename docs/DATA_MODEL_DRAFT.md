# Data Model Draft — Caesar AI Regulation Watch

**Prepared:** 19 May 2026  
**Status:** Draft for review (YAML/JSON files not yet created)

This draft describes entities and relationships for the full-scale product. Field names may change before implementation. Align exports with `caesar-ai-evidence` **regulation-change** when that schema stabilizes.

---

## Entity relationship overview

```text
Jurisdiction ──< OfficialSource ──< SourceSnapshot
     │                │
     │                └──< ChangeRecord
     │
     ├──< LawRecord
     ├──< GuidanceRecord
     └──< TimelineEvent

ChangeRecord ──< AffectedControlLink
ChangeRecord ──< AffectedEvidenceLink
ChangeRecord ──< SummaryRecord (AI + human review)
```

---

## 1. Jurisdiction

| Field | Type | Notes |
|---|---|---|
| `jurisdiction_id` | string | Stable slug, e.g. `no`, `eu`, `gb` |
| `name` | string | Display name |
| `region` | string | e.g. Europe, Americas, Asia-Pacific |
| `blocs` | string[] | e.g. EU, EEA, ASEAN |
| `iso_codes` | string[] | ISO 3166 where applicable |
| `status_summary` | string | Short tracked overview (not legal advice) |
| `regulators` | RegulatorRef[] | Name + official URL |
| `coverage_note` | string | Honest limits of tracked coverage |
| `last_reviewed_at` | date | Human curation |
| `last_reviewed_by` | string | Optional reviewer id |

---

## 2. OfficialSource (registry)

| Field | Type | Notes |
|---|---|---|
| `source_id` | string | |
| `jurisdiction_id` | string | FK |
| `title` | string | |
| `url` | uri | Canonical monitored URL |
| `source_type` | enum | law_portal, regulator, gazette, rss, api, standards_ref |
| `document_types` | enum[] | law, regulation, guidance, faq, implementation |
| `credibility_tier` | enum | official_primary, official_secondary, authoritative_reference |
| `fetch_method` | enum | rss, html_snapshot, api, manual |
| `cadence` | string | e.g. daily, weekly |
| `attribution` | string | Required citation |
| `license_notes` | string | Reuse constraints |
| `active` | boolean | |

---

## 3. LawRecord

| Field | Type | Notes |
|---|---|---|
| `law_id` | string | |
| `jurisdiction_id` | string | |
| `title` | string | |
| `citation` | string | Official citation if available |
| `source_url` | uri | |
| `status` | StatusLabel | See §8 |
| `topics` | string[] | e.g. gpaI, transparency, risk_management |
| `effective_from` | date? | Tracked date; verify on source |
| `effective_to` | date? | |
| `summary` | string | Human or reviewed AI summary |
| `related_guidance_ids` | string[] | |

---

## 4. GuidanceRecord

| Field | Type | Notes |
|---|---|---|
| `guidance_id` | string | |
| `jurisdiction_id` | string | |
| `issuer` | string | e.g. EU AI Office, Datatilsynet |
| `title` | string | |
| `published_at` | date? | |
| `source_url` | uri | |
| `status` | StatusLabel | Usually `guidance` |
| `related_law_ids` | string[] | |
| `summary` | string | Reviewed where public |

---

## 5. TimelineEvent

| Field | Type | Notes |
|---|---|---|
| `event_id` | string | |
| `jurisdiction_id` | string | |
| `law_id` | string? | |
| `guidance_id` | string? | |
| `event_type` | enum | proposed, adopted, in_force, deadline, guidance_issued, other |
| `label` | string | Display text |
| `event_date` | date | |
| `source_url` | uri? | |
| `verified` | boolean | Human verified flag |

---

## 6. SourceSnapshot

| Field | Type | Notes |
|---|---|---|
| `snapshot_id` | string | |
| `source_id` | string | |
| `fetched_at` | datetime | |
| `content_hash` | string | For diff detection |
| `storage_ref` | string | Path or object key (future) |
| `http_status` | int? | |

---

## 7. ChangeRecord

| Field | Type | Notes |
|---|---|---|
| `change_id` | string | |
| `source_id` | string | |
| `detected_at` | datetime | |
| `change_type` | enum | content, metadata, new_document, removed, unknown |
| `previous_snapshot_id` | string? | |
| `current_snapshot_id` | string? | |
| `diff_ref` | string? | Link to diff artifact |
| `source_excerpt` | string? | Minimal excerpt if permitted |
| `review_status` | enum | pending, reviewed, rejected, archived |
| `reviewed_at` | datetime? | |
| `reviewed_by` | string? | |
| `client_impact_category` | enum? | informational, review_recommended, high_attention |

---

## 8. StatusLabel (controlled vocabulary)

`proposed` | `adopted` | `in_force` | `guidance` | `voluntary` | `withdrawn` | `monitoring`

Operational labels only — not a substitute for legal status determination.

---

## 9. SummaryRecord (AI layer)

| Field | Type | Notes |
|---|---|---|
| `summary_id` | string | |
| `parent_type` | enum | change, law, guidance, jurisdiction |
| `parent_id` | string | |
| `text` | string | Draft or published summary |
| `generated_by` | enum | ai_draft, human, hybrid |
| `model_id` | string? | If AI-generated |
| `review_status` | enum | pending, approved, rejected |
| `disclaimer_included` | boolean | Must be true for public |

---

## 10. AffectedControlLink

| Field | Type | Notes |
|---|---|---|
| `link_id` | string | |
| `change_id` | string | |
| `control_ref` | string | Caesar control taxonomy id |
| `relationship` | enum | may_affect, suggested_review |
| `rationale` | string | Short, non-legal-advice note |

---

## 11. AffectedEvidenceLink

| Field | Type | Notes |
|---|---|---|
| `link_id` | string | |
| `change_id` | string | |
| `evidence_type` | string | e.g. ai_system_register, vendor_questionnaire |
| `suggested_action` | enum | review, update, create, archive |
| `rationale` | string | |

---

## 12. Export bundles

### RSS item (conceptual)

`title`, `link`, `pubDate`, `jurisdiction_id`, `change_id`, `summary` (approved only)

### JSON feed record

Full `ChangeRecord` + nested links + source metadata + disclaimers.

### caesar-ai-evidence regulation-change (conceptual alignment)

```json
{
  "type": "regulation-change",
  "id": "chg_2026_0001",
  "detected_at": "2026-05-19T10:00:00Z",
  "jurisdiction": "eu",
  "source_url": "https://...",
  "summary": "Draft summary — requires review",
  "affected_controls": [],
  "affected_evidence": [],
  "review_status": "pending"
}
```

Exact schema to be coordinated with `caesar-ai-evidence` maintainers.

---

## 13. File layout (planned, not created)

```text
data/
  jurisdictions/
  sources/
  laws/
  guidance/
  changes/
  timelines/
mappings/
  controls/
  evidence/
```

No implementation in blueprint phase.
