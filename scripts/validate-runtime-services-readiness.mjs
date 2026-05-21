#!/usr/bin/env node
/**
 * Validate public runtime services readiness JSON — no credentials required.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const READINESS_PATH = path.join(
  ROOT,
  "public/data/runtime-services-readiness.json",
);
const SCHEMA_PATH = path.join(
  ROOT,
  "schemas/runtime-services-readiness.schema.json",
);

const FORBIDDEN_KEY_PATTERN =
  /^(.*\.)?(password|secret|email|db_url|database_url|hostname|host|username|service_role|anon_key|token|api_token|connection_string|project_ref|account_id)$/i;

const FORBIDDEN_VALUE_PATTERNS = [
  /postgres:\/\//i,
  /@gmail\.com/i,
  /@law\.com/i,
  /eyJ[a-zA-Z0-9_-]{10,}/,
  /sk_[a-zA-Z0-9]{10,}/,
];

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function scanKeys(obj, prefix = "", errors = []) {
  if (obj === null || typeof obj !== "object") return errors;
  for (const [key, value] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${key}` : key;
    if (FORBIDDEN_KEY_PATTERN.test(key)) {
      errors.push(`forbidden key in public export: ${p}`);
    }
    if (typeof value === "string") {
      for (const pat of FORBIDDEN_VALUE_PATTERNS) {
        if (pat.test(value)) {
          errors.push(`forbidden value pattern in public export at ${p}`);
        }
      }
    }
    if (value && typeof value === "object") scanKeys(value, p, errors);
  }
  return errors;
}

function main() {
  const errors = [];

  if (!fs.existsSync(READINESS_PATH)) {
    console.error(
      `Missing: ${READINESS_PATH} — run npm run runtime:services:check`,
    );
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(READINESS_PATH, "utf8"));
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
    if (data[key] !== false) {
      errors.push(`${key} must be false in public export`);
    }
  }

  if (data.readiness?.uptime_manual_setup_required !== true) {
    errors.push("readiness.uptime_manual_setup_required must be true");
  }

  for (const [flag, expected] of Object.entries(data.safety_flags ?? {})) {
    if (expected !== false) {
      errors.push(`safety_flags.${flag} must be false in public export`);
    }
  }

  scanKeys(data, "", errors);

  if (errors.length > 0) {
    console.error("validate-runtime-services-readiness: FAILED");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log(
    `PASS: validate-runtime-services-readiness (${data.status})`,
  );
}

main();
