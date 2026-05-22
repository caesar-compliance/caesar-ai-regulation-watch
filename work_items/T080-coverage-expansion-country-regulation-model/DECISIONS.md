# T080 — Decisions

## Source expansion

- **25 sources** in `monitoring-pilot-registry.yml` (within 20–30 target): kept EDPB/EDPS automated RSS; all new entries are `manual_review` unless a stable official RSS was already proven in T079.
- **Official URLs** chosen from existing `data/sources/` where possible; new URLs verified with bounded `curl -sI` checks on 22 May 2026. Entries that timed out from CI/agent network (e.g. some `canada.ca`, `industry.gov.au`) remain registered as manual review with notes — not competitor data.
- **No new automated RSS** in T080 to avoid widening live fetch surface before review.

## Country/regulation model

- **YAML-first** layer: `data/tracker/regulation-records.yml` and `data/tracker/jurisdiction-profile-cards.yml` drive public exports via `build-runtime-public-export.mjs`.
- **Supabase migration** `003_country_regulation_tracker_model.sql` added (additive, idempotent grants) but **not applied** in this task — dev apply path unchanged from T073/T079.

## UI

- Reused Caesar-native `TrackerMeter` component and profile cards on `/countries/` rather than importing competitor UI/assets.
- Map side panel uses T080 `regulation-map-metrics.json` scores; choropleth still uses existing tracker country status seeds.

## Version

- Bump to **1.0.31** on successful validation and deploy.
