#!/usr/bin/env node
/**
 * Validate source adapter allowlist YAML against schema and T052 safety invariants.
 * No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ALLOWLIST_PATH = path.join(ROOT, "data/source-adapters/source-adapter-allowlist.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/source-adapter-allowlist.schema.json");

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
delete schema.$schema;
const validateSchema = ajv.compile(schema);

function hostFromUrl(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function normalizeHost(host) {
  return String(host || "")
    .toLowerCase()
    .replace(/^www\./, "");
}

function hostsMatch(url, allowedHost) {
  const parsed = hostFromUrl(url);
  if (!parsed) return false;
  const a = normalizeHost(parsed);
  const b = normalizeHost(allowedHost);
  return a === b || a.endsWith(`.${b}`) || parsed === allowedHost.toLowerCase();
}

function invariantErrors(adapter, index) {
  const prefix = `adapters[${index}] (${adapter?.adapter_id ?? "?"})`;
  const errors = [];

  const boolGates = [
    ["verified_on_source", false],
    ["client_use_allowed", false],
    ["client_evidence_allowed", false],
    ["final_evidence_allowed", false],
    ["legal_change_claimed", false],
    ["schedule_enabled", false],
    ["broad_crawl_allowed", false],
    ["stores_full_text", false],
    ["legal_text_publication_allowed", false],
  ];
  for (const [key, expected] of boolGates) {
    if (adapter[key] !== expected) {
      errors.push(`${prefix}: ${key} must be ${expected}, got ${adapter[key]}`);
    }
  }
  if (adapter.stores_metadata_only !== true) {
    errors.push(`${prefix}: stores_metadata_only must be true`);
  }
  if (
    adapter.collection_mode === "manual_network_approved" &&
    adapter.status !== "approved_for_manual_run"
  ) {
    errors.push(
      `${prefix}: manual_network_approved requires status approved_for_manual_run`,
    );
  }
  if (adapter.paywall_login_required === true) {
    errors.push(`${prefix}: paywall_login_required sources are disallowed`);
  }

  const url = adapter.endpoint_url ?? adapter.source_url;
  if (!url) {
    errors.push(`${prefix}: endpoint_url or source_url required`);
  } else if (!hostsMatch(url, adapter.allowed_host)) {
    errors.push(
      `${prefix}: URL host does not match allowed_host (${url} vs ${adapter.allowed_host})`,
    );
  }

  return errors;
}

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

function main() {
  if (!fs.existsSync(ALLOWLIST_PATH)) {
    console.error(`Missing allowlist: ${ALLOWLIST_PATH}`);
    process.exit(1);
  }

  const doc = normalizeDates(yaml.load(fs.readFileSync(ALLOWLIST_PATH, "utf8")));
  const schemaOk = validateSchema(doc);
  if (!schemaOk) {
    console.error("Schema validation failed:");
    for (const err of validateSchema.errors ?? []) {
      console.error(`  ${err.instancePath || "/"} ${err.message}`);
    }
    process.exit(1);
  }

  const adapters = doc.adapters ?? [];
  const invariantFailures = adapters.flatMap((a, i) => invariantErrors(a, i));

  if (doc.no_live_collection !== true || doc.no_scheduled_monitoring !== true) {
    invariantFailures.push("root: no_live_collection and no_scheduled_monitoring must be true");
  }

  if (invariantFailures.length > 0) {
    console.error("Safety invariant failures:");
    for (const msg of invariantFailures) console.error(`  ${msg}`);
    process.exit(1);
  }

  const byStatus = {};
  for (const a of adapters) {
    byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
  }

  console.log("PASS: source adapter allowlist validated");
  console.log(`  adapters: ${adapters.length}`);
  console.log(`  statuses: ${JSON.stringify(byStatus)}`);
  console.log(`  file: ${ALLOWLIST_PATH}`);
}

main();
