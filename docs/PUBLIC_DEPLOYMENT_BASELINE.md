# Public Deployment Baseline

**Phase:** v1.0.5 — automation-first tracker skeleton (T048)
**Deployment date:** 20 May 2026 (pending)
**Status:** Release candidate — deploy workflow TBD

---

## Deployment record

| Field | Value |
|---|---|
| **Product version** | `v1.0.5` |
| **Deployment ID** | `DEPLOY-20260520-023` — TBD |
| **Deployed commit** | TBD |
| **Git tag** | `regulation-watch-v1.0.5` — TBD (after successful deploy + smoke) |
| **Prior deploy** | v1.0.4 `5c19b28` — [26168769688](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26168769688) |
| **Public URL** | https://regulation-watch.caesar.no/ |

---

## Planned smoke tests (v1.0.5)

- `/`, `/tracker/`, `/updates/`, `/countries/` HTTP **200**
- `/data/country-status.json`, `/data/regulatory-updates.json`, `/data/automation-first-metrics.json`, `/data/tracker-topics.json` HTTP **200**
- Snapshot `version` **1.0.5**; conservative disclaimers; manual seed wording visible
- `verified_on_source_count` **0**; `client_use_allowed_count` **0**; `legal_change_claimed_count` **0**

## v1.0.5 scope (T048)

| Area | Result |
|---|---|
| **Tracker pages** | Map skeleton, country status list, regulatory updates feed with filters |
| **Seed data** | 13 jurisdictions, 15 updates, `automation_method: manual_seed` |
| **Automation** | No scraping; adapters deferred to T049 |

Not legal advice. Not client evidence. Not complete coverage.

---

## Previous baseline (v1.0.4)

See [DEPLOYMENTS.md](../DEPLOYMENTS.md) row `DEPLOY-20260520-022` for v1.0.4 autonomous verification worker deploy details.
