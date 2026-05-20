# T046 Agent Prompt — Automation-First Strategy Rebase

Use this prompt for the local AI coding agent.

---

## Title

T046 — Automation-first product strategy rebase and reference-driven development policy

## Context

You are working in `caesar-ai-regulation-watch`.

The project has changed product direction. The first full MVP is no longer a human-review-centered legal evidence workflow. The first full MVP is an automation-first global AI regulation tracker and news intelligence dashboard inspired by Techieray Global AI Regulation Tracker and The Legal Wire AI Regulation Tracker.

Target product:

- world map;
- country profiles;
- latest updates/newsfeed;
- filters;
- groupings;
- metrics;
- source-linked update records;
- structured exports;
- scheduled automation for official and authoritative sources.

Human review is now optional future assurance/evidence functionality, not the core product model.

Reference-driven development is approved:

- study competitor public sites and open-source repos locally;
- reuse MIT/Apache/BSD/ISC code only with license notices and documentation;
- use GPL/AGPL/source-available/proprietary code as reference-only unless explicitly approved;
- text/HTML/CSS/JS from public sites may be inspected and used for local inspiration/placeholders, but final repo output must be Caesar-native or properly licensed.

## Allowed

- Documentation changes.
- Add new strategy docs.
- Update README / PROJECT_STATE / NEXT_ACTIONS.
- Update/link competitor benchmark docs.
- Update/link third-party code/data policy docs.
- Clarify automation-first roadmap.
- Reframe human review as optional future assurance layer.
- Validate docs and repository.

## Not allowed

- Do not implement new product code in this task.
- Do not import competitor code.
- Do not import GPL/AGPL/proprietary code.
- Do not copy competitor text into final public-facing docs except as clearly marked reference URLs or short factual descriptions.
- Do not enable client evidence export.
- Do not set `client_use_allowed: true`.
- Do not set `final_evidence_allowed: true`.
- Do not claim legal advice.
- Do not enable broad uncontrolled scraping.
- Do not bypass WAF/CAPTCHA or technical controls.
- Do not write to `caesar-ai-evidence`.

## State guard

Run:

```bash
git branch --show-current
git status --short
git log --oneline -5
find . -name '* 2.*' -o -name '* 2.md' -o -name '* 2.astro' -o -name '* 2.json' | sort | head -200
```

If branch is not `main`, report and stop unless Artem explicitly told you to work on another branch.

If working tree is dirty, inspect and report. Do not overwrite unknown user work. If dirty files are generated/stale duplicates and the fix is obvious, propose a safe cleanup plan before modifying.

## Create branch

```bash
git checkout main
git pull --ff-only
BRANCH="docs/T046-automation-first-strategy-rebase"
git checkout -b "$BRANCH"
```

## Implement documentation rebase

Add these docs if not already present:

```text
docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md
docs/FIRST_FULL_MVP_REQUIREMENTS.md
docs/REFERENCE_DRIVEN_BUILD_POLICY.md
docs/COMPETITOR_OPEN_SOURCE_BENCHMARKS_AUTOMATION_FIRST.md
docs/AUTOMATION_FIRST_MVP_ROADMAP.md
docs/REFERENCE_REPO_STUDY_TEMPLATE.md
docs/DOCUMENTATION_PATCH_MAP.md
```

Update existing docs:

1. `README.md`
   - Reposition as automation-first global AI regulation tracker and news intelligence dashboard.
   - Move human review/evidence to future optional assurance layer.
   - Keep not legal advice / not complete coverage / source transparency.

2. `PROJECT_STATE.md`
   - Add product strategy decision dated 20 May 2026.
   - Treat v1.0.4 as technical base.
   - Fix stale “in progress” language if v1.0.4 is already deployed.

3. `NEXT_ACTIONS.md`
   - Replace stale v1.0.4 deployment actions with T046–T050 automation-first sequence.

4. `docs/COMPETITOR_BENCHMARKS.md`
   - Link or merge automation-first competitor/open-source benchmarks.
   - Emphasize Techieray, The Legal Wire, `delschlangen/ai-legislation-tracker`, `riadeane/airegulationmap`.

5. `docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md`
   - Link or merge `REFERENCE_DRIVEN_BUILD_POLICY.md`.
   - Clarify MIT reuse with attribution/notices.
   - Clarify GPL/proprietary/public-site reference-only default.

6. `docs/FULL_SCALE_PRODUCT_BLUEPRINT.md`
   - Reframe mission as automation-first tracker/news intelligence first.
   - Keep evidence/governance as later optional integration.

7. `docs/UI_UX_VISION.md`
   - Make map/newsfeed/filters/metrics the central public UX.

8. `docs/SCHEDULED_MONITORING_POLICY.md` and relevant monitoring docs
   - Clarify scheduled automation is expected when safe and source-approved.
   - Keep no WAF/CAPTCHA bypass, no stealth/proxy evasion, no broad uncontrolled scraping.

## Cleanup duplicate files if safe

If Finder duplicate files like `* 2.md`, `* 2.astro`, `* 2.json`, `* 2.mjs` exist:

1. Compare with canonical file.
2. If identical or clearly accidental generated duplicate, remove.
3. If different, do not delete; report exact diff and stop cleanup for that file.

Commands:

```bash
find . -name '* 2.*' | sort
```

Use `diff -u` against canonical where possible.

## Validation

Run available validation commands from repo docs/package.json. At minimum:

```bash
npm run validate
npm run build
```

If package scripts differ, run the closest documented commands and report exactly what was run.

Also run:

```bash
git diff --check
```

Optional if available:

```bash
npm run check:all-offline
npm run verify:dist
```

## Commit

```bash
git status --short
git add README.md PROJECT_STATE.md NEXT_ACTIONS.md docs/
git commit -m "docs: rebase regulation watch toward automation-first MVP"
```

## Merge / push

If validation passes:

```bash
git checkout main
git merge --no-ff "$BRANCH" -m "Merge T046 automation-first strategy rebase"
git push origin main
```

Do not deploy unless public site output changes and existing workflow requires it. If docs are public and included in site output, follow existing deploy workflow only with normal confirmation.

## Tagging

Do not create a release tag unless Control Tower explicitly approves. This task may be docs-only and may not require a version tag.

## Final report required

Return:

1. Starting commit.
2. Branch name.
3. Final branch commit.
4. Merge commit if merged.
5. Files created.
6. Files changed.
7. Duplicate files found/removed or stopped on.
8. Summary of strategy changes.
9. Validation commands and results.
10. Whether deploy was needed/performed.
11. Remaining risks.
12. Recommended next task.
