#!/usr/bin/env node
/**
 * T081 — Validate source freshness export against monitoring registry.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion } from "../lib/read-project-version.mjs";
import { loadMonitoringPilotRegistry } from "./lib/monitoring-pilot-registry.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC_DATA = path.join(ROOT, "public/data");

const VALID_STATUS = new Set([
  "fresh",
  "aging",
  "stale",
  "manual_review_needed",
  "not_automated",
]);

function readJson(name) {
  const full = path.join(PUBLIC_DATA, name);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function main() {
  const errors = [];
  const version = readProjectVersion();
  const registry = loadMonitoringPilotRegistry();
  const freshness = readJson("source-freshness.json");

  if (!freshness) {
    errors.push("missing source-freshness.json");
  } else {
    if (freshness.product_version && freshness.product_version !== version) {
      errors.push(
        `source-freshness product_version ${freshness.product_version} != ${version}`,
      );
    }
    if (freshness.scheduled_monitoring_enabled === true) {
      errors.push("scheduled_monitoring_enabled must be false");
    }
    const sources = freshness.sources ?? [];
    if (sources.length !== registry.sources.length) {
      errors.push(
        `source-freshness count ${sources.length} != registry ${registry.sources.length}`,
      );
    }
    const registryKeys = new Set(registry.sources.map((s) => s.source_key));
    for (const s of sources) {
      if (!registryKeys.has(s.source_key)) {
        errors.push(`unknown source_key in freshness: ${s.source_key}`);
      }
      if (!VALID_STATUS.has(s.freshness_status)) {
        errors.push(`invalid freshness_status for ${s.source_key}: ${s.freshness_status}`);
      }
      if (s.schedule_enabled === true) {
        errors.push(`schedule_enabled must be false for ${s.source_key}`);
      }
    }
    if (freshness.registry_source_count !== registry.sources.length) {
      errors.push("registry_source_count mismatch");
    }
  }

  if (errors.length) {
    console.error("FAIL: validate-source-freshness");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }
  console.log("PASS: validate-source-freshness");
}

main();
