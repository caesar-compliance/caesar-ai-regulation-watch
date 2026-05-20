# Public Deployment Baseline

**Phase:** v1.0.5 — automation-first tracker skeleton (T048)
**Deployment date:** 20 May 2026
**Status:** Live — [26184820086](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26184820086)

---

## Deployment record

| Field | Value |
|---|---|
| **Product version** | `v1.0.5` |
| **Deployment ID** | `DEPLOY-20260520-023` |
| **Deployed commit** | `a153043847b8a76bc93e3c5af2574e7bcf864987` |
| **Git tag** | `regulation-watch-v1.0.5` → `a153043` |
| **Prior deploy** | v1.0.4 `5c19b28` — [26168769688](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26168769688) |
| **Public URL** | https://regulation-watch.caesar.no/ |
| **Deploy workflow** | Deploy static site (`.github/workflows/deploy-static-site.yml`) |

---

## Smoke-tested (20 May 2026)

All required URLs HTTP **200**:

- `/`, `/tracker/`, `/updates/`, `/countries/`
- `/data/country-status.json`, `/data/regulatory-updates.json`, `/data/automation-first-metrics.json`, `/data/tracker-topics.json`
- `/data/regulation-watch-snapshot.json` — `version` **1.0.5**

Conservative disclaimers and manual-seed wording visible on tracker surfaces. `verified_on_source_count` **0**; `client_use_allowed_count` **0**; `legal_change_claimed_count` **0**.

## v1.0.5 scope (T048)

| Area | Result |
|---|---|
| **Tracker pages** | Map skeleton, country status list, regulatory updates feed with filters |
| **Seed data** | 13 jurisdictions, 15 updates, `automation_method: manual_seed` |
| **Automation** | No scraping; live source adapter pipeline deferred to T049 |

## Remaining limitations

- **manual_seed only** — no live source adapter pipeline yet (T049).
- **CSS/SVG map skeleton** — not full choropleth.
- **13 pilot jurisdictions** — not complete global coverage.
- **Not legal advice** — not client evidence; evidence/client/final gates remain closed.

Not legal advice. Not client evidence. Not complete coverage.

---

## Previous baseline (v1.0.4)

See [DEPLOYMENTS.md](../DEPLOYMENTS.md) row `DEPLOY-20260520-022` for v1.0.4 autonomous verification worker deploy details.
