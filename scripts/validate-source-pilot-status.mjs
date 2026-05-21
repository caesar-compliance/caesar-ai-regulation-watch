#!/usr/bin/env node
/**
 * Validate public source pilot status JSON against schema and safety invariants.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATUS_PATH = path.join(ROOT, "public/data/source-pilot-status.json");
const SCHEMA_PATH = path.join(ROOT, "schemas/source-pilot-status.schema.json");

const FORBIDDEN_KEY_PATTERN =
  /^(.*\.)?(password|secret|db_url|database_url|hostname|host|username|service_role|anon_key|token|connection_string|body|html|legal_text)$/i;

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function main() {
  const errors = [];

  if (!fs.existsSync(STATUS_PATH)) {
    console.error(`Missing: ${STATUS_PATH} — run npm run build:source-pilot-status`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(STATUS_PATH, "utf8"));
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
  delete schema.$schema;
  const validate = ajv.compile(schema);

  if (!validate(data)) {
    for (const err of validate.errors ?? []) {
      errors.push(`${err.instancePath || "/"}: ${err.message}`);
    }
  }

  for (const key of [
    "live_ingestion_enabled",
    "scheduled_monitoring_enabled",
    "network_execution_enabled",
  ]) {
    if (data.runtime_flags?.[key] !== false) {
      errors.push(`runtime_flags.${key} must be false`);
    }
  }

  for (const key of [
    "verified_on_source",
    "client_use_allowed",
    "client_evidence_allowed",
    "final_evidence_allowed",
    "legal_change_claimed",
    "publication_allowed",
    "public_export_allowed",
  ]) {
    if (data.gates?.[key] !== false) {
      errors.push(`gates.${key} must be false`);
    }
  }

  for (const source of data.sources ?? []) {
    if (source.allowed_for_network_check !== false) {
      errors.push(`${source.source_id}: allowed_for_network_check must be false`);
    }
    if (source.stores_metadata_only !== true) {
      errors.push(`${source.source_id}: stores_metadata_only must be true`);
    }
  }

  function scanKeys(obj, prefix = "") {
    if (obj === null || typeof obj !== "object") return;
    for (const [key, value] of Object.entries(obj)) {
      const p = prefix ? `${prefix}.${key}` : key;
      if (FORBIDDEN_KEY_PATTERN.test(key)) {
        errors.push(`forbidden key in public export: ${p}`);
      }
      if (typeof value === "string" && /postgres:\/\//i.test(value)) {
        errors.push(`public export must not contain database URLs at ${p}`);
      }
      if (value && typeof value === "object") scanKeys(value, p);
    }
  }
  scanKeys(data);

  if (errors.length > 0) {
    console.error("validate-source-pilot-status: FAILED");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log(`PASS: validate-source-pilot-status (${data.status}, ${data.source_count} sources)`);
}

main();
