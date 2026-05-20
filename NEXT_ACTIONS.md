# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

**Current version:** v0.9.1 · **Phase:** public pilot — source discovery expansion · **Branch:** `main` (after merge)

**Canonical URL:** https://regulation-watch.caesar.no/

---

## Immediate priority

1. ~~**v0.9.1 source discovery**~~ — 24 leads, 9 new sources, policy + `/source-discovery/` page (deploy pending).
2. **Re-verify pending leads** — White House EO URL (404), Canada responsible-ai (fetch unclear), Australia industry principles (fetch failed).
3. **EUR-Lex deep pass** — EU AI Act candidate remains `needs_more_source_review`.
4. **Tag** — `regulation-watch-v0.9.1` after deploy smoke pass.

---

## Deployment (ongoing)

1. **Pre-deploy:** `docs/PUBLIC_RELEASE_CHECKLIST.md`.
2. **Build parity:** `npm run build:custom-domain` + `npm run verify:dist` (root `/`, no project base path).
3. **Post-deploy:** smoke tests; update `DEPLOYMENTS.md` and `docs/PUBLIC_DEPLOYMENT_BASELINE.md`.
4. ~~**Legacy URL**~~ — `https://caesar-compliance.github.io/caesar-ai-regulation-watch/` **301** to custom domain (may use `http://` target; HTTPS works on canonical host).

---

## Commands

```bash
npm run build                    # local / CI (root base path)
npm run build:custom-domain      # production custom domain (parity with deploy workflow)
npm run verify:dist              # after build:custom-domain
npm run build:pages              # legacy GitHub project path only (rollback reference)
npm run validate:data
npm run generate:evidence-candidates
npm run generate:exports
```

---

## Not in scope

- Final evidence export to caesar-ai-evidence
- `client_use_allowed: true` on candidates or reviews
- Auto-deploy on every merge to `main`

See [ROADMAP.md](ROADMAP.md), [DEPLOYMENTS.md](DEPLOYMENTS.md), and [docs/PUBLIC_DEPLOYMENT_BASELINE.md](docs/PUBLIC_DEPLOYMENT_BASELINE.md).
