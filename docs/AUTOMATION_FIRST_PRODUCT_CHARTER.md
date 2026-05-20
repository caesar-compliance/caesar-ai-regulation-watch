# Automation-First Product Charter — Caesar AI Regulation Watch

**Date:** 20 May 2026
**Status:** Product strategy decision
**Applies to:** `caesar-ai-regulation-watch`

---

## 1. Decision

Caesar AI Regulation Watch is now defined as an **automation-first global AI regulation tracker and news intelligence product**.

The first full MVP is **not** a manual legal review system and **not** a client evidence export system.

The first full MVP is a public and machine-readable tracker similar in product shape to:

- Techieray Global AI Regulation Tracker;
- The Legal Wire AI Regulation Tracker;
- selected open-source tracker/map projects used as references.

The product should answer, automatically and quickly:

- Which countries have adopted AI laws, rules, policies, guidance, or enforcement activity?
- Which countries are discussing or consulting on AI regulation?
- What changed recently?
- What sources support the update?
- What topics are affected: GPAI, high-risk AI, biometric AI, employment, transparency, safety, copyright, public sector AI, procurement, enforcement, etc.?
- Which jurisdictions, regulators, and topics are most active?
- What should a compliance, legal, product, or governance team watch next?

---

## 2. New north star

> Caesar AI Regulation Watch automatically tracks AI law, regulation, policy, guidance, consultations, enforcement and official regulatory news across jurisdictions, then turns them into structured country profiles, update feeds, maps, metrics, filters, timelines and machine-readable exports.

---

## 3. What human review means now

Human review is **not** the foundation of the product.

Human review becomes an optional future layer for higher-assurance workflows:

- premium legal review mode;
- client evidence mode;
- final evidence export;
- consulting deliverables;
- high-confidence regulatory memos;
- Caesar AI Evidence / Governance OS integration.

The normal product path should be:

```text
official source / public regulatory signal / official feed / API / RSS / public page
  → automated detection
    → automated classification
      → automated summary
        → confidence score
          → public update / country profile / metrics / feed
            → optional human/evidence/legal assurance layer later
```

---

## 4. First full MVP definition

The first full MVP is complete only when the repo delivers all of the following:

### 4.1 Public website

- Global map of AI regulation status by country.
- Country list and country detail pages.
- Latest updates/newsfeed.
- Topic and status filters.
- Jurisdiction comparison basics.
- Metrics dashboard.
- Source links.
- Public JSON exports.
- Conservative disclaimers.

### 4.2 Database / structured data layer

Minimum entities:

- jurisdiction;
- regulator/source;
- update/event;
- law;
- guidance;
- proposal;
- consultation;
- enforcement;
- topic;
- source link;
- confidence score;
- detection metadata;
- status classification.

### 4.3 Automation layer

- Official RSS/API/feed monitoring where available.
- Public official page monitoring where no API/feed exists.
- Change detection.
- Deduplication.
- Classification.
- Summary generation or deterministic summary templates.
- Update publication into static exports.
- Build/deploy automation.

### 4.4 UX features

- Map-first navigation.
- Fast search.
- Filters by region, country, status, topic, source type, date, confidence.
- “What changed this week?” page.
- Country timeline.
- Metrics widgets.
- Latest updates grouped by country/topic/status.

### 4.5 Data exports

- JSON exports.
- RSS/Atom feed.
- Future API/widget/MCP-ready structure.

---

## 5. What this project is not in the first full MVP

The first full MVP is not:

- a legal advice product;
- a compliance guarantee;
- an audit-ready evidence product;
- a full legal database;
- a manual human-review workflow as core product;
- a competitor content mirror;
- a broad scraping system that ignores source terms or technical barriers.

---

## 6. Product positioning

Preferred wording:

> Automation-first global AI regulation tracker and news intelligence dashboard.

> Tracks official and authoritative AI regulatory developments across jurisdictions.

> Turns regulatory signals into country profiles, update feeds, maps, timelines, filters and machine-readable exports.

> Human/legal/evidence review is optional and reserved for higher-assurance workflows.

Avoid wording that implies:

- every update is lawyer-reviewed;
- coverage is complete;
- output is legal advice;
- every source is final evidence;
- all detected changes are legally material;
- human review is required before the tracker is useful.

---

## 7. Strategic benchmark formula

The product should move toward:

```text
Techieray-style map + newsfeed + API/widget ideas
  + The Legal Wire-style country snapshots and source-linked updates
  + IAPP/DLA/Bird & Bird-style legal tracker structure
  + open-source tracker architecture inspiration
  + Caesar-native automation, metrics, exports and governance integration
```

---

## 8. Implications for repo roadmap

The next tasks should prioritize:

1. Documentation rebase to automation-first.
2. Competitor/open-source benchmark pack.
3. Data model for automated regulation updates.
4. Map/country/update UI rebuild.
5. Automation source adapters.
6. Metrics/newsfeed/search.
7. Optional human/evidence layer later.

---

## 9. Control Tower rule

Before any new implementation sprint, the local AI coding agent must be told:

> Human review is not the core product model. Build toward automation-first tracking. Treat review/evidence as optional future layers unless a task explicitly says otherwise.
