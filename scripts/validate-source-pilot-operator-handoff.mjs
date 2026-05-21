#!/usr/bin/env node
/**
 * Validate public source pilot operator handoff JSON — schema + safety invariants.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPORT_PATH = path.join(ROOT, "public/data/source-pilot-operator-handoff.json");
const SCHEMA_PATH = path.join(ROOT, "schemas/source-pilot-operator-handoff.schema.json");

const FORBIDDEN_KEY_PATTERN =
  /^(.*\.)?(password|secret|db_url|database_url|hostname|host|username|service_role|anon_key|token|connection_string|body|html|legal_text|full_text|raw_content|raw_body|page_body|content_html|content_markdown)$/i;

const FORBIDDEN_STATUS_PATTERN =
  /approved|verified_on_source|publication_ready|evidence_allowed|export_allowed|legal_change_verified|monitoring_active|supabase_connected/i;

const FORBIDDEN_TEXT_PATTERN =
  /legal\s+conclusion|verified\s+on\s+source|publication\s+approved|evidence\s+approved|client\s+usable|monitoring\s+active/i;

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

const FORBIDDEN_CONTENT_KEYS = new Set([
  "full_text",
  "raw_body",
  "body",
  "legal_text",
  "content_html",
  "content_markdown",
]);

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function main() {
  const errors = [];

  if (!fs.existsSync(EXPORT_PATH)) {
    console.error(`Missing: ${EXPORT_PATH} — run npm run build:source-pilot-operator-handoff`);
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

  if (!data.safety_summary || typeof data.safety_summary !== "object") {
    errors.push("safety_summary is required");
  }

  if (!Array.isArray(data.cannot_claim_yet) || data.cannot_claim_yet.length === 0) {
    errors.push("cannot_claim_yet is required and must be non-empty");
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

  if (FORBIDDEN_STATUS_PATTERN.test(data.status ?? "")) {
    errors.push("status implies approval or live monitoring");
  }

  if (FORBIDDEN_STATUS_PATTERN.test(data.runtime_status ?? "")) {
    errors.push("runtime_status implies approval or live monitoring");
  }

  if (data.source_count !== (data.sources_summary ?? []).length) {
    errors.push("source_count must match sources_summary length");
  }

  if (data.candidate_count !== (data.candidates_summary ?? []).length) {
    errors.push("candidate_count must match candidates_summary length");
  }

  if (data.packet_count !== (data.decision_packets_summary ?? []).length) {
    errors.push("packet_count must match decision_packets_summary length");
  }

  for (const src of data.sources_summary ?? []) {
    if (src.allowed_for_network_check !== false) {
      errors.push(`${src.source_id}: allowed_for_network_check must be false`);
    }
  }

  for (const item of data.operator_checklist ?? []) {
    if (item.completed_placeholder === true) {
      errors.push(`operator_checklist.${item.id}: completed_placeholder must be false`);
    }
  }

  const noteFields = [
    data.public_note,
    data.safety_summary?.public_note,
    ...(data.cannot_claim_yet ?? []).map((c) => `${c.label} ${c.detail}`),
  ];
  for (const text of noteFields) {
    if (typeof text === "string" && FORBIDDEN_TEXT_PATTERN.test(text)) {
      errors.push("handoff text implies approval, verification, or live monitoring");
    }
  }

  function scanKeys(obj, prefix = "") {
    if (obj === null || typeof obj !== "object") return;
    for (const [key, value] of Object.entries(obj)) {
      const p = prefix ? `${prefix}.${key}` : key;
      if (FORBIDDEN_CONTENT_KEYS.has(key)) {
        errors.push(`forbidden content key in public export: ${p}`);
      }
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
    console.error("validate-source-pilot-operator-handoff: FAILED");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log(
    `PASS: validate-source-pilot-operator-handoff (${data.source_count} sources, ${data.candidate_count} candidates, ${data.packet_count} packets)`,
  );
}

main();
