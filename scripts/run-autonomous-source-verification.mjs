#!/usr/bin/env node
/**
 * Autonomous official-source verification worker (v1.0.4).
 * Conservative machine verification: official APIs, SPARQL, metadata fetch, official alternatives.
 * No WAF bypass, no CAPTCHA, no full HTML/legal text storage, no link crawling.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERIFICATIONS_DIR = path.join(ROOT, "data/verifications");
const RUN_DATE = process.env.AUTONOMOUS_VERIFY_DATE ?? "2026-05-20";
const BATCH_SUFFIX = process.env.AUTONOMOUS_VERIFY_SUFFIX ?? "v103";
const BATCH_ID = `autonomous-source-verification-${RUN_DATE}-${BATCH_SUFFIX}`;
const OUTPUT_YML = path.join(VERIFICATIONS_DIR, `${BATCH_ID}.yml`);
const DRY_RUN = process.argv.includes("--dry-run");
const OFFLINE = process.argv.includes("--offline");

const USER_AGENT =
  "CaesarRegulationWatch/1.0.4 (autonomous-source-verify; +https://regulation-watch.caesar.no/methodology/)";
const FETCH_TIMEOUT_MS = Number(process.env.AUTONOMOUS_VERIFY_TIMEOUT_MS ?? 22_000);
const TITLE_READ_BYTES = 14_336;

const SPARQL_ENDPOINT = "https://publications.europa.eu/webapi/rdf/sparql";
const LEGAL_SAFE_NOTE_BATCH =
  "v1.0.4 autonomous official-source verification worker. Official APIs, SPARQL, metadata-only fetch, and official alternatives only. No WAF/bot bypass. No full legal text storage. verified_on_source remains false. Not legal advice. Not client evidence.";

function readAllowlist() {
  const files = fs
    .readdirSync(VERIFICATIONS_DIR)
    .filter(
      (f) =>
        f.startsWith("autonomous-source-verification-allowlist-") &&
        (f.endsWith(".yml") || f.endsWith(".yaml")),
    )
    .sort()
    .reverse();
  if (files.length === 0) {
    throw new Error("No autonomous-source-verification-allowlist-*.yml in data/verifications/");
  }
  return yaml.load(fs.readFileSync(path.join(VERIFICATIONS_DIR, files[0]), "utf8"));
}

function extractTitleFromHtmlSnippet(html) {
  const m = html.match(/<title[^>]*>([^<]{1,400})<\/title>/i);
  if (!m) return null;
  return m[1].replace(/\s+/g, " ").trim() || null;
}

function extractMetaContent(html, name) {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']{1,300})["']`,
    "i",
  );
  const m = html.match(re);
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
}

function truncate(s, max = 400) {
  if (!s) return null;
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

async function fetchMetadata(url, { method = "HEAD", readTitle = false, maxBytes = TITLE_READ_BYTES } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  };

  const out = {
    http_status: null,
    final_url: null,
    visible_or_extracted_title: null,
    fetch_error: null,
    body_snippet: null,
  };

  try {
    let res = await fetch(url, { method, headers, redirect: "follow", signal: controller.signal });

    if (method === "HEAD" && (res.status === 405 || res.status === 501)) {
      res = await fetch(url, {
        method: "GET",
        headers: { ...headers, Range: "bytes=0-0" },
        redirect: "follow",
        signal: controller.signal,
      });
    }

    out.http_status = res.status;
    out.final_url = res.url ?? url;

    if (readTitle && (method === "GET" || res.status < 400 || res.status === 403)) {
      const reader = res.body?.getReader?.();
      if (reader) {
        const chunks = [];
        let total = 0;
        while (total < maxBytes) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          total += value.length;
        }
        reader.cancel().catch(() => {});
        const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
        out.body_snippet = buf.toString("utf8", 0, maxBytes);
        out.visible_or_extracted_title = extractTitleFromHtmlSnippet(out.body_snippet);
        if (!out.visible_or_extracted_title) {
          out.visible_or_extracted_title =
            extractMetaContent(out.body_snippet, "og:title") ??
            extractMetaContent(out.body_snippet, "twitter:title");
        }
      }
    }

    return out;
  } catch (err) {
    out.fetch_error = err.name === "AbortError" ? "timeout" : String(err.message ?? err);
    return out;
  } finally {
    clearTimeout(timer);
  }
}

async function querySparqlCelex(celex) {
  const query = `PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
SELECT ?celex ?title ?eli ?dateDoc WHERE {
  ?work cdm:resource_legal_id_celex "${celex}" .
  OPTIONAL { ?work cdm:resource_legal_eli ?eli . }
  OPTIONAL { ?work cdm:work_date_document ?dateDoc . }
  ?work cdm:work_has_expression ?expr .
  ?expr cdm:expression_uses_language <http://publications.europa.eu/resource/authority/language/ENG> .
  ?expr cdm:expression_title ?title .
  BIND("${celex}" AS ?celex)
} LIMIT 3`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(SPARQL_ENDPOINT, {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/sparql-results+json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ query }),
      signal: controller.signal,
    });
    if (!res.ok) {
      return { ok: false, error: `SPARQL HTTP ${res.status}`, bindings: [] };
    }
    const json = await res.json();
    const bindings = json?.results?.bindings ?? [];
    return { ok: true, bindings, error: null };
  } catch (err) {
    return {
      ok: false,
      error: err.name === "AbortError" ? "timeout" : String(err.message ?? err),
      bindings: [],
    };
  } finally {
    clearTimeout(timer);
  }
}

function parseEftaIdentity(html, celex) {
  const title = extractTitleFromHtmlSnippet(html);
  const celexPresent = new RegExp(celex, "i").test(html);
  const hasReg2024 =
    /Regulation\s*\(EU\)\s*2024\/1689/i.test(html) ||
    /2024\/1689/i.test(html);
  const hasAiAct = /Artificial Intelligence Act/i.test(html);
  const regMatch = html.match(
    /Regulation\s*\(EU\)\s*2024\/1689[\s\S]{0,400}?Artificial Intelligence Act/i,
  );
  const identityOk = celexPresent && hasReg2024 && hasAiAct;
  return {
    title,
    regSnippet: regMatch
      ? truncate(regMatch[0], 200)
      : identityOk
        ? "Regulation (EU) 2024/1689 — Artificial Intelligence Act (EEA-Lex factsheet metadata)"
        : null,
    celexPresent,
    identityOk,
  };
}

function baseResult(entry) {
  return {
    verification_id: `autonomous-verify-${entry.related_source_id}-${BATCH_SUFFIX}`,
    related_source_id: entry.related_source_id,
    related_record_id: entry.related_record_id ?? undefined,
    related_candidate_id: entry.related_candidate_id ?? undefined,
    official_url: entry.official_url,
    verification_strategy: "failed_safe",
    verification_result: "machine_unverifiable",
    http_status: null,
    final_url: null,
    visible_or_extracted_title: null,
    official_identifier: entry.expected_celex ?? null,
    publisher_or_authority: null,
    publication_date_or_visible_date: null,
    source_identity_confirmed: false,
    full_instrument_identity_confirmed: false,
    content_not_copied: true,
    no_full_text_storage: true,
    no_bypass_attempted: true,
    client_use_allowed: false,
    final_evidence_allowed: false,
    verified_on_source: false,
    legal_change_claimed: false,
    strategies_attempted: [],
    limitations: "",
    next_action: "document_blocker_only",
    checked_at: new Date().toISOString(),
    legal_safe_note:
      "Autonomous worker attempt only. Not verified_on_source. Not client evidence. Not legal advice.",
  };
}

async function verifyEuAiAct(entry, result) {
  const celex = entry.expected_celex ?? "32024R1689";
  result.official_identifier = celex;
  result.strategies_attempted.push("official_sparql:publications.europa.eu");

  if (!OFFLINE) {
    const sparql = await querySparqlCelex(celex);
    if (sparql.ok && sparql.bindings.length > 0) {
      const b = sparql.bindings[0];
      const title = b.title?.value ?? null;
      const eli = b.eli?.value ?? null;
      result.verification_strategy = "official_sparql";
      result.verification_result = "official_sparql_verified_identity";
      result.visible_or_extracted_title = truncate(title);
      result.publisher_or_authority = "Publications Office of the European Union (CELLAR)";
      result.publication_date_or_visible_date = b.dateDoc?.value ?? null;
      if (eli) result.final_url = eli;
      result.source_identity_confirmed = true;
      result.full_instrument_identity_confirmed = Boolean(
        title && /artificial intelligence/i.test(title),
      );
      result.limitations =
        "CELEX identity confirmed via official Publications Office SPARQL (metadata only). EUR-Lex HTML consolidated text not read. verified_on_source remains false.";
      result.next_action = "corroborate_on_eur_lex_when_accessible";
      return result;
    }
    if (!sparql.ok) {
      result.strategies_attempted.push(`official_sparql_failed:${sparql.error}`);
    } else {
      result.strategies_attempted.push("official_sparql_empty:CELEX not in CELLAR index");
    }
  }

  result.strategies_attempted.push("metadata_fetch:eur-lex");
  if (!OFFLINE) {
    const eurLex = await fetchMetadata(entry.official_url, { method: "HEAD" });
    result.http_status = eurLex.http_status;
    result.final_url = eurLex.final_url;
    if (eurLex.fetch_error) {
      result.strategies_attempted.push(`metadata_fetch_error:${eurLex.fetch_error}`);
    } else if (eurLex.http_status === 202 || eurLex.http_status === 403) {
      result.verification_strategy = "metadata_fetch";
      result.verification_result = "blocked_by_waf_or_bot_gate";
      result.limitations =
        `EUR-Lex primary URL returned HTTP ${eurLex.http_status} (bot gate / async acceptance). No bypass attempted.`;
    }
  }

  const alt = (entry.official_alternatives ?? []).find(
    (a) => a.purpose === "official_eea_lex_celex_metadata_only",
  );
  if (alt && !OFFLINE) {
    result.strategies_attempted.push(`official_alternative:${alt.url}`);
    const efta = await fetchMetadata(alt.url, {
      method: "GET",
      readTitle: true,
      maxBytes: 128_000,
    });
    if (efta.fetch_error) {
      result.strategies_attempted.push(`official_alternative_error:${efta.fetch_error}`);
    } else if (efta.http_status === 200 && efta.body_snippet) {
      const parsed = parseEftaIdentity(efta.body_snippet, celex);
      if (parsed.identityOk && parsed.regSnippet) {
        result.verification_strategy = "official_alternative";
        result.verification_result = "official_alternative_verified_identity";
        result.http_status = efta.http_status;
        result.final_url = efta.final_url;
        result.visible_or_extracted_title = truncate(parsed.title ?? parsed.regSnippet);
        result.publisher_or_authority = alt.authority;
        result.source_identity_confirmed = true;
        result.full_instrument_identity_confirmed = true;
        result.limitations =
          "Instrument identity (Regulation (EU) 2024/1689 / CELEX 32024R1689) confirmed via official EFTA EEA-Lex factsheet metadata snippet only — not EUR-Lex consolidated text. EC digital-strategy corroboration is supplementary only. verified_on_source remains false.";
        result.next_action = "corroborate_on_eur_lex_when_accessible";
        return result;
      }
    } else {
      result.strategies_attempted.push(`official_alternative_http:${efta.http_status}`);
    }
  }

  const corroboration = (entry.official_alternatives ?? []).find(
    (a) => a.purpose === "corroboration_only_not_instrument_verification",
  );
  if (corroboration && !OFFLINE && result.verification_result === "blocked_by_waf_or_bot_gate") {
    result.strategies_attempted.push(`corroboration_only:${corroboration.url}`);
    const ec = await fetchMetadata(corroboration.url, { method: "GET", readTitle: true });
    if (ec.http_status === 200 && ec.visible_or_extracted_title) {
      result.strategies_attempted.push(
        `corroboration_title:${truncate(ec.visible_or_extracted_title, 80)}`,
      );
      result.limitations += ` EC digital-strategy page HTTP 200 title "${truncate(ec.visible_or_extracted_title, 120)}" — high-level corroboration only, not EUR-Lex instrument verification.`;
    }
  }

  if (result.verification_result === "blocked_by_waf_or_bot_gate") {
    result.next_action = "corroborate_on_eur_lex_when_accessible";
    return result;
  }

  result.verification_strategy = "failed_safe";
  result.verification_result = "machine_unverifiable";
  result.limitations =
    "No official machine route confirmed CELEX 32024R1689 in this pass (SPARQL index miss; EUR-Lex blocked; EFTA alternative inconclusive).";
  result.next_action = "needs_human_policy_decision";
  return result;
}

async function verifyMetadataBlocked(entry, result) {
  result.strategies_attempted.push("metadata_fetch:primary");
  if (OFFLINE) {
    result.limitations = "Offline mode; no live fetch performed.";
    return result;
  }

  const primary = await fetchMetadata(entry.official_url, { method: "HEAD" });
  result.http_status = primary.http_status;
  result.final_url = primary.final_url;

  if (primary.fetch_error) {
    result.verification_strategy = "metadata_fetch";
    result.verification_result = "access_failed";
    result.limitations = `Primary official URL fetch failed: ${primary.fetch_error}. No bypass attempted.`;
    result.next_action = "retry_official_machine_later";
    return result;
  }

  if (primary.http_status === 403 || primary.http_status === 401) {
    result.verification_strategy = "metadata_fetch";
    result.verification_result = "blocked_by_waf_or_bot_gate";
    result.limitations = `HTTP ${primary.http_status} on primary official URL. No bypass attempted.`;
    result.next_action = "document_blocker_only";
  } else if (primary.http_status == null) {
    result.verification_result = "access_failed";
    result.limitations = "No HTTP status from primary official URL.";
  } else if (primary.http_status >= 200 && primary.http_status < 400) {
    const withTitle = await fetchMetadata(entry.official_url, { method: "GET", readTitle: true });
    result.http_status = withTitle.http_status;
    result.final_url = withTitle.final_url;
    result.visible_or_extracted_title = truncate(withTitle.visible_or_extracted_title);
    if (withTitle.visible_or_extracted_title) {
      result.verification_strategy = "metadata_fetch";
      result.verification_result = "machine_verified_identity";
      result.source_identity_confirmed = true;
      result.limitations =
        "Source page title/metadata only; body and obligations not reviewed. verified_on_source remains false.";
      result.next_action = "no_action_recorded";
      return result;
    }
  } else if (primary.http_status === 202) {
    result.verification_result = "blocked_by_waf_or_bot_gate";
    result.limitations = "HTTP 202 async/bot gate on primary URL.";
  } else {
    result.verification_result = "access_failed";
    result.limitations = `Primary URL HTTP ${primary.http_status}.`;
  }

  for (const alt of entry.official_alternatives ?? []) {
    if (alt.purpose?.includes("corroboration")) continue;
    result.strategies_attempted.push(`official_alternative:${alt.url}`);
    const altFetch = await fetchMetadata(alt.url, { method: "HEAD" });
    if (altFetch.http_status === 200) {
      const altTitle = await fetchMetadata(alt.url, { method: "GET", readTitle: true });
      if (altTitle.visible_or_extracted_title) {
        result.verification_strategy = "official_alternative";
        result.verification_result = "official_alternative_verified_identity";
        result.http_status = altTitle.http_status;
        result.final_url = altTitle.final_url;
        result.visible_or_extracted_title = truncate(altTitle.visible_or_extracted_title);
        result.publisher_or_authority = alt.authority;
        result.source_identity_confirmed = true;
        result.limitations =
          "Identity confirmed via official alternative URL metadata only; primary HTML still blocked. verified_on_source remains false.";
        result.next_action = "retry_official_machine_later";
        return result;
      }
    }
    result.strategies_attempted.push(`official_alternative_http:${altFetch.http_status ?? "error"}`);
  }

  result.strategies_attempted.push("browser_worker:not_implemented");
  result.limitations +=
    " Browser worker (Playwright) not enabled in repo — metadata-only pass. Human policy review may still be required.";
  if (result.verification_result === "blocked_by_waf_or_bot_gate") {
    result.next_action = "await_browser_worker_support";
  } else if (result.verification_result === "access_failed") {
    result.next_action = "retry_official_machine_later";
  }
  return result;
}

async function runVerification(entry) {
  const result = baseResult(entry);
  if (entry.related_source_id === "eu-ai-act") {
    return verifyEuAiAct(entry, result);
  }
  return verifyMetadataBlocked(entry, result);
}

async function main() {
  const allowlist = readAllowlist();
  const entries = allowlist.sources ?? [];
  if (entries.length === 0) throw new Error("Allowlist has no sources");

  const verifications = [];
  for (const entry of entries) {
    const row = DRY_RUN || OFFLINE ? baseResult(entry) : await runVerification(entry);
    if (DRY_RUN) {
      row.limitations = "Dry run — no network verification performed.";
      row.verification_result = "machine_unverifiable";
    }
    verifications.push(row);
    console.log(
      `${entry.related_source_id}: ${row.verification_result} (${row.verification_strategy})`,
    );
  }

  const batch = {
    autonomous_source_verification_batch_id: BATCH_ID,
    run_date: RUN_DATE,
    verifier_type: "autonomous_worker",
    legal_safe_note: LEGAL_SAFE_NOTE_BATCH,
    verifications,
  };

  if (!DRY_RUN) {
    fs.mkdirSync(VERIFICATIONS_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_YML, yaml.dump(batch, { lineWidth: 120, noRefs: true }), "utf8");
    console.log(`Wrote ${OUTPUT_YML}`);
  } else {
    console.log("Dry run — YAML not written");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
