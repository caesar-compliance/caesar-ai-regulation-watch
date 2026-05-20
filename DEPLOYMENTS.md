# Deployments — Caesar AI Regulation Watch

Authoritative log of **public deployment events**. Product version (`vX.Y.Z`) is separate from deployment ID and GitHub Actions run ID.

**Standard:** [caesar-ai-governance-hub — Versioning and Deployment](https://github.com/caesar-compliance/caesar-ai-governance-hub/blob/main/docs/VERSIONING_AND_DEPLOYMENT_STANDARD.md)

**Canonical public URL (v0.9.0+):** https://regulation-watch.caesar.no/

---

## Deployment table

| Deployment ID | Product Version | Date | Commit | GitHub Run ID | Environment | Public URL | Domain mode | Smoke test | Notes |
|---|---|---|---|---|---|---|---|---|---|
| DEPLOY-20260520-001 | v0.8.5 | 20 May 2026 | `57acfcf` | [26130431228](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26130431228) | github-pages | https://caesar-compliance.github.io/caesar-ai-regulation-watch/ | project-path | pass | First GitHub Pages pilot deploy. *Historical — partial record.* |
| DEPLOY-20260520-002 | v0.8.6 | 20 May 2026 | `956730b` | *see baseline* | github-pages | …/caesar-ai-regulation-watch/ | project-path | pass | Content review candidate refresh. *Historical — run ID in PUBLIC_DEPLOYMENT_BASELINE if updated.* |
| DEPLOY-20260520-003 | v0.8.7 | 20 May 2026 | `a3ded91` | *see baseline* | github-pages | …/caesar-ai-regulation-watch/ | project-path | pass | Export review gate. *Historical.* |
| DEPLOY-20260520-004 | v0.8.8 | 20 May 2026 | `52ac0c1` | *see baseline* | github-pages | …/caesar-ai-regulation-watch/ | project-path | pass | Public HTML version consistency. *Historical.* |
| DEPLOY-20260520-005 | v0.8.9 | 20 May 2026 | `4e987c0` | [26131903261](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26131903261) | github-pages | …/caesar-ai-regulation-watch/ | project-path | pass | Source verification refresh; superseded by custom domain. |
| DEPLOY-20260520-006 | v0.9.0 | 20 May 2026 | `6aedd49` | [26132437149](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26132437149) | github-pages | https://regulation-watch.caesar.no/ | custom-domain-root | pass | Ecosystem versioning standard; legacy project URL redirects here; tag `regulation-watch-v0.9.0`. *Superseded by DEPLOY-20260520-007 (commit alignment).* |
| DEPLOY-20260520-007 | v0.9.0 | 20 May 2026 | `6779c28` | [26132704545](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26132704545) | github-pages | https://regulation-watch.caesar.no/ | custom-domain-root | pass | v0.9.0 hygiene redeploy — live site aligned with tag `regulation-watch-v0.9.0` / docs commit on `main`. |

---

## How to record a new deployment

1. Run **Deploy static site** with `confirm_disclaimers=DEPLOY`.
2. After success, add a row with next `DEPLOY-YYYYMMDD-NNN`, product version, commit SHA, run ID, smoke result.
3. Update [docs/PUBLIC_DEPLOYMENT_BASELINE.md](docs/PUBLIC_DEPLOYMENT_BASELINE.md) summary if baseline changes.

---

## Legacy project URL

`https://caesar-compliance.github.io/caesar-ai-regulation-watch/` may continue to serve an older build or redirect depending on GitHub Pages configuration after custom-domain deploy. Document behavior in smoke test / baseline after v0.9.0 deploy.
