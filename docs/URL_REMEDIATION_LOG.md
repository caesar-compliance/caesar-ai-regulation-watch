# URL Remediation Log

**Prepared:** 19 May 2026  
**Version:** v0.6.2  
**Related:** [URL_VERIFICATION_POLICY.md](./URL_VERIFICATION_POLICY.md), [SOURCE_VERIFICATION_WORKFLOW.md](./SOURCE_VERIFICATION_WORKFLOW.md)

---

## Scope

Manual remediation of official URLs flagged in the v0.6.1 technical URL check (`url-check-2026-05-19`). This pass updates registry URLs and documents source **identity** review only. It does **not** complete legal or content summary review.

---

## Remediation entries

| item_id | old_url | new_url | action_taken | reason | remaining risk | next human action |
|---|---|---|---|---|---|---|
| australia-industry-ai | `…/australias-artificial-intelligence-ai-ethics-framework` | `…/australias-ai-ethics-principles` | replaced_with_canonical_official_url | Legacy slug 404; government site redirects to AI Ethics Principles page | Framework vs principles naming may differ in internal policies | Confirm record summary still matches official page scope |
| policy-australia-ai-ethics-framework | (same as source) | (aligned with source) | replaced_with_canonical_official_url | Record URL aligned to remediated source | Content not reviewed | Do not set `verified_on_source` until summary checked |
| australia-oaic-ai | `…/technologies/artificial-intelligence` | `…/privacy/guidance-and-advice` | replaced_with_canonical_official_url | Deep link 404; OAIC maintains guidance hub | Hub covers multiple topics, not AI-only | Pick specific AI guidance pages when curating records |
| japan-meti-ai | `…/connected_industries/ai/index.html` | `…/english/policy/index.html` | replaced_with_canonical_official_url | AI subdirectory 404; English policy index reachable | Weak AI-specific landing; Japanese pages may be authoritative | Add MIC/Japanese sources if needed; language review |
| policy-japan-meti-ai | (same as source) | (aligned) | replaced_with_canonical_official_url | Record aligned to remediated METI index | METI index is general, not AI-only | Content review pending |
| norway-ai-act-implementation | `…/ai/id3015480/` | `…/whats-new/…/id3093081/` | replaced_with_canonical_official_url | Topic page 404; current government AI implementation news reachable | News article may not be permanent canonical topic URL | Monitor for dedicated AI topic page; content review pending |
| implementation-norway-ai-act | (same as source) | (aligned) | replaced_with_canonical_official_url | Record aligned | Implementation details not verified on page | Content review pending |
| south-korea-pipc | `…/np/eng/main/main.do` | `https://www.pipc.go.kr/eng/` | replaced_with_canonical_official_url | Legacy path 404; `/eng/` reachable | Portal home, not instrument-specific | Find Korean AI guidance URLs when available |
| guidance-south-korea-pipc-ai | (same as source) | (aligned) | replaced_with_canonical_official_url | Record aligned | English portal only | Content review pending |
| g7-hiroshima-ai-process | `https://www.g7hiroshima.go.jp/en/` | `https://www.soumu.go.jp/hiroshimaaiprocess/en/index.html` | replaced_with_canonical_official_url | Summit domain DNS failure; MIC hosts official process site | Process site is Japan-government hosted, not G7 secretariat | Confirm MOFA communiqué links if needed for records |
| policy-g7-hiroshima-ai-process | (same as source) | (aligned) | replaced_with_canonical_official_url | Record aligned | Political commitments not law | Content review pending |
| edpb | `https://www.edpb.europa.eu/` | `https://www.edpb.europa.eu/edpb_en` | redirected_url_accepted_pending_review | Root redirects to `/edpb_en` (200) | Same site, locale path | None for URL; content review still required |
| edps | `https://www.edps.europa.eu/` | `https://www.edps.europa.eu/_en` | redirected_url_accepted_pending_review | Root redirects to `/_en` (200) | Same site, locale path | None for URL; content review still required |
| us-federal-register | (unchanged) | (unchanged) | redirected_url_accepted_pending_review | Canonical URL; automated fetch may hit unblock subdomain | Anti-bot behaviour | Manual browser check for specific documents |
| us-congress-gov | (unchanged) | (unchanged) | source_temporarily_unreachable | HTTP 403 on automated checks; likely bot filter | False negative in technical check | Manual browser verification; do not replace with non-official trackers |

---

## Summary

| Metric | Count |
|---|---|
| URLs replaced with canonical official URL | 8 source/record pairs (10 registry rows incl. duplicates) |
| Redirect canonical URLs updated | 2 (EDPB, EDPS) |
| Kept pending / bot-blocked | 2 (Congress.gov, Federal Register notes only) |
| Unresolved without replacement | 0 (G7 resolved via MIC host) |

---

## What this pass did not do

- No legal or content summary review
- No `verified_on_source: true` on records
- No `client_use_allowed: true`
- No competitor tracker URLs used as replacements
