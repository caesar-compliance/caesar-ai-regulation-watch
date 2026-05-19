# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

**Current version:** v0.8.9 · **Phase:** public pilot + source verification refresh · **Branch:** `main`

**Live site:** https://caesar-compliance.github.io/caesar-ai-regulation-watch/

---

## Immediate priority

1. **EUR-Lex deep pass** for `law-eu-ai-act-2024-1689` — candidate `candidate-change-sample-eu-ai-act-status-change` is `needs_more_source_review`.
2. **Mapping review** — draft `regulation_watch.*` control/evidence refs (design only; no caesar-ai-evidence implementation without approval).
3. Second content review batch for remaining registry records; Datatilsynet AI-theme subpage URL.

---

## Deployment (ongoing)

1. **Redeploy:** Actions → **Deploy static site** → `confirm_disclaimers: DEPLOY` (not automatic on merge).
2. **Pre-deploy:** `docs/PUBLIC_RELEASE_CHECKLIST.md`.
3. **Post-deploy:** `docs/POST_DEPLOY_SMOKE_TESTS.md`; update `docs/PUBLIC_DEPLOYMENT_BASELINE.md` if baseline changes.
4. **Custom domain** (`regulations.caesar.no`) — deferred.

---

## Commands

```bash
npm run build                    # local / CI (root base path)
npm run build:pages              # GitHub Pages base path (parity with deploy workflow)
ASTRO_BASE_PATH=/caesar-ai-regulation-watch/ npm run verify:dist  # after build:pages
npm run validate:data
npm run generate:evidence-candidates
npm run generate:exports
```

---

## Not in scope (v0.8.7)

- Final evidence export to caesar-ai-evidence
- `client_use_allowed: true` on candidates or reviews
- Custom domain / DNS
- Auto-deploy on every merge to `main`

See [ROADMAP.md](ROADMAP.md), [docs/EVIDENCE_EXPORT_CANDIDATE_REVIEW_WORKFLOW.md](docs/EVIDENCE_EXPORT_CANDIDATE_REVIEW_WORKFLOW.md), and [docs/PUBLIC_DEPLOYMENT_BASELINE.md](docs/PUBLIC_DEPLOYMENT_BASELINE.md).
