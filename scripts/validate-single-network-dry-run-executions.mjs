#!/usr/bin/env node
/**
 * Validate single network dry-run execution records against schema and T055 safety invariants.
 * Cross-checks approvals, manual runs, and allowlist. No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXECUTIONS_PATH = path.join(ROOT, "data/source-adapters/single-network-dry-run-executions.yml");
const APPROVALS_PATH = path.join(ROOT, "data/source-adapters/network-dry-run-approvals.yml");
const ALLOWLIST_PATH = path.join(ROOT, "data/source-adapters/source-adapter-allowlist.yml");
const RUNS_PATH = path.join(ROOT, "data/source-adapters/manual-intake-runs.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/single-network-dry-run-execution.schema.json");
const CANDIDATE_PREFIX = "generated/network-dry-run-candidates/";
const REPORT_PREFIX = "generated/network-dry-run-reports/";

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

function invariantErrors(execution, index, adapterById, approvalById, runById) {
  const prefix = `executions[${index}] (${execution?.execution_id ?? "?"})`;
  const errors = [];

  if (execution.execution_id !== "T055-001") {
    errors.push(`${prefix}: execution_id must be T055-001 for T055 pilot`);
  }
  if (execution.approval_id !== "T054-001") {
    errors.push(`${prefix}: approval_id must be T054-001 for T055 pilot`);
  }
  if (execution.adapter_id !== "edpb-publications-rss") {
    errors.push(`${prefix}: adapter_id must be edpb-publications-rss for T055 pilot`);
  }

  const boolFlags = [
    ["schedule_enabled", false],
    ["broad_crawl_allowed", false],
    ["stores_metadata_only", true],
    ["stores_full_text", false],
    ["legal_text_publication_allowed", false],
  ];
  for (const [key, expected] of boolFlags) {
    if (execution[key] !== expected) {
      errors.push(`${prefix}: ${key} must be ${expected}, got ${execution[key]}`);
    }
  }

  if (execution.max_network_requests !== 1) {
    errors.push(`${prefix}: max_network_requests must be 1`);
  }
  if (execution.max_items > 5) {
    errors.push(`${prefix}: max_items must be <= 5`);
  }
  if (execution.max_bytes > 500000) {
    errors.push(`${prefix}: max_bytes must be <= 500000`);
  }
  if (execution.timeout_seconds > 20) {
    errors.push(`${prefix}: timeout_seconds must be <= 20`);
  }

  const gateKeys = [
    "verified_on_source",
    "client_use_allowed",
    "client_evidence_allowed",
    "final_evidence_allowed",
    "legal_change_claimed",
  ];
  for (const key of gateKeys) {
    if (execution.gates?.[key] !== false) {
      errors.push(`${prefix}: gates.${key} must be false`);
    }
  }

  if (!execution.output_path?.startsWith(CANDIDATE_PREFIX) || !execution.output_path.endsWith(".json")) {
    errors.push(`${prefix}: output_path must be under ${CANDIDATE_PREFIX}`);
  }
  if (!execution.report_path?.startsWith(REPORT_PREFIX) || !execution.report_path.endsWith(".json")) {
    errors.push(`${prefix}: report_path must be under ${REPORT_PREFIX}`);
  }

  const forbiddenKeys = ["network_execution_allowed", "network_allowed"];
  for (const key of forbiddenKeys) {
    if (key in execution) {
      errors.push(`${prefix}: persistent field ${key} is not allowed on execution records`);
    }
  }

  const approval = approvalById.get(execution.approval_id);
  if (!approval) {
    errors.push(`${prefix}: unknown approval_id ${execution.approval_id}`);
  } else {
    if (approval.run_id !== execution.run_id) {
      errors.push(`${prefix}: run_id does not match approval ${execution.approval_id}`);
    }
    if (approval.adapter_id !== execution.adapter_id) {
      errors.push(`${prefix}: adapter_id does not match approval`);
    }
    if (approval.source_id !== execution.source_id) {
      errors.push(`${prefix}: source_id does not match approval`);
    }
    if (execution.output_path !== approval.output_path) {
      errors.push(`${prefix}: output_path must match approval output_path`);
    }
    const host = hostFromUrl(approval.endpoint_url);
    if (!host || host !== approval.allowed_host) {
      errors.push(`${prefix}: approval endpoint host mismatch (internal)`);
    }
  }

  const run = runById.get(execution.run_id);
  if (!run) {
    errors.push(`${prefix}: unknown run_id ${execution.run_id}`);
  } else if (run.adapter_id !== execution.adapter_id) {
    errors.push(`${prefix}: run adapter_id does not match execution`);
  }

  const adapter = adapterById.get(execution.adapter_id);
  if (!adapter) {
    errors.push(`${prefix}: unknown adapter_id ${execution.adapter_id}`);
  } else if (adapter.source_id !== execution.source_id) {
    errors.push(`${prefix}: adapter source_id does not match execution`);
  }

  return errors;
}

function main() {
  for (const p of [EXECUTIONS_PATH, APPROVALS_PATH, ALLOWLIST_PATH, RUNS_PATH, SCHEMA_PATH]) {
    if (!fs.existsSync(p)) {
      console.error(`Missing required file: ${p}`);
      process.exit(1);
    }
  }

  const doc = normalizeDates(yaml.load(fs.readFileSync(EXECUTIONS_PATH, "utf8")));
  const schemaOk = validateSchema(doc);
  if (!schemaOk) {
    console.error("Schema validation failed:");
    for (const err of validateSchema.errors ?? []) {
      console.error(`  ${err.instancePath || "/"} ${err.message}`);
    }
    process.exit(1);
  }

  const allowlist = normalizeDates(yaml.load(fs.readFileSync(ALLOWLIST_PATH, "utf8")));
  const approvalsDoc = normalizeDates(yaml.load(fs.readFileSync(APPROVALS_PATH, "utf8")));
  const runsDoc = normalizeDates(yaml.load(fs.readFileSync(RUNS_PATH, "utf8")));

  const adapterById = new Map((allowlist.adapters ?? []).map((a) => [a.adapter_id, a]));
  const approvalById = new Map((approvalsDoc.approvals ?? []).map((a) => [a.approval_id, a]));
  const runById = new Map((runsDoc.runs ?? []).map((r) => [r.run_id, r]));

  const executions = doc.executions ?? [];
  const invariantFailures = executions.flatMap((e, i) =>
    invariantErrors(e, i, adapterById, approvalById, runById),
  );

  if (doc.no_live_collection !== true || doc.no_scheduled_monitoring !== true) {
    invariantFailures.push("root: no_live_collection and no_scheduled_monitoring must be true");
  }

  const executionIds = new Set();
  for (const e of executions) {
    if (executionIds.has(e.execution_id)) {
      invariantFailures.push(`duplicate execution_id: ${e.execution_id}`);
    }
    executionIds.add(e.execution_id);
  }

  if (invariantFailures.length > 0) {
    console.error("Safety invariant failures:");
    for (const msg of invariantFailures) console.error(`  ${msg}`);
    process.exit(1);
  }

  console.log("PASS: single network dry-run executions validated");
  console.log(`  executions: ${executions.length}`);
  console.log(`  file: ${EXECUTIONS_PATH}`);
}

main();
