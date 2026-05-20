# Competitor Feature Matrix — Regulation Watch

**Date:** 20 May 2026  
**Purpose:** Compare automation-first MVP feature categories across Caesar v1.0.4 and reference benchmarks.  
**Policy:** Patterns only — no competitor code, data, or copy in Caesar repo.

**Legend:** ✅ strong / shipped · ◐ partial / skeleton · ⬜ absent or unknown · 🔒 login/paywall · 📖 reference-only open source

---

## Matrix

| Feature | Caesar v1.0.4 | Techieray | The Legal Wire | IAPP | DLA Piper | Bird & Bird | delschlangen | riadeane |
|---------|:-------------:|:---------:|:--------------:|:----:|:---------:|:-----------:|:------------:|:--------:|
| **World map** | ◐ markers only | ✅ svgMap choropleth | ✅ WP map embed | ◐ (hydrated app) | ⬜ guide-first | ⬜ table hub | ⬜ table UI | ✅ D3 choropleth |
| **Country pages** | ✅ `/jurisdictions/` | ✅ detail panel | ✅ cards + detail | ◐ resource framing | ✅ per-country guides | ✅ 22+ jurisdiction routes | ◐ via table rows | ✅ click panel |
| **Country status** | ◐ pilot labels | ✅ map colors | ✅ snapshots | ◐ tracker badges | ✅ framework summaries | ✅ color matrix | ✅ `status` field | ✅ multi-score dimensions |
| **Legal/policy records** | ✅ `/records/` | ◐ in panel | ✅ standardized summaries | ◐ | ✅ deep guides | ✅ per-country sections | ✅ JSON entries | ✅ narrative CSV fields |
| **Newsfeed/updates** | ◐ `/changes/` sample | ✅ curated news module | ◐ site newsroom | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **Timeline** | ✅ `/timelines/` | ◐ insights | ⬜ | ⬜ | ◐ edition snapshots | ⬜ | ◐ deadlines in data | ✅ history scrubber |
| **Filters** | ◐ limited | ✅ tabs + search | ◐ client-side | ◐ | ✅ multi-country checkboxes | ◐ by country button | ✅ tag/status/jurisdiction CLI | ✅ score dimension selector |
| **Search** | ✅ Pagefind | ✅ jurisdiction search | ◐ | ⬜ | ◐ | ⬜ | ✅ full-text CLI | ✅ country search |
| **Metrics dashboard** | ◐ home stats | ✅ insights + vibe meter | ⬜ | ⬜ | ◐ Q3 snapshot framing | ◐ status table image | ✅ generated MD dashboard | ◐ score aggregates |
| **Source links** | ✅ `/sources/` | ◐ | ✅ explicit source links | ◐ citations | ✅ guide attribution | ◐ firm pages | ✅ `source_url` required | ✅ Sources column |
| **API/RSS/JSON** | ✅ JSON exports | ✅ API/widget tab | ⬜ | ⬜ | 🔒 Intelligence login | ⬜ | ⬜ static JSON files | ⬜ static CSV/JSON |
| **AI search** | ⬜ | ✅ chatbot tab | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **Evidence/human review** | ✅ queues (v1 focus) | ⬜ | ⬜ | ◐ editorial trust | ◐ firm research | ◐ professional CTA | ⬜ | ⬜ |
| **Public exports** | ✅ `/exports/` | ✅ embed widget | ⬜ | ⬜ | 🔒 | ⬜ | ✅ JSON in repo | ✅ public CSV |
| **Open-source availability** | ✅ product repo | ⬜ proprietary | ⬜ proprietary | ⬜ proprietary | ⬜ proprietary | ⬜ proprietary | ✅ MIT | ✅ GPL-3.0 |
| **License/reuse notes** | Caesar BSL/policy | **Proprietary** — patterns only | **Proprietary** | **Proprietary** | **Proprietary**; login tier | **Proprietary** | **MIT** — rewrite default | **GPL-3.0** — reference-only |

---

## Caesar v1.0.4 notes (technical base)

**Strengths today:** Official-source registry, watchers, verification tooling, jurisdiction/record/timeline pages, Pagefind search, JSON exports, monitoring artifacts.

**Gaps vs automation-first MVP:** Interactive status map, newsfeed-style `regulatory_update` stream, topic/region filters on feed, metrics page aligned to competitor dashboards, automation-first home narrative (human-review banner still prominent on live home).

---

## Competitor clusters

| Cluster | Members | Caesar takeaway |
|---------|---------|-----------------|
| **Map + feed products** | Techieray, Legal Wire, riadeane | Primary UX target for first full MVP |
| **Data-first open** | delschlangen | Schema and verification discipline |
| **Law-firm guides** | DLA Piper, Bird & Bird, IAPP | Country page IA, trust signals, compare/matrix |
| **Automation platform** | Caesar (target) | Feed-first automation + exports + optional evidence later |

---

## License/reuse summary

| Source | Reuse stance |
|--------|----------------|
| Caesar | N/A — native implementation |
| Techieray, Legal Wire, IAPP, DLA Piper, Bird & Bird | UX/product patterns only |
| delschlangen | MIT — study schema/CLI; rewrite; attribute if importing code |
| riadeane | GPL-3.0 — no code copy; choropleth/score **ideas** only |

---

## Related docs

- [PUBLIC_COMPETITOR_UX_FINDINGS.md](PUBLIC_COMPETITOR_UX_FINDINGS.md)
- [OPEN_SOURCE_ARCHITECTURE_FINDINGS.md](OPEN_SOURCE_ARCHITECTURE_FINDINGS.md)
- [AUTOMATION_FIRST_IMPLEMENTATION_BACKLOG.md](AUTOMATION_FIRST_IMPLEMENTATION_BACKLOG.md)
- [FIRST_FULL_MVP_REQUIREMENTS.md](FIRST_FULL_MVP_REQUIREMENTS.md)
