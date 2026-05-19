# Next Actions — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

**Current version:** v0.8.0 · **Phase:** scheduled monitoring foundation.

---

## Immediate priority — Control Tower

1. Review `docs/SCHEDULED_MONITORING_POLICY.md` — approve or disable daily GitHub schedule.
2. Run `npm run monitoring:cycle` locally and inspect `/monitoring/` + `data/monitoring-runs/`.
3. After a second monitoring cycle, triage any **real** detected changes (not simulations).
4. Download GitHub Actions artifacts when using remote monitoring; **manually** commit triaged data if needed.

---

## Commands

```bash
npm run monitoring:report      # no network
npm run monitoring:cycle:dry-run
npm run monitoring:cycle       # full cycle
npm run validate:data
npm run build
```

---

## Not in scope (v0.8.0)

- Production deploy / Coolify
- Auto-merge monitoring output to main
- Backend API, database, auth

See [ROADMAP.md](ROADMAP.md).
