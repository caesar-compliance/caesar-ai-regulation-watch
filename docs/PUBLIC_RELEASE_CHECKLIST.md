# Public Release Checklist

**Phase:** v0.8.4 — manual-gated static deploy  
**Use before:** `workflow_dispatch` → **Deploy static site** with `confirm_disclaimers: DEPLOY`

---

## Pre-deploy (repository)

- [ ] `main` branch CI green (`validate-and-build.yml`).
- [ ] Local parity passed: `npm run build` (or deploy pipeline steps).
- [ ] GitHub **Settings → Pages → Source: GitHub Actions** enabled (one-time).
- [ ] No secrets added for this deploy path.
- [ ] No custom domain configured in v0.8.4.

## Content and policy (required)

- [ ] Site banners/disclaimers state: pilot data, not legal advice, not compliance guarantee.
- [ ] Evidence export **candidates** labelled — not final evidence, not client-ready.
- [ ] No `client_use_allowed: true` in evidence export candidates (`npm run validate:data`).
- [ ] No inappropriate `verified_on_source: true` on records without content review batch support.
- [ ] Simulated detected changes remain clearly marked simulation-only.
- [ ] Export samples page states sample-only — not caesar-ai-evidence output.

## Operational scope

- [ ] Deploy is intentional preview/stakeholder access — not claimed as complete production launch.
- [ ] Monitoring workflow semantics unchanged (no auto-deploy from monitoring PR).
- [ ] caesar-ai-evidence integration **not** started.
- [ ] Coolify/production host **not** used unless separately documented.

## Deploy execution

- [ ] Run **Deploy static site** workflow manually.
- [ ] Input `confirm_disclaimers` exactly: `DEPLOY`
- [ ] Workflow completes successfully (artifact upload + deploy-pages).

## Post-deploy

- [ ] Complete [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).
- [ ] Record deploy date, commit SHA, and public URL in Control Tower notes.

---

## Abort deploy if

- Validation fails on `main`.
- New unreviewed simulated changes would be presented without simulation labelling.
- Legal/comms has not approved public pilot disclaimer language for external audiences.
