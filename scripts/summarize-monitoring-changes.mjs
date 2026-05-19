#!/usr/bin/env node
/**
 * Summarize working-tree changes after a monitoring cycle (v0.8.1).
 * Compares against git base ref (default HEAD) for review/PR gating.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUN_DATE = process.env.MONITORING_RUN_DATE ?? new Date().toISOString().slice(0, 10);
const GIT_BASE = process.env.MONITORING_DIFF_BASE ?? "HEAD";
const SUMMARY_PATH = path.join(ROOT, "data/monitoring-runs/latest-monitoring-diff-summary.json");

const LEGAL_SAFE_NOTE =
  "Monitoring diff summary for governance review support only. Not legal advice. Not a compliance guarantee. Watcher signals require human review. Does not set verified_on_source or client_use_allowed.";

const WATCH_PATHS = [
  "data/snapshots",
  "data/watcher-runs",
  "data/detected-changes",
  "data/monitoring-runs",
  "public/data",
  "public/feeds",
];

function git(args) {
  const result = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  if (result.status !== 0) return { ok: false, stdout: "", stderr: result.stderr ?? "" };
  return { ok: true, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function relUnderWatch(relPath) {
  const norm = relPath.replace(/\\/g, "/");
  return WATCH_PATHS.some((p) => norm === p || norm.startsWith(`${p}/`));
}

function parsePorcelain() {
  const status = git(["status", "--porcelain", "-u", "--", ...WATCH_PATHS]);
  if (!status.ok) return [];
  return status.stdout
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const xy = line.slice(0, 2);
      let file = line.slice(3).trim();
      if (file.includes(" -> ")) file = file.split(" -> ").pop();
      return { xy, file };
    })
    .filter((e) => relUnderWatch(e.file));
}

function listChangedFiles() {
  const diff = git(["diff", "--name-only", GIT_BASE, "--", ...WATCH_PATHS]);
  const names = new Set();
  if (diff.ok) {
    for (const line of diff.stdout.split("\n")) {
      const f = line.trim();
      if (f && relUnderWatch(f)) names.add(f);
    }
  }
  for (const { file } of parsePorcelain()) names.add(file);
  return [...names].sort();
}

function readYaml(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return null;
  return yaml.load(fs.readFileSync(abs, "utf8"));
}

function isNewFile(file, porcelain) {
  const entry = porcelain.find((p) => p.file === file);
  if (entry?.xy.includes("?")) return true;
  const check = git(["ls-files", "--error-unmatch", file]);
  return !check.ok;
}

function classifyFiles(files, porcelain) {
  const new_snapshots = [];
  const updated_latest_pointers = [];
  const new_watcher_runs = [];
  const new_monitoring_runs = [];
  const new_detected_changes = [];
  const changed_exports = [];
  const review_queue_changed = false;
  let regulation_watch_snapshot_changed = false;

  for (const file of files) {
    const isNew = isNewFile(file, porcelain);
    if (file.startsWith("data/snapshots/") && file.endsWith(".yml")) {
      if (file.endsWith("/latest.yml")) updated_latest_pointers.push(file);
      else if (file.includes("/snap-") || file.includes("/snap-fixture-")) {
        if (isNew) new_snapshots.push(file);
        else if (!file.endsWith("/latest.yml")) new_snapshots.push(file);
      }
    } else if (file.startsWith("data/watcher-runs/") && file.endsWith(".yml")) {
      if (isNew) new_watcher_runs.push(file);
    } else if (file.startsWith("data/detected-changes/") && file.endsWith(".yml")) {
      if (isNew) new_detected_changes.push(file);
    } else if (file.startsWith("data/monitoring-runs/") && file.endsWith(".yml")) {
      if (file !== "data/monitoring-runs/latest-monitoring-diff-summary.json" && isNew) {
        new_monitoring_runs.push(file);
      }
    } else if (file.startsWith("public/data/")) {
      changed_exports.push(file);
      if (file.endsWith("review-queue.json")) review_queue_changed = true;
      if (file.endsWith("regulation-watch-snapshot.json")) regulation_watch_snapshot_changed = true;
    } else if (file.startsWith("public/feeds/")) {
      changed_exports.push(file);
    }
  }

  return {
    new_snapshots: [...new Set(new_snapshots)],
    updated_latest_pointers: [...new Set(updated_latest_pointers)],
    new_watcher_runs: [...new Set(new_watcher_runs)],
    new_detected_changes: [...new Set(new_detected_changes)],
    new_monitoring_runs: [...new Set(new_monitoring_runs)],
    changed_exports: [...new Set(changed_exports)],
    review_queue_changed,
    regulation_watch_snapshot_changed,
  };
}

function loadNewRealDetectedChangeIds(newDetectedFiles) {
  const ids = [];
  for (const rel of newDetectedFiles) {
    const doc = readYaml(rel);
    if (!doc) continue;
    if (doc.simulation === true) continue;
    ids.push(doc.detected_change_id ?? rel);
  }
  return ids;
}

function latestMonitoringReport() {
  const runs = fs
    .readdirSync(path.join(ROOT, "data/monitoring-runs"))
    .filter((f) => f.startsWith("monitoring-cycle-") && f.endsWith(".yml"))
    .sort()
    .reverse();
  if (runs.length === 0) return null;
  return readYaml(`data/monitoring-runs/${runs[0]}`);
}

function latestWatcherRun() {
  const runs = fs
    .readdirSync(path.join(ROOT, "data/watcher-runs"))
    .filter((f) => f.startsWith("watcher-run-") && f.endsWith(".yml") && !f.includes("simulation"))
    .sort()
    .reverse();
  if (runs.length === 0) return null;
  return readYaml(`data/watcher-runs/${runs[0]}`);
}

function isExportTimestampOnlyChurn(files) {
  if (files.length === 0) return false;
  const exportOnly = files.every((f) => f.startsWith("public/data/") || f.startsWith("public/feeds/"));
  if (!exportOnly) return false;
  const diff = git(["diff", GIT_BASE, "--", ...files]);
  if (!diff.ok || !diff.stdout) return false;
  const meaningful = /"(detected_change|snapshot|watcher|change_type|status|error|simulation)"/i.test(
    diff.stdout,
  );
  return !meaningful;
}

function recommendAction(summary) {
  if (summary.has_detected_changes) return "open_human_review_for_detected_changes";
  if (summary.has_watcher_errors) return "triage_watcher_errors";
  if (summary.new_monitoring_run_count > 0 && summary.latest_monitoring_status === "failed") {
    return "triage_monitoring_cycle_failure";
  }
  if (summary.has_meaningful_changes) return "review_monitoring_pr_or_artifacts";
  return "no_pr_needed_artifact_only";
}

function buildSummary() {
  const porcelain = parsePorcelain();
  const changed_files = listChangedFiles();
  const buckets = classifyFiles(changed_files, porcelain);

  const new_real_detected_change_ids = loadNewRealDetectedChangeIds(buckets.new_detected_changes);
  const monitoringReport = latestMonitoringReport();
  const watcherRun = latestWatcherRun();

  const has_watcher_errors =
    (monitoringReport?.watcher_soft_error_count ?? 0) > 0 ||
    (watcherRun?.error_count ?? 0) > 0;
  const has_detected_changes = new_real_detected_change_ids.length > 0;
  const latest_monitoring_status = monitoringReport?.overall_status ?? null;
  const monitoring_failed = latest_monitoring_status === "failed";

  const new_snapshot_count = buckets.new_snapshots.length;
  const new_detected_change_count = buckets.new_detected_changes.length;
  const new_monitoring_run_count = buckets.new_monitoring_runs.length;
  const changed_export_count = buckets.changed_exports.length;

  const timestamp_only_export_churn =
    changed_export_count > 0 &&
    isExportTimestampOnlyChurn(buckets.changed_exports) &&
    new_snapshot_count === 0 &&
    new_detected_change_count === 0 &&
    !has_watcher_errors &&
    !monitoring_failed;

  const only_monitoring_report_churn =
    changed_files.length > 0 &&
    changed_files.every(
      (f) =>
        f.startsWith("data/monitoring-runs/monitoring-cycle-") ||
        f === "data/monitoring-runs/latest-monitoring-diff-summary.json",
    );

  const has_meaningful_changes =
    has_detected_changes ||
    has_watcher_errors ||
    monitoring_failed ||
    new_snapshot_count > 0 ||
    (watcherRun?.changed_count ?? 0) > 0;

  const has_meaningful_changes_final =
    has_meaningful_changes && !timestamp_only_export_churn && !only_monitoring_report_churn;

  const summary = {
    generated_at: new Date().toISOString(),
    run_date: RUN_DATE,
    git_base: GIT_BASE,
    monitoring_run_id: monitoringReport?.monitoring_run_id ?? `monitoring-cycle-${RUN_DATE}`,
    monitoring_mode: monitoringReport?.mode ?? null,
    latest_monitoring_status,
    has_meaningful_changes: has_meaningful_changes_final,
    has_detected_changes,
    has_watcher_errors,
    new_snapshot_count,
    new_detected_change_count,
    new_real_detected_change_count: new_real_detected_change_ids.length,
    new_monitoring_run_count,
    new_watcher_run_count: buckets.new_watcher_runs.length,
    changed_export_count,
    updated_latest_pointer_count: buckets.updated_latest_pointers.length,
    review_queue_changed: buckets.review_queue_changed,
    regulation_watch_snapshot_changed: buckets.regulation_watch_snapshot_changed,
    new_real_detected_change_ids,
    new_snapshots: buckets.new_snapshots,
    new_detected_changes: buckets.new_detected_changes,
    new_monitoring_runs: buckets.new_monitoring_runs,
    changed_exports: buckets.changed_exports,
    timestamp_only_export_churn,
    only_monitoring_report_churn,
    watchers_checked: monitoringReport?.watchers_checked ?? watcherRun?.checked_count ?? 0,
    watcher_success_count: monitoringReport?.watcher_success_count ?? 0,
    watcher_soft_error_count: monitoringReport?.watcher_soft_error_count ?? 0,
    review_queue_count: monitoringReport?.review_queue_count ?? null,
    recommended_action: null,
    legal_safe_note: LEGAL_SAFE_NOTE,
  };

  summary.recommended_action = recommendAction(summary);
  return summary;
}

function printConsoleSummary(summary) {
  console.log(`\nCaesar AI Regulation Watch — monitoring diff summary (v0.8.1)`);
  console.log(`Run date: ${summary.run_date} · base: ${summary.git_base}`);
  console.log(`Meaningful changes: ${summary.has_meaningful_changes ? "yes" : "no"}`);
  console.log(`  Real detected changes: ${summary.new_real_detected_change_count}`);
  console.log(`  Watcher errors: ${summary.has_watcher_errors ? "yes" : "no"}`);
  console.log(`  New snapshots: ${summary.new_snapshot_count}`);
  console.log(`  New monitoring runs: ${summary.new_monitoring_run_count}`);
  console.log(`  Changed exports: ${summary.changed_export_count}`);
  console.log(`Recommended action: ${summary.recommended_action}`);
  if (summary.new_real_detected_change_ids.length > 0) {
    console.log(`New real detected change IDs: ${summary.new_real_detected_change_ids.join(", ")}`);
  }
  console.log(`\nWrote ${path.relative(ROOT, SUMMARY_PATH)}`);
}

function main() {
  const summary = buildSummary();
  fs.mkdirSync(path.dirname(SUMMARY_PATH), { recursive: true });
  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2) + "\n", "utf8");
  printConsoleSummary(summary);
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(summary, null, 2));
  }
}

main();
