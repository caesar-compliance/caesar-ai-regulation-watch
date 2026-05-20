# Source Verification Workflow

**Prepared:** 19 May 2026  
**Last updated:** 20 May 2026  
**Version:** v1.0.4

---

## Competitor-assisted discovery (v0.9.1)

Before adding URLs to `data/sources/`, use the [COMPETITOR_ASSISTED_SOURCE_DISCOVERY_POLICY.md](./COMPETITOR_ASSISTED_SOURCE_DISCOVERY_POLICY.md) workflow:

1. Log a lead in `data/source-discovery/` with `discovered_from_type` and independent `candidate_official_url`.
2. Verify HTTP status and page title on the **official** URL only.
3. Promote to `data/sources/` when `verification_status: official_source_confirmed`.
4. Run human source identity review per this document before client-facing use.

---

## Purpose

This workflow supports **systematic human review** of official URLs linked from the Caesar AI Regulation Watch registry. Verification records document what was checked, when, and whether an item remains suitable for governance review support.

Verification is **not** legal advice and **does not** grant compliance certification.

---

## Technical URL check vs human verification

| Layer | Data | Tool | Meaning |
|---|---|---|---|
| **Technical URL check** | `data/verifications/url-check-*.yml` | `npm run check:urls` | HTTP reachability, redirects, status code only |
| **Source identity review** | `source-verification-*.yml` | Human | Confirms authority, domain, and instrument match |
| **Content review** | `data/verifications/content-review-*.yml` | Human (browser) | Confirms summary, dates, status at high level — see [CONTENT_REVIEW_WORKFLOW.md](./CONTENT_REVIEW_WORKFLOW.md) |
| **URL batch content flag** | `content_review_status` on URL checks | Automated default | Stays `not_reviewed` until human content batch updates |
| **Client-use approval** | `client_use_allowed` on verification entries | Human | Explicit opt-in; default `false` |

**Do not** set `check_result` in source verification to `reachable_*` based only on `npm run check:urls`. Technical results use the URL verification schema (`reachable`, `reachable_redirected`, etc.). Human source verification uses its own enum (`reachable_matches_expected_source`, etc.).

See [URL_VERIFICATION_POLICY.md](./URL_VERIFICATION_POLICY.md).

### Official-source watcher (v0.7.0 — separate from verification)

| Layer | Data | Tool | Meaning |
|---|---|---|---|
| **Metadata watcher** | `data/snapshots/`, `data/detected-changes/` | `npm run watch:official` | Hash/metadata diff signals only; not legal review |

Watcher output does **not** set `verified_on_source`, `client_use_allowed`, or update record YAML. Reviewers confirm any detected change on the live official source. See [WATCHER_PROTOTYPE.md](./WATCHER_PROTOTYPE.md).

---

## When to verify

| Trigger | Action |
|---|---|
| New curated record added | Create verification entry with `check_result: not_checked` until a human checks the URL |
| Source `official_url` changes | Re-verify; set prior verification to `needs_update` on the item |
| Review queue flags `verified_on_source_false` | Prioritise timeline events and records with unverified dates |
| Before client-facing export | Human reviewer must set `client_use_allowed: true` only with strong evidence |

---

## Verification record fields

Each entry in `data/verifications/*.yml` validates against `schemas/source-verification.schema.json`.

| Field | Description |
|---|---|
| `verification_id` | Unique ID for this check |
| `verified_date` | Date check performed (ISO `YYYY-MM-DD`) |
| `verifier_type` | `human_reviewer`, `curator_batch`, or `automated_check_pending` |
| `item_type` | `source`, `record`, `timeline_event`, or `change` |
| `item_id` | ID of the verified item |
| `source_id` | Registry source used |
| `official_url_checked` | Exact URL visited or intended for check |
| `check_result` | See allowed values below |
| `page_title_or_reference` | Optional human note of page title or citation |
| `notes` | Free-text reviewer notes |
| `review_status_after_check` | Item review status after check |
| `client_use_allowed` | `false` unless verification is genuinely strong |
| `legal_safe_note` | Required disclaimer per entry |

### Allowed `check_result` values

| Value | Meaning |
|---|---|
| `reachable_matches_expected_source` | URL loads; content matches expected authority/instrument |
| `reachable_needs_human_review` | URL loads; content scope or language needs expert review |
| `unreachable` | URL failed to load |
| `redirected` | URL redirects; confirm canonical destination |
| `not_checked` | Placeholder; no live check performed yet |
| `uncertain` | Check attempted; outcome unclear |

---

## Autonomous official-source verification (v1.0.4)

When automated URL checks or environments hit **WAF, bot gates, or timeouts**, run the autonomous worker before asking operators to open pages manually:

| Action | Do | Do not |
|---|---|---|
| Run worker | `npm run source:verify:autonomous` (allowlist in `autonomous-source-verification-allowlist-*.yml`) | Bypass WAF, solve CAPTCHA, use stealth proxies |
| Strategies | Official SPARQL/Cellar, metadata HEAD/GET, official government alternatives | Scrape full legal text or store full HTML |
| Record results | `autonomous-source-verification-*.yml` + public JSON export | Set `verified_on_source: true` from worker output |
| Browser worker | Playwright normal rendering (when added) — title/URL/status only | Link crawling, credentialled access, residential proxies |

Public status: `/source-verification/` and `/data/autonomous-source-verifications.json`.

**v1.0.4 allowlist:** Australia `australia-industry-ai`, EUR-Lex CELEX `eu-ai-act` / `law-eu-ai-act-2024-1689`, Japan `japan-meti-ai`.

## Manual source verification intake (supplementary)

Optional human-browser intake when policy requires explicit browser observation beyond autonomous machine attempts:

| Action | Do | Do not |
|---|---|---|
| Route | Update `manual-source-verification-intake-*.yml` after autonomous batch documents blockers | Use manual intake as sole path without running autonomous worker |
| Record observations | Per [MANUAL_SOURCE_VERIFICATION_INTAKE_GUIDE.md](./MANUAL_SOURCE_VERIFICATION_INTAKE_GUIDE.md) | Fabricate titles or paste legal text into YAML |
| Set `verified_on_source` | Only after Control Tower approval per [VERIFIED_ON_SOURCE_POLICY.md](./VERIFIED_ON_SOURCE_POLICY.md) | Auto-set from intake batch |

Public export: `/data/manual-source-verification-intake.json` (no private reviewer notes).

---

## Review steps (human)

1. Open the item in the site (`/records/`, `/sources/`, `/timelines/`, or `/review-queue/`).
2. If automated verification is blocked, use **manual intake** (`/source-verification/`) instead of repeated automated retries.
3. Follow the **official source** link (never competitor tracker pages).
4. Confirm the page is from the expected authority (domain, branding, instrument title).
5. Update or create a verification YAML entry with the actual `check_result`.
6. **`verified_on_source: true`** on records requires completed manual intake + explicit Control Tower approval — see [VERIFIED_ON_SOURCE_POLICY.md](./VERIFIED_ON_SOURCE_POLICY.md). Not set in v1.0.3.
7. Set `review_status: reviewed` only when Control Tower approves for your use case.
8. Set `client_use_allowed: true` only when verification is genuinely strong — default is `false`.

---

## Batch files

| File | Description |
|---|---|
| [source-verification-2026-05-19.yml](../data/verifications/source-verification-2026-05-19.yml) | v0.6.0 curated records batch (`not_checked`) |
| [url-check-2026-05-19.yml](../data/verifications/url-check-2026-05-19.yml) | Technical URL batch (`npm run check:urls`; re-run after remediation) |
| [source-identity-review-2026-05-19.yml](../data/verifications/source-identity-review-2026-05-19.yml) | v0.6.2 source identity batch (`reviewed_source_identity_only`) |
| [source-verification-2026-05-20-v093.yml](../data/verifications/source-verification-2026-05-20-v093.yml) | v0.9.3 targeted pass — Australia industry.gov.au, EUR-Lex CELEX, EDPB AI topic |
| [source-verification-2026-05-20-v102.yml](../data/verifications/source-verification-2026-05-20-v102.yml) | v1.0.2 human/browser pass — AU/EUR-Lex/Japan blockers documented |
| [autonomous-source-verification-2026-05-20-v103.yml](../data/verifications/autonomous-source-verification-2026-05-20-v103.yml) | v1.0.4 autonomous worker batch |
| [manual-source-verification-intake-2026-05-20-v103.yml](../data/verifications/manual-source-verification-intake-2026-05-20-v103.yml) | v1.0.3 manual intake placeholders (supplementary) |

Static exports: `/data/verifications.json`, `/data/url-checks.json`, `/data/autonomous-source-verifications.json`, `/data/manual-source-verification-intake.json` (generated at build).

Site pages: [/verification/](/verification/) (batch summary) · [/source-verification/](/source-verification/) (autonomous worker + policy gate).

---

## Integration with review queue

The review queue export includes:

- Records with `review_status` not `reviewed`
- Records with `verified_on_source: false` when set on the entity
- Verification entries with `check_result` of `not_checked` or `uncertain`
- Unverified timeline events

---

## Legal-safe defaults

- Do not auto-mark items reviewed in CI.
- Do not scrape competitor sites for verification.
- Do not copy official legal text into summaries.
- Official sources control; Caesar summaries are `summary_for_review` only.

See also [TAXONOMY_AND_REVIEW_WORKFLOW.md](TAXONOMY_AND_REVIEW_WORKFLOW.md) and [RECORD_EXPANSION_GAPS.md](RECORD_EXPANSION_GAPS.md).
