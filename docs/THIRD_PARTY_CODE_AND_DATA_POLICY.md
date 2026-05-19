# Third-Party Code and Data Policy — Caesar AI Regulation Watch

**Effective:** 19 May 2026  
**Version:** v0.3.3  
**Status:** Approved for planning; no third-party code imported. v0.3.3 VerifyWise study completed in external sandbox only.

This policy applies to **caesar-ai-regulation-watch** and aligns with [Caesar AI Governance Hub — License and Code Policy](https://github.com/caesar-compliance/caesar-ai-governance-hub/blob/main/research/LICENSE_AND_CODE_POLICY.md).

---

## Purpose

Caesar AI Regulation Watch may accelerate delivery using **permissive open-source components**, **official public sources**, and **licensed datasets** — but only when license and terms clearly permit reuse. Competitor products are **benchmark inputs**, not copy sources.

---

## Core rule

> Study competitors and third parties aggressively. Build Caesar products as **original implementations** unless a license or contract clearly allows reuse.

---

## Allowed reuse categories

| Category | What it means | Caesar requirements |
|---|---|---|
| **Permissive open-source code** | MIT, Apache-2.0, BSD-2/3-Clause, ISC, and similar after verification | Keep license notices; add `THIRD_PARTY_NOTICES.md` when code is imported; no GPL/AGPL in commercial core without explicit approval |
| **Official-source facts** | Public law, guidance, metadata, and URLs from regulators and legislatures | Link primary URLs; cite source; do not present as Caesar-authored law text |
| **Licensed open datasets** | Structured data with explicit data license (e.g. MIT dataset files) | Verify data license separately from code license; attribute; document in research |
| **Commercial APIs (contract)** | Paid API with written terms (e.g. Techieray) | Use only within Permitted Purpose; do not redistribute API payloads in public Caesar products without commercial tier |
| **UX and workflow patterns** | Map-first navigation, status badges, timelines, export concepts | Clean-room spec and implementation; original wording and design |
| **JSON Schema / validation libraries** | Standard validators when a package manager is approved later | Prefer hub-aligned tooling decisions |

---

## Prohibited copying

Do **not**:

- copy competitor **source code**, **UI components**, **CSS/layout**, or **branding** 1:1;
- copy competitor **database dumps**, **scraped news corpora**, or **curated proprietary datasets**;
- copy **marketing text**, **law-firm analysis**, **summaries**, or **report prose** without permission;
- copy **VerifyWise** or other **BSL / source-available** code into Caesar client-facing or consulting deliverables without compatible license;
- treat **website HTML** as freely reusable data without checking terms;
- publish **unreviewed AI summaries** as governance or legal guidance;
- claim **compliance**, **legal advice**, or **complete global coverage**.

---

## Clean-room implementation rule

For any feature inspired by a competitor benchmark:

1. Document the **feature pattern** in research (not their implementation).
2. Write a **Caesar specification** in original words aligned with [SPEC.md](../SPEC.md) and [DATA_MODEL_DRAFT.md](DATA_MODEL_DRAFT.md).
3. Design **Caesar YAML schemas and UI** from first principles.
4. Implement **original code** using only verified dependencies.
5. Record decisions in [docs/DECISION_LOG.md](DECISION_LOG.md) and [research/THIRD_PARTY_ACCELERATION_AUDIT.md](../research/THIRD_PARTY_ACCELERATION_AUDIT.md).

If a teammate has seen competitor proprietary code for the same feature, assign a different implementer or narrow scope to avoid subconscious copying.

---

## Official-source-first data principle

**Primary truth** for public Caesar content is:

- official regulator and legislature URLs already in `data/sources/`;
- machine-readable official APIs where terms permit (EUR-Lex, government open data);
- human-curated excerpts with `source_url` and `last_verified`.

**Secondary** (structure hints, gap-finding, not primary truth):

- OECD, IAPP, law-firm matrices, open datasets, commercial trackers.

Every record must keep `credibility_level`, `official_url`, and review metadata per [docs/TAXONOMY_AND_REVIEW_WORKFLOW.md](TAXONOMY_AND_REVIEW_WORKFLOW.md).

---

## Human review before client / legal use

| Stage | Requirement |
|---|---|
| Registry and samples | `review_status: pending_review` until Control Tower approves |
| Watcher output (future) | Default `pending_review`; no public publish without review |
| AI summaries (future) | Draft only until human-reviewed |
| Client / consulting delivery | `rejected_for_client_use` blocks export; no “compliant” language |
| Third-party dataset merge | Legal + Control Tower sign-off if bulk import |

---

## Source-available vs open-source

| Term | Meaning | Default Caesar action |
|---|---|---|
| **Open-source** | OSI-approved license with clear redistribution rights | May adopt as dependency after checklist |
| **Source-available** | Code visible but BSL, custom commercial, or internal-only grants | **Reference only** unless legal approves |
| **Proprietary SaaS** | No code license | **Reference only**; API only if contract permits |
| **No LICENSE file** | Unknown | **Blocked** until verified |

**VerifyWise** is source-available (BSL 1.1). Treat as benchmark, not a code base. v0.3.3 studied the repository in a **temporary external sandbox** only; findings are in [research/VERIFYWISE_ARCHITECTURE_STUDY.md](../research/VERIFYWISE_ARCHITECTURE_STUDY.md). **No VerifyWise files were committed to Caesar.**

---

## Attribution requirements

When reusing permitted code or data:

- preserve copyright and license notices;
- add an entry to `THIRD_PARTY_NOTICES.md` (create when first dependency is added);
- cite dataset authors in `docs/` or export metadata;
- link official sources on every public record;
- do not remove upstream notices from vendored files.

---

## License review checklist

Before importing **any** code, dataset, or API integration:

- [ ] Identify **exact license** or Terms of Service URL and date checked
- [ ] Separate **code license** vs **data license** vs **API data restrictions**
- [ ] Confirm **commercial / consulting / SaaS** use is permitted
- [ ] Confirm **redistribution** of data in public JSON/RSS is permitted
- [ ] Check **copyleft** (GPL/AGPL/EUPL) compatibility with Caesar commercial goals
- [ ] Check **attribution** and **notice** requirements
- [ ] Confirm **no competitor corpus** is embedded
- [ ] Record classification in [research/THIRD_PARTY_ACCELERATION_AUDIT.md](../research/THIRD_PARTY_ACCELERATION_AUDIT.md)
- [ ] Add row to [docs/ACCELERATION_DECISION_MATRIX.md](ACCELERATION_DECISION_MATRIX.md)
- [ ] Control Tower approval for pilot ingestion or public publish

---

## v0.3.2–v0.3.3 boundary

These releases add **policy and research only**:

- v0.4.0 adds `package.json` with **astro**, **js-yaml**, **ajv** only (MIT);
- no vendored third-party source trees;
- no VerifyWise or competitor source code in the repository;
- no watcher or API client implementation;
- no competitor data files committed.

v0.3.3 adds VerifyWise architecture study and v0.4.0 static site **plan** — implementation remains clean-room per [research/CLEAN_ROOM_FEATURE_BACKLOG.md](../research/CLEAN_ROOM_FEATURE_BACKLOG.md).

Future phases may adopt approved dependencies per this policy and [docs/ACCELERATION_DECISION_MATRIX.md](ACCELERATION_DECISION_MATRIX.md). **v0.4.0** may add `site/package.json` (Astro, ajv) after Control Tower approval.

---

## Related documents

| Document | Role |
|---|---|
| [research/THIRD_PARTY_ACCELERATION_AUDIT.md](../research/THIRD_PARTY_ACCELERATION_AUDIT.md) | Per-source classification |
| [research/OPEN_SOURCE_COMPONENT_SHORTLIST.md](../research/OPEN_SOURCE_COMPONENT_SHORTLIST.md) | Component recommendations |
| [research/COMPETITOR_FEATURE_REPLICATION_PLAN.md](../research/COMPETITOR_FEATURE_REPLICATION_PLAN.md) | Clean-room feature plan |
| [research/OFFICIAL_SOURCE_INGESTION_CANDIDATES.md](../research/OFFICIAL_SOURCE_INGESTION_CANDIDATES.md) | Future watcher targets |
| [research/VERIFYWISE_ARCHITECTURE_STUDY.md](../research/VERIFYWISE_ARCHITECTURE_STUDY.md) | VerifyWise reference study (v0.3.3) |
| [research/CLEAN_ROOM_FEATURE_BACKLOG.md](../research/CLEAN_ROOM_FEATURE_BACKLOG.md) | Implementation backlog |
| [docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md](V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md) | v0.4.0 plan |
| [docs/ACCELERATION_DECISION_MATRIX.md](ACCELERATION_DECISION_MATRIX.md) | Prioritised actions |
