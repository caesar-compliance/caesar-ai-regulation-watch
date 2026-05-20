# T055 — Execute one approved single-source network dry-run

**Branch:** `task/T055-approved-single-source-network-dry-run`  
**Base:** main @ `98ed630` (post-T054)  
**Package:** `1.0.8` (unchanged)

## Scope

- Add T055 execution control model (`T055-001`) without changing legal/evidence gates
- Extend guarded network runner for exactly one approved EDPB RSS GET
- Validate, execute one live dry-run locally, document results
- No deploy, tag, publication, or scheduling

## Control Tower approval (T055)

- Adapter: `edpb-publications-rss`
- Approval: `T054-001` / Run: `T053-001`
- One GET to `https://www.edpb.europa.eu/feed/publications_en`
- Max 5 metadata candidates, 500000 bytes, 20s timeout

## Out of scope

- Scheduled monitoring
- `public/data/` publication
- Full legal text
- Source verification
- caesar-ai-evidence integration
