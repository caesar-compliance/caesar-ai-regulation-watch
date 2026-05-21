#!/usr/bin/env node
/**
 * Validate automation runtime YAML and T073 safety invariants.
 * No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = path.join(ROOT, "data/runtime/automation-runtime.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/automation-runtime.schema.json");
const SQL_PATH = path.join(ROOT, "ops/supabase/001_regulation_watch_runtime_schema.sql");
const WORKER_FILES = [
  path.join(ROOT, "ops/cloudflare-workers/regulation-watch-monitor/README.md"),
  path.join(ROOT, "ops/cloudflare-workers/regulation-watch-monitor/wrangler.toml.example"),
  path.join(ROOT, "ops/cloudflare-workers/regulation-watch-monitor/src/index.ts"),
];

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
delete schema.$schema;
const validateSchema = ajv.compile(schema);

function main() {
  const errors = [];

  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`Missing config: ${CONFIG_PATH}`);
    process.exit(1);
  }

  const config = yaml.load(fs.readFileSync(CONFIG_PATH, "utf8"));
  if (!validateSchema(config)) {
    for (const err of validateSchema.errors ?? []) {
      errors.push(`${err.instancePath || "/"}: ${err.message}`);
    }
  }

  const boolChecks = [
    ["live_ingestion_enabled", false],
    ["scheduled_monitoring_enabled", false],
    ["network_execution_enabled", false],
  ];
  for (const [key, expected] of boolChecks) {
    if (config[key] !== expected) {
      errors.push(`${key} must be ${expected}`);
    }
  }

  const policy = config.source_policy ?? {};
  const policyChecks = [
    ["allowlisted_sources_only", true],
    ["no_broad_crawl", true],
    ["metadata_only", true],
    ["full_text_storage_allowed", false],
  ];
  for (const [key, expected] of policyChecks) {
    if (policy[key] !== expected) {
      errors.push(`source_policy.${key} must be ${expected}`);
    }
  }

  const gates = config.gates ?? {};
  for (const key of ["verified_on_source", "client_use_allowed", "legal_change_claimed"]) {
    if (gates[key] !== false) {
      errors.push(`gates.${key} must be false`);
    }
  }

  if (!fs.existsSync(SQL_PATH)) {
    errors.push(`Missing Supabase schema: ${SQL_PATH}`);
  }

  for (const file of WORKER_FILES) {
    if (!fs.existsSync(file)) {
      errors.push(`Missing worker scaffold file: ${file}`);
    }
  }

  if (errors.length > 0) {
    console.error("validate-automation-runtime: FAILED");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log("PASS: validate-automation-runtime");
}

main();
