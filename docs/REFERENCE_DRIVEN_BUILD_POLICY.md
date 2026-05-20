# Reference-Driven Build Policy — Caesar AI Regulation Watch

**Date:** 20 May 2026
**Status:** Development policy
**Purpose:** Allow faster development by studying open-source projects and public competitor sites while keeping Caesar code, data, text and design safe to publish.

---

## 1. Core principle

Caesar AI Regulation Watch uses **reference-driven clean implementation**.

This means:

> We look at how good products and open-source projects work, learn from their architecture, UX, data model, feature set and implementation patterns, then build Caesar-native code and content.

This avoids wasting time reinventing the wheel while keeping the final repository controlled and publishable.

---

## 2. Local reference workspace

Reference projects and competitor captures should be kept **outside** the Caesar repo.

Recommended local layout:

```text
~/Desktop/Projects/reference-repos/
  delschlangen-ai-legislation-tracker/
  riadeane-airegulationmap/
  other-reference-projects/

~/Desktop/Projects/reference-captures/
  techieray/
  the-legal-wire/
  dla-piper/
  iapp/
```

The Caesar repo should contain only:

- benchmark notes;
- clean-room specs;
- original Caesar code;
- properly licensed imported code with notices, if approved;
- original or properly attributed data.

---

## 3. Open-source code rules

### 3.1 Permissive licenses

Examples:

- MIT;
- Apache-2.0;
- BSD-2-Clause;
- BSD-3-Clause;
- ISC.

Policy:

- code may be copied, adapted or imported **only after license verification**;
- preserve copyright and license notices;
- add the dependency/import to `THIRD_PARTY_NOTICES.md`;
- document why reuse was faster/better than rewriting;
- prefer small, isolated imports over copying whole apps;
- default remains: rewrite Caesar-native unless full reuse is clearly useful.

### 3.2 MIT-specific rule

MIT-licensed code may generally be used, copied, modified and redistributed if the copyright and permission notice are included.

Caesar policy:

- if a MIT file is copied fully, keep the original license header/notice;
- if a MIT component is modified, preserve notice and document modifications;
- if MIT code becomes a meaningful part of the repo, add it to `THIRD_PARTY_NOTICES.md`;
- if a MIT dataset is used, verify whether the dataset itself is also MIT or separately licensed.

### 3.3 GPL / AGPL / strong copyleft

Examples:

- GPL-3.0;
- AGPL-3.0.

Policy:

- may be cloned locally and studied;
- may be used as architecture/UX/data-model inspiration;
- may be used to understand algorithms or product mechanics;
- do **not** copy GPL/AGPL code into Caesar commercial/product code unless there is explicit Control Tower approval and license consequences are accepted;
- rewrite equivalent functionality from scratch as Caesar-native implementation.

### 3.4 Source-available / BSL / unclear license

Policy:

- reference only;
- no code import;
- no dataset import unless terms clearly allow it;
- write a reference study and clean-room implementation plan.

---

## 4. Public competitor site rules

Public websites may be studied with:

- normal browser use;
- screenshots for internal reference;
- browser developer tools;
- page structure inspection;
- network request inspection where publicly accessible;
- public API/RSS/JSON discovery if not blocked by terms;
- UX and interaction notes.

Do not:

- bypass login, paywalls, WAF, CAPTCHA or technical controls;
- use stealth/proxy evasion;
- mass scrape content;
- copy proprietary HTML/CSS/JS into final Caesar repo;
- copy competitor text into final public pages;
- copy competitor branding/assets/icons/images;
- republish competitor curated datasets;
- claim competitor analysis as Caesar analysis.

---

## 5. Text, HTML, CSS and JavaScript as inspiration

### 5.1 Text

Allowed:

- use competitor/public text as temporary local placeholder during design exploration;
- use it to understand information architecture;
- rewrite it into original Caesar wording before commit/publication;
- cite official sources instead of competitor summaries.

Final public Caesar text must be:

- original;
- not copied from law firms or competitor trackers;
- conservative;
- not legal advice;
- source-linked.

### 5.2 HTML/CSS/JS

Allowed:

- inspect how a page is structured;
- inspect classes/layout ideas;
- inspect map/filter/newsfeed mechanics;
- create local notes or throwaway prototypes outside the repo;
- implement the same general idea with Caesar-native code.

Final Caesar code must be:

- original unless properly licensed;
- not a direct copy of proprietary site code;
- not a pixel-perfect clone;
- adapted to Caesar data model and design system.

---

## 6. Data rules

Allowed:

- official source facts;
- official URLs;
- official publication metadata;
- public government data where reuse is allowed;
- open datasets where license permits;
- competitor data used only as discovery leads.

Not allowed without approval:

- competitor curated dataset copy;
- law firm summaries;
- full legal/source text storage;
- paywalled or login-protected data;
- scraped news corpus;
- unverified AI-generated legal statements.

---

## 7. Required documentation for every reference-driven task

Every agent final report must include:

1. References inspected.
2. License/terms observed.
3. What was used as inspiration.
4. Whether any code/data/text was copied.
5. If permissive code was imported, exact files and notices added.
6. If restricted/proprietary/GPL code was inspected, confirmation that final implementation was rewritten.
7. Validation commands.
8. Remaining license/product risks.

---

## 8. Safe wording for prompts

Use:

> Study these reference repositories and public products to derive a Caesar-native architecture and feature implementation. Reuse permissive code only if license notices are preserved and documented. Treat GPL/proprietary/public-site code as reference-only. Final repo code, text and UI must be original Caesar implementation unless explicitly licensed and documented.

Avoid:

> Copy competitor code.

> Clone the site exactly.

> Scrape all competitor data.

> Remove attribution.

> Ignore license because we rewrote later.

---

## 9. Default decision table

| Source type | Local inspection | Copy into Caesar repo | Final rule |
|---|---:|---:|---|
| MIT code | Yes | Yes, if notices preserved | Prefer Caesar rewrite unless reuse is useful |
| Apache/BSD/ISC code | Yes | Yes, if notices preserved | Same as MIT |
| GPL/AGPL code | Yes | No by default | Reference-only; rewrite |
| Source-available/BSL | Yes | No by default | Reference-only; rewrite |
| Public competitor site | Yes | No proprietary code/text/assets | Use UX/mechanics as inspiration |
| Official government data | Yes | Usually yes, with source link | Use as primary factual source |
| Law firm tracker text | Yes | No | Use as benchmark/discovery only |
| Competitor curated dataset | Yes for discovery | No by default | Verify against official sources |
