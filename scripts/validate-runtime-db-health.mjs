#!/usr/bin/env node
/**
 * Validate public runtime DB health JSON against schema and safety invariants.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HEALTH_PATH = path.join(ROOT, "public/data/runtime-db-health.json");
const SCHEMA_PATH = path.join(ROOT, "schemas/runtime-db-health.schema.json");

const FORBIDDEN_KEY_PATTERN =
  /^(.*\.)?(password|secret|db_url|database_url|hostname|host|username|service_role|anon_key|token|connection_string)$/i;

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function main() {
  const errors = [];

  if (!fs.existsSync(HEALTH_PATH)) {
    console.error(`Missing: ${HEALTH_PATH} — run npm run runtime:db:health`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(HEALTH_PATH, "utf8"));
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
  delete schema.$schema;
  const validate = ajv.compile(schema);

  if (!validate(data)) {
    for (const err of validate.errors ?? []) {
      errors.push(`${err.instancePath || "/"}: ${err.message}`);
    }
  }

  for (const key of ["live_ingestion_enabled", "scheduled_monitoring_enabled", "network_execution_enabled"]) {
    if (data[key] !== false) {
      errors.push(`${key} must be false in public export`);
    }
  }

  function scanKeys(obj, prefix = "") {
    if (obj === null || typeof obj !== "object") return;
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (FORBIDDEN_KEY_PATTERN.test(key)) {
        errors.push(`forbidden key in public export: ${path}`);
      }
      if (typeof value === "string" && /postgres:\/\//i.test(value)) {
        errors.push(`public export must not contain database URLs at ${path}`);
      }
      if (value && typeof value === "object") scanKeys(value, path);
    }
  }
  scanKeys(data);

  if (errors.length > 0) {
    console.error("validate-runtime-db-health: FAILED");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log(`PASS: validate-runtime-db-health (${data.status})`);
}

main();
