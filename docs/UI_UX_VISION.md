# UI / UX Vision — Caesar AI Regulation Watch

**Prepared:** 19 May 2026  
**Status:** Design direction only (no UI implementation)

Public target: **regulations.caesar.no** (or static GitHub Pages during early phases).

---

## Design principles

1. **Source-first transparency** — every claim links to an official or registered authoritative URL.
2. **Map as front door** — global discovery before dense tables.
3. **Governance-oriented detail** — control and evidence tags visible without legal overclaim.
4. **Review-visible** — AI drafts labeled; human-reviewed content distinguished.
5. **Accessible and fast** — static-first where possible; progressive enhancement for globe.
6. **No compliance theater** — no green “compliant” badges for countries or companies.

---

## Information architecture

```text
Home (Globe + latest changes)
├── Explore by region
├── Search (global)
├── Changes feed (chronological)
├── Jurisdictions
│   └── [Country/region profile]
│       ├── Overview & status
│       ├── Laws & instruments
│       ├── Guidance
│       ├── Timeline
│       ├── Sources (registry)
│       └── Recent changes
├── Regulation / guidance detail
│   └── [Record page]
│       ├── Metadata & status label
│       ├── Source link (primary CTA)
│       ├── Timeline events
│       ├── Related changes
│       ├── Affected controls (tags)
│       └── Affected evidence (tags)
├── Change detail
│   ├── Diff / change summary
│   ├── Review status
│   └── Export / subscribe
├── Methodology & disclaimers
└── Developers (RSS, JSON, GitHub)
```

---

## Key screens

### 1. Home — global map / globe

**Inspired by (not copied from):** Techieray map-first entry, VerifyWise country grid, DLA Piper country selector.

**Caesar elements:**

- Interactive map or simplified globe (WebGL or SVG by phase).
- Jurisdiction markers colored by **dominant status label** (legend explains labels are tracked operational states).
- Side panel: **Latest changes** (global feed, filterable).
- Quick filters: EU, EEA, Norway, UK, US, “monitoring only”.
- Search bar with jurisdiction and keyword autocomplete.
- Footer disclaimer: not legal advice; coverage not complete.

### 2. Jurisdiction profile

**Inspired by:** DLA Piper country pages, OECD jurisdiction dashboards, IAPP tracker rows.

**Caesar elements:**

- Header: flag/icon, name, blocs, `last_reviewed_at`.
- **Coverage note** callout when depth is limited.
- Tabs: Overview | Laws | Guidance | Timeline | Sources | Changes.
- Regulator cards with external links (open in new tab).
- Status summary paragraph (human-written or reviewed AI).
- **Compare** button (select second jurisdiction — future).

### 3. Law / guidance detail

**Inspired by:** artificialintelligenceact.eu topic pages, VerifyWise regulation cards.

**Caesar elements:**

- Status badge (proposed / in force / guidance / etc.).
- Prominent **View official source** button.
- Key dates row (with “verify on source” microcopy).
- Topic tags (risk, transparency, GPAI, etc.).
- **Affected controls** and **Affected evidence** sections (tag chips + short rationale).
- Related changes timeline strip.

### 4. Change detail

**Inspired by:** Terms Watch / Vendor Watch change pages (ecosystem sibling pattern).

**Caesar elements:**

- Change type icon + detected date.
- Source credibility tier badge.
- Summary block with `AI draft` / `Reviewed` label.
- Optional diff viewer (text/HTML per license constraints).
- Export: JSON snippet, copy link, add to memo (future OS).
- Review status for internal curators (hidden on public until reviewed — policy TBD).

### 5. Changes feed

Chronological list with filters: jurisdiction, status, topic, date range, review status.

RSS subscribe CTA.

### 6. Methodology page

Explains:

- Official source-first policy.
- Credibility tiers.
- AI summary review process.
- What we do **not** guarantee.
- How to report source errors (GitHub issue link).

---

## Component library (conceptual)

| Component | Use |
|---|---|
| `StatusBadge` | Regulation status labels |
| `CredibilityBadge` | Source tier |
| `ReviewBadge` | pending / reviewed |
| `ControlTag` | Affected control chip |
| `EvidenceTag` | Affected evidence chip |
| `SourceCard` | Registry entry |
| `Timeline` | Vertical milestone list |
| `ChangeCard` | Feed item |
| `GlobeMap` | Home navigation |

Original Caesar visual design — do not clone competitor color systems or trademarks.

---

## Responsive behavior

- **Mobile:** list-first jurisdictions; map collapses to searchable country list.
- **Tablet/Desktop:** map + side feed split view.
- **Print/PDF export:** future Governance OS feature; not MVP.

---

## Accessibility

- Map alternative: full searchable jurisdiction index (WCAG).
- Keyboard navigation for filters and feeds.
- Sufficient contrast on status badges; do not rely on color alone.

---

## Future Governance OS embedded views

- **Regulatory Inbox:** same `ChangeCard` with assignee and task creation.
- **Client workspace:** filtered jurisdictions per client profile.
- **Report widget:** selected changes + evidence suggestions for export.

---

## Non-goals for UI

- User accounts on public site (v1).
- Chatbot that answers legal questions without disclaimers.
- “Compliance score” per country or company.
- Copying VerifyWise or Techieray layouts pixel-for-pixel.
