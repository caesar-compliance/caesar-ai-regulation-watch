# Automation-First MVP Roadmap — Caesar AI Regulation Watch

**Date:** 20 May 2026
**Status:** Roadmap proposal after strategy rebase

---

## Phase 0 — Repo hygiene and strategy rebase

Goal: make the repo internally consistent before new product work.

Tasks:

1. Remove accidental duplicate files such as Finder-style `* 2.*` files if present.
2. Resolve generated/public dirty state.
3. Update README / PROJECT_STATE / NEXT_ACTIONS.
4. Add automation-first charter.
5. Add reference-driven build policy.
6. Update competitor benchmarks.
7. Add first full MVP requirements.
8. Add roadmap.
9. Validate and commit.

Exit criteria:

- docs no longer describe human review as core product;
- first full MVP is defined as automation-first tracker/newsfeed/map;
- local agent has clear policy for references and licenses;
- repo validation passes.

---

## Phase 1 — Reference study sprint

Goal: learn from the best existing products without copying restricted material.

Inputs:

- Techieray Global AI Regulation Tracker;
- The Legal Wire AI Regulation Tracker;
- `delschlangen/ai-legislation-tracker`;
- `riadeane/airegulationmap`;
- IAPP / DLA / Bird & Bird trackers.

Outputs:

- feature map;
- UI architecture notes;
- map implementation options;
- data model comparison;
- update feed design;
- metrics design;
- implementation backlog.

Exit criteria:

- Caesar-native specs exist;
- license/reference notes complete;
- no restricted code copied into repo.

---

## Phase 2 — Data model rebase

Goal: create an automation-first data model.

New/updated entities:

- `jurisdiction`;
- `source`;
- `regulatory_update`;
- `topic`;
- `source_check`;
- `monitoring_run`;
- `country_status`;
- `metric_snapshot`.

Key changes:

- `human_review` becomes optional metadata;
- confidence score becomes central;
- source automation method becomes visible;
- update feed becomes first-class.

Exit criteria:

- schemas validate;
- sample data generated;
- public JSON exports updated;
- docs updated.

---

## Phase 3 — Public UI MVP rebuild

Goal: make the public site look and behave like a real tracker.

Build:

- home dashboard;
- map page;
- country list;
- country profile;
- latest updates/newsfeed;
- filters;
- metrics page;
- source registry page;
- export/API page.

Exit criteria:

- static build passes;
- pages load locally;
- public copy is automation-first;
- no legal advice claims;
- visual UX clearly moves toward Techieray/Legal Wire quality.

---

## Phase 4 — Automation engine v1

Goal: automated update pipeline for selected official sources.

Start with 5–10 source adapters:

- official RSS/Atom where available;
- official APIs where available;
- official publication pages;
- structured source lists.

Build:

- source adapter registry;
- scheduled source check;
- change detection;
- classification;
- deduplication;
- generated update records;
- generated latest updates feed;
- CI validation.

Exit criteria:

- scheduled run creates deterministic artifacts;
- public JSON updates validate;
- no WAF/CAPTCHA/stealth bypass;
- no full legal/source text storage;
- confidence labels visible.

---

## Phase 5 — Metrics and discovery layer

Goal: make the tracker useful, not just complete.

Build metrics:

- active jurisdictions this week/month;
- new proposals;
- new adopted laws;
- consultations opened/closed;
- top topics;
- source availability;
- automation coverage;
- update velocity by region.

Build discovery:

- filters;
- grouped feed;
- country comparison basics;
- topic pages;
- weekly digest page.

Exit criteria:

- users can answer “what changed this week?”;
- users can compare country/topic activity;
- data exports support the UI.

---

## Phase 6 — AI search and summarization

Goal: add natural-language intelligence on top of structured data.

Build:

- grounded AI search over local structured data;
- summary generation with source links;
- “compare jurisdictions” answers;
- “what changed in topic X” answers;
- generated but clearly labeled summaries.

Rules:

- no unsourced legal advice;
- answers cite source links;
- confidence labels visible;
- source data remains structured and inspectable.

---

## Phase 7 — API / widget / MCP

Goal: turn the tracker into a data product.

Build:

- stable JSON API/export contract;
- RSS/Atom feed;
- iframe/widget version;
- MCP server or connector later;
- docs for developers.

---

## Phase 8 — Optional evidence/human review layer

Goal: add premium/high-assurance workflows after automation-first MVP works.

Build only later:

- human review queue;
- legal assurance status;
- client evidence export;
- Caesar AI Evidence writes;
- governance task assignment;
- audit trail.

This phase must not block the first full MVP.
