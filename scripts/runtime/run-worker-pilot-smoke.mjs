#!/usr/bin/env node
/**
 * T086 — Worker endpoint smoke + bounded six-source pilot (dry-run then write).
 * Requires RUN_TOKEN in environment (never logged).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRuntimeEnv } from "./lib/load-runtime-env.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REPORT_PATH = path.join(ROOT, "generated/runtime/worker-pilot-run.latest.json");
const env = loadRuntimeEnv();
const WORKER_URL = (
  env.WORKER_URL ||
  env.REGWATCH_WORKER_URL ||
  process.env.WORKER_URL ||
  process.env.REGWATCH_WORKER_URL ||
  "https://regulation-watch-monitor-dev.nazzarkoartem.workers.dev"
).replace(/\/$/, "");
const RUN_TOKEN = (
  env.RUN_TOKEN ||
  env.REGWATCH_RUN_TOKEN ||
  process.env.RUN_TOKEN ||
  process.env.REGWATCH_RUN_TOKEN ||
  ""
).trim();
const EXPECTED_VERSION = process.env.EXPECTED_WORKER_VERSION || "1.0.37";

async function fetchJson(pathname, options = {}) {
  const res = await fetch(`${WORKER_URL}${pathname}`, options);
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 500) };
  }
  return { status: res.status, body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const results = { worker_url: WORKER_URL, steps: [], started_at: new Date().toISOString() };

  const health = await fetchJson("/healthz");
  results.steps.push({ step: "GET /healthz", status: health.status });
  assert(health.status === 200, `/healthz expected 200, got ${health.status}`);

  const ready = await fetchJson("/readyz");
  results.steps.push({ step: "GET /readyz", status: ready.status, ready: ready.body?.ready });
  assert(ready.status === 200, `/readyz expected 200, got ${ready.status}`);

  const version = await fetchJson("/version");
  results.steps.push({
    step: "GET /version",
    status: version.status,
    version: version.body?.version,
  });
  assert(version.status === 200, `/version expected 200`);

  const lastBefore = await fetchJson("/last-run");
  results.last_run_before = lastBefore.body;
  results.steps.push({ step: "GET /last-run (before)", status: lastBefore.status });

  const unauth = await fetchJson("/run-pilot", { method: "POST" });
  results.steps.push({ step: "POST /run-pilot (no auth)", status: unauth.status });
  assert(
    unauth.status === 401 || unauth.status === 403,
    `unauthorized /run-pilot expected 401/403, got ${unauth.status}`,
  );

  if (!RUN_TOKEN) {
    console.error(
      "run-worker-pilot-smoke: RUN_TOKEN (or REGWATCH_RUN_TOKEN) required for dry-run/write pilot",
    );
    process.exit(1);
  }

  const authHeaders = {
    Authorization: `Bearer ${RUN_TOKEN}`,
    "Content-Type": "application/json",
  };

  const dry = await fetchJson(
    "/run-pilot?dry_run=true&max_sources=6&max_items=20",
    { method: "POST", headers: authHeaders },
  );
  results.dry_run = dry.body;
  results.steps.push({ step: "POST /run-pilot dry_run", status: dry.status });
  assert(dry.status === 200, `dry_run expected 200, got ${dry.status}`);
  assert(dry.body?.dry_run === true, "dry_run response must set dry_run=true");
  assert(
    (dry.body?.results?.length ?? 0) <= 6,
    "dry_run must attempt at most 6 sources",
  );

  const write = await fetchJson(
    "/run-pilot?max_sources=6&max_items=20",
    { method: "POST", headers: authHeaders },
  );
  results.write_run = write.body;
  results.steps.push({ step: "POST /run-pilot write", status: write.status });
  assert(write.status === 200, `write pilot expected 200, got ${write.status}`);

  const lastAfter = await fetchJson("/last-run");
  results.last_run_after = lastAfter.body;
  results.steps.push({ step: "GET /last-run (after)", status: lastAfter.status });

  const report = {
    task_id: "T086",
    worker_url: WORKER_URL,
    worker_version: version.body?.version ?? null,
    expected_worker_version: EXPECTED_VERSION,
    deployed_at: new Date().toISOString(),
    worker_allowlist_source_count: write.body?.worker_allowlist_source_count ?? 6,
    worker_run_source_success_count: write.body?.worker_run_source_success_count ?? null,
    worker_run_source_failure_count: write.body?.worker_run_source_failure_count ?? null,
    scheduled_monitoring_enabled: write.body?.scheduled_monitoring_enabled ?? false,
    dry_run: results.dry_run,
    write_run: results.write_run,
    last_run_before: results.last_run_before,
    last_run_after: results.last_run_after,
    latest_run_id:
      write.body?.results?.find((r) => r.run_id && r.run_id !== "dry-run-not-persisted")
        ?.run_id ?? null,
    steps: results.steps,
    completed_at: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`PASS: run-worker-pilot-smoke (${report.worker_run_source_success_count ?? "?"} ok, ${report.worker_run_source_failure_count ?? "?"} failed)`);
}

main().catch((err) => {
  console.error(`run-worker-pilot-smoke: ${err.message}`);
  process.exit(1);
});
