# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

**Current version:** v0.8.6 · **Phase:** public pilot + first content review batch · **Branch:** `main`

**Live site:** https://caesar-compliance.github.io/caesar-ai-regulation-watch/

---

## Immediate priority — redeploy and follow-up review

1. **Redeploy** after v0.8.6 merge: Actions → **Deploy static site** → `confirm_disclaimers=DEPLOY` (public site was on pre–v0.8.6 commit `6f28ade`).
2. Second content review batch: remaining registry records; EUR-Lex deep pass for `law-eu-ai-act-2024-1689` key_dates; Datatilsynet AI-theme subpage URL.
3. Human export review for 2 `ready_for_human_review` manual sample candidates — still **not** final evidence (`client_use_allowed` must remain 0).

---

## Deployment (ongoing)

1. **Redeploy:** Actions → **Deploy static site** → `confirm_disclaimers: DEPLOY` (not automatic on merge).
2. **Pre-deploy:** `docs/PUBLIC_RELEASE_CHECKLIST.md`.
3. **Post-deploy:** `docs/POST_DEPLOY_SMOKE_TESTS.md`; update `docs/PUBLIC_DEPLOYMENT_BASELINE.md` if baseline changes.
4. **Custom domain** (`regulations.caesar.no`) — deferred; requires DNS + TLS + base path change (separate Control Tower approval).

---

## Monitoring (unchanged)

1. Scheduled monitoring remains artifact-only (no deploy from monitoring).
2. Optional `create_pr=true` trial after meaningful watcher changes.
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

## Not in scope (v0.8.5)

- Custom domain / DNS / Cloudflare
- Auto-deploy on every merge to `main`
- Coolify (no documented path in repo)
- Final evidence export to caesar-ai-evidence
- `client_use_allowed: true` on candidates

See [ROADMAP.md](ROADMAP.md), [docs/PUBLIC_DEPLOYMENT_BASELINE.md](docs/PUBLIC_DEPLOYMENT_BASELINE.md), and [docs/STATIC_DEPLOYMENT_ARCHITECTURE.md](docs/STATIC_DEPLOYMENT_ARCHITECTURE.md).
