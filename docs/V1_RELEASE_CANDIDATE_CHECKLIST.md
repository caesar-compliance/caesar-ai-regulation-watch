# v1.0.0 Release Candidate Checklist

**Last updated:** 20 May 2026  
**Prepared for:** Control Tower sign-off before `regulation-watch-v1.0.0` tag  
**Prerequisite:** v0.9.9 MVP readiness audit complete and deployed

Use this checklist when promoting from **technical MVP candidate** (v0.9.x) to **v1.0.0 release candidate**. All items must be explicitly checked or waived by Control Tower with documented reason.

---

## Build and CI

- [ ] `validate-and-build.yml` green on `main` (latest merge)
- [ ] `npm ci` succeeds locally and in CI
- [ ] `npm run generate:evidence-candidates` succeeds
- [ ] `npm run validate:data` succeeds (schemas + policy gates)
- [ ] `npm run generate:exports` succeeds
- [ ] `npm run build` succeeds
- [ ] `npm run build:custom-domain` succeeds (root `/`, `ASTRO_SITE=https://regulation-watch.caesar.no`)
- [ ] `npm run verify:dist` succeeds (no stale v0.5.1 / v0.8.4 / v0.8.3 labels; no wrong base path in HTML)

---

## Deploy and smoke

- [ ] `deploy-static-site.yml` run with `confirm_disclaimers=DEPLOY`
- [ ] Deployed commit SHA recorded in DEPLOYMENTS.md
- [ ] Deploy run ID recorded
- [ ] Public smoke tests pass — [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md)

### Required smoke URLs (HTTP 200)

- [ ] https://regulation-watch.caesar.no/
- [ ] https://regulation-watch.caesar.no/monitoring/
- [ ] https://regulation-watch.caesar.no/source-discovery/
- [ ] https://regulation-watch.caesar.no/content-review/
- [ ] https://regulation-watch.caesar.no/evidence-export-candidates/
- [ ] https://regulation-watch.caesar.no/exports/
- [ ] https://regulation-watch.caesar.no/methodology/
- [ ] https://regulation-watch.caesar.no/disclaimer/
- [ ] https://regulation-watch.caesar.no/search/
- [ ] https://regulation-watch.caesar.no/data/regulation-watch-snapshot.json
- [ ] https://regulation-watch.caesar.no/data/live-metadata-runs.json
- [ ] https://regulation-watch.caesar.no/data/change-review-packs.json
- [ ] https://regulation-watch.caesar.no/data/metadata-review-triage.json
- [ ] https://regulation-watch.caesar.no/data/monitoring-source-configs.json
- [ ] https://regulation-watch.caesar.no/data/monitoring-runs.json
- [ ] https://regulation-watch.caesar.no/feeds/changes.xml
- [ ] https://regulation-watch.caesar.no/pagefind/pagefind.js

### Smoke content checks

- [ ] Home/footer show correct product version (e.g. v1.0.0)
- [ ] No stale labels (v0.5.1 product preview, v0.8.4 footer, v0.8.3 pipeline)
- [ ] No `/caesar-ai-regulation-watch/` base path in custom-domain HTML
- [ ] Snapshot `version` matches deployed product version
- [ ] Disclaimers visible (not legal advice, not complete coverage)

---

## Data and governance counts

- [ ] Source-discovery counts reviewed (26 leads; confirmed/pending/rejected documented)
- [ ] Content-review counts reviewed (reviewed vs pending documented)
- [ ] Evidence candidate gates closed for any `ready_for_human_review` items intended for v1.0.0
- [ ] Monitoring gates safe — allowlist unchanged unless Control Tower approves expansion
- [ ] `legal_change_claimed` count **0** in triage and public exports
- [ ] Simulated detected-change candidates remain `blocked_simulation_only`

---

## Policy gates (must be zero / false)

- [ ] No `client_use_allowed: true` in any YAML/JSON data file
- [ ] No `final_evidence_allowed: true` in any YAML/JSON data file
- [ ] No `verified_on_source: true` on records unless Control Tower documents explicit approval
- [ ] No `legal_change_claimed: true` in monitoring triage
- [ ] No final evidence export artifacts or scripts writing to caesar-ai-evidence
- [ ] No new scheduled broad-crawl workflow added to production path
- [ ] No secrets committed; no backend/database/auth added
- [ ] No public copy claiming: production-ready, complete coverage, legal advice, compliance guarantee, client-ready evidence

---

## Monitoring workflow safety

- [ ] `manual-live-metadata-review.yml` remains `workflow_dispatch` only
- [ ] `confirm_live_metadata=RUN` required
- [ ] No auto-commit / auto-merge / deploy from manual monitoring workflow
- [ ] `npm run monitoring:policy-check` passes on artifact pack
- [ ] SCHEDULED_MONITORING_POLICY unchanged or stricter (no expanded allowlist without approval)

---

## Release hygiene

- [ ] Merge commit on `main` recorded
- [ ] Deploy commit equals tag commit (or tag points to deployed commit per hub standard)
- [ ] Annotated tag `regulation-watch-v1.0.0` created **after** successful deploy and smoke
- [ ] DEPLOYMENTS.md row added (DEPLOY-YYYYMMDD-NNN)
- [ ] docs/PUBLIC_DEPLOYMENT_BASELINE.md updated
- [ ] CHANGELOG.md v1.0.0 section complete
- [ ] Remote branches cleaned — ideally only `origin/main`
- [ ] No existing tags moved or deleted
- [ ] `main` branch not deleted

---

## Documentation sign-off

- [ ] [MVP_READINESS_AUDIT.md](MVP_READINESS_AUDIT.md) reviewed for v1.0.0
- [ ] [V1_MVP_BLOCKERS_AND_DECISIONS.md](V1_MVP_BLOCKERS_AND_DECISIONS.md) section A items resolved or waived
- [ ] README / PROJECT_STATE / NEXT_ACTIONS reflect v1.0.0 scope honestly

---

## Control Tower sign-off

| Field | Value |
|---|---|
| **Sign-off date** | |
| **Signed by** | |
| **Decision** | ☐ Proceed v1.0.0 RC · ☐ More source verification · ☐ Continue technical expansion |
| **Waivers** (section A items, if any) | |
| **Notes** | |

---

## v0.9.9 interim checklist (this release)

For the v0.9.9 technical release candidate pack only:

- [x] MVP readiness audit document created
- [x] v1.0.0 blockers document created
- [x] Release candidate checklist created
- [ ] Version bumped to 0.9.9 in package.json and project-version.ts
- [ ] CI green on feature branch and main
- [ ] Deploy + smoke + tag `regulation-watch-v0.9.9` on deployed commit
- [ ] Control Tower notified with final implementation report
