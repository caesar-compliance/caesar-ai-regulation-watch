# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

**Current version:** v0.8.4 · **Phase:** static deployment readiness · **Branch:** `main`

---

## Immediate priority — enable and optionally deploy preview

1. **One-time:** GitHub → Settings → Pages → Source: **GitHub Actions** (see `docs/STATIC_DEPLOYMENT_ARCHITECTURE.md`).
2. Complete `docs/PUBLIC_RELEASE_CHECKLIST.md` before any public deploy.
3. Run **Deploy static site** workflow (`workflow_dispatch`) with `confirm_disclaimers: DEPLOY`.
4. Run `docs/POST_DEPLOY_SMOKE_TESTS.md` against the GitHub Pages URL.
5. Continue human content review (`content-review-2026-05-19.yml`) — deploy does not replace review.

---

## Content review and candidates (ongoing)

1. Complete browser content review for priority records.
2. `npm run generate:evidence-candidates && npm run build` after YAML updates.
3. Treat `/evidence-export-candidates/` as **candidates only** — not client evidence.

---

## Monitoring (unchanged)

1. Scheduled monitoring remains artifact-only.
2. Optional `create_pr=true` trial after meaningful changes.
3. Follow `docs/MONITORING_PR_REVIEW_CHECKLIST.md` before merging monitoring PRs.

---

## Commands

```bash
npm run build                    # local / CI (root base path)
npm run build:pages              # GitHub Pages base path (parity with deploy workflow)
ASTRO_BASE_PATH=/caesar-ai-regulation-watch/ npm run verify:dist  # after build:pages
npm run validate:data
npm run generate:evidence-candidates
```

---

## Not in scope (v0.8.4)

- Custom domain (`regulations.caesar.no`) / DNS / Cloudflare
- Auto-deploy on every merge to `main`
- Coolify (no documented path in repo)
- Final evidence export to caesar-ai-evidence
- `client_use_allowed: true` on candidates

See [ROADMAP.md](ROADMAP.md) and [docs/STATIC_DEPLOYMENT_ARCHITECTURE.md](docs/STATIC_DEPLOYMENT_ARCHITECTURE.md).
