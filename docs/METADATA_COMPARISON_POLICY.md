# Live metadata comparison policy (v0.9.8)

**Last updated:** 20 May 2026

## Scope

Applies to the cautious live metadata pilot (`scripts/run-live-metadata-pilot.mjs`), v0.9.8 manual artifact pack (`scripts/build-live-metadata-review-artifact.mjs`), and v0.9.7 triage of review candidates. **Not** scheduled broad monitoring, **not** legal/regulatory change detection, **not** client or final evidence. GitHub Actions artifact output is for human review only — never auto-merged to curated records.

## Compared fields

| Field | When compared | Notes |
|---|---|---|
| `http_status` | Always | Change requires human review |
| `final_url` (redirect) | When differs from allowlisted URL | `redirect_changed_needs_review` |
| `page_title` | Only when live fetch obtained a title | HEAD with null title skips title compare |
| `last_modified` | When baseline had a value or live differs materially | Null baseline → live header = weak appearance (benign) |
| `etag` | Same as `last_modified` | GOV.UK/UNESCO etags may rotate; null baseline → benign |

## Weak headers and null baselines

v0.9.5 deterministic monitoring runs often stored `last_modified: null` and `etag: null` without live HEAD capture. A later live HEAD that exposes these headers is **not** treated as a regulatory change signal when the only delta is null→present.

## Title normalization

Before comparing titles, normalize (lowercase, trim, strip common suffixes such as ` - GOV.UK` and ` | UNESCO`). Residual title differences against deterministic baseline labels may be triaged as `check_artifact` when the live HTML title is stable on recheck.

## Outcomes

| Pilot check result | Meaning |
|---|---|
| `metadata_check_ok` | No meaningful metadata diff vs baseline |
| `metadata_changed_needs_review` | Meaningful diff; queue + triage |
| `redirect_changed_needs_review` | Final URL changed |
| `metadata_check_failed` | Fetch failed |

Triage classifications (`metadata-review-triage-*.yml`):

- `benign_metadata_change` — weak header / baseline artifact; `human_review_required: false`
- `check_artifact` — title/baseline wording drift; human review optional but flagged if substantive change suspected
- `source_update_needs_human_review` — possible substantive source update (not used in v0.9.7 batch unless confirmed)
- `unresolved_needs_review` — cannot classify safely
- `no_change_after_recheck` — recheck matches baseline for compared fields

## Prohibited claims

- `legal_change_claimed: true` — never set in triage or exports
- `client_use_allowed: true` / `final_evidence_allowed: true` — never set
- `verified_on_source: true` — never set by automated metadata path

## Storage

Metadata only: HTTP status, URLs, selected headers, optional title snippet from first ~12 KiB of GET. **No** full HTML, legal text, or crawl of links.
