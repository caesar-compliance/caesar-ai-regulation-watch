# Competitor-Assisted Official Source Discovery Policy

**Effective:** 20 May 2026
**Version:** v0.9.1
**Status:** Active for `caesar-ai-regulation-watch` source registry expansion.

---

## Purpose

Accelerate **official source URL discovery** by using public competitor and benchmark trackers only as **navigation aids**. Caesar records, summaries, and registry entries must remain **official-source-first**.

This policy complements [THIRD_PARTY_CODE_AND_DATA_POLICY.md](THIRD_PARTY_CODE_AND_DATA_POLICY.md) and [SOURCE_VERIFICATION_WORKFLOW.md](SOURCE_VERIFICATION_WORKFLOW.md).

---

## Core rules

1. **Competitors are benchmarks and discovery aids only** — not authority sources, not primary truth, not copy sources.
2. **Competitor pages are not authority sources** — never cite a competitor URL as `official_url`, `source_id` truth, or legal basis.
3. **Only official source URLs may become Caesar source records** — government, legislature, regulator, or clearly designated international body domains.
4. **Every official URL must be independently opened and verified** — record HTTP status, page title, and access date; no trust-by-proxy from a competitor link.
5. **No proprietary UI or text copying** — do not copy competitor summaries, tables, labels, status classifications, or wording.
6. **Discovery trail** — when a competitor page helped find a URL, record it only as `discovered_from_url` with `discovered_from_type: competitor_tracker` and optional `competitor_name`. Do not store competitor page content.
7. **Final records are based on the official source** — titles and minimal summaries must be derived from Caesar review of the official page, in original cautious language.
8. **If the official source cannot be verified**, the lead stays `pending_official_review`, `official_source_unclear`, or `rejected_not_official` — never promoted to the public source registry as confirmed.

---

## Allowed workflow

| Step | Allowed |
|---|---|
| Manually open a public competitor tracker page | Yes — to see which jurisdiction or topic to research |
| Note “competitor X listed a link to domain Y” | Yes — as a lead only |
| Open domain Y independently | Yes — required |
| Add `data/sources/` entry from Y | Yes — after verification |
| Add minimal law/guidance record from Y | Yes — sparingly, `review_status: pending_review`, no client use |
| Record `no_competitor_text_copied: true` | Required on every discovery lead batch |

---

## Prohibited

- Bulk scraping or automated extraction from competitor sites
- Copying competitor summaries, tables, or datasets
- Importing competitor status labels or proprietary classifications
- Using competitor content as legal authority
- Setting `client_use_allowed: true` or `final_evidence_allowed: true` from discovery work
- Writing to `caesar-ai-evidence` or creating final evidence exports

---

## Data locations

| Artifact | Path |
|---|---|
| Discovery leads (batch) | `data/source-discovery/source-discovery-leads-*.yml` |
| Schema | `schemas/source-discovery-lead.schema.json` |
| Promoted sources | `data/sources/` |
| Public export | `public/data/source-discovery-leads.json` |
| Public page | `/source-discovery/` |

---

## Promotion criteria

A lead may be promoted to `data/sources/` when:

- `verification_status` is `official_source_confirmed`
- `official_source_verified` is `true`
- `verified_title`, `http_status`, and `access_date` are recorded
- `no_competitor_text_copied` and `no_bulk_extraction` are `true`
- The URL is not a duplicate of an existing `source_id` (update existing entry if same institution)

---

## Disclaimer

> Competitor-assisted discovery does not imply endorsement, completeness, or legal accuracy of any tracker. Caesar AI Regulation Watch is not legal advice and does not guarantee regulatory compliance.
