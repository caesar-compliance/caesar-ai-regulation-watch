# Architecture — caesar-ai-regulation-watch

This document outlines the high-level architecture, module layers, and mapping engines for `caesar-ai-regulation-watch`.

---

## 🏗️ Planned Structure

The mapping service is structured into four decoupled layers:

```
┌────────────────────────────────────────────────────────┐
│                   Legislative Parser                   │
│   (Crawlers and text normalizers for EUR-Lex portals)  │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│                    Mapping Database                    │
│   (Relational database connecting clauses to controls) │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│                     Checklist Compiler                 │
│   (Translates statutory mappings into technical rules) │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│                     Ecosystem Gateway                  │
│   (Saves local control libraries and emits payloads)   │
└────────────────────────────────────────────────────────┘
```

1.  **Legislative Parser Layer:** Scheduled crawlers designed to pull statutory text, extract HTML structures, and parse raw legal articles into structured plain markdown.
2.  **Mapping Database Layer:** A curated relational catalog overlaying legal requirements with engineering control IDs.
3.  **Checklist Compiler Layer:** Translates abstract legal text changes into concrete compliance parameters.
4.  **Ecosystem Gateway Layer:** Formats output data structures, manages baseline text archives, and emits changes.

---

## 🔄 Data Flow

The regulatory tracking and mapping sequence proceeds as follows:

```
[Statutory Feed] ──> (Scraper Parser) ──> [Structured Clauses]
                                                 │
                                                 ▼
[Ecosystem Checklists] <── (Gateway Exporter) <── (Mapping Database)
                                                 │
                                                 ▼
                                     [Regulatory Changelogs]
```

1.  **Ingestion:** The scraper scans official RSS feeds or legislative APIs, pulling new articles.
2.  **Parsing:** Raw text is divided into structured articles, section numbers, and provisions.
3.  **Mapping:** The database engine queries these clauses to identify affected engineering controls (e.g. Risk, Vendor, Security limits).
4.  **Serialization:** Updated checklists are compiled and written locally, exporting a `regulation-change` payload.

---

## 🔗 Integration with `caesar-ai-evidence`

`caesar-ai-regulation-watch` maps all output payloads to ecosystem schemas. Specifically:
- **`control` schema:** Mapped statutory requirements flow directly into control libraries.
- **`regulation-change` schema:** Tracks statutory adjustments over time, preserving historic legal baselines.

---

## 📊 Future UI, Reporting & API Expectations

*   **Public Regulation Timelines:** Self-contained static site engines will allow hosting community dashboards displaying AI regulatory changes.
*   **OS Checklist Ingestion:** Webhook endpoints will stream compiled checklists to `caesar-ai-governance-os`, enabling corporate compliance platforms to adjust their audit parameters in response to legal updates.
