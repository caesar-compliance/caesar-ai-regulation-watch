# Public Deployment Baseline

**Phase:** v0.9.1 — competitor-assisted official source discovery  
**Deployment date:** 20 May 2026  
**Status:** Live — custom domain deploy run [26133482897](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26133482897)

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Product version** | `v0.9.1` |
| **Deployment ID** | `DEPLOY-20260520-008` (see [DEPLOYMENTS.md](../DEPLOYMENTS.md)) |
| **Deployed commit** | `8040212` (`merge: v0.9.1 official source discovery expansion`) |
| **Latest workflow run ID** | [26133482897](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26133482897) |
| **Prior deploy** | `6779c28` — v0.9.0 run [26132704545](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26132704545) |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **Trigger** | `workflow_dispatch` with `confirm_disclaimers=DEPLOY` |
| **Canonical public URL** | https://regulation-watch.caesar.no/ |
| **Domain mode** | custom-domain-root (`/`) |
| **Legacy project URL** | https://caesar-compliance.github.io/caesar-ai-regulation-watch/ — **301 redirect** to custom domain |
| **Hosting** | GitHub Pages (`build_type: workflow`) |
| **Custom domain** | `regulation-watch.caesar.no` (CNAME → `caesar-compliance.github.io`) |

---

## Smoke-tested URLs (20 May 2026 — v0.9.1)

Base `https://regulation-watch.caesar.no/` — see [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

**Verified:**

- Home/footer show **v0.9.1** (no stale v0.5.1 / v0.8.4 / v0.8.3 labels).
- `/source-discovery/` HTTP 200; competitor-assisted policy warning visible.
- `data/source-discovery-leads.json` — 26 leads, 22 official confirmed.
- `snapshot.version` = **0.9.1**; `source_discovery_lead_count` = **26**; `client_use_allowed` = **0**; `final_evidence_allowed` = **0**.
- 35 official sources in registry (9 new in v0.9.1).
- Disclaimer/methodology links present in footer.

---

## Policy baseline (unchanged)

- Evidence export **candidates** only; no final evidence export; no writes to caesar-ai-evidence.
- `client_use_allowed: true` — **0** in candidates and reviews.
- Not legal advice; no compliance guarantee; human review required before client use.
- Competitor trackers used as discovery leads only — see [COMPETITOR_ASSISTED_SOURCE_DISCOVERY_POLICY.md](COMPETITOR_ASSISTED_SOURCE_DISCOVERY_POLICY.md).

---

## Build parity command

```bash
npm run build:custom-domain
npm run verify:dist
```

Must match deploy workflow (`ASTRO_SITE=https://regulation-watch.caesar.no`, site root `/`).
