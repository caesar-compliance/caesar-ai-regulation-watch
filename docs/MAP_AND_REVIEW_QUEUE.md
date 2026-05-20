# Map and exceptions queue — v0.7.0+

**Last updated:** 20 May 2026 (automation-first rebase — T046)

## Overview

The **global map** is a central public UX surface (automation-first MVP). The **review queue** is reframed as an **exceptions / confidence queue** for items that need human attention — not a gate before every update is useful.

v0.5.1+ adds read-only browsing tools (map, review queue). v0.6.x extends the queue with unverified records, source verification, and technical URL reasons. **v0.7.0** adds `detected_change` and `watcher_error` item types from the official-source watcher prototype (see `docs/WATCHER_PROTOTYPE.md`). See [/verification/](/verification/).

1. **Global coverage map** (`/map/`) — static SVG markers from jurisdiction YAML; target: interactive filterable map (T049)
2. **Exceptions / confidence queue** (`/review-queue/`) — low-confidence, blocked, or unverified items; optional assurance workflow later

## Map implementation

| Aspect | Choice |
|--------|--------|
| Library | None (no Leaflet) |
| Rendering | Build-time SVG equirectangular projection |
| Remote tiles | **No** |
| Data source | `data/jurisdictions/*.yml` → `map` object |
| Export | `public/data/map-coverage.json` |

### Map metadata fields

See `schemas/jurisdiction.schema.json` — `map.display_name`, `latitude`, `longitude`, `marker_type`, `coverage_status`, `map_note`.

Markers are **display aids only**, not legal territorial boundaries.

## Exceptions / confidence queue (formerly review queue)

- Built at static generation from YAML and watcher outputs
- Export: `public/data/review-queue.json`
- **Read-only** — no UI actions to mark reviewed in static MVP
- Surfaces items needing attention: low confidence, access failures, missing URLs, optional human assurance requests
- **Not required** for every automated update to appear in the public feed

### Filters (client-side)

Item type, jurisdiction, confidence, review status, missing official URL, unverified on source, watcher errors.

## Boundaries (unchanged)

- No watchers, backend APIs, database, auth, or runtime data ingestion
- Map tiles are not fetched; regulatory data is not ingested via the map
- Human reviewers update YAML out-of-band after verification

## Local development

```bash
npm run validate:data
npm run generate:exports
npm run build
npm run preview
```

Visit `/map/` and `/review-queue/`.
