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
  if (versionTs.includes("v1.0.27") && projectVersion === "1.0.29") {
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
  }

  const changes = readJson("regulation-detected-changes.json");
  const candidates = readJson("regulation-review-candidates.json");
  if (
    monitoring?.status === "backend_smoke_passed_public_export_ready" ||
    monitoring?.status === "backend_monitoring_mvp"
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
