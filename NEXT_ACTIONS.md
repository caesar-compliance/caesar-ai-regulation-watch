# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026
**Current release:** v1.0.6 (T049 offline metadata adapter) — deployed `DEPLOY-20260520-024` (commit `1e8b7f0`, run [26187837019](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26187837019)); prior live v1.0.5 (`DEPLOY-20260520-023`, tag `regulation-watch-v1.0.5`)
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

5. **T050 — Choropleth map + compare jurisdictions** *(next implementation task)*
   - Safe official-source adapters using API/RSS/feed-first approach.
   - No WAF/CAPTCHA bypass; no stealth scraping; no full legal/source text storage.

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
