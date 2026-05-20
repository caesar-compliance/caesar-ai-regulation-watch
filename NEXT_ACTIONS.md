# Next Actions — Caesar AI Regulation Watch

**Last updated:** 21 May 2026
**Current codebase:** v1.0.8 (T051 profiles + drilldowns; T052 allowlist; T053 manual intake) — tag/deploy pending future approval
**Live release:** v1.0.7 (T050) — deployed `DEPLOY-20260520-025`, commit `86c9262`, tag `regulation-watch-v1.0.7`
**Product direction:** Automation-first global AI regulation tracker and news intelligence dashboard

---

## Immediate Control Tower sequence

1. **T046 — Automation-first documentation rebase** *(merged)*
   - Automation-first product charter and reference-driven build policy.
   - Human review reframed as optional future assurance layer.

2. **T047 — Competitor and open-source reference study** *(merged)*
   - Reference lab study docs; T048 implementation plan.

3. **T048 — Automation-first tracker skeleton** *(merged, released, deployed v1.0.5)*
   - Country status + regulatory update YAML seeds and schemas.
   - Public pages: `/tracker/`, `/updates/`, `/countries/` with map skeleton, filters, metrics.
   - JSON exports: `country-status.json`, `regulatory-updates.json`, `automation-first-metrics.json`.

4. **T049 — Source adapter pipeline for updates feed** *(merged, released, deployed v1.0.6)*
   - Offline metadata adapter: `npm run build:regulatory-updates` → `data/regulatory-updates/generated-from-metadata.yml`.
   - Feed: 33 updates (`manual_seed` 15 + `offline_metadata_adapter` 18); method filter and badges on public pages.
   - Live API/RSS scheduling and fetch adapters remain separate (Phase 2 P2-01).

5. **T050 — Choropleth map + compare jurisdictions** *(merged, released, deployed v1.0.7)*
   - Choropleth-style status panel on `/tracker/`; `/compare/` for 2–4 jurisdictions.
   - Tracker scoring metadata; `jurisdiction-comparison.json` export.
   - No GPL map copy; no scraping; gates remain closed.

6. **T051 — Richer country profiles + regional/topic drilldowns** *(merged to main — PR #11)*
   - Richer `/jurisdictions/[id]/` profiles; `/regions/` and `/topics/` drilldowns; JSON exports.
   - Tag `regulation-watch-v1.0.8`, deploy, and closeout pending future Control Tower approval.

7. **T052 — API/RSS source adapter planning + allowlist architecture** *(merged to main — PR #12, squash `f3d2055`)*
   - Allowlist schema, draft registry, validation, fixture-only parser, `/source-adapters/` page.
   - No live collection; no scheduled crawl; gates remain closed; no deploy/tag in T052.

8. **T053 — Manual approved source intake runner** *(merged to main — PR #13, squash `0469a9e`)*
   - Pilot `edpb-publications-rss`; fixture-first CLI; `manual-intake-runs.yml`; no live network; no deploy/tag in T053.

9. **T054 — Approved single-source network dry-run design** *(recommended next)*
   - Manual-only network dry-run spec; explicit Control Tower approval; no scheduling; no publication.

---

## Standing boundaries

**Allowed:**

- automation-first source monitoring;
- official API/RSS/feed adapters;
- public page monitoring for approved sources;
- confidence labels;
- source-linked summaries;
- reference-driven implementation per [REFERENCE_DRIVEN_BUILD_POLICY.md](docs/REFERENCE_DRIVEN_BUILD_POLICY.md).

**Not allowed without separate approval:**

- `client_use_allowed: true` or `final_evidence_allowed: true`;
- client evidence export;
- legal advice claims;
- broad uncontrolled scraping;
- WAF/CAPTCHA/stealth bypass;
- competitor dataset copying;
- GPL/proprietary code import into the repo;
- writes to `caesar-ai-evidence`.

---

## Strategy references

| Document | Purpose |
|---|---|
| [docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md](docs/AUTOMATION_FIRST_PRODUCT_CHARTER.md) | Product north star |
| [docs/FIRST_FULL_MVP_REQUIREMENTS.md](docs/FIRST_FULL_MVP_REQUIREMENTS.md) | First full MVP definition |
| [docs/AUTOMATION_FIRST_MVP_ROADMAP.md](docs/AUTOMATION_FIRST_MVP_ROADMAP.md) | Phased delivery after rebase |
| [docs/REFERENCE_DRIVEN_BUILD_POLICY.md](docs/REFERENCE_DRIVEN_BUILD_POLICY.md) | License and reference rules |
