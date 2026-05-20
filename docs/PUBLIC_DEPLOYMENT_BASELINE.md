# Public Deployment Baseline

**Phase:** v0.9.6 — cautious live metadata pilot  
**Deployment date:** 20 May 2026  
**Status:** Live — custom domain deploy run [26161681675](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26161681675)

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Product version** | `v0.9.6` |
| **Deployment ID** | `DEPLOY-20260520-013` (see [DEPLOYMENTS.md](../DEPLOYMENTS.md)) |
| **Deployed commit** | `644c448` (`merge: v0.9.6 live metadata pilot`) |
| **Latest workflow run ID** | [26161681675](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26161681675) |
| **Prior deploy** | v0.9.5 `5d43122` — run [26160894726](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26160894726) |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **Trigger** | `workflow_dispatch` with `confirm_disclaimers=DEPLOY` |
| **Canonical public URL** | https://regulation-watch.caesar.no/ |
| **Domain mode** | custom-domain-root (`/`) |
| **Hosting** | GitHub Pages (`build_type: workflow`) |
| **Custom domain** | `regulation-watch.caesar.no` |

---

## Smoke-tested URLs (20 May 2026 — v0.9.6)

Base `https://regulation-watch.caesar.no/` — see [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

**Verified:**

- Home/footer show **v0.9.6** (no stale v0.5.1 / v0.8.4 / v0.8.3 labels).
- `/monitoring/` HTTP 200 — **Cautious live metadata pilot** section visible; allowlist **5** sources.
- `data/live-metadata-runs.json` — run `live-metadata-run-2026-05-20-v096`; `metadata_check_ok: 2`, `metadata_changed_needs_review: 3`, `metadata_check_failed: 0`.
- `data/change-review-packs.json` — pack `change-review-pack-2026-05-20-v096`.
- `snapshot.version` = **0.9.6**; `live_metadata_pilot_source_count` = **5**; `live_metadata_client_use_allowed_count` = **0**.
- Prior v0.9.5 monitoring exports and discovery/content/evidence pages remain HTTP 200.

---

## Policy reminders (unchanged)

- Cautious live metadata pilot only — not scheduled broad monitoring; max one request per allowlisted URL.
- Metadata headers/title only; no full legal text storage; no link crawl; no WAF bypass.
- Not legal advice; not client evidence; `client_use_allowed: 0`; no final evidence export.
- Blocked/manual-only unchanged: EUR-Lex CELEX, EDPB AI topic, Australia industry.gov.au (excluded from live allowlist).
