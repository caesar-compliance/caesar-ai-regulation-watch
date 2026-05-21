# Next Actions — Caesar AI Regulation Watch

**Last updated:** 21 May 2026
**Current codebase:** v1.0.12 (T051–T064) — live `DEPLOY-20260521-030`, commit `38af753`, tag `regulation-watch-v1.0.12`
**Live release:** v1.0.12 — deployed 21 May 2026
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

9. **T054 — Single-source network dry-run approval architecture** *(merged to main — PR #14, squash `78a00be`)*
   - Approval packet `T054-001`; planning-only plan generator; future runner refuses execution.
   - No live network; no scheduling; no publication; gates unchanged; no deploy/tag in T054.

10. **T055 — Execute one approved single-source network dry-run** *(merged to main — PR #15, squash `10bdc4c`)*
   - Execution registry `T055-001`; exactly one GET executed locally; metadata-only `generated/` output; not published; gates unchanged; no deploy/tag.

11. **T056 — Manual review promotion from network dry-run candidate** *(merged to main — PR #16, squash `74e04aa`)*
   - One local generated T055 dry-run candidate promoted to draft under `data/regulatory-updates/drafts/`; draft excluded from public exports; no new live network; not verified; not client/evidence use; no publication.

12. **T057 — Manual reviewer decision workflow for draft update** *(merged to main — PR #17, squash `413b87f`)*
   - `T057-001` records `request_changes` for `T056-001` draft; internal-draft-only scope; still no publication; gates unchanged; no live network in T057.

13. **T058 — Draft revision packet after request-changes** *(merged to main — PR #18, squash `3e5dce8`)*
   - `T058-001` revises T056 draft metadata-only after T057 `request_changes`; T056/T057/T058 excluded from public exports; no live network in T058; gates unchanged; no tag/deploy/closeout.

14. **T059 — Internal draft promotion readiness gate** *(merged to main — PR #19, squash `d25247d`)*
   - `T059-001` assesses revised T056 draft; `not_ready_for_publication_review`; next step source verification checklist; no tag/deploy yet.

15. **T060 — Source verification cockpit + checklist** *(merged, deployed v1.0.8 — PR #20)*
   - `/source-verification/` cockpit; checklist `T060-001`; pending verification only; gates unchanged.

16. **T061 — Manual source URL verification result capture** *(merged, deployed v1.0.9 — PR #21)*
   - Record pass/fail per checklist item; keep `verified_on_source` false until final legal approval.

17. **T062 — Final legal review packet UI** *(merged, deployed v1.0.10 — PR #22)*

18. **T063 — Final legal reviewer decision capture** *(merged, deployed v1.0.11 — PR #23)*

19. **T064 — Legal review revision response UI** *(merged, deployed v1.0.12 — PR #24)*

20. **T065 — Final reviewer re-check packet** *(next)*
   - Show T064 response; conservative re-check decision record; still no publication; gates false.

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
