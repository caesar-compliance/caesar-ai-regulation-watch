#!/usr/bin/env node
/**
 * Validate network dry-run approval packets against schema and T054 safety invariants.
 * Cross-checks source-adapter-allowlist.yml and manual-intake-runs.yml. No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPROVALS_PATH = path.join(ROOT, "data/source-adapters/network-dry-run-approvals.yml");
const ALLOWLIST_PATH = path.join(ROOT, "data/source-adapters/source-adapter-allowlist.yml");
const RUNS_PATH = path.join(ROOT, "data/source-adapters/manual-intake-runs.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/network-dry-run-approval.schema.json");
const CANDIDATE_PREFIX = "generated/network-dry-run-candidates/";
const PLAN_PREFIX = "generated/network-dry-run-plans/";

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
delete schema.$schema;
const validateSchema = ajv.compile(schema);

function normalizeDates(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(normalizeDates);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalizeDates(v);
    return out;
  }
  return value;
}

function hostFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function invariantErrors(approval, index, adapterById, runById) {
  const prefix = `approvals[${index}] (${approval?.approval_id ?? "?"})`;
  const errors = [];

  const boolFlags = [
    ["control_tower_approval_required", true],
    ["network_execution_allowed", false],
    ["schedule_enabled", false],
    ["broad_crawl_allowed", false],
    ["stores_metadata_only", true],
    ["stores_full_text", false],
    ["legal_text_publication_allowed", false],
    ["paywall_login_required", false],
    ["captcha_or_waf_risk", false],
  ];
  for (const [key, expected] of boolFlags) {
    if (approval[key] !== expected) {
      errors.push(`${prefix}: ${key} must be ${expected}, got ${approval[key]}`);
    }
  }

  const gateKeys = [
    "verified_on_source",
    "client_use_allowed",
    "client_evidence_allowed",
    "final_evidence_allowed",
    "legal_change_claimed",
  ];
  for (const key of gateKeys) {
    if (approval.gates?.[key] !== false) {
      errors.push(`${prefix}: gates.${key} must be false`);
    }
  }

  if (approval.max_items > 5) {
    errors.push(`${prefix}: max_items must be <= 5`);
  }
  if (approval.max_bytes > 500000) {
    errors.push(`${prefix}: max_bytes must be <= 500000`);
  }
  if (approval.timeout_seconds > 20) {
    errors.push(`${prefix}: timeout_seconds must be <= 20`);
  }

  if (!approval.output_path?.startsWith(CANDIDATE_PREFIX) || !approval.output_path.endsWith(".json")) {
    errors.push(`${prefix}: output_path must be under ${CANDIDATE_PREFIX}`);
  }
  if (!approval.dry_run_plan_path?.startsWith(PLAN_PREFIX) || !approval.dry_run_plan_path.endsWith(".json")) {
    errors.push(`${prefix}: dry_run_plan_path must be under ${PLAN_PREFIX}`);
  }

  const endpointHost = hostFromUrl(approval.endpoint_url);
  if (!endpointHost) {
    errors.push(`${prefix}: invalid endpoint_url`);
  } else if (endpointHost !== approval.allowed_host) {
    errors.push(
      `${prefix}: allowed_host ${approval.allowed_host} does not match endpoint host ${endpointHost}`,
    );
  }

  const adapter = adapterById.get(approval.adapter_id);
  if (!adapter) {
    errors.push(`${prefix}: unknown adapter_id ${approval.adapter_id}`);
    return errors;
  }
  if (adapter.source_id !== approval.source_id) {
    errors.push(
      `${prefix}: source_id ${approval.source_id} does not match adapter source_id ${adapter.source_id}`,
    );
  }
  if (adapter.paywall_login_required !== false) {
    errors.push(`${prefix}: adapter must not require paywall/login`);
  }
  if (adapter.captcha_or_waf_risk !== false) {
    errors.push(`${prefix}: adapter must not have CAPTCHA/WAF risk flagged`);
  }
  if (adapter.schedule_enabled !== false) {
    errors.push(`${prefix}: adapter schedule_enabled must be false`);
  }
  if (adapter.broad_crawl_allowed !== false) {
    errors.push(`${prefix}: adapter broad_crawl_allowed must be false`);
  }
  if (adapter.stores_metadata_only !== true) {
    errors.push(`${prefix}: adapter stores_metadata_only must be true`);
  }
  if (adapter.stores_full_text !== false) {
    errors.push(`${prefix}: adapter stores_full_text must be false`);
  }
  if (adapter.legal_text_publication_allowed !== false) {
    errors.push(`${prefix}: adapter legal_text_publication_allowed must be false`);
  }

  const adapterEndpoint = adapter.endpoint_url ?? adapter.source_url;
  if (adapterEndpoint && approval.endpoint_url !== adapterEndpoint) {
    errors.push(`${prefix}: endpoint_url must match allowlist adapter endpoint`);
  }
  const adapterHost = adapterEndpoint ? hostFromUrl(adapterEndpoint) : null;
  if (adapterHost && adapter.allowed_host !== adapterHost) {
    errors.push(`${prefix}: adapter allowlist host mismatch (internal)`);
  }
  if (adapter.allowed_host !== approval.allowed_host) {
    errors.push(
      `${prefix}: allowed_host ${approval.allowed_host} does not match adapter ${adapter.allowed_host}`,
    );
  }

  const run = runById.get(approval.run_id);
  if (!run) {
    errors.push(`${prefix}: unknown run_id ${approval.run_id}`);
  } else {
    if (run.adapter_id !== approval.adapter_id) {
      errors.push(`${prefix}: run adapter_id ${run.adapter_id} does not match approval adapter_id`);
    }
    if (run.source_id !== approval.source_id) {
      errors.push(`${prefix}: run source_id does not match approval source_id`);
    }
  }

  return errors;
}

function main() {
  for (const p of [APPROVALS_PATH, ALLOWLIST_PATH, RUNS_PATH, SCHEMA_PATH]) {
    if (!fs.existsSync(p)) {
      console.error(`Missing required file: ${p}`);
      process.exit(1);
    }
  }

  const doc = normalizeDates(yaml.load(fs.readFileSync(APPROVALS_PATH, "utf8")));
  const schemaOk = validateSchema(doc);
  if (!schemaOk) {
    console.error("Schema validation failed:");
    for (const err of validateSchema.errors ?? []) {
      console.error(`  ${err.instancePath || "/"} ${err.message}`);
    }
    process.exit(1);
  }

  const allowlist = normalizeDates(yaml.load(fs.readFileSync(ALLOWLIST_PATH, "utf8")));
  const runsDoc = normalizeDates(yaml.load(fs.readFileSync(RUNS_PATH, "utf8")));
  const adapterById = new Map((allowlist.adapters ?? []).map((a) => [a.adapter_id, a]));
  const runById = new Map((runsDoc.runs ?? []).map((r) => [r.run_id, r]));

  const approvals = doc.approvals ?? [];
  const invariantFailures = approvals.flatMap((a, i) => invariantErrors(a, i, adapterById, runById));

  if (doc.no_live_collection !== true || doc.no_scheduled_monitoring !== true) {
    invariantFailures.push("root: no_live_collection and no_scheduled_monitoring must be true");
  }

  const approvalIds = new Set();
  for (const a of approvals) {
    if (approvalIds.has(a.approval_id)) {
      invariantFailures.push(`duplicate approval_id: ${a.approval_id}`);
    }
    approvalIds.add(a.approval_id);
  }

  if (invariantFailures.length > 0) {
    console.error("Safety invariant failures:");
    for (const msg of invariantFailures) console.error(`  ${msg}`);
    process.exit(1);
  }

  console.log("PASS: network dry-run approvals validated");
  console.log(`  approvals: ${approvals.length}`);
  console.log(`  file: ${APPROVALS_PATH}`);
}

main();
