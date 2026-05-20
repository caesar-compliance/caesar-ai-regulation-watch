# Automation-First Implementation Backlog — Regulation Watch

**Date:** 20 May 2026  
**Source:** T047 reference lab study (competitors + open source + Caesar v1.0.4 gap analysis)  
**Prerequisite:** Merge T046 strategy docs to `main` before treating as default-branch approved.

**Principles:**

- Automation-first public tracker (map, countries, feed, filters, metrics).
- Human review = optional future layer, not Phase 1–2 blocker.
- Official sources only; no competitor dataset import.
- Static Astro build; adapters produce YAML/JSON consumed at build time.

---

## Phase 1 — Tracker skeleton (MVP core UX)

**Goal:** User opens site and sees a credible global tracker — map, statuses, feed, filters, metrics — even with seeded/sample automation data.

| ID | Item | Priority | Notes |
|----|------|----------|-------|
| P1-01 | **Data model** — `country_status`, `regulatory_update`, `topic` entities + schemas | P0 | Align with `FIRST_FULL_MVP_REQUIREMENTS.md` |
| P1-02 | **Sample seed data** — 20–30 jurisdictions with status buckets | P0 | Official-source-linked placeholders; no competitor text |
| P1-03 | **Public world map skeleton** — clickable jurisdictions, status colors | P0 | Replace marker-only map; clean-room component |
| P1-04 | **Country status list** — sortable table/cards with badges | P0 | Legal Wire / Bird & Bird list patterns |
| P1-05 | **Updates/newsfeed page** — chronological `regulatory_update` list | P0 | Techieray-style feed |
| P1-06 | **Basic filters** — region, status, topic, date on feed | P0 | URL-query state |
| P1-07 | **Metrics cards** — home + dedicated metrics section | P0 | Counts: adopted, proposed, updates week/month |
| P1-08 | **Country profile refresh** — status, latest updates, sources block | P0 | Extend `/jurisdictions/[id]/` |
| P1-09 | **Home dashboard reframe** — automation-first hero, de-emphasize review queue | P0 | Copy from charter, not competitors |
| P1-10 | **Export hooks** — `regulatory_updates.json`, `country_status.json` | P1 | Validate in CI |

**Exit criteria:** Map + feed + metrics live on staging; schemas validate; docs match UI.

**Recommended task:** **T048** (subset of P1-01 through P1-08).

---

## Phase 2 — Automation depth

**Goal:** Feed and statuses driven by scheduled adapters, not manual seeds alone.

| ID | Item | Priority | Notes |
|----|------|----------|-------|
| P2-01 | **Source adapters** — API/RSS/feed-first for 5+ official sources | P0 | Reuse watcher patterns; extend to `regulatory_update` |
| P2-02 | **Update classification** — `update_type`, `legal_status`, topics | P0 | Deterministic rules before ML |
| P2-03 | **Duplicate detection** — same URL/title/hash jurisdiction | P0 | |
| P2-04 | **Timelines** — link updates to milestone timelines | P1 | Extend existing `/timelines/` |
| P2-05 | **Better search** — structured feed search + Pagefind sync | P1 | |
| P2-06 | **Map choropleth** — full status coloring from `country_status` | P1 | **T050 (in progress):** Caesar-native regional panel + tiles; no GPL map |
| P2-07 | **Compare jurisdictions** — 2–5 country delta view | P2 | **T050 (in progress):** `/compare/` for 2–4 pilot jurisdictions |
| P2-08 | **Edition snapshots** — quarterly `metric_snapshot` baseline | P2 | DLA Piper edition model |
| P2-09 | **Staleness alerts** — 90-day source re-check flags | P1 | riadeane `STALENESS_DAYS` pattern |
| P2-10 | **Monitoring integration** — detected-changes → regulatory_update pipeline | P1 | **T049 (deployed v1.0.6):** `offline_metadata_adapter` from repo-local metadata; no live fetch |

**Exit criteria:** ≥5 adapters run in CI schedule; feed updates without manual YAML edits for those sources.

---

## Phase 3 — Intelligence layer and integrations

**Goal:** Differentiators without compromising clean-room or evidence policy.

| ID | Item | Priority | Notes |
|----|------|----------|-------|
| P3-01 | **AI summaries** — draft update summaries, confidence-labeled | P2 | Never sole legal basis |
| P3-02 | **AI search** — natural language over public index | P3 | Defer past MVP |
| P3-03 | **RSS/Atom feeds** — public syndication | P1 | |
| P3-04 | **Widget/embed API** — read-only public JSON endpoints | P2 | Policy-gated |
| P3-05 | **Optional evidence/human-review layer** — premium queue, export gates | P3 | Not MVP foundation |
| P3-06 | **Governance OS inbox** — regulatory events to Caesar ecosystem | P3 | |

---

## Dependency graph (simplified)

```text
Phase 1 data model (P1-01)
  → map skeleton (P1-03) + feed (P1-05) + metrics (P1-07)
    → Phase 2 adapters (P2-01)
      → classification (P2-02) → Phase 3 AI (P3-01)
```

---

## Explicitly deferred (do not build in Phase 1–2)

- Techieray-style chatbot
- Competitor dataset import (delschlangen JSON bulk, riadeane CSV)
- WAF/bot bypass
- Client evidence export / `final_evidence_allowed`
- GPL frontend reuse
- Pixel-perfect competitor clones
- Paid auth dashboard

---

## Mapping to roadmap doc

| This backlog | `AUTOMATION_FIRST_MVP_ROADMAP.md` |
|--------------|-----------------------------------|
| Phase 1 | Roadmap Phase 2–3 (data + public UI) |
| Phase 2 | Roadmap Phase 4 (automation) |
| Phase 3 | Roadmap Phase 5+ (AI, API, evidence optional) |

T047 completes Roadmap **Phase 1 — Reference study sprint** deliverables.

---

## Related docs

- [T048_RECOMMENDED_IMPLEMENTATION_PLAN.md](T048_RECOMMENDED_IMPLEMENTATION_PLAN.md)
- [AUTOMATION_FIRST_MVP_ROADMAP.md](AUTOMATION_FIRST_MVP_ROADMAP.md)
- [FIRST_FULL_MVP_REQUIREMENTS.md](FIRST_FULL_MVP_REQUIREMENTS.md)
