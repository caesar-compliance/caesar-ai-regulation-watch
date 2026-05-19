# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.9.0` |
| **Current phase** | Public pilot — custom domain + deployment/version standard |
| **Status** | Deploy pending after merge; canonical URL **https://regulation-watch.caesar.no/** |
| **Working branch** | `agent/v0.9.0-versioned-custom-domain-cleanup` → merge to `main` |
| **Latest completed task** | Ecosystem versioning/deployment standard applied; custom-domain build configured |
| **Next recommended step** | Deploy via `deploy-static-site.yml`; smoke test custom domain; tag `regulation-watch-v0.9.0` |

---

## Versioning (ecosystem standard)

| ID type | Example | Use |
|---|---|---|
| Work item | `TXXX` | `work-items/` only — not public version |
| Product version | `v0.9.0` | Site footer, snapshot, `package.json` |
| Deployment ID | `DEPLOY-20260520-006` | One publish event — see [DEPLOYMENTS.md](DEPLOYMENTS.md) |
| Git tag | `regulation-watch-v0.9.0` | After successful deploy + smoke |

Hub standard: [VERSIONING_AND_DEPLOYMENT_STANDARD](https://github.com/caesar-compliance/caesar-ai-governance-hub/blob/main/docs/VERSIONING_AND_DEPLOYMENT_STANDARD.md)

---

## Static deployment

| Capability | Status |
|---|---|
| `DEPLOYMENTS.md` | Yes — deployment event log |
| `docs/PUBLIC_DEPLOYMENT_BASELINE.md` | Yes |
| `.github/workflows/deploy-static-site.yml` | Yes — `build:custom-domain`, root `/` |
| `npm run build:custom-domain` | Yes |
| GitHub Pages custom domain | **regulation-watch.caesar.no** (DNS CNAME → caesar-compliance.github.io) |
| Legacy project URL | `https://caesar-compliance.github.io/caesar-ai-regulation-watch/` — document after deploy |
| Auto-deploy on push | **No** |

---

## Policy baseline (unchanged)

- Evidence export **candidates** only; no final evidence export; no caesar-ai-evidence writes.
- `client_use_allowed: true` — **0** candidates and reviews.
- `final_evidence_allowed: true` — **0** reviews.
- Not legal advice; no compliance guarantee; pilot disclaimers required.
