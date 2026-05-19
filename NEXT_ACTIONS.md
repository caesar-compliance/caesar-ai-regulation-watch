# Next Actions — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

**Current version:** v0.8.2 · **Phase:** content review workflow.

---

## Immediate priority — human content review

1. Complete browser content review for `data/verifications/content-review-2026-05-19.yml` entries marked `not_checked`.
2. Update batch with honest outcomes; set record `verified_on_source: true` only with documented high-level source support.
3. Follow `docs/CONTENT_REVIEW_CHECKLIST.md` — keep `client_use_allowed: false`.
4. Regenerate exports after YAML updates.

---

## Control Tower — monitoring (unchanged)

1. Add GitHub label `monitoring-review` (optional; workflow falls back without it).
2. Trial `workflow_dispatch` with `create_pr=true` after a cycle with meaningful changes.
3. Follow `docs/MONITORING_PR_REVIEW_CHECKLIST.md` before merging any monitoring PR.
4. Scheduled runs remain artifact-only — triage via download or manual PR workflow.

---

## Commands

```bash
npm run monitoring:report      # no network
npm run monitoring:summary     # diff vs HEAD
npm run monitoring:cycle:dry-run
npm run monitoring:cycle       # full cycle
npm run validate:data
npm run build
```

---

## Not in scope (v0.8.2)

- Production deploy / Coolify
- Auto-merge monitoring output to main
- Scheduled monitoring PRs (cron stays artifact-only)
- Backend API, database, auth

See [ROADMAP.md](ROADMAP.md).
