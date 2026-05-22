#!/usr/bin/env node
/**
 * T085A — Fail when CI snapshot fallback is stale vs package version / T085 runtime state.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion } from "../lib/read-project-version.mjs";
import { loadMonitoringPilotRegistry } from "./lib/monitoring-pilot-registry.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SNAPSHOT_DIR = path.join(ROOT, "data/runtime/public-export-snapshot");

function readPayload(name) {
  const file = path.join(SNAPSHOT_DIR, `${name}.payload.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function main() {
  const errors = [];
  const projectVersion = readProjectVersion();
  const registry = loadMonitoringPilotRegistry();
  const automated = registry.sources.filter(
    (s) => s.fetch_mode === "automated_metadata",
  ).length;

  const monitoring = readPayload("runtime-monitoring-status");
  const runs = readPayload("regulation-source-runs");
  const workerPilot = readPayload("worker-pilot-run");

  if (!monitoring) {
    errors.push("missing runtime-monitoring-status.payload.json");
  }

  if (projectVersion === "1.0.37") {
    if (monitoring?.backend_mvp !== "T086") {
      errors.push(`snapshot backend_mvp must be T086, got ${monitoring?.backend_mvp}`);
    }
    if (monitoring?.db_registry_alignment_status !== "aligned") {
      errors.push(
        `snapshot db_registry_alignment_status must be aligned, got ${monitoring?.db_registry_alignment_status}`,
      );
    }
    if ((monitoring?.automated_registry_row_count ?? 0) < 6) {
      errors.push(
        `snapshot automated_registry_row_count must be >= 6, got ${monitoring?.automated_registry_row_count}`,
      );
    }
    if ((monitoring?.no_registry_fk_error_count ?? 1) !== 0) {
      errors.push(
        `snapshot no_registry_fk_error_count must be 0, got ${monitoring?.no_registry_fk_error_count}`,
      );
    }
    if (monitoring?.cron_enabled === true) {
      errors.push("snapshot cron_enabled must not be true");
    }
    if (monitoring?.gates_closed !== true) {
      errors.push("snapshot gates_closed must be true");
    }
    const autoCount =
      monitoring?.automated_rss_source_count ?? monitoring?.automated_source_count ?? 0;
    if (automated > 0 && autoCount !== automated) {
      errors.push(`snapshot automated sources ${autoCount} != registry ${automated}`);
    }
    if (workerPilot?.task_id !== "T086") {
      errors.push(`worker-pilot-run.payload.json task_id must be T086`);
    }
    if ((workerPilot?.no_registry_fk_error_count ?? 1) !== 0) {
      errors.push("worker-pilot-run.payload.json no_registry_fk_error_count must be 0");
    }
  }

  if (errors.length) {
    console.error("validate-public-export-snapshot: FAILED");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log(`PASS: validate-public-export-snapshot (${projectVersion})`);
}

main();
