# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026
**Current live technical base:** v1.0.4 — [regulation-watch.caesar.no](https://regulation-watch.caesar.no/)
**Product direction:** Automation-first global AI regulation tracker and news intelligence dashboard

---

## Immediate Control Tower sequence

1. **T046 — Automation-first documentation rebase** *(this branch)*
   - Add automation-first product charter and reference-driven build policy.
   - Update README / PROJECT_STATE / NEXT_ACTIONS.
   - Update competitor benchmarks and monitoring docs.
   - Reframe human review as optional future assurance layer.

2. **T047 — Competitor and open-source reference study**
   - Study Techieray, The Legal Wire, IAPP, DLA Piper, Bird & Bird.
   - Clone and inspect `delschlangen/ai-legislation-tracker` and `riadeane/airegulationmap` **outside** the repo.
   - Produce Caesar-native feature map and architecture notes per [REFERENCE_REPO_STUDY_TEMPLATE.md](docs/REFERENCE_REPO_STUDY_TEMPLATE.md).

3. **T048 — Automation-first data model**
   - Create/update schemas for jurisdictions, regulatory updates, source checks, confidence, update types and metrics.
   - Make update/newsfeed records first-class per [FIRST_FULL_MVP_REQUIREMENTS.md](docs/FIRST_FULL_MVP_REQUIREMENTS.md).

4. **T049 — Public tracker UI architecture**
   - Plan world map, country profiles, update feed, filters and metrics.
   - Decide map library and data flow per [UI_UX_VISION.md](docs/UI_UX_VISION.md).

5. **T050 — First automated update adapters**
   - Implement safe official-source adapters using API/RSS/feed-first approach.
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
