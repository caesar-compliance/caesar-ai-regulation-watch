# First Full MVP Requirements — Caesar AI Regulation Watch

**Date:** 20 May 2026
**Status:** Product requirements draft
**Goal:** Define what “first full MVP” means after the automation-first strategy decision.

---

## 1. MVP one-liner

The first full MVP is a public, automated AI regulation tracker with a world map, country profiles, latest updates, filters, metrics, source links, structured data exports and scheduled update pipelines.

---

## 2. User-facing product

A user should open the website and immediately understand:

- which countries have AI laws or active AI policy developments;
- what changed recently;
- which source supports each update;
- whether an item is adopted, proposed, consultation, guidance, enforcement or general policy signal;
- which jurisdictions and topics are most active;
- where to click for country details and source documents.

---

## 3. Required public pages

### 3.1 Home / global dashboard

Must include:

- headline positioning as automation-first AI regulation tracker;
- global stats cards;
- latest updates feed;
- map entry point;
- quick filters;
- top active jurisdictions;
- top topics;
- disclaimer.

### 3.2 World map page

Must include:

- interactive map;
- country color/status by AI regulation maturity;
- hover/click country card;
- filters by region/status/topic;
- link to country profile.

Minimum status buckets:

- adopted / in force;
- proposed / bill / draft;
- consultation;
- guidance / soft law;
- enforcement;
- strategy / policy;
- no tracked AI-specific update yet;
- unknown / not monitored.

### 3.3 Country profile page

Each country page should include:

- country name;
- region/bloc;
- AI regulation status;
- latest updates;
- key laws/proposals/guidance;
- regulators and official sources;
- timeline;
- topic tags;
- source links;
- last automated check;
- confidence status.

### 3.4 Latest updates / newsfeed

Must include:

- chronological feed;
- filters by country, region, topic, source type, status, date, confidence;
- grouping by week/month;
- short summary;
- source link;
- detected date;
- classification.

### 3.5 Metrics page

Must include:

- countries with adopted AI laws;
- countries with proposals/consultations;
- updates this week/month;
- most active jurisdictions;
- most active topics;
- source health metrics;
- automation coverage metrics.

### 3.6 Sources page

Must include:

- official source registry;
- source type;
- jurisdiction;
- monitoring method: API/RSS/feed/public page/manual seed;
- last check;
- status;
- known blocker if any.

### 3.7 API/exports page

Must include:

- links to JSON exports;
- RSS/Atom feed link when implemented;
- schema docs;
- future API/widget/MCP note.

---

## 4. Required data model

Minimum record types:

```text
jurisdiction
source
regulatory_update
law_or_policy_record
topic
monitoring_run
source_check
```

### 4.1 `regulatory_update`

Minimum fields:

```yaml
id:
title:
summary:
jurisdiction_id:
region:
source_ids:
source_urls:
source_type:
update_type: adopted | proposed | consultation | guidance | enforcement | strategy | policy | news | source_update
legal_status: in_force | proposed | draft | non_binding | consultation_open | consultation_closed | unknown
topics:
detected_at:
published_at:
last_checked_at:
confidence_score:
automation_method: api | rss | official_feed | official_page | public_page | manual_seed
requires_human_review: false
human_review_status: optional | not_required | requested | completed
client_evidence_allowed: false
final_evidence_allowed: false
```

### 4.2 Confidence score

Confidence should describe automation confidence, not legal certainty.

Example buckets:

- `high`: official API/RSS/feed with clear metadata;
- `medium`: official page detected and classified;
- `low`: public signal requiring source confirmation;
- `blocked`: source known but not reachable from automation environment.

---

## 5. Required automation features

### 5.1 Source adapters

Adapters should prioritize:

1. official APIs;
2. official RSS/Atom feeds;
3. official structured pages;
4. official pages with metadata-only checks;
5. public institutional pages;
6. curated discovery leads.

### 5.2 Detection

System should detect:

- new official publication;
- changed source page metadata;
- changed title/date/link list;
- new consultation;
- new guidance;
- new enforcement/action;
- new law/proposal status.

### 5.3 Classification

System should classify:

- jurisdiction;
- topic;
- update type;
- source type;
- legal/policy status;
- confidence.

### 5.4 Publication

Detected updates may be published automatically if they pass deterministic policy rules:

- source is allowed;
- source type is known;
- URL is stored;
- title/date/summary are present;
- no legal advice wording;
- no full legal/source text copied;
- confidence label is visible;
- evidence/client gates stay closed unless separately approved.

---

## 6. Required non-goals for MVP

Do not build first:

- paid auth dashboard;
- client evidence export;
- legal advice memos;
- broad web crawler;
- WAF/CAPTCHA/stealth bypass;
- competitor data copier;
- full-text legal database;
- pixel-perfect clone of any competitor;
- direct writes to `caesar-ai-evidence`.

---

## 7. MVP completion checklist

MVP can be called first full MVP when:

- global map exists;
- at least 50+ jurisdictions are represented with status buckets;
- latest updates feed exists;
- at least 5 automated source adapters run successfully;
- metrics page exists;
- country pages exist;
- exports exist and validate;
- scheduled automation runs without manual intervention;
- public site deploys from CI;
- docs clearly state automation-first positioning;
- human review is documented as optional future assurance layer.
