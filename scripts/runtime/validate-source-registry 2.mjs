#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import {
  loadMonitoringPilotRegistry,
  hostMatchesAllowed,
} from "./lib/monitoring-pilot-registry.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SCHEMA_PATH = path.join(ROOT, "schemas/monitoring-pilot-registry.schema.json");

function main() {
  const registry = loadMonitoringPilotRegistry();
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
  delete schema.$schema;
  const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  if (!validate(registry)) {
    console.error("validate-source-registry: schema errors");
    for (const e of validate.errors ?? []) {
      console.error(`  ${e.instancePath} ${e.message}`);
    }
    process.exit(1);
  }

  const errors = [];
  const keys = new Set();
  for (const source of registry.sources ?? []) {
    if (keys.has(source.source_key)) {
      errors.push(`duplicate source_key: ${source.source_key}`);
    }
    keys.add(source.source_key);
    if (!hostMatchesAllowed(source, source.official_url)) {
      errors.push(`${source.source_key}: official_url host mismatch`);
    }
    if (source.fetch_mode === "automated_metadata" && source.feed_url) {
      if (!hostMatchesAllowed(source, source.feed_url)) {
        errors.push(`${source.source_key}: feed_url host mismatch`);
      }
    }
    if (source.stores_metadata_only !== true) {
      errors.push(`${source.source_key}: stores_metadata_only must be true`);
    }
    const sf = source.safety_flags ?? {};
    for (const gate of [
      "verified_on_source",
      "client_use_allowed",
      "legal_change_claimed",
      "publication_allowed",
      "public_export_allowed",
    ]) {
      if (sf[gate] === true) {
        errors.push(`${source.source_key}: safety flag ${gate} must not be true`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("validate-source-registry: policy errors");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  const automated = registry.sources.filter(
    (s) => s.fetch_mode === "automated_metadata",
  ).length;
  console.log(
    `PASS: validate-source-registry (${registry.sources.length} sources, ${automated} automated)`,
  );
}

main();
