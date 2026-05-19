# URL Verification Policy

**Prepared:** 19 May 2026  
**Version:** v0.6.1

---

## Purpose

Technical URL verification records **HTTP reachability** of `official_url` values already present in local YAML. It does **not** replace human source identity review, content summary review, or client-use approval.

---

## What technical URL checks cover

| Covered | Not covered |
|---|---|
| HTTP status code | Legal accuracy of summaries |
| Final URL after redirects | Whether content matches the instrument |
| DNS / network / timeout errors | `verified_on_source` on records |
| Domain match vs registry source | `client_use_allowed` (defaults `false`) |
| Optional page title from response headers | Automated monitoring or watchers |

---

## Separation of review layers

```text
Technical URL check (automated_head_get)
  → source identity review (human)
    → content summary review (human)
      → client-use approval (human, explicit)
```

| Layer | Field(s) | Default |
|---|---|---|
| Technical URL | `check_result`, `http_status`, `final_url` | `not_checked` until script run |
| Content review | `content_review_status` | `not_reviewed` |
| Client use | `client_use_allowed` | `false` |

**A reachable URL does not mean the record is reviewed or safe for client deliverables.**

---

## Allowed `check_result` values

| Value | Meaning |
|---|---|
| `reachable` | URL responded; no redirect to a different host |
| `reachable_redirected` | URL responded; redirect detected (review final URL) |
| `unreachable` | HTTP 4xx/5xx or empty response |
| `timeout` | Request exceeded timeout |
| `dns_error` | Hostname could not be resolved |
| `network_error` | Other network failure |
| `not_checked` | Check skipped (offline, dry-run, or not run) |
| `uncertain` | Ambiguous outcome |

---

## Running checks

```bash
npm run check:urls
```

- Reads only URLs from `data/sources/`, `data/laws/`, `data/guidance/`.
- Uses Node built-in `fetch` (HEAD first, GET fallback).
- Writes `data/verifications/url-check-YYYY-MM-DD.yml`.
- Optionally mirrors `public/data/url-checks.json` when run before export generation.

**Not run in CI** — live URL checks can be flaky and are manual/operator-triggered only.

---

## Legal-safe defaults

- Do not set `client_use_allowed: true` from URL reachability alone.
- Do not set `verified_on_source: true` from URL reachability alone.
- Do not scrape page body content beyond optional title from headers.
- Official sources control; Caesar summaries remain `summary_for_review` only.

---

## Related docs

- [SOURCE_VERIFICATION_WORKFLOW.md](./SOURCE_VERIFICATION_WORKFLOW.md) — human source verification batch
- [TAXONOMY_AND_REVIEW_WORKFLOW.md](./TAXONOMY_AND_REVIEW_WORKFLOW.md) — review statuses
- [CI_VALIDATION.md](./CI_VALIDATION.md) — validate/build without live URL checks
