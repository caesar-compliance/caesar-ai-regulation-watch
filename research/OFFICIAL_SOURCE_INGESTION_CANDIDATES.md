# Official Source Ingestion Candidates — Future Watchers

**Prepared:** 19 May 2026  
**Status:** Planning only — **no watchers implemented**

Pilot registry sources are marked **(in registry)**. This table extends to likely next jurisdictions.

**Ingestion methods:** `RSS` · `API` · `sitemap` · `static HTML` · `manual only`

**Risk / complexity:** Low · Medium · High

---

## Pilot registry (EU & Norway) — recommended watcher order

| # | Source name | Jurisdiction | Source URL (canonical) | Source type | Likely ingestion | Expected update types | Risk / complexity | Pilot order |
|---|---|---|---|---|---|---|---|---|
| 1 | EUR-Lex (EU AI Act CELEX) **(in registry)** | EU | https://eur-lex.europa.eu/ | Legislation database | API + stable URLs | Consolidated text, amendments, OJ publication | **High** / Medium | **1** |
| 2 | EU AI Office **(in registry)** | EU | https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai | Regulator hub | RSS / static HTML | Guidance, implementation updates, FAQs | Medium / Low | **2** |
| 3 | EU AI Act portal (Commission) **(in registry)** | EU | https://artificialintelligenceact.eu/ — **link only**; watch via EUR-Lex/Office | Reference | manual only for Caesar primary | — | Low / Low | — (not primary watcher) |
| 4 | EDPB **(in registry)** | EU | https://www.edpb.europa.eu/ | Supervisory board | RSS / static HTML | Guidelines, statements, AI-related opinions | Medium / Low | **3** |
| 5 | EDPS **(in registry)** | EU | https://www.edps.europa.eu/ | Supervisor | RSS / static HTML | Opinions, guidance | Medium / Low | **4** |
| 6 | Norway — AI Act implementation **(in registry)** | Norway | https://www.regjeringen.no/ | Government | static HTML / sitemap | Implementation bills, consultation, adoption | Medium / Medium | **5** |
| 7 | Datatilsynet **(in registry)** | Norway | https://www.datatilsynet.no/ | DPA | RSS / static HTML | Guidance, enforcement, AI+privacy | Low / Low | **6** |

---

## EU institutional (extensions)

| Source name | Jurisdiction | Source URL | Source type | Likely ingestion | Expected update types | Risk / complexity | Pilot order |
|---|---|---|---|---|---|---|---|
| Official Journal of the EU | EU | https://eur-lex.europa.eu/oj/ | Legal gazette | API (EUR-Lex) | New acts, corrigenda | High / High | After CELEX watcher stable |
| European Parliament — AI Act legislative procedure | EU | https://www.europarl.europa.eu/ | Legislature | static HTML | Procedure status (historical) | Medium / Medium | Manual / low priority |
| EU Council | EU | https://www.consilium.europa.eu/ | Institution | RSS | Council positions, adoption | Medium / Medium | 7+ |

---

## Norway (extensions)

| Source name | Jurisdiction | Source URL | Source type | Likely ingestion | Expected update types | Risk / complexity | Pilot order |
|---|---|---|---|---|---|---|---|
| Lovdata (statutes) | Norway | https://lovdata.no/ | Legal database | API/terms review | Statute text changes | **High** / High | After Regjeringen; verify license |
| Finanstilsynet | Norway | https://www.finanstilsynet.no/ | Sector regulator | RSS / static HTML | Financial AI guidance | Medium / Medium | 8+ |
| Nkom | Norway | https://www.nkom.no/ | Sector regulator | static HTML | Telecom/AI crossover | Low / Medium | 9+ |

---

## United Kingdom

| Source name | Jurisdiction | Source URL | Source type | Likely ingestion | Expected update types | Risk / complexity | Pilot order |
|---|---|---|---|---|---|---|---|
| legislation.gov.uk | UK | https://www.legislation.gov.uk/ | Legislation | API (OGL) | UK AI / data bills, SI | Medium / Medium | Post EU/Norway pilot |
| ICO — AI guidance | UK | https://ico.org.uk/ | Regulator | RSS | Guidance, enforcement | Low / Low | Post pilot |
| DSIT / GOV.UK AI policy | UK | https://www.gov.uk/government/organisations/department-for-science-innovation-and-technology | Government | RSS / static HTML | Policy papers | Medium / Low | Post pilot |

---

## United States

| Source name | Jurisdiction | Source URL | Source type | Likely ingestion | Expected update types | Risk / complexity | Pilot order |
|---|---|---|---|---|---|---|---|
| Congress.gov API | US federal | https://api.congress.gov/ | Legislature API | API | Bills, summaries (verify) | Medium / Medium | Phase 2 |
| Federal Register | US federal | https://www.federalregister.gov/ | Executive/regulatory | API / RSS | Rules, executive orders | Medium / High | Phase 2 |
| NIST AI RMF / publications | US federal | https://www.nist.gov/itl/ai-risk-management-framework | Standards body | static HTML / RSS | Framework updates | Low / Low | Phase 2 |
| State legislatures (e.g. CA, CO, TX) | US state | Various `.gov` | State law | API where available; else manual | State AI laws | **High** / High | Phase 3; use MIT tracker as gap list only |

---

## International organisations

| Source name | Jurisdiction | Source URL | Source type | Likely ingestion | Expected update types | Risk / complexity | Pilot order |
|---|---|---|---|---|---|---|---|
| OECD.AI policy database | Multilateral | https://oecd.ai/en/dashboards/overview | Policy repository | API/terms review | Policy metadata | Medium / Medium | Reference + manual |
| UNESCO AI ethics / policy | Multilateral | https://www.unesco.org/en/artificial-intelligence | Organisation | static HTML | Recommendations | Low / Low | Manual only |
| G7 Hiroshima / ministerial | Multilateral | https://www.g7hiroshima.go.jp/ (archived) + successor hosts | Summit docs | manual only | Declarations | Low / Low | Manual only |
| Council of Europe AI Convention | CoE | https://www.coe.int/en/web/artificial-intelligence | Treaty body | RSS / static HTML | Convention status | Medium / Medium | Phase 2 |

---

## Watcher design constraints (all sources)

1. Read `fetch_method` and rate limits from future `data/sources/` extensions.
2. Store `SourceSnapshot` with hash; never replace official text as “Caesar law”.
3. Default new `ChangeRecord` to `review_status: pending_review` and `record_origin: future_watcher_output`.
4. Respect robots.txt; prefer RSS/API over HTML scrape.
5. Control Tower approval before enabling each source in production CI.

---

## Recommended pilot rollout

```text
Phase A (v0.4):  EU AI Office RSS/HTML + Datatilsynet RSS
Phase B (v0.4):  EDPB + EDPS RSS
Phase C (v0.4+): EUR-Lex API (CELEX watch for AI Act)
Phase D (v0.5):  Regjeringen.no implementation pages
Phase E (post):  UK OGL sources, US Congress.gov, OECD manual cross-check
```

See [docs/PILOT_SOURCE_REGISTRY.md](../docs/PILOT_SOURCE_REGISTRY.md) for current static registry.
