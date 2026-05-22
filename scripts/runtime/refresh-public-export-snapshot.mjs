#!/usr/bin/env node
/**
 * T085A — Refresh committed public-export-snapshot from public/data (metadata-only).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion } from "../lib/read-project-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC_DATA = path.join(ROOT, "public/data");
const SNAPSHOT_DIR = path.join(ROOT, "data/runtime/public-export-snapshot");

function readPublic(name) {
  return JSON.parse(fs.readFileSync(path.join(PUBLIC_DATA, name), "utf8"));
}

function stripExportEnvelope(obj) {
  const { generated_at, product_version, ...rest } = obj;
  return rest;
}

function main() {
  const version = readProjectVersion();
  const monitoring = readPublic("runtime-monitoring-status.json");
  const runs = readPublic("regulation-source-runs.json");
  const changes = readPublic("regulation-detected-changes.json");
  const candidates = readPublic("regulation-review-candidates.json");

  const statusPayload = {
    status: monitoring.status,
    backend_mvp: monitoring.backend_mvp,
    live_ingestion_enabled: monitoring.live_ingestion_enabled,
    scheduled_monitoring_enabled: monitoring.scheduled_monitoring_enabled,
    cron_enabled: monitoring.cron_enabled,
    gates_closed: monitoring.gates_closed,
    monitored_source_count: monitoring.monitored_source_count,
    automated_source_count: monitoring.automated_source_count,
    automated_rss_source_count: monitoring.automated_rss_source_count,
    manual_source_count: monitoring.manual_source_count,
    manual_review_source_count: monitoring.manual_review_source_count,
    detected_changes_count: monitoring.detected_changes_count,
    review_candidates_count: monitoring.review_candidates_count,
    latest_run: monitoring.latest_run,
    latest_worker_run: monitoring.latest_worker_run,
    latest_pilot_report: monitoring.latest_pilot_report,
    runtime_events_recent: monitoring.runtime_events_recent,
    source_runs_count: monitoring.source_runs_count,
    latest_run_id: monitoring.latest_run_id,
    latest_run_at: monitoring.latest_run_at,
    worker_deployed: monitoring.worker_deployed,
    worker_redeployed: monitoring.worker_redeployed,
    worker_name: monitoring.worker_name,
    worker_url: monitoring.worker_url,
    latest_worker_run_at: monitoring.latest_worker_run_at,
    latest_worker_run_id: monitoring.latest_worker_run_id,
    worker_allowlist_source_count: monitoring.worker_allowlist_source_count,
    worker_run_source_success_count: monitoring.worker_run_source_success_count,
    worker_run_source_failure_count: monitoring.worker_run_source_failure_count,
    no_registry_fk_error_count: monitoring.no_registry_fk_error_count,
    db_registry_alignment_status: monitoring.db_registry_alignment_status,
    automated_registry_row_count: monitoring.automated_registry_row_count,
    db_registry_alignment_task: monitoring.db_registry_alignment_task,
    worker_redeployed_at: monitoring.worker_redeployed_at,
    worker_version: monitoring.worker_version,
    public_note: monitoring.public_note,
  };

  const workerPilotPayload = {
    task_id: monitoring.backend_mvp ?? "T086",
    worker_version: monitoring.worker_version ?? version,
    deployed_at: monitoring.worker_redeployed_at,
    worker_allowlist_source_count: monitoring.worker_allowlist_source_count ?? 6,
    worker_run_source_success_count: monitoring.worker_run_source_success_count ?? 6,
    worker_run_source_failure_count: monitoring.worker_run_source_failure_count ?? 0,
    no_registry_fk_error_count: monitoring.no_registry_fk_error_count ?? 0,
    latest_run_id: monitoring.latest_worker_run_id,
  };

  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(SNAPSHOT_DIR, "runtime-monitoring-status.payload.json"),
    `${JSON.stringify(statusPayload, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(SNAPSHOT_DIR, "regulation-source-runs.payload.json"),
    `${JSON.stringify(stripExportEnvelope(runs), null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(SNAPSHOT_DIR, "regulation-detected-changes.payload.json"),
    `${JSON.stringify(stripExportEnvelope(changes), null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(SNAPSHOT_DIR, "regulation-review-candidates.payload.json"),
    `${JSON.stringify(stripExportEnvelope(candidates), null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(SNAPSHOT_DIR, "worker-pilot-run.payload.json"),
    `${JSON.stringify(workerPilotPayload, null, 2)}\n`,
  );

  console.log(
    `PASS: refresh-public-export-snapshot (${version}, source_runs=${statusPayload.source_runs_count}, ${workerPilotPayload.task_id})`,
  );
}

main();
