#!/usr/bin/env node
/**
 * Monitoring cycle orchestrator (v0.8.0).
 * Phases: watchers → validate → exports → build → report.
 * Modes: dry_run | write | report_only
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import yaml from "js-yaml";
import { writeYaml } from "./lib/source-adapters/shared.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MONITORING_ROOT = path.join(ROOT, "data/monitoring-runs");
const LOCK_FILE = path.join(MONITORING_ROOT, ".monitoring-cycle.lock");
const RUN_DATE = process.env.MONITORING_RUN_DATE ?? new Date().toISOString().slice(0, 10);
const MONITORING_RUN_ID = `monitoring-cycle-${RUN_DATE}`;

const LEGAL_SAFE_NOTE =
  "Monitoring cycle output for governance review support only. Not legal advice. Not a compliance guarantee. Watcher and detected-change signals require human review. Does not set verified_on_source or client_use_allowed.";

function normalizeMode(raw) {
  const m = String(raw ?? "write").trim().toLowerCase().replace(/-/g, "_");
  if (m === "report_only") return "report_only";
  if (m === "dry_run") return "dry_run";
  return "write";
}

function parseMode() {
  const arg = process.argv.find((a) => a.startsWith("--mode="));
  if (arg) return normalizeMode(arg.split("=")[1]);
  if (process.argv.includes("--report-only")) return "report_only";
  if (process.argv.includes("--dry-run")) return "dry_run";
  return normalizeMode(process.env.MONITORING_MODE ?? "write");
}

const MODE = parseMode();
const SKIP_LOCK = process.argv.includes("--skip-lock");

function npmRun(script, extraEnv = {}, extraArgs = []) {
  const result = spawnSync("npm", ["run", script, ...extraArgs], {
    cwd: ROOT,
    env: { ...process.env, ...extraEnv },
    encoding: "utf8",
    stdio: "pipe",
  });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function runNodeScript(relScript, args = [], extraEnv = {}) {
  const scriptPath = path.join(ROOT, relScript);
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: ROOT,
    env: { ...process.env, ...extraEnv },
    encoding: "utf8",
    stdio: "pipe",
  });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function readYamlFile(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return null;
  return yaml.load(fs.readFileSync(abs, "utf8"));
}

function listYamlDir(relDir) {
  const abs = path.join(ROOT, relDir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".yml") && !f.startsWith("."))
    .map((f) => yaml.load(fs.readFileSync(path.join(abs, f), "utf8")));
}

function acquireLock() {
  fs.mkdirSync(MONITORING_ROOT, { recursive: true });
  if (fs.existsSync(LOCK_FILE)) {
    const existing = fs.readFileSync(LOCK_FILE, "utf8").trim();
    throw new Error(
      `Monitoring cycle lock present (${existing}). Another run may be in progress. Remove ${LOCK_FILE} only if stale.`,
    );
  }
  fs.writeFileSync(
    LOCK_FILE,
    `${MONITORING_RUN_ID}\n${new Date().toISOString()}\npid=${process.pid}\n`,
    "utf8",
  );
}

function releaseLock() {
  if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
}

function summarizeWatcherRun(runLog) {
  if (!runLog) {
    return {
      watchers_configured: 0,
      watchers_checked: 0,
      watcher_success_count: 0,
      watcher_soft_error_count: 0,
      detected_changes_created: 0,
      watcher_run_id: null,
      errors_by_category: {},
    };
  }
  const results = runLog.results ?? [];
  const successStatuses = new Set(["checked", "unchanged", "change_detected", "baseline"]);
  const watcher_success_count = results.filter((r) => successStatuses.has(r.status)).length;
  return {
    watchers_configured: runLog.watcher_count ?? results.length,
    watchers_checked: runLog.checked_count ?? 0,
    watcher_success_count,
    watcher_soft_error_count: runLog.error_count ?? 0,
    detected_changes_created: runLog.changed_count ?? (runLog.detected_change_ids?.length ?? 0),
    watcher_run_id: runLog.run_id ?? null,
    errors_by_category: runLog.errors_by_category ?? {},
  };
}

function countDetectedChanges() {
  const items = listYamlDir("data/detected-changes");
  return {
    total: items.length,
    real: items.filter((d) => d.simulation !== true).length,
    simulated: items.filter((d) => d.simulation === true).length,
  };
}

function estimateReviewQueueCount() {
  const exportPath = path.join(ROOT, "public/data/review-queue.json");
  if (fs.existsSync(exportPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(exportPath, "utf8"));
      return data.summary?.total ?? data.items?.length ?? 0;
    } catch {
      /* fall through */
    }
  }
  return null;
}

function buildReport(partial) {
  return {
    monitoring_run_id: MONITORING_RUN_ID,
    run_date: RUN_DATE,
    mode: MODE === "dry_run" ? "dry_run" : MODE === "report_only" ? "report_only" : "write",
    started_at: partial.started_at,
    finished_at: partial.finished_at ?? null,
    watchers_configured: partial.watchers_configured ?? 0,
    watchers_checked: partial.watchers_checked ?? 0,
    watcher_success_count: partial.watcher_success_count ?? 0,
    watcher_soft_error_count: partial.watcher_soft_error_count ?? 0,
    watcher_run_id: partial.watcher_run_id ?? null,
    detected_changes_created: partial.detected_changes_created ?? 0,
    real_detected_changes: partial.real_detected_changes ?? 0,
    simulated_detected_changes: partial.simulated_detected_changes ?? 0,
    validation_status: partial.validation_status ?? "not_run",
    exports_status: partial.exports_status ?? "not_run",
    build_status: partial.build_status ?? "not_run",
    watchers_status: partial.watchers_status ?? "not_run",
    overall_status: partial.overall_status ?? "partial",
    review_queue_count: partial.review_queue_count ?? 0,
    errors_by_category: partial.errors_by_category ?? {},
    phase_notes: partial.phase_notes ?? [],
    error_message: partial.error_message ?? null,
    legal_safe_note: LEGAL_SAFE_NOTE,
  };
}

function writeReport(report) {
  fs.mkdirSync(MONITORING_ROOT, { recursive: true });
  const file = path.join(MONITORING_ROOT, `${MONITORING_RUN_ID}.yml`);
  writeYaml(
    file,
    report,
    `# Monitoring cycle report — ${RUN_DATE}\n# Mode: ${report.mode}. Not legal advice.\n\n`,
  );
  return file;
}

async function main() {
  const started_at = new Date().toISOString();
  const phase_notes = [];
  const phaseResults = {
    watchers_status: "not_run",
    validation_status: "not_run",
    exports_status: "not_run",
    build_status: "not_run",
  };
  let watcherSummary = summarizeWatcherRun(null);
  let error_message = null;

  console.log(`\nCaesar AI Regulation Watch — monitoring cycle (v0.8.0)`);
  console.log(`Run ID: ${MONITORING_RUN_ID}`);
  console.log(`Mode: ${MODE}`);

  if (!SKIP_LOCK) {
    try {
      acquireLock();
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  }

  try {
    if (MODE === "report_only") {
      phase_notes.push("Report-only: no network fetch; read existing watcher/export state.");
      const runs = listYamlDir("data/watcher-runs").sort((a, b) =>
        b.run_date.localeCompare(a.run_date),
      );
      watcherSummary = summarizeWatcherRun(runs[0] ?? null);
      phaseResults.watchers_status = "skipped";
    } else if (MODE === "dry_run") {
      phase_notes.push(
        "Dry-run: watchers invoked with --dry-run (no snapshot/detected-change writes). Validate/build use current repo data.",
      );
      console.log("\nPhase 1/4: watchers (dry-run)…");
      const w = runNodeScript("scripts/run-official-source-watchers.mjs", ["--dry-run"], {
        WATCHER_RUN_DATE: RUN_DATE,
      });
      process.stdout.write(w.stdout);
      if (w.stderr) process.stderr.write(w.stderr);
      phaseResults.watchers_status = w.ok ? "passed" : "failed";
      if (!w.ok) error_message = `Watcher dry-run failed (exit ${w.status})`;
      const runs = listYamlDir("data/watcher-runs");
      watcherSummary = summarizeWatcherRun(runs[0] ?? null);
      watcherSummary.detected_changes_created = 0;
    } else {
      console.log("\nPhase 1/4: watchers…");
      const w = runNodeScript("scripts/run-official-source-watchers.mjs", [], {
        WATCHER_RUN_DATE: RUN_DATE,
      });
      process.stdout.write(w.stdout);
      if (w.stderr) process.stderr.write(w.stderr);
      phaseResults.watchers_status = w.ok ? "passed" : "failed";
      if (!w.ok) error_message = `Watcher run failed (exit ${w.status})`;
      const runPath = path.join(ROOT, "data/watcher-runs", `watcher-run-${RUN_DATE}.yml`);
      const runLog = fs.existsSync(runPath) ? readYamlFile(`data/watcher-runs/watcher-run-${RUN_DATE}.yml`) : null;
      watcherSummary = summarizeWatcherRun(runLog);
    }

    const dcBefore =
      MODE === "write" ? countDetectedChanges() : { total: 0, real: 0, simulated: 0 };

    if (MODE !== "report_only") {
      console.log("\nPhase 2/4: validate:data…");
      const v = npmRun("validate:data");
      if (v.stdout) process.stdout.write(v.stdout);
      if (v.stderr) process.stderr.write(v.stderr);
      phaseResults.validation_status = v.ok ? "passed" : "failed";
      if (!v.ok && !error_message) error_message = `validate:data failed (exit ${v.status})`;

      console.log("\nPhase 3/4: generate:exports…");
      const e = npmRun("generate:exports");
      if (e.stdout) process.stdout.write(e.stdout);
      if (e.stderr) process.stderr.write(e.stderr);
      phaseResults.exports_status = e.ok ? "passed" : "failed";
      if (!e.ok && !error_message) error_message = `generate:exports failed (exit ${e.status})`;

      console.log("\nPhase 4/4: build…");
      const b = npmRun("build");
      if (b.stdout) process.stdout.write(b.stdout);
      if (b.stderr) process.stderr.write(b.stderr);
      phaseResults.build_status = b.ok ? "passed" : "failed";
      if (!b.ok && !error_message) error_message = `build failed (exit ${b.status})`;
    } else {
      phaseResults.validation_status = "skipped";
      phaseResults.exports_status = "skipped";
      phaseResults.build_status = "skipped";
      phase_notes.push("Skipped validate, exports, and build in report-only mode.");
    }

    const dc = countDetectedChanges();
    const review_queue_count = estimateReviewQueueCount() ?? 0;

    const allPassed =
      MODE === "report_only" ||
      (phaseResults.watchers_status !== "failed" &&
        phaseResults.validation_status === "passed" &&
        phaseResults.exports_status === "passed" &&
        phaseResults.build_status === "passed");

    const overall_status =
      MODE === "report_only"
        ? "report_only"
        : allPassed
          ? watcherSummary.watcher_soft_error_count > 0
            ? "partial"
            : "passed"
          : "failed";

    const report = buildReport({
      started_at,
      finished_at: new Date().toISOString(),
      ...watcherSummary,
      real_detected_changes: dc.real,
      simulated_detected_changes: dc.simulated,
      detected_changes_created:
        MODE === "write"
          ? Math.max(0, dc.total - (dcBefore?.total ?? dc.total))
          : watcherSummary.detected_changes_created,
      ...phaseResults,
      overall_status,
      review_queue_count,
      phase_notes,
      error_message,
    });

    const reportPath = writeReport(report);
    console.log(`\nWrote ${path.relative(ROOT, reportPath)}`);

    console.log(`\nSummary: overall=${overall_status} watchers=${phaseResults.watchers_status} validate=${phaseResults.validation_status} build=${phaseResults.build_status}`);
    console.log(
      `Watchers: configured=${report.watchers_configured} checked=${report.watchers_checked} success=${report.watcher_success_count} soft_errors=${report.watcher_soft_error_count}`,
    );

    if (overall_status === "failed") process.exit(1);
  } finally {
    if (!SKIP_LOCK) releaseLock();
  }
}

main().catch((err) => {
  console.error(err);
  if (!SKIP_LOCK) releaseLock();
  process.exit(1);
});
