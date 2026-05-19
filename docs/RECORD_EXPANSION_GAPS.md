# Record Expansion Gaps

**Prepared:** 19 May 2026  
**Version:** v0.6.0

This log lists jurisdictions or instruments where **official sources need human verification** before adding further curated records. Prefer documenting gaps here over fabricating records.

---

## Jurisdictions needing deeper official linkage

| Jurisdiction | Gap | Suggested next step |
|---|---|---|
| **China** | Additional AI rules (algorithm recommendation, deep synthesis) have separate CAC pages not yet in the source registry | Add dedicated `source_id` entries per instrument on `cac.gov.cn` after URL confirmation |
| **South Korea** | PIPC English portal is an entry point; specific AI statutes/guidance pages need canonical URLs | Identify official Korean/English instrument pages on `pipc.go.kr` or legislation portal |
| **Japan** | Binding rules may appear on Japanese-only ministry pages not linked from METI English hub | Add Japanese official sources or bilingual index pages after human review |
| **G7** | Hiroshima summit domain may archive; successor G7 hosts publish follow-on AI materials | Verify current official G7 publication URL for 2024+ declarations |
| **US federal** | No single comprehensive federal AI statute in registry; EO and agency rules scattered | Add White House / Federal Register source entries when canonical URLs are confirmed |
| **UK** | Sector regulators (ICO, FCA, etc.) have separate guidance beyond DSIT policy paper | Expand registry with sector `source_id` entries as needed |

---

## Instruments deferred (uncertain or unstable URL)

| Topic | Reason deferred |
|---|---|
| EU AI Act national implementing acts (non-Norway) | National transposition varies; add per member state only with verified official URLs |
| US state AI laws | Out of v0.6.0 global pilot scope; requires state `.gov` source registry phase |
| Council of Europe AI Convention | Not yet in source registry; add official `coe.int` source before record |

---

## Language-specific review needs

| Source | Note |
|---|---|
| China CAC instruments | Authoritative text in Chinese; English summaries require qualified review |
| South Korea PIPC / legislation | Korean primary text; English portal may lag |
| Japan METI / MIC materials | Japanese primary publications may not appear on English hub |

---

## Canonical URL improvements

| Current registry entry | Improvement needed |
|---|---|
| `china-cac` (homepage) | Prefer instrument-specific URLs (see `china-cac-generative-ai` added in v0.6.0) |
| `south-korea-pipc` (portal root) | Link records to specific guidance or law pages when identified |
| `g7-hiroshima-ai-process` | Document successor host if Hiroshima domain redirects |

---

## Records intentionally not created in v0.6.0

- Detailed legal interpretation or obligation checklists
- Competitor tracker URLs as primary sources
- Auto-marked `reviewed` or `client_use_allowed: true` without verification evidence

---

## How to close a gap

1. Confirm official URL on the authority site.
2. Add or update `data/sources/*.yml`.
3. Add curated `data/laws/` or `data/guidance/` record with `verified_on_source: false`.
4. Add verification entry in `data/verifications/`.
5. Remove or update this log when the gap is closed.
