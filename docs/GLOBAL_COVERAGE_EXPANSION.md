# Global coverage expansion — v0.5.0

**Last updated:** 19 May 2026

## What changed

v0.5.0 expands Caesar AI Regulation Watch from the EU/Norway pilot into a **broader static global monitoring foundation**:

- **11 new jurisdiction profiles** (UK, US federal, China, Canada, Australia, Singapore, Japan, South Korea, OECD, UNESCO, G7)
- **~20 new official source registry entries** with authoritative URLs only
- **Timeline layer** (`data/timelines/`, `/timelines/` pages, `timelines.json` export)
- **GitHub Actions CI** validating data and building the static site on push/PR

## What did not change

- Still **manual curated YAML** — no crawlers, watchers, backend APIs, database, auth, or runtime remote fetch
- Still **not complete global legal coverage**
- Still **not legal advice** or a compliance guarantee
- New entries default to `review_status: pending_review`

## Human review gate

All expanded jurisdiction, source, and timeline content requires **human review before client use**. Dates with `verified_on_source: false` must be confirmed on official sources.

## Next steps (Control Tower)

- Prioritise URL verification and `reviewed` status for high-priority jurisdictions
- Add law/guidance records for new jurisdictions when official instruments are curated
- Wire reviewed change exports to Control Tower evidence workflow (future phase)
