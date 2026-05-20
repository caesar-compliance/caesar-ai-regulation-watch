#!/usr/bin/env node
/**
 * Validate manual source intake runs YAML against schema and T053 safety invariants.
 * Cross-checks source-adapter-allowlist.yml. No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUNS_PATH = path.join(ROOT, "data/source-adapters/manual-intake-runs.yml");
const ALLOWLIST_PATH = path.join(ROOT, "data/source-adapters/source-adapter-allowlist.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/manual-source-intake-run.schema.json");
const OUTPUT_PREFIX = "generated/source-intake-candidates/";

const ALLOWED_RUN_STATUSES_FOR_ADAPTER = new Set(["disabled", "draft", "manual_review_ready"]);
const ALLOWED_COLLECTION_MODES = new Set(["fixture_only", "manual_network_disabled"]);

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

function invariantErrors(run, index, adapterById) {
  const prefix = `runs[${index}] (${run?.run_id ?? "?"})`;
  const errors = [];

  const boolGates = [
    ["verified_on_source", false],
    ["client_use_allowed", false],
    ["client_evidence_allowed", false],
    ["final_evidence_allowed", false],
    ["legal_change_claimed", false],
    ["schedule_enabled", false],
    ["stores_full_text", false],
  ];
  for (const [key, expected] of boolGates) {
    if (run[key] !== expected) {
      errors.push(`${prefix}: ${key} must be ${expected}, got ${run[key]}`);
    }
  }
  if (run.stores_metadata_only !== true) {
    errors.push(`${prefix}: stores_metadata_only must be true`);
  }
  if (run.approval_required !== true) {
    errors.push(`${prefix}: approval_required must be true`);
  }

  const strictNetwork =
    run.mode === "manual_network_approved" &&
    run.status === "approved_for_single_manual_run";
  if (run.network_allowed === true && !strictNetwork) {
    errors.push(
      `${prefix}: network_allowed true only allowed with mode manual_network_approved and status approved_for_single_manual_run`,
    );
  }
  if (strictNetwork && run.network_allowed !== true) {
    errors.push(
      `${prefix}: manual_network_approved + approved_for_single_manual_run requires network_allowed true`,
    );
  }
  if (!strictNetwork && run.network_allowed !== false) {
    errors.push(`${prefix}: network_allowed must be false for fixture/manual-disabled runs`);
  }

  if (!run.output_path?.startsWith(OUTPUT_PREFIX) || !run.output_path.endsWith(".json")) {
    errors.push(`${prefix}: output_path must be under ${OUTPUT_PREFIX} and end with .json`);
  }

  const adapter = adapterById.get(run.adapter_id);
  if (!adapter) {
    errors.push(`${prefix}: unknown adapter_id ${run.adapter_id}`);
    return errors;
  }
  if (adapter.source_id !== run.source_id) {
    errors.push(
      `${prefix}: source_id ${run.source_id} does not match adapter source_id ${adapter.source_id}`,
    );
  }
  if (adapter.schedule_enabled !== false) {
    errors.push(`${prefix}: referenced adapter must have schedule_enabled false`);
  }
  if (!ALLOWED_RUN_STATUSES_FOR_ADAPTER.has(adapter.status)) {
    errors.push(
      `${prefix}: adapter status must be disabled, draft, or manual_review_ready (got ${adapter.status})`,
    );
  }
  if (!ALLOWED_COLLECTION_MODES.has(adapter.collection_mode)) {
    errors.push(
      `${prefix}: adapter collection_mode must be fixture_only or manual_network_disabled`,
    );
  }
  for (const [key, expected] of boolGates) {
    if (adapter[key] !== expected) {
      errors.push(`${prefix}: adapter ${key} must be ${expected}`);
    }
  }
  if (adapter.stores_metadata_only !== true) {
    errors.push(`${prefix}: adapter stores_metadata_only must be true`);
  }

  return errors;
}

function main() {
  if (!fs.existsSync(RUNS_PATH)) {
    console.error(`Missing runs file: ${RUNS_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(ALLOWLIST_PATH)) {
    console.error(`Missing allowlist: ${ALLOWLIST_PATH}`);
    process.exit(1);
  }

  const doc = normalizeDates(yaml.load(fs.readFileSync(RUNS_PATH, "utf8")));
  const schemaOk = validateSchema(doc);
  if (!schemaOk) {
    console.error("Schema validation failed:");
    for (const err of validateSchema.errors ?? []) {
      console.error(`  ${err.instancePath || "/"} ${err.message}`);
    }
    process.exit(1);
  }

  const allowlist = normalizeDates(yaml.load(fs.readFileSync(ALLOWLIST_PATH, "utf8")));
  const adapterById = new Map((allowlist.adapters ?? []).map((a) => [a.adapter_id, a]));

  const runs = doc.runs ?? [];
  const invariantFailures = runs.flatMap((r, i) => invariantErrors(r, i, adapterById));

  if (doc.no_live_collection !== true || doc.no_scheduled_monitoring !== true) {
    invariantFailures.push("root: no_live_collection and no_scheduled_monitoring must be true");
  }

  const runIds = new Set();
  for (const r of runs) {
    if (runIds.has(r.run_id)) {
      invariantFailures.push(`duplicate run_id: ${r.run_id}`);
    }
    runIds.add(r.run_id);
  }

  if (invariantFailures.length > 0) {
    console.error("Safety invariant failures:");
    for (const msg of invariantFailures) console.error(`  ${msg}`);
    process.exit(1);
  }

  console.log("PASS: manual source intake runs validated");
  console.log(`  runs: ${runs.length}`);
  console.log(`  file: ${RUNS_PATH}`);
}

main();
