#!/usr/bin/env node
/**
 * Guarded single-source network dry-run runner — T055.
 * Performs exactly one GET when Control Tower approval + CLI + env are all present.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { XMLParser } from "fast-xml-parser";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const APPROVALS_PATH = path.join(ROOT, "data/source-adapters/network-dry-run-approvals.yml");
const EXECUTIONS_PATH = path.join(ROOT, "data/source-adapters/single-network-dry-run-executions.yml");
const ALLOWLIST_PATH = path.join(ROOT, "data/source-adapters/source-adapter-allowlist.yml");
const RUNS_PATH = path.join(ROOT, "data/source-adapters/manual-intake-runs.yml");

const T054_APPROVAL_ID = "T054-001";
const T055_EXECUTION_ID = "T055-001";
const T055_ADAPTER_ID = "edpb-publications-rss";

const PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  processEntities: { enabled: true, maxTotalExpansions: 2048, maxExpandedLength: 8192 },
};

const USER_AGENT =
  "Caesar-Regulation-Watch-Metadata-Pilot/1.0.8 (manual one-off dry-run; not a crawler)";

function parseArgs(argv) {
  let approvalId = null;
  let executionId = null;
  let understandNetwork = false;
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--approval-id" && argv[i + 1]) {
      approvalId = argv[++i];
    } else if (arg.startsWith("--approval-id=")) {
      approvalId = arg.slice("--approval-id=".length);
    } else if (arg === "--execution-id" && argv[i + 1]) {
      executionId = argv[++i];
    } else if (arg.startsWith("--execution-id=")) {
      executionId = arg.slice("--execution-id=".length);
    } else if (arg === "--i-understand-this-runs-network") {
      understandNetwork = true;
    }
  }
  return { approvalId, executionId, understandNetwork };
}

function hostFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function refuse(message, hints = []) {
  console.error(`Refused: ${message}`);
  for (const h of hints) console.error(h);
  process.exit(1);
}

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function snippet(text, max = 500) {
  if (!text) return null;
  const flat = String(text).replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

function detectTopics(item) {
  const cats = asArray(item.category).map((c) => {
    if (typeof c === "string") return c;
    return c?.["#text"] ?? c?.["@_term"] ?? c?.term ?? null;
  });
  return cats.filter(Boolean).map((c) => String(c).toLowerCase().replace(/\s+/g, "_").slice(0, 64));
}

function pickDate(item, fields) {
  for (const field of fields) {
    const parts = field.split(":");
    let cur = item;
    for (const p of parts) cur = cur?.[p];
    if (cur) return String(cur).trim().slice(0, 80);
  }
  return null;
}

function parseRssItems(channel) {
  return asArray(channel?.item).map((item, idx) => {
    const title = item.title ? String(item.title).trim().slice(0, 500) : null;
    const link = item.link ? String(item.link).trim().slice(0, 2000) : null;
    const guid = item.guid?.["#text"] ?? item.guid ?? `rss-network-${idx}`;
    const published_at = pickDate(item, ["pubDate", "dc:date", "updated"]);
    return {
      title,
      url: link,
      published_at,
      summary_snippet: snippet(item.description),
      detected_topics: detectTopics(item),
      entry_key: String(guid).slice(0, 200),
    };
  });
}

function parseAtomEntries(feed) {
  return asArray(feed?.entry).map((entry, idx) => {
    const title = entry.title?.["#text"] ?? entry.title;
    const titleStr = title ? String(title).trim().slice(0, 500) : null;
    let link = entry.link;
    if (Array.isArray(link)) link = link.find((l) => l?.["@_rel"] !== "self") ?? link[0];
    if (typeof link === "object") link = link?.["@_href"] ?? link?.href;
    const linkStr = link ? String(link).trim().slice(0, 2000) : null;
    const id = entry.id ? String(entry.id).trim().slice(0, 500) : `atom-network-${idx}`;
    const published_at = pickDate(entry, ["published", "updated"]);
    const summary = entry.summary?.["#text"] ?? entry.summary;
    return {
      title: titleStr,
      url: linkStr,
      published_at,
      summary_snippet: snippet(summary),
      detected_topics: detectTopics(entry),
      entry_key: id.slice(0, 200),
    };
  });
}

function parseFeedXml(xml) {
  const parser = new XMLParser(PARSER_OPTIONS);
  const doc = parser.parse(xml);
  if (doc?.rss?.channel ?? doc?.channel) {
    return { format: "rss", entries: parseRssItems(doc?.rss?.channel ?? doc?.channel) };
  }
  const feed = doc?.feed ?? doc?.["atom:feed"];
  if (feed) {
    return { format: "atom", entries: parseAtomEntries(feed) };
  }
  throw new Error("Unrecognized RSS/Atom feed format");
}

function assertExecutionSafety(execution, approval, adapter) {
  const errors = [];
  const prefix = `execution ${execution.execution_id}`;

  if (execution.execution_id !== T055_EXECUTION_ID) {
    errors.push(`${prefix}: execution_id must be ${T055_EXECUTION_ID}`);
  }
  if (execution.approval_id !== T054_APPROVAL_ID) {
    errors.push(`${prefix}: approval_id must be ${T054_APPROVAL_ID}`);
  }
  if (execution.adapter_id !== T055_ADAPTER_ID) {
    errors.push(`${prefix}: adapter_id must be ${T055_ADAPTER_ID}`);
  }
  if (execution.status !== "control_tower_approved_for_one_off_run") {
    errors.push(`${prefix}: status must be control_tower_approved_for_one_off_run`);
  }
  if (execution.mode !== "one_off_network_dry_run") {
    errors.push(`${prefix}: mode must be one_off_network_dry_run`);
  }
  if (execution.max_network_requests !== 1) {
    errors.push(`${prefix}: max_network_requests must be 1`);
  }
  if (execution.schedule_enabled !== false || execution.broad_crawl_allowed !== false) {
    errors.push(`${prefix}: schedule_enabled and broad_crawl_allowed must be false`);
  }
  if (execution.stores_metadata_only !== true || execution.stores_full_text !== false) {
    errors.push(`${prefix}: metadata-only storage flags invalid`);
  }
  if (execution.legal_text_publication_allowed !== false) {
    errors.push(`${prefix}: legal_text_publication_allowed must be false`);
  }

  for (const key of [
    "verified_on_source",
    "client_use_allowed",
    "client_evidence_allowed",
    "final_evidence_allowed",
    "legal_change_claimed",
  ]) {
    if (execution.gates?.[key] !== false) {
      errors.push(`${prefix}: gates.${key} must be false`);
    }
  }

  if (approval.approval_id !== execution.approval_id) {
    errors.push(`${prefix}: approval mismatch`);
  }
  if (approval.adapter_id !== execution.adapter_id) {
    errors.push(`${prefix}: approval adapter mismatch`);
  }
  if (approval.output_path !== execution.output_path) {
    errors.push(`${prefix}: output_path must match approval`);
  }

  const endpointHost = hostFromUrl(approval.endpoint_url);
  if (!endpointHost || endpointHost !== approval.allowed_host) {
    errors.push(`${prefix}: approval endpoint host invalid`);
  }

  const adapterEndpoint = adapter.endpoint_url ?? adapter.source_url;
  if (adapterEndpoint && approval.endpoint_url !== adapterEndpoint) {
    errors.push(`${prefix}: endpoint must match allowlist adapter`);
  }
  if (adapter.allowed_host !== approval.allowed_host) {
    errors.push(`${prefix}: allowed_host must match adapter`);
  }

  return errors;
}

async function fetchWithByteCap(url, { timeoutSeconds, maxBytes }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutSeconds * 1000);
  let networkRequestsUsed = 0;

  try {
    networkRequestsUsed = 1;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
        "User-Agent": USER_AGENT,
      },
      signal: controller.signal,
      redirect: "follow",
    });

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body not readable");
    }

    const chunks = [];
    let bytesRead = 0;
    let truncated = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      if (bytesRead + value.length > maxBytes) {
        const remaining = maxBytes - bytesRead;
        if (remaining > 0) chunks.push(value.subarray(0, remaining));
        bytesRead = maxBytes;
        truncated = true;
        try {
          await reader.cancel();
        } catch {
          /* ignore */
        }
        break;
      }
      chunks.push(value);
      bytesRead += value.length;
    }

    const body = Buffer.concat(chunks).toString("utf8");
    return {
      http_status: response.status,
      content_type: response.headers.get("content-type"),
      bytes_read: bytesRead,
      truncated,
      body,
      network_requests_used: networkRequestsUsed,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeCandidates(execution, approval, adapter, entries) {
  const limited = entries.slice(0, execution.max_items);
  return limited.map((entry, idx) => ({
    candidate_id: `${execution.execution_id}-${approval.approval_id}-${idx + 1}`,
    execution_id: execution.execution_id,
    approval_id: approval.approval_id,
    run_id: execution.run_id,
    adapter_id: adapter.adapter_id,
    source_id: adapter.source_id,
    source_name: adapter.source_name,
    title: entry.title,
    url: entry.url,
    published_at: entry.published_at,
    summary_snippet: entry.summary_snippet,
    detected_topics: entry.detected_topics,
    jurisdiction_ids: adapter.jurisdiction_ids,
    metadata_only: true,
    verified_on_source: false,
    client_use_allowed: false,
    client_evidence_allowed: false,
    final_evidence_allowed: false,
    legal_change_claimed: false,
    source_collection_mode: "one_off_network_dry_run",
    manual_review_required: true,
    entry_key: entry.entry_key,
  }));
}

function main() {
  const runMain = async () => {
    const { approvalId, executionId, understandNetwork } = parseArgs(process.argv);
    const envOk = process.env.CAESAR_ALLOW_SINGLE_NETWORK_DRY_RUN === "YES";

    if (!approvalId || !executionId) {
      refuse("missing required --approval-id and --execution-id.", [
        "Usage: npm run run:approved-network-dry-run -- --approval-id T054-001 --execution-id T055-001 --i-understand-this-runs-network",
        "Also requires env CAESAR_ALLOW_SINGLE_NETWORK_DRY_RUN=YES for the one approved live run.",
      ]);
    }

    if (approvalId !== T054_APPROVAL_ID || executionId !== T055_EXECUTION_ID) {
      refuse("only T054-001 / T055-001 are approved for T055.", [
        `Got approval_id=${approvalId}, execution_id=${executionId}`,
      ]);
    }

    if (!understandNetwork || !envOk) {
      const hints = [];
      if (!understandNetwork) {
        hints.push("Note: live run requires --i-understand-this-runs-network");
      }
      if (!envOk) {
        hints.push("Note: live run requires CAESAR_ALLOW_SINGLE_NETWORK_DRY_RUN=YES");
      }
      hints.push(
        "Network dry-run execution is disabled without explicit Control Tower approval signals.",
      );
      refuse("network dry-run not enabled (safe refusal).", hints);
    }

    for (const p of [APPROVALS_PATH, EXECUTIONS_PATH, ALLOWLIST_PATH, RUNS_PATH]) {
      if (!fs.existsSync(p)) {
        console.error(`Missing required file: ${p}`);
        process.exit(1);
      }
    }

    const approvalsDoc = yaml.load(fs.readFileSync(APPROVALS_PATH, "utf8"));
    const executionsDoc = yaml.load(fs.readFileSync(EXECUTIONS_PATH, "utf8"));
    const allowlist = yaml.load(fs.readFileSync(ALLOWLIST_PATH, "utf8"));
    const runsDoc = yaml.load(fs.readFileSync(RUNS_PATH, "utf8"));

    const approval = (approvalsDoc.approvals ?? []).find((a) => a.approval_id === approvalId);
    const execution = (executionsDoc.executions ?? []).find((e) => e.execution_id === executionId);
    if (!approval) {
      console.error(`Approval not found: ${approvalId}`);
      process.exit(1);
    }
    if (!execution) {
      console.error(`Execution not found: ${executionId}`);
      process.exit(1);
    }

    const adapter = (allowlist.adapters ?? []).find((a) => a.adapter_id === execution.adapter_id);
    const run = (runsDoc.runs ?? []).find((r) => r.run_id === execution.run_id);
    if (!adapter) {
      console.error(`Adapter not found: ${execution.adapter_id}`);
      process.exit(1);
    }
    if (!run) {
      console.error(`Manual intake run not found: ${execution.run_id}`);
      process.exit(1);
    }

    const safetyErrors = assertExecutionSafety(execution, approval, adapter);
    if (safetyErrors.length > 0) {
      console.error("Safety check failed:");
      for (const msg of safetyErrors) console.error(`  ${msg}`);
      process.exit(1);
    }

    const endpointUrl = approval.endpoint_url;
    const endpointHost = hostFromUrl(endpointUrl);
    if (!endpointHost || endpointHost !== approval.allowed_host) {
      refuse("endpoint host does not match allowed_host.");
    }

    const requestedAt = new Date().toISOString();
    let fetchResult;
    try {
      fetchResult = await fetchWithByteCap(endpointUrl, {
        timeoutSeconds: execution.timeout_seconds,
        maxBytes: execution.max_bytes,
      });
    } catch (err) {
      console.error(`Network dry-run fetch failed: ${err?.message ?? err}`);
      process.exit(1);
    }

    if (fetchResult.network_requests_used !== 1) {
      console.error("Invariant violation: more than one network request");
      process.exit(1);
    }

    let entries = [];
    let itemsSeen = 0;
    try {
      const parsed = parseFeedXml(fetchResult.body);
      itemsSeen = parsed.entries.length;
      entries = parsed.entries;
    } catch (err) {
      console.error(`Feed parse failed: ${err?.message ?? err}`);
      process.exit(1);
    }

    const candidates = normalizeCandidates(execution, approval, adapter, entries);
    const completedAt = new Date().toISOString();

    const candidatePayload = {
      generated_at: completedAt.slice(0, 10),
      runner: "run-approved-network-dry-run",
      execution_id: execution.execution_id,
      approval_id: approval.approval_id,
      run_id: execution.run_id,
      adapter_id: execution.adapter_id,
      source_id: execution.source_id,
      network_fetch: true,
      metadata_only: true,
      legal_safe_note:
        "One-off network dry-run metadata candidates. Not verified on source. Not legal advice. Gates closed. Local/manual review only.",
      candidate_count: candidates.length,
      candidates,
    };

    const outAbs = path.join(ROOT, execution.output_path);
    const outRaw = `${JSON.stringify(candidatePayload, null, 2)}\n`;
    fs.mkdirSync(path.dirname(outAbs), { recursive: true });
    fs.writeFileSync(outAbs, outRaw, "utf8");
    const outputSha256 = crypto.createHash("sha256").update(outRaw).digest("hex");

    const report = {
      execution_id: execution.execution_id,
      approval_id: approval.approval_id,
      adapter_id: execution.adapter_id,
      endpoint_host: endpointHost,
      requested_at: requestedAt,
      completed_at: completedAt,
      http_status: fetchResult.http_status,
      content_type: fetchResult.content_type,
      bytes_read: fetchResult.bytes_read,
      response_truncated: fetchResult.truncated === true,
      items_seen: itemsSeen,
      candidates_written: candidates.length,
      output_path: execution.output_path,
      output_sha256: outputSha256,
      max_network_requests: 1,
      network_requests_used: fetchResult.network_requests_used,
      schedule_enabled: false,
      broad_crawl_allowed: false,
      published_to_public_data: false,
      gates: {
        verified_on_source: false,
        client_use_allowed: false,
        client_evidence_allowed: false,
        final_evidence_allowed: false,
        legal_change_claimed: false,
      },
      notes:
        "T055 one-off EDPB publications RSS metadata dry-run. Not source verification. Not publication.",
    };

    const reportAbs = path.join(ROOT, execution.report_path);
    fs.mkdirSync(path.dirname(reportAbs), { recursive: true });
    fs.writeFileSync(reportAbs, `${JSON.stringify(report, null, 2)}\n`, "utf8");

    if (path.resolve(outAbs).startsWith(path.join(ROOT, "public"))) {
      console.error("Refused: candidate output must not be under public/");
      process.exit(1);
    }

    console.log("PASS: approved network dry-run completed");
    console.log(`  execution_id: ${execution.execution_id}`);
    console.log(`  approval_id: ${approval.approval_id}`);
    console.log(`  adapter_id: ${execution.adapter_id}`);
    console.log(`  endpoint_host: ${endpointHost}`);
    console.log(`  http_status: ${fetchResult.http_status}`);
    console.log(`  bytes_read: ${fetchResult.bytes_read}`);
    console.log(`  candidates_written: ${candidates.length}`);
    console.log(`  network_requests_used: ${fetchResult.network_requests_used}`);
    console.log(`  output: ${execution.output_path}`);
    console.log(`  report: ${execution.report_path}`);
  };

  runMain().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

main();
