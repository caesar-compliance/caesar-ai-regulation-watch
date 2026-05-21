#!/usr/bin/env node
/**
 * Validate public source pilot review candidates JSON — schema + safety invariants.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPORT_PATH = path.join(ROOT, "public/data/source-pilot-review-candidates.json");
const SCHEMA_PATH = path.join(ROOT, "schemas/source-pilot-review-candidates.schema.json");

const FORBIDDEN_KEY_PATTERN =
  /^(.*\.)?(password|secret|db_url|database_url|hostname|host|username|service_role|anon_key|token|connection_string|body|html|legal_text|full_text|raw_content|page_body)$/i;

const FORBIDDEN_REVIEWER_STATUS =
  /approved|legal_approved|verified_on_source|publication|evidence_allowed|export_allowed/i;

const FORBIDDEN_CANDIDATE_STATUS =
  /approved|verified|published|legal_change|client_use|final_evidence|public_export/i;

const GATE_KEYS = [
  "verified_on_source",
  "client_use_allowed",
  "client_evidence_allowed",
  "final_evidence_allowed",
  "legal_change_claimed",
  "publication_allowed",
  "public_export_allowed",
];

const RUNTIME_KEYS = [
  "live_ingestion_enabled",
  "scheduled_monitoring_enabled",
  "network_execution_enabled",
];

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function main() {
  const errors = [];

  if (!fs.existsSync(EXPORT_PATH)) {
    console.error(`Missing: ${EXPORT_PATH} — run npm run build:source-pilot-review-candidates`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(EXPORT_PATH, "utf8"));
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
  delete schema.$schema;
  const validate = ajv.compile(schema);

  if (!validate(data)) {
    for (const err of validate.errors ?? []) {
      errors.push(`${err.instancePath || "/"}: ${err.message}`);
    }
  }

  for (const key of RUNTIME_KEYS) {
    if (data.runtime_flags?.[key] !== false) {
      errors.push(`runtime_flags.${key} must be false`);
    }
  }

  for (const key of GATE_KEYS) {
    if (data.gates?.[key] !== false) {
      errors.push(`gates.${key} must be false`);
    }
  }

  if (data.candidate_count !== (data.candidates ?? []).length) {
    errors.push("candidate_count must match candidates array length");
  }

  for (const candidate of data.candidates ?? []) {
    if (!candidate.source_id) {
      errors.push(`${candidate.candidate_id ?? "?"}: missing source_id`);
    }
    if (!candidate.official_url) {
      errors.push(`${candidate.candidate_id ?? "?"}: missing official_url`);
    }

    if (FORBIDDEN_CANDIDATE_STATUS.test(candidate.candidate_status ?? "")) {
      errors.push(
        `${candidate.candidate_id}: candidate_status implies final/legal/publication approval`,
      );
    }

    if (FORBIDDEN_REVIEWER_STATUS.test(candidate.reviewer_status ?? "")) {
      errors.push(`${candidate.candidate_id}: reviewer_status implies legal approval`);
    }

    for (const key of RUNTIME_KEYS) {
      if (candidate.runtime_flags?.[key] !== false) {
        errors.push(`${candidate.candidate_id}: runtime_flags.${key} must be false`);
      }
    }

    for (const key of GATE_KEYS) {
      if (candidate.safety_flags?.[key] === true) {
        errors.push(`${candidate.candidate_id}: safety_flags.${key} must be false`);
      }
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
    console.error("validate-source-pilot-review-candidates: FAILED");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log(
    `PASS: validate-source-pilot-review-candidates (${data.candidate_count} candidates)`,
  );
}

main();
