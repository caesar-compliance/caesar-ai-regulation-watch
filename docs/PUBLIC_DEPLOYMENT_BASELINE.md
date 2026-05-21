# Public Deployment Baseline

**Phase:** v1.0.13 live — T065 deployed 21 May 2026 (`DEPLOY-20260521-031`, commit `de3d8c8`, tag `regulation-watch-v1.0.13`). `/legal-review/` `T065-001` ready_for_publication_gate_review (internal only); not approved; gates closed.

**Deployment date:** 20 May 2026
**Status:** Deployed — `DEPLOY-20260520-025`, run [26189934284](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26189934284)

---

## Deployment record

| Field | Value |
|---|---|
| **Product version** | `v1.0.7` |
| **Deployment ID** | `DEPLOY-20260520-025` |
| **Deployed commit** | `86c9262` |
| **Git tag** | `regulation-watch-v1.0.7` |
| **Prior deploy** | v1.0.6 `1e8b7f0` — [26187837019](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26187837019) |
| **Public URL** | https://regulation-watch.caesar.no/ |
| **Deploy workflow** | Deploy static site (`.github/workflows/deploy-static-site.yml`) |

---

## Public smoke (post-deploy)

**Result:** pass

All required URLs HTTP **200**:

- `/`, `/tracker/`, `/updates/`, `/countries/`, `/compare/`
- `/compare/?ids=eu&ids=uk&ids=us-federal`
- `/data/country-status.json`, `/data/jurisdiction-comparison.json`, `/data/automation-first-metrics.json`, `/data/regulation-watch-snapshot.json`
- `version` **1.0.7** confirmed in snapshot

Conservative disclaimers visible. Choropleth map and legend on `/tracker/`. Heuristic maturity/activity wording. `verified_on_source_count` **0**; `client_use_allowed_count` **0**; `legal_change_claimed_count` **0**.

## v1.0.7 scope (T050)

| Area | Result |
|---|---|
| **Choropleth panel** | Regional status tiles colored by `status_bucket`; legend; maturity/activity indices |
| **Compare** | `/compare/` for 2–4 jurisdictions; `jurisdiction-comparison.json` export |
| **Automation** | No scraping, crawling, or live network adapters |

## Remaining limitations

- **Heuristic tracker metadata only** — not legal certainty or compliance scoring.
- **Simplified choropleth-style map** — not full precise geographic coverage.
- **Compare limited to 4 jurisdictions** — not multi-region bulk analysis.
- **13 pilot jurisdictions** — not complete global coverage.
- **Offline metadata adapter only** — not live API/RSS fetch (Phase 2).
- **Not legal advice** — not final evidence; not verified legal change; evidence/client/final gates remain closed.

Not legal advice. Not client evidence. Not complete coverage.

---

## Previous baseline (v1.0.6)

See [DEPLOYMENTS.md](../DEPLOYMENTS.md) row `DEPLOY-20260520-024` for v1.0.6 T049 offline metadata adapter deploy details.
