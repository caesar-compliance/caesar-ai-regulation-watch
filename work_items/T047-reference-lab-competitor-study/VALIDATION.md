# T047 — Validation checklist

**Task:** Reference lab competitor study (documentation only)

---

## Pre-flight

- [ ] `git fetch --all --prune` completed
- [ ] Branch `docs/T047-reference-lab-competitor-study` created
- [ ] T046 automation-first docs status on `main` recorded in `FINDINGS.md` / final report
- [ ] `_reference-lab` accessed read-only only

---

## Deliverable files

- [ ] `work_items/T047-reference-lab-competitor-study/TASK.md`
- [ ] `work_items/T047-reference-lab-competitor-study/VALIDATION.md`
- [ ] `work_items/T047-reference-lab-competitor-study/FINDINGS.md`
- [ ] `work_items/T047-reference-lab-competitor-study/DECISIONS.md`
- [ ] `work_items/T047-reference-lab-competitor-study/FINAL_REPORT_TEMPLATE.md`
- [ ] `docs/REFERENCE_LAB_SETUP.md`
- [ ] `docs/COMPETITOR_FEATURE_MATRIX.md`
- [ ] `docs/OPEN_SOURCE_ARCHITECTURE_FINDINGS.md`
- [ ] `docs/PUBLIC_COMPETITOR_UX_FINDINGS.md`
- [ ] `docs/AUTOMATION_FIRST_IMPLEMENTATION_BACKLOG.md`
- [ ] `docs/T048_RECOMMENDED_IMPLEMENTATION_PLAN.md`

---

## Content policy

- [ ] No competitor HTML/CSS/JS copied into repo
- [ ] No competitor datasets or jurisdiction copy pasted into repo
- [ ] No screenshots or full page captures added to repo
- [ ] No GPL/MIT source files copied into repo
- [ ] Summaries are Caesar-native original prose
- [ ] Human review documented as optional future layer, not MVP core

---

## Repo validation commands

```bash
npm run validate:data
npm run build
git diff --check
```

- [ ] `npm run validate:data` — pass
- [ ] `npm run build` — pass
- [ ] `git diff --check` — no conflict markers in staged docs

---

## Git hygiene

- [ ] Commit includes only `docs/` and `work_items/` (no intentional `public/data/` churn)
- [ ] Commit message: `docs(T047): add reference lab competitor study`
- [ ] Branch pushed to `origin`

---

## Final report

- [ ] `FINAL_REPORT_TEMPLATE.md` completed in work item folder or agent transcript
- [ ] Starting `main` commit hash recorded
- [ ] Final commit hash recorded
- [ ] Top findings and license risks summarized
- [ ] T048 recommendation stated
