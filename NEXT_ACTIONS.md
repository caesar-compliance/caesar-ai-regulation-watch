# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

**Current version:** v0.8.3 · **Phase:** evidence export candidate pipeline.

---

## Immediate priority — content review then candidate triage

1. Complete browser content review for `data/verifications/content-review-2026-05-19.yml` entries marked `not_checked`.
2. Update batch with honest outcomes; set record `verified_on_source: true` only with documented high-level source support.
3. Regenerate: `npm run generate:evidence-candidates` then `npm run build`.
4. Review `/evidence-export-candidates/` — treat as **candidates only**, not client evidence.
5. Follow `docs/CONTENT_REVIEW_CHECKLIST.md` — keep `client_use_allowed: false`.

---

## Control Tower — monitoring (unchanged)

1. Add GitHub label `monitoring-review` (optional; workflow falls back without it).
2. Trial `workflow_dispatch` with `create_pr=true` after a cycle with meaningful changes.
3. Follow `docs/MONITORING_PR_REVIEW_CHECKLIST.md` before merging any monitoring PR.
4. Scheduled runs remain artifact-only — triage via download or manual PR workflow.

---

## Commands

```bash
npm run generate:evidence-candidates
npm run validate:data
npm run generate:exports
npm run build
npm run monitoring:report      # no network
npm run monitoring:summary       # diff vs HEAD
npm run monitoring:cycle:dry-run
npm run monitoring:cycle         # full cycle
```

---

## Not in scope (v0.8.3)

- Final evidence export to caesar-ai-evidence
- Production deploy / Coolify
- Auto-merge monitoring output to main
- Backend API, database, auth
- `client_use_allowed: true` on candidates

See [ROADMAP.md](ROADMAP.md) and [docs/EVIDENCE_EXPORT_CANDIDATE_PIPELINE.md](docs/EVIDENCE_EXPORT_CANDIDATE_PIPELINE.md).
