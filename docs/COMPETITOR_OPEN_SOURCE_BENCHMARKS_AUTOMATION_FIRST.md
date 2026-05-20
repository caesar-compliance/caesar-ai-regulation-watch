# Competitor and Open-Source Benchmarks — Automation-First Edition

**Date:** 20 May 2026
**Status:** Benchmark and reference plan
**Purpose:** Define which products/projects Caesar AI Regulation Watch should study and what to build from them.

---

## 1. Benchmark philosophy

We do not start from a blank page.

We study the best public products and open-source trackers, identify what works, and build a Caesar-native version that is faster, clearer, more automated, better filtered and better structured.

---

## 2. Primary product benchmarks

### 2.1 Techieray Global AI Regulation Tracker

**URL:** https://www.techieray.com/GlobalAIRegulationTracker

Observed public positioning:

- interactive world map;
- tracks AI law, regulatory and policy developments;
- region/country profiles;
- AI-powered search;
- insights dashboard;
- “vibe meter”;
- live AI newsfeed;
- API service and widget feature;
- regular updates.

What Caesar should copy as product ideas:

- map-first entry point;
- country profiles;
- live updates/newsfeed;
- AI search concept;
- insights dashboard;
- API/widget roadmap;
- coverage ambition across many jurisdictions.

What Caesar should do better:

- cleaner data model;
- more transparent source registry;
- more visible confidence labels;
- better filters;
- better public JSON/RSS exports;
- clearer automation status;
- more governance/compliance oriented topic taxonomy.

Do not copy:

- proprietary code;
- proprietary database;
- proprietary wording;
- branding or design assets.

---

### 2.2 The Legal Wire AI Regulation Tracker

**URL:** https://thelegalwire.ai/ai-regulation-tracker/
**Launch note:** https://thelegalwire.ai/the-legal-wire-launches-ai-regulation-tracker/

Observed public positioning:

- clickable global map;
- country snapshots;
- current AI legislation and related activity;
- automatically sourced from official government and institutional channels;
- brief standardized summaries;
- direct links to original source documents;
- continuously updated and timestamped jurisdiction pages.

What Caesar should copy as product ideas:

- country snapshot model;
- source-linked updates;
- simple standardized update summaries;
- timestamped jurisdiction pages;
- no-noise tracker style.

What Caesar should do better:

- richer filters;
- richer metrics;
- structured export layer;
- automation method visibility;
- source health/coverage metrics;
- better dashboard and technical transparency.

Do not copy:

- text;
- summaries;
- proprietary dataset;
- HTML/CSS/JS.

---

### 2.3 IAPP Global AI Law and Policy Tracker

**URL:** https://iapp.org/resources/article/global-ai-legislation-tracker

What to study:

- legal/policy tracker information architecture;
- jurisdiction-by-jurisdiction summaries;
- status categories;
- topic grouping;
- professional legal tone.

Caesar angle:

- use as legal-structure reference;
- rely on official source links and automation;
- avoid copying analysis/prose.

---

### 2.4 DLA Piper AI Laws of the World

**URL:** https://intelligence.dlapiper.com/artificial-intelligence

What to study:

- country selector;
- legal framework comparison;
- broad jurisdiction coverage;
- topic-oriented explanation.

Caesar angle:

- add country comparison later;
- make more automated and machine-readable;
- avoid law-firm content copying.

---

### 2.5 Bird & Bird AI Regulatory Horizon Tracker

**URL:** https://www.twobirds.com/en/capabilities/artificial-intelligence/ai-legal-services/ai-regulatory-horizon-tracker

What to study:

- horizon-scanning structure;
- proposed/adopted/guidance/enforcement buckets;
- simple color/status language.

Caesar angle:

- use status bucket clarity;
- combine with automated update feed.

---

### 2.6 Holistic AI Tracker

**URL:** https://www.holisticai.com/ai-tracker

What to study:

- regulation + risk + compliance framing;
- incident/lawsuit/regulation grouping;
- enterprise risk orientation.

Caesar angle:

- later connect updates to governance/compliance topics and metrics.

---

## 3. Open-source references

### 3.1 `delschlangen/ai-legislation-tracker`

**Repo:** https://github.com/delschlangen/ai-legislation-tracker
**License observed:** MIT
**Live demo:** https://delschlangen.github.io/ai-legislation-tracker

What to study:

- structured legislation dataset;
- searchable/filterable table;
- expandable rows;
- source links;
- lightweight static implementation;
- JSON/data-first approach.

What may be reused:

- MIT code/data only after checking exact license coverage;
- preserve copyright/license notices;
- document imports in `THIRD_PARTY_NOTICES.md`.

Default Caesar approach:

- use as architecture/data-model reference;
- rewrite core implementation in Caesar-native Astro/data model;
- verify any data against official sources before publishing as Caesar data.

---

### 3.2 `riadeane/airegulationmap`

**Repo:** https://github.com/riadeane/airegulationmap
**License observed:** GPL-3.0
**Description:** AI regulation map by country, D3.js, Cloudflare Pages.

What to study:

- map UX;
- D3 map mechanics;
- data-to-map connection;
- static deployment structure;
- country interaction model.

What may be reused:

- ideas and architecture only by default.

Default Caesar approach:

- do not import GPL code into Caesar repo;
- implement a Caesar-native map from scratch;
- consider open map libraries directly under compatible licenses;
- document clean-room implementation.

---

### 3.3 `changedetection.io`

**Repo:** https://github.com/dgtlmoon/changedetection.io

What to study:

- change detection concepts;
- watch configuration;
- diff storage;
- notification model;
- source health patterns.

Caesar approach:

- study architecture;
- do not necessarily import;
- build narrower regulation-source-specific adapters.

---

### 3.4 `FreshRSS`

**Repo:** https://github.com/FreshRSS/FreshRSS

What to study:

- RSS aggregation;
- tags/categories;
- feed refresh;
- API patterns;
- feed UI.

Caesar approach:

- use as feed/news inspiration;
- build regulation-specific newsfeed.

---

### 3.5 OpenStates / US legislative data references

**Org:** https://github.com/openstates

What to study:

- legislative data model;
- API/bulk data patterns;
- bill status tracking;
- state-level source normalization.

Caesar approach:

- use for future US state-level AI regulation tracking research;
- respect API/data terms.

---

## 4. Feature benchmark matrix

| Feature | Techieray | Legal Wire | delschlangen | riadeane | Caesar target |
|---|---:|---:|---:|---:|---|
| World map | Yes | Yes | No/table | Yes | Yes, polished and filterable |
| Country profiles | Yes | Yes | Limited | Yes | Yes, structured and source-linked |
| Latest updates | Yes/newsfeed | Yes | Dataset updates | Not primary | Yes, core feature |
| AI search | Yes | Not primary | No | No | Later, grounded in structured data |
| Metrics dashboard | Yes | Not primary | No | No | Yes, stronger than competitors |
| API/widget | Yes | Not clear | Static data | No | JSON/RSS first, API/widget later |
| Open-source code | No | No | MIT | GPL | Use references safely |
| Automation-first | Yes-ish | Yes, auto-sourced | Manual/curated | Static | Yes, explicit core |
| Evidence layer | No | Source links | No | No | Later optional Caesar differentiator |

---

## 5. Caesar differentiation

Caesar should not merely clone a map.

Caesar should win on:

1. speed of automated updates;
2. clear source transparency;
3. better filtering;
4. better metrics;
5. cleaner public JSON/RSS exports;
6. country/topic timelines;
7. automation/confidence labels;
8. future Governance OS / Evidence integration;
9. open documentation of how the tracker works.

---

## 6. Immediate research tasks

1. Clone `delschlangen/ai-legislation-tracker` into local reference workspace.
2. Clone `riadeane/airegulationmap` into local reference workspace.
3. Capture product screenshots/notes from Techieray and The Legal Wire using normal browser only.
4. Produce a feature map:
   - map mechanics;
   - data model;
   - filters;
   - update feed;
   - source links;
   - metrics;
   - exports;
   - automation clues.
5. Convert findings into Caesar-native specs.

---

## 7. Required warning for agents

Agents may inspect references, but must not import restricted/proprietary code/text/data into the Caesar repo.

If any third-party code is imported, the final report must identify:

- source repo;
- license;
- files copied;
- notices preserved;
- modifications;
- reason for reuse.
