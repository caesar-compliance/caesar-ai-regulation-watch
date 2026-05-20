# Documentation Patch Map — Automation-First Rebase

**Date:** 20 May 2026
**Purpose:** Tell the local AI coding agent exactly which existing docs should be updated after adding the new strategy docs.

---

## 1. Root README.md

Change positioning from:

```text
Public tracker for AI laws, regulatory guidance, source verification, and evidence export readiness.
```

to:

```text
Automation-first global AI regulation tracker and news intelligence dashboard.
```

Update “What it does” to emphasize:

- automatic source monitoring;
- map-first country tracking;
- latest updates/newsfeed;
- filters and metrics;
- official/authoritative source links;
- JSON/RSS/API-ready exports.

Move human review/evidence language to “Future optional assurance layer”.

Remove or soften phrases implying:

- not an automated product;
- human-reviewed as the central workflow;
- evidence export as current core direction.

Keep:

- not legal advice;
- not complete global coverage;
- no unsupported compliance claims;
- source transparency.

---

## 2. PROJECT_STATE.md

Add section:

```markdown
## Product strategy decision — 20 May 2026

The project direction is now automation-first. The first full MVP target is a Techieray / The Legal Wire style AI regulation tracker: world map, country profiles, update feed, filters, metrics and automated source monitoring. Human review remains optional for future premium legal/evidence workflows and is not the foundation of the MVP roadmap.
```

Fix stale wording:

- if v1.0.4 is deployed, do not call it “in progress”;
- separate “current live technical base” from “next automation-first product target”.

---

## 3. NEXT_ACTIONS.md

Replace stale immediate tasks with:

1. T046 documentation rebase: automation-first strategy and reference-driven build policy.
2. T047 reference study: Techieray, Legal Wire, delschlangen, riadeane.
3. T048 automation-first data model design.
4. T049 public UI map/newsfeed/metrics architecture.
5. T050 first source adapters for automated updates.

Remove “deploy v1.0.4” if already deployed.

---

## 4. docs/COMPETITOR_BENCHMARKS.md

Merge in or link:

```text
docs/COMPETITOR_OPEN_SOURCE_BENCHMARKS_AUTOMATION_FIRST.md
```

Add stronger focus on:

- Techieray;
- The Legal Wire;
- `delschlangen/ai-legislation-tracker`;
- `riadeane/airegulationmap`.

---

## 5. docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md

Merge in or link:

```text
docs/REFERENCE_DRIVEN_BUILD_POLICY.md
```

Clarify:

- MIT/Apache/BSD/ISC can be reused with notices;
- GPL/AGPL reference-only by default;
- public competitor sites can be inspected but not copied into final output;
- text/HTML/CSS/JS can be used for inspiration/local placeholders, but final code/text/design must be Caesar-native or licensed.

---

## 6. docs/FULL_SCALE_PRODUCT_BLUEPRINT.md

Update mission from evidence-oriented first to automation-first first.

Old emphasis:

```text
governance review, evidence update, client action
```

New emphasis:

```text
automated tracking, country intelligence, latest updates, maps, metrics, filters, exports
```

Keep evidence/governance integration as later optional differentiator.

---

## 7. docs/UI_UX_VISION.md

Update design priorities:

1. Map-first.
2. Latest updates/newsfeed-first.
3. Filters and metrics.
4. Country profiles.
5. Source links.
6. Automation/confidence labels.
7. Optional review/evidence layer later.

---

## 8. docs/SCHEDULED_MONITORING_POLICY.md and monitoring docs

Update policy language so scheduled automation is allowed and expected when safe.

Keep prohibitions:

- no broad uncontrolled scraping;
- no WAF/CAPTCHA bypass;
- no stealth/proxy evasion;
- no full legal/source text storage;
- no unsupported legal conclusions.

Add:

- API/RSS/feed-first automation is preferred;
- public-page monitoring is allowed for approved sources;
- confidence labels must distinguish automation quality.

---

## 9. docs/MAP_AND_REVIEW_QUEUE.md

Rename/reframe if needed:

- map remains central;
- review queue becomes `exceptions queue`, `confidence queue`, or optional assurance queue;
- do not imply every normal update needs human review before being useful.

---

## 10. New docs to add

Add:

```text
docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md
docs/FIRST_FULL_MVP_REQUIREMENTS.md
docs/REFERENCE_DRIVEN_BUILD_POLICY.md
docs/COMPETITOR_OPEN_SOURCE_BENCHMARKS_AUTOMATION_FIRST.md
docs/AUTOMATION_FIRST_MVP_ROADMAP.md
docs/REFERENCE_REPO_STUDY_TEMPLATE.md
docs/DOCUMENTATION_PATCH_MAP.md
```
