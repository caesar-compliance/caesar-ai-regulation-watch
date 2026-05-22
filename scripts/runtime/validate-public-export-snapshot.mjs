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

  if (projectVersion === "1.0.36") {
    if (monitoring?.backend_mvp !== "T085") {
      errors.push(`snapshot backend_mvp must be T085, got ${monitoring?.backend_mvp}`);
    }
    if ((monitoring?.source_runs_count ?? 0) < 7) {
      errors.push(`snapshot source_runs_count must be >= 7, got ${monitoring?.source_runs_count}`);
    }
    if ((monitoring?.runtime_events_recent?.length ?? 0) < 5) {
      errors.push(
        `snapshot runtime_events_recent must have >= 5 events, got ${monitoring?.runtime_events_recent?.length ?? 0}`,
      );
    }
    if (monitoring?.worker_run_source_success_count !== 2) {
      errors.push(
        `snapshot worker_run_source_success_count must be 2, got ${monitoring?.worker_run_source_success_count}`,
      );
    }
    if (monitoring?.worker_run_source_failure_count !== 4) {
      errors.push(
        `snapshot worker_run_source_failure_count must be 4, got ${monitoring?.worker_run_source_failure_count}`,
      );
    }
    if (monitoring?.worker_redeployed !== true) {
      errors.push("snapshot worker_redeployed must be true");
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
    if ((runs?.runs?.length ?? 0) < 7) {
      errors.push(`snapshot regulation-source-runs must have >= 7 runs, got ${runs?.runs?.length ?? 0}`);
    }
    if (workerPilot?.task_id !== "T085") {
      errors.push(`worker-pilot-run.payload.json task_id must be T085`);
    }
    if (workerPilot?.worker_run_source_success_count !== 2) {
      errors.push("worker-pilot-run.payload.json success count must be 2");
    }
    if (workerPilot?.worker_run_source_failure_count !== 4) {
      errors.push("worker-pilot-run.payload.json failure count must be 4");
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
