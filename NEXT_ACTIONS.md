# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

**Current version:** v1.0.0-rc1 · **Phase:** public technical MVP candidate · **Branch:** `main` (after merge)

**Canonical URL:** https://regulation-watch.caesar.no/

**Important:** v1.0.0-rc1 is a **release candidate**, not final v1.0.0. Control Tower sign-off required before final tag.

---

## Immediate priority (Control Tower)

1. **Review RC decision record** — [docs/V1_RELEASE_CANDIDATE_DECISION_RECORD.md](docs/V1_RELEASE_CANDIDATE_DECISION_RECORD.md).
2. **Review scope freeze** — [docs/V1_TECHNICAL_MVP_SCOPE_FREEZE.md](docs/V1_TECHNICAL_MVP_SCOPE_FREEZE.md).
3. **Decide final v1.0.0 path** — approve final v1.0.0, require source verification first, or keep as RC ([docs/V1_MVP_BLOCKERS_AND_DECISIONS.md](docs/V1_MVP_BLOCKERS_AND_DECISIONS.md)).
4. **Optional** — UNESCO `check_artifact` confirm on official source; Australia / EUR-Lex / EDPB human browser verification.

---

## Completed (v0.9.x → v1.0.0-rc1)

- v0.9.9 MVP readiness audit — deployed `DEPLOY-20260520-016`; tag `regulation-watch-v0.9.9`.
- v0.9.8 manual artifact workflow — deployed `DEPLOY-20260520-015`; tag `regulation-watch-v0.9.8`.
- v0.9.7 live metadata triage — benign NIST/UK GOV; UNESCO `check_artifact`.
- v0.9.6 cautious live metadata pilot — 5 allowlisted URLs.
- v0.9.5 monitoring adapter pack — deterministic pack run v095.
- v0.9.4 watcher eligibility — 15 entries.
- v0.9.3 targeted verification — Australia, EUR-Lex, EDPB documented.
- v0.9.2 content review batch — v0.9.1 records.
- v0.9.1 source discovery — 26 leads.

---

## Deployment (ongoing)

1. **Pre-deploy:** [docs/PUBLIC_RELEASE_CHECKLIST.md](docs/PUBLIC_RELEASE_CHECKLIST.md) and [docs/V1_RELEASE_CANDIDATE_CHECKLIST.md](docs/V1_RELEASE_CANDIDATE_CHECKLIST.md).
2. **Build parity:** `npm run build:custom-domain` + `npm run verify:dist`.
3. **Post-deploy:** smoke tests; update `DEPLOYMENTS.md` and `docs/PUBLIC_DEPLOYMENT_BASELINE.md`.
4. **Tag:** annotated tag on **deployed** main commit only (`regulation-watch-v1.0.0-rc1`).

---

## Commands

```bash
npm run build:custom-domain
npm run verify:dist
npm run validate:data
npm run generate:evidence-candidates
npm run generate:exports
npm run monitoring:pack
npm run monitoring:live-artifact    # local artifact pack (tmp/)
npm run monitoring:policy-check
```

---

## Not in scope

- Final evidence export to caesar-ai-evidence
- `client_use_allowed: true` on candidates or reviews
- Auto-deploy on every merge to `main`
- New jurisdictions or monitoring allowlist expansion (without Control Tower approval)
- Production-ready / complete coverage / legal advice claims
- Final v1.0.0 tag without Control Tower sign-off

See [ROADMAP.md](ROADMAP.md), [DEPLOYMENTS.md](DEPLOYMENTS.md), and [docs/PUBLIC_DEPLOYMENT_BASELINE.md](docs/PUBLIC_DEPLOYMENT_BASELINE.md).
