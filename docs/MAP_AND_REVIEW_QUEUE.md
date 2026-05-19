# Map and review queue — v0.7.0

**Last updated:** 19 May 2026

## Overview

v0.5.1+ adds read-only browsing tools (map, review queue). v0.6.x extends the queue with unverified records, source verification, and technical URL reasons. **v0.7.0** adds `detected_change` and `watcher_error` item types from the official-source watcher prototype (see `docs/WATCHER_PROTOTYPE.md`). See [/verification/](/verification/).

1. **Global coverage map** (`/map/`) — static SVG markers from jurisdiction YAML
2. **Human review queue** (`/review-queue/`) — aggregated items needing verification

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

## Review queue

- Built at static generation from all YAML entity types
- Export: `public/data/review-queue.json`
- **Read-only** — no UI actions to mark reviewed
- Includes timeline events where `verified_on_source: false`

### Filters (client-side)

Item type, jurisdiction, review status, missing official URL, unverified on source.

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
