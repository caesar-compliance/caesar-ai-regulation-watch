# Acceleration Decision Matrix — Caesar AI Regulation Watch

**Prepared:** 19 May 2026  
**Version:** v0.3.3

Use with [docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md](THIRD_PARTY_CODE_AND_DATA_POLICY.md) and [research/THIRD_PARTY_ACCELERATION_AUDIT.md](../research/THIRD_PARTY_ACCELERATION_AUDIT.md).

**Legend — Recommended action:** adopt later · evaluate dependency · use as benchmark only · use API only · reject · manual review required

**Earliest safe phase:** v0.3.3 (CI/site) · v0.4 (watchers) · v0.5 (public) · v1.0+

---

## Competitors and data

| Candidate | Category | Acceleration value | License/legal risk | Technical complexity | Recommended action | Earliest safe phase |
|---|---|---|---|---|---|---|
| Techieray Tracker (UX) | Competitor | High — map-first UX | Low if benchmark only | Low | use as benchmark only | v0.5 |
| Techieray API | Commercial API | Medium — gap detection | Medium — no redistribution | Low | use API only (Commercial tier) or reject for public product | v1.0+ |
| VerifyWise tracker / platform | Competitor | High — status/timeline UX; evidence patterns | High if code copied | — | use as benchmark only; study done v0.3.3 | v0.4+ UX |
| DLA Piper matrix | Competitor | Medium — IA | Medium — content copyright | — | use as benchmark only | v0.5 |
| OECD Navigator | Policy data | Medium — taxonomy | Medium — terms | Medium | manual review required | v1.0+ |
| IAPP tracker | Competitor | Medium — audience framing | Medium | — | use as benchmark only | v0.5 |
| AI Legislation Tracker (MIT) | Open dataset | High — US/global seed | Low license; Medium data quality | Medium | evaluate dependency + manual review required | v0.5 |
| artificialintelligenceact.eu | Reference site | Medium — EU UX | Medium if text copied | — | use as benchmark only | v0.3.3 |
| Fairly map/repo | Competitor | Medium — status colors | **High** — no LICENSE | — | reject (data) until license verified | blocked |

---

## Open-source components

| Candidate | Category | Acceleration value | License/legal risk | Technical complexity | Recommended action | Earliest safe phase |
|---|---|---|---|---|---|---|
| Astro | SSG | High | Low | Low–Medium | adopt later | v0.4.0 |
| Leaflet | Map | High | Low | Low | adopt later | v0.5 |
| Pagefind | Search | High | Low | Low | adopt later | v0.5 |
| ajv | Validation | High | Low | Low | adopt later | v0.4.0 |
| MapLibre GL JS | Map | Medium | Low | Medium | evaluate dependency | v0.5 |
| D3 / Observable Plot | Charts | Medium | Low | Medium | adopt later | v0.5 |
| Lunr / FlexSearch | Search | Medium | Low | Low | evaluate dependency | v0.5 |
| Next.js | SSG | Medium | Low | Medium–High | evaluate dependency | v0.5 |
| rss-parser / feedparser | Watcher | High | Low | Low | adopt later | v0.4 |
| js-yaml / PyYAML | Build | High | Low | Low | adopt later | v0.4.0 |

---

## Official sources (pilot)

| Candidate | Category | Acceleration value | License/legal risk | Technical complexity | Recommended action | Earliest safe phase |
|---|---|---|---|---|---|---|
| EU AI Office | Official | High | Low | Low | adopt later (RSS/HTML watch) | v0.4 |
| Datatilsynet | Official | High | Low | Low | adopt later | v0.4 |
| EDPB / EDPS | Official | Medium | Low | Low | adopt later | v0.4 |
| EUR-Lex / Cellar API | Official | High | Low–Medium | High | adopt later | v0.4+ |
| Regjeringen.no | Official | High | Low | Medium | adopt later | v0.4 |
| UK legislation.gov.uk | Official | Medium | Low (OGL) | Medium | adopt later | v1.0+ |
| US Congress.gov API | Official | Medium | Low | Medium | adopt later | v1.0+ |
| OECD / UNESCO / G7 | Reference | Low | Medium | Low | manual review required | v1.0+ |

---

## Caesar-native (no third-party import)

| Candidate | Category | Acceleration value | Risk | Complexity | Recommended action | Phase |
|---|---|---|---|---|---|---|
| Existing YAML + JSON Schema | Internal | **Highest** | Low | Low | adopt later (extend only) | **now** |
| Evidence export contract | Internal | High | Low | Low | adopt later | v0.3.1 done |
| Taxonomies + review workflow | Internal | High | Low | Low | adopt later | v0.3.1 done |
| Static site from `data/` | Internal | High | Low | Medium | adopt later | v0.4.0 |
| VerifyWise clean-room study | Internal | High | Low | Low | **done** (v0.3.3) | v0.3.3 |

---

## Quick decisions (v0.3.3)

| Do now | Do not do until v0.4.0 approved |
|---|---|
| Approve v0.4.0 Astro static site plan | Copy VerifyWise code or UI |
| Implement clean-room site from YAML | Import competitor datasets |
| Align evidence export with hub | Embed Techieray widget |
| Study complete — see VERIFYWISE_ARCHITECTURE_STUDY | Add watchers before static site |

---

## Review cadence

Re-run this matrix when:

- a new dependency is proposed;
- a commercial API contract is signed;
- a new jurisdiction enters the registry;
- Fairly or other blocked entries publish a clear license.
