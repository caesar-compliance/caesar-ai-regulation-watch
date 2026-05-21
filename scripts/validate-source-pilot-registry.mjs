#!/usr/bin/env node
/**
 * Validate source pilot registry YAML and T075A safety invariants.
 * No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY_PATH = path.join(ROOT, "data/runtime/source-pilot-registry.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/source-pilot-registry.schema.json");

const LIVE_MONITORING_STATUSES = new Set([
  "live_active",
  "scheduled",
  "running",
  "ingesting",
  "network_enabled",
]);

const GATE_KEYS = [
  "verified_on_source",
  "client_use_allowed",
  "client_evidence_allowed",
  "final_evidence_allowed",
  "legal_change_claimed",
  "publication_allowed",
  "public_export_allowed",
];

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
delete schema.$schema;
const validateSchema = ajv.compile(schema);

function main() {
  const errors = [];

  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`Missing registry: ${REGISTRY_PATH}`);
    process.exit(1);
  }

  const registry = yaml.load(fs.readFileSync(REGISTRY_PATH, "utf8"));
  if (!validateSchema(registry)) {
    for (const err of validateSchema.errors ?? []) {
      errors.push(`${err.instancePath || "/"}: ${err.message}`);
    }
  }

  if (registry.no_live_ingestion !== true) {
    errors.push("no_live_ingestion must be true");
  }
  if (registry.no_scheduled_monitoring !== true) {
    errors.push("no_scheduled_monitoring must be true");
  }
  if (registry.no_network_execution !== true) {
    errors.push("no_network_execution must be true");
  }

  const seenIds = new Set();
  for (const [index, source] of (registry.sources ?? []).entries()) {
    const prefix = `sources[${index}] (${source?.source_id ?? "?"})`;

    if (!source.official_url) {
      errors.push(`${prefix}: official_url is required`);
    }

    if (!source.source_id) {
      errors.push(`${prefix}: source_id is required`);
    } else if (seenIds.has(source.source_id)) {
      errors.push(`${prefix}: duplicate source_id ${source.source_id}`);
    } else {
      seenIds.add(source.source_id);
    }

    if (source.stores_full_text === true) {
      errors.push(`${prefix}: stores_full_text must be false`);
    }
    if (source.allowed_for_network_check === true) {
      errors.push(`${prefix}: allowed_for_network_check must be false in T075A`);
    }
    if (source.stores_metadata_only !== true) {
      errors.push(`${prefix}: stores_metadata_only must be true`);
    }

    if (LIVE_MONITORING_STATUSES.has(source.monitoring_status)) {
      errors.push(
        `${prefix}: monitoring_status "${source.monitoring_status}" implies live/scheduled execution`,
      );
    }

    const flags = source.safety_flags ?? {};
    for (const key of GATE_KEYS) {
      if (flags[key] === true) {
        errors.push(`${prefix}: safety_flags.${key} must be false`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("validate-source-pilot-registry: FAILED");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log(
    `PASS: validate-source-pilot-registry (${registry.sources?.length ?? 0} sources)`,
  );
}

main();
