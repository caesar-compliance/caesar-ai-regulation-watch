#!/usr/bin/env node
/**
 * Technical URL verification for official_url fields in local YAML only.
 * HEAD first, GET fallback. No CI integration. Not legal/content review.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECKED_DATE = process.env.URL_CHECK_DATE ?? "2026-05-19";
const BATCH_ID = `url-check-${CHECKED_DATE}`;
const OUTPUT_YML = path.join(ROOT, "data/verifications", `${BATCH_ID}.yml`);
const OUTPUT_JSON = path.join(ROOT, "public/data/url-checks.json");
const TIMEOUT_MS = Number(process.env.URL_CHECK_TIMEOUT_MS ?? 15000);
const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_NETWORK = process.argv.includes("--skip-network");

const LEGAL_SAFE_NOTE =
  "Technical HTTP reachability check only. Not legal advice. Not source identity or content review. client_use_allowed remains false unless separately approved by human reviewer.";

function listYamlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    .map((f) => path.join(dir, f));
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function domainsMatch(expectedHost, finalHost) {
  if (!expectedHost || !finalHost) return null;
  const e = expectedHost.replace(/^www\./, "").toLowerCase();
  const f = finalHost.replace(/^www\./, "").toLowerCase();
  if (e === f) return true;
  return f === e || f.endsWith(`.${e}`) || e.endsWith(`.${f}`);
}

function collectTargets() {
  const targets = [];
  const sourceById = {};

  for (const file of listYamlFiles(path.join(ROOT, "data/sources"))) {
    const s = readYaml(file);
    if (!s?.official_url) continue;
    sourceById[s.source_id] = s;
    targets.push({
      item_type: "source",
      item_id: s.source_id,
      source_id: s.source_id,
      original_url: s.official_url,
      expected_host: hostnameFromUrl(s.official_url),
      title: s.title,
    });
  }

  for (const file of listYamlFiles(path.join(ROOT, "data/laws"))) {
    const r = readYaml(file);
    if (!r?.official_url) continue;
    const src = sourceById[r.source_id];
    targets.push({
      item_type: "law",
      item_id: r.record_id,
      source_id: r.source_id,
      original_url: r.official_url,
      expected_host:
        hostnameFromUrl(r.official_url) ?? (src ? hostnameFromUrl(src.official_url) : null),
      title: r.title,
    });
  }

  for (const file of listYamlFiles(path.join(ROOT, "data/guidance"))) {
    const r = readYaml(file);
    if (!r?.official_url) continue;
    const src = sourceById[r.source_id];
    targets.push({
      item_type: "guidance",
      item_id: r.record_id,
      source_id: r.source_id,
      original_url: r.official_url,
      expected_host:
        hostnameFromUrl(r.official_url) ?? (src ? hostnameFromUrl(src.official_url) : null),
      title: r.title,
    });
  }

  return targets;
}

async function fetchUrl(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Caesar-AI-Regulation-Watch/0.6.1 URL-check (governance review support)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function classifyError(err) {
  const msg = String(err?.cause?.code ?? err?.code ?? err?.message ?? err);
  if (/abort|timeout/i.test(msg)) return "timeout";
  if (/ENOTFOUND|getaddrinfo|dns/i.test(msg)) return "dns_error";
  return "network_error";
}

async function checkOne(target) {
  const base = {
    url_check_id: `urlcheck-${target.item_id}`,
    checked_date: CHECKED_DATE,
    checker_type: "automated_head_get",
    item_type: target.item_type,
    item_id: target.item_id,
    source_id: target.source_id,
    original_url: target.original_url,
    final_url: target.original_url,
    http_status: null,
    check_result: "not_checked",
    redirect_detected: false,
    domain_matches_expected: null,
    title_or_reference: target.title,
    technical_note: "",
    content_review_status: "not_reviewed",
    client_use_allowed: false,
    legal_safe_note: LEGAL_SAFE_NOTE,
  };

  if (SKIP_NETWORK || DRY_RUN) {
    base.check_result = "not_checked";
    base.technical_note = SKIP_NETWORK
      ? "Network checks skipped (--skip-network)."
      : "Dry run; no HTTP request performed.";
    return base;
  }

  let response;
  try {
    response = await fetchUrl(target.original_url, "HEAD");
    if (response.status === 405 || response.status === 501 || response.status === 403) {
      response = await fetchUrl(target.original_url, "GET");
    }
  } catch (err) {
    try {
      response = await fetchUrl(target.original_url, "GET");
    } catch (err2) {
      const kind = classifyError(err2);
      return {
        ...base,
        check_result: kind,
        technical_note: `Request failed: ${String(err2?.message ?? err2)}`,
      };
    }
  }

  const finalUrl = response.url || target.original_url;
  const originalHost = hostnameFromUrl(target.original_url);
  const finalHost = hostnameFromUrl(finalUrl);
  const redirectDetected =
    finalUrl.replace(/\/$/, "") !== target.original_url.replace(/\/$/, "") ||
    (originalHost && finalHost && originalHost !== finalHost);

  const status = response.status;
  const domainOk = domainsMatch(target.expected_host ?? originalHost, finalHost);

  let checkResult;
  if (status >= 200 && status < 400) {
    checkResult = redirectDetected ? "reachable_redirected" : "reachable";
  } else if (status >= 400) {
    checkResult = "unreachable";
  } else {
    checkResult = "uncertain";
  }

  let titleRef = target.title;
  const pageTitle = response.headers.get("content-title") ?? response.headers.get("x-page-title");
  if (pageTitle) titleRef = `${target.title} — ${pageTitle}`;

  const notes = [];
  if (redirectDetected) notes.push(`Redirect to ${finalUrl}`);
  if (domainOk === false) notes.push("Final domain does not match expected registry host.");
  if (status >= 400) notes.push(`HTTP ${status}`);

  return {
    ...base,
    final_url: finalUrl,
    http_status: status,
    check_result: checkResult,
    redirect_detected: redirectDetected,
    domain_matches_expected: domainOk,
    title_or_reference: titleRef,
    technical_note: notes.join(" ") || "HTTP check completed.",
  };
}

async function main() {
  const targets = collectTargets();
  console.log(`\nCaesar AI Regulation Watch — technical URL check`);
  console.log(`Date: ${CHECKED_DATE}`);
  console.log(`Targets: ${targets.length}`);
  if (DRY_RUN) console.log(`Mode: dry-run`);
  if (SKIP_NETWORK) console.log(`Mode: skip-network`);

  const url_checks = [];
  for (const target of targets) {
    process.stdout.write(`  Checking ${target.item_type}/${target.item_id}… `);
    const entry = await checkOne(target);
    url_checks.push(entry);
    console.log(entry.check_result);
  }

  const batch = {
    url_check_batch_id: BATCH_ID,
    checked_date: CHECKED_DATE,
    checker_type: "automated_head_get",
    legal_safe_note: LEGAL_SAFE_NOTE,
    url_checks,
  };

  fs.mkdirSync(path.dirname(OUTPUT_YML), { recursive: true });
  const ymlBody =
    `# Technical URL verification batch — v0.6.1\n` +
    `# Generated: ${CHECKED_DATE}\n` +
    `# Reachability is not legal/content review. client_use_allowed defaults false.\n\n` +
    yaml.dump(batch, { lineWidth: 120, noRefs: true });
  fs.writeFileSync(OUTPUT_YML, ymlBody, "utf8");

  const summary = {
    reachable: url_checks.filter((c) => c.check_result === "reachable").length,
    reachable_redirected: url_checks.filter((c) => c.check_result === "reachable_redirected")
      .length,
    unreachable: url_checks.filter((c) => c.check_result === "unreachable").length,
    timeout: url_checks.filter((c) => c.check_result === "timeout").length,
    dns_error: url_checks.filter((c) => c.check_result === "dns_error").length,
    network_error: url_checks.filter((c) => c.check_result === "network_error").length,
    not_checked: url_checks.filter((c) => c.check_result === "not_checked").length,
    uncertain: url_checks.filter((c) => c.check_result === "uncertain").length,
  };

  const jsonExport = {
    generated_at: CHECKED_DATE,
    disclaimer: LEGAL_SAFE_NOTE,
    batch,
    items: url_checks,
    summary: { total: url_checks.length, ...summary },
  };
  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(jsonExport, null, 2) + "\n", "utf8");

  console.log(`\nWrote ${path.relative(ROOT, OUTPUT_YML)}`);
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`);
  console.log(`Summary: ${JSON.stringify(summary)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
