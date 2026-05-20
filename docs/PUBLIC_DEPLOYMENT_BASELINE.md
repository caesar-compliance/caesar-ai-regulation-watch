# Public Deployment Baseline

**Phase:** v1.0.6 — offline metadata adapter for updates feed (T049)
**Deployment date:** 20 May 2026
**Status:** Deploy pending — `DEPLOY-20260520-024` (run TBD)

---

## Deployment record

| Field | Value |
|---|---|
| **Product version** | `v1.0.6` |
| **Deployment ID** | `DEPLOY-20260520-024` |
| **Deployed commit** | TBD |
| **Git tag** | `regulation-watch-v1.0.6` (after successful deploy + smoke) |
| **Prior deploy** | v1.0.5 `a153043` — [26184820086](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26184820086) |
| **Public URL** | https://regulation-watch.caesar.no/ |
| **Deploy workflow** | Deploy static site (`.github/workflows/deploy-static-site.yml`) |

---

## Expected smoke (post-deploy)

All required URLs HTTP **200**:

- `/`, `/tracker/`, `/updates/`, `/countries/`
- `/data/country-status.json`, `/data/regulatory-updates.json`, `/data/automation-first-metrics.json`, `/data/tracker-topics.json`
- `/data/regulation-watch-snapshot.json` — `version` **1.0.6**

Conservative disclaimers visible. Metadata adapter wording on tracker surfaces. `manual_seed_count` **15**; `offline_metadata_adapter_count` **18**; total **33** updates. `verified_on_source_count` **0**; `client_use_allowed_count` **0**; `legal_change_claimed_count` **0**.

## v1.0.6 scope (T049)

| Area | Result |
|---|---|
| **Offline adapter** | `npm run build:regulatory-updates` from repo-local monitoring/registry metadata |
| **Feed** | 33 updates with method filter; badges distinguish `manual_seed` vs `offline_metadata_adapter` |
| **Automation** | No scraping, crawling, or live network adapters |

## Remaining limitations

- **Offline metadata adapter only** — not live API/RSS fetch (Phase 2).
- **CSS/SVG map skeleton** — not full choropleth (T050).
- **13 pilot jurisdictions** — not complete global coverage.
- **Not legal advice** — not final evidence; not verified legal change; evidence/client/final gates remain closed.

Not legal advice. Not client evidence. Not complete coverage.

---

## Previous baseline (v1.0.5)

See [DEPLOYMENTS.md](../DEPLOYMENTS.md) row `DEPLOY-20260520-023` for v1.0.5 T048 tracker skeleton deploy details.
