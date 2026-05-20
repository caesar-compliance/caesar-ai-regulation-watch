# T051 — Decisions

## Region slugs

**Decision:** Derive stable slugs from region display names via lowercase + hyphenation (`regionSlug()`), not a hardcoded enum.

**Rationale:** Pilot data may add regions; one helper keeps routes and JSON exports aligned.

## Topic routes

**Decision:** Use `topic_id` from YAML as the URL segment (e.g. `/topics/eu_ai_act/`).

**Rationale:** Matches seed `topic_tags` and avoids ambiguous hyphen/underscore mapping.

## Profile exports

**Decision:** Build `jurisdiction-profiles.json`, `region-drilldowns.json`, and `topic-drilldowns.json` at export time from existing YAML only; all legal gates explicitly `false`.

**Rationale:** Supports static/API consumers without duplicating YAML; keeps safety contract visible in JSON.

## Compare defaults on profiles

**Decision:** Default compare link includes EU plus regional peers (UK for Europe, US Federal for North America) when applicable, capped at four ids.

**Rationale:** Matches task compare guidance without implying legal equivalence.
