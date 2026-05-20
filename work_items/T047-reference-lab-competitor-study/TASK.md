# T047 — Regulation Watch reference lab study docs

**Task ID:** T047  
**Branch:** `docs/T047-reference-lab-competitor-study`  
**Date:** 20 May 2026  
**Repo:** `caesar-ai-regulation-watch`

---

## Goal

Read local reference-lab materials (open-source clones and public site capture notes) and produce **Caesar-native** study documents inside this repo. No runtime implementation, no third-party code or content in the product repo.

---

## Inputs (read-only, outside Caesar repo)

| Category | Path |
|----------|------|
| Lab root | `~/Desktop/Projects/caesar-compliance/_reference-lab/regulation-watch/` |
| Open source | `repos/delschlangen-ai-legislation-tracker/`, `repos/riadeane-airegulationmap/` |
| Site captures | `site-captures/techieray/`, `the-legal-wire/`, `iapp/`, `dla-piper/`, `bird-and-bird/` |
| Notes | `notes/OPEN_SOURCE_REPOS_CLONED.md`, `notes/PUBLIC_SITE_CAPTURES.md` |

---

## Deliverables

### Work item folder

- `work_items/T047-reference-lab-competitor-study/TASK.md` (this file)
- `VALIDATION.md`
- `FINDINGS.md`
- `DECISIONS.md`
- `FINAL_REPORT_TEMPLATE.md`

### Docs

1. `docs/REFERENCE_LAB_SETUP.md`
2. `docs/COMPETITOR_FEATURE_MATRIX.md`
3. `docs/OPEN_SOURCE_ARCHITECTURE_FINDINGS.md`
4. `docs/PUBLIC_COMPETITOR_UX_FINDINGS.md`
5. `docs/AUTOMATION_FIRST_IMPLEMENTATION_BACKLOG.md`
6. `docs/T048_RECOMMENDED_IMPLEMENTATION_PLAN.md`

---

## Constraints

- Do **not** copy third-party code, HTML, CSS, JS, text, datasets, or screenshots into Caesar repo.
- Do **not** modify `_reference-lab` (read-only).
- Do **not** implement runtime code or add dependencies.
- Human review remains **optional future** assurance layer, not MVP foundation.
- First full MVP = automation-first tracker: map, country pages, newsfeed, filters, metrics, updates.

---

## State guard (T046)

Before starting, verify on `main`:

- `docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md`
- `docs/FIRST_FULL_MVP_REQUIREMENTS.md`
- `docs/REFERENCE_DRIVEN_BUILD_POLICY.md`
- `docs/AUTOMATION_FIRST_MVP_ROADMAP.md`

If missing from `main`, report that **T046 must be merged first** before production implementation; study docs may still be prepared on a docs branch.

---

## Commit

- Message: `docs(T047): add reference lab competitor study`
- Stage only `docs/` and `work_items/` changes.
- Push: `git push -u origin docs/T047-reference-lab-competitor-study`
