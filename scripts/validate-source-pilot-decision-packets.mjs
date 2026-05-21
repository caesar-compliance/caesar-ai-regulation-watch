#!/usr/bin/env node
/**
 * Validate public source pilot decision packets JSON — schema + safety invariants.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPORT_PATH = path.join(ROOT, "public/data/source-pilot-decision-packets.json");
const SCHEMA_PATH = path.join(ROOT, "schemas/source-pilot-decision-packets.schema.json");

const FORBIDDEN_KEY_PATTERN =
  /^(.*\.)?(password|secret|db_url|database_url|hostname|host|username|service_role|anon_key|token|connection_string|body|html|legal_text|full_text|raw_content|raw_body|page_body|content_html|content_markdown)$/i;

const FORBIDDEN_PACKET_STATUS =
  /approved|verified_on_source|publication|evidence_allowed|export_allowed|legal_change|final_|client_use/i;

const FORBIDDEN_PLACEHOLDER_TEXT =
  /legal\s+conclusion|verified\s+on\s+source|publication\s+approved|evidence\s+approved|client\s+usable/i;

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
    console.error(`Missing: ${EXPORT_PATH} — run npm run build:source-pilot-decision-packets`);
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

  if (data.packet_count !== (data.packets ?? []).length) {
    errors.push("packet_count must match packets array length");
  }

  if (data.candidate_count < (data.packets ?? []).length) {
    errors.push("candidate_count must be >= packet_count");
  }

  for (const packet of data.packets ?? []) {
    if (!packet.source_id) {
      errors.push(`${packet.packet_id ?? "?"}: missing source_id`);
    }
    if (!packet.official_url) {
      errors.push(`${packet.packet_id ?? "?"}: missing official_url`);
    }
    if (!packet.safety_flags || typeof packet.safety_flags !== "object") {
      errors.push(`${packet.packet_id ?? "?"}: missing safety_flags`);
    }

    if (FORBIDDEN_PACKET_STATUS.test(packet.packet_status ?? "")) {
      errors.push(`${packet.packet_id}: packet_status implies approval or verification`);
    }

    for (const key of RUNTIME_KEYS) {
      if (packet.runtime_flags?.[key] !== false) {
        errors.push(`${packet.packet_id}: runtime_flags.${key} must be false`);
      }
    }

    for (const key of GATE_KEYS) {
      if (packet.safety_flags?.[key] === true) {
        errors.push(`${packet.packet_id}: safety_flags.${key} must be false`);
      }
    }

    const placeholders = packet.decision_placeholders ?? {};
    for (const [key, ph] of Object.entries(placeholders)) {
      if (ph?.selected_placeholder === true) {
        errors.push(`${packet.packet_id}: decision_placeholders.${key}.selected_placeholder must be false`);
      }
      const note = ph?.note_placeholder ?? "";
      if (FORBIDDEN_PLACEHOLDER_TEXT.test(note)) {
        errors.push(
          `${packet.packet_id}: decision_placeholders.${key} note implies final legal conclusion or approval`,
        );
      }
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
    console.error("validate-source-pilot-decision-packets: FAILED");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log(
    `PASS: validate-source-pilot-decision-packets (${data.packet_count} packets)`,
  );
}

main();
