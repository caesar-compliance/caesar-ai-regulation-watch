#!/usr/bin/env node
/**
 * T078A — Fail when public exports disagree with package version, registry, or DB health.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion, readProjectVersionLabel } from "../lib/read-project-version.mjs";
import { loadMonitoringPilotRegistry } from "./lib/monitoring-pilot-registry.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC_DATA = path.join(ROOT, "public/data");
const VERSION_TS = path.join(ROOT, "src/lib/project-version.ts");
const PACKAGE_JSON = path.join(ROOT, "package.json");

function readJson(name) {
  const full = path.join(PUBLIC_DATA, name);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function main() {
  const errors = [];
  const projectVersion = readProjectVersion();
  const projectLabel = readProjectVersionLabel();
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, "utf8"));

  if (pkg.version !== projectVersion) {
    errors.push(
      `package.json version ${pkg.version} != project-version.ts ${projectVersion}`,
    );
  }

  const versionTs = fs.readFileSync(VERSION_TS, "utf8");
  if (versionTs.includes("v1.0.27") && projectVersion !== "1.0.27") {
    errors.push("project-version.ts still references v1.0.27");
  }
  if (versionTs.includes(projectLabel) === false) {
    errors.push(`project-version.ts missing label ${projectLabel}`);
  }

  const monitoring = readJson("runtime-monitoring-status.json");
  const dbHealth = readJson("runtime-db-health.json");
  const registry = loadMonitoringPilotRegistry();
  const automatedRegistry = registry.sources.filter(
    (s) => s.fetch_mode === "automated_metadata",
  ).length;

  if (!monitoring) {
    errors.push("missing runtime-monitoring-status.json");
  } else {
    if (monitoring.product_version && monitoring.product_version !== projectVersion) {
      errors.push(
        `runtime-monitoring-status product_version ${monitoring.product_version} != ${projectVersion}`,
      );
    }
    if (monitoring.status === "not_configured") {
      errors.push(
        "runtime-monitoring-status.status must not be not_configured when T078 registry is present",
      );
    }
    if (
      dbHealth?.status === "connected" &&
      monitoring.status === "not_configured"
    ) {
      errors.push(
        "connected runtime-db-health with not_configured monitoring status",
      );
    }
    const autoExport =
      monitoring.automated_rss_source_count ??
      monitoring.automated_source_count ??
      0;
    if (automatedRegistry > 0 && autoExport === 0) {
      errors.push(
        `registry has ${automatedRegistry} automated RSS sources but export shows 0`,
      );
    }
    if (
      monitoring.monitored_source_count &&
      monitoring.monitored_source_count !== registry.sources.length
    ) {
      errors.push(
        `monitored_source_count ${monitoring.monitored_source_count} != registry ${registry.sources.length}`,
      );
    }
    if (monitoring.scheduled_monitoring_enabled === true) {
      errors.push("scheduled_monitoring_enabled must not be true in public export");
    }
    if (monitoring.cron_enabled === true) {
      errors.push("cron_enabled must not be true in public export");
    }
    if (monitoring.gates_closed === false) {
      errors.push("gates_closed must remain true");
    }
    const allowlist =
      monitoring.worker_allowlist_source_count ?? monitoring.automated_rss_source_count;
    if (automatedRegistry > 0 && allowlist !== automatedRegistry) {
      errors.push(
        `worker_allowlist_source_count ${allowlist} != registry automated ${automatedRegistry}`,
      );
    }
    if (projectVersion === "1.0.37" && monitoring.backend_mvp !== "T086") {
      errors.push(`v1.0.37 expects backend_mvp T086, got ${monitoring.backend_mvp}`);
    }
    if (projectVersion === "1.0.37") {
      if (monitoring.db_registry_alignment_status !== "aligned") {
        errors.push(
          `v1.0.37 expects db_registry_alignment_status aligned, got ${monitoring.db_registry_alignment_status}`,
        );
      }
      if ((monitoring.automated_registry_row_count ?? 0) < 6) {
        errors.push(
          `v1.0.37 expects automated_registry_row_count >= 6, got ${monitoring.automated_registry_row_count}`,
        );
      }
      if ((monitoring.no_registry_fk_error_count ?? 1) !== 0) {
        errors.push(
          `v1.0.37 expects no_registry_fk_error_count 0, got ${monitoring.no_registry_fk_error_count}`,
        );
      }
      if (
        monitoring.worker_run_source_failure_count > 0 &&
        (monitoring.no_registry_fk_error_count ?? 0) > 0
      ) {
        errors.push(
          "worker_run_source_failure_count > 0 with registry/FK errors — classify as misaligned",
        );
      }
    }
  }

  const ingress = readJson("ingress-filter-summary.json");
  const tracker = readJson("tracker-summary.json");
  const queue = readJson("regulation-review-queue.json");
  if (tracker?.product_version && tracker.product_version !== projectVersion) {
    errors.push(
      `tracker-summary product_version ${tracker.product_version} != ${projectVersion}`,
    );
  }
  if (ingress?.product_version && ingress.product_version !== projectVersion) {
    errors.push(
      `ingress-filter-summary product_version ${ingress.product_version} != ${projectVersion}`,
    );
  }
  if (ingress && queue) {
    const visible = ingress.operator_visible_count ?? 0;
    const queueVisible =
      queue.operator_visible_count ?? queue.operator_queue_card_count ?? null;
    if (queueVisible != null && visible !== queueVisible) {
      errors.push(
        `ingress operator_visible_count ${visible} != review queue operator_visible ${queueVisible}`,
      );
    }
    if (ingress.scheduled_monitoring_enabled === true) {
      errors.push("ingress-filter-summary must not claim scheduled monitoring enabled");
    }
  }

  const changes = readJson("regulation-detected-changes.json");
  const candidates = readJson("regulation-review-candidates.json");
  if (
    monitoring?.status === "backend_smoke_passed_public_export_ready" ||
    monitoring?.status === "backend_monitoring_mvp" ||
    monitoring?.status === "backend_monitoring_mvp_worker_run"
  ) {
    const changeCount = changes?.changes?.length ?? 0;
    const candidateCount = candidates?.candidates?.length ?? 0;
    if (
      (monitoring.detected_changes_count ?? 0) > 0 &&
      changeCount === 0
    ) {
      errors.push(
        "monitoring reports detected_changes_count but regulation-detected-changes.json is empty",
      );
    }
    if (
      (monitoring.review_candidates_count ?? 0) > 0 &&
      candidateCount === 0
    ) {
      errors.push(
        "monitoring reports review_candidates_count but regulation-review-candidates.json is empty",
      );
    }
  }

  if (errors.length > 0) {
    console.error("validate-public-export-consistency: FAILED");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log(
    `PASS: validate-public-export-consistency (${projectLabel}, monitoring=${monitoring?.status})`,
  );
}

main();
