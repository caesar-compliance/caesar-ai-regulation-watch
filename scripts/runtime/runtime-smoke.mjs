#!/usr/bin/env node
/**
 * Runtime smoke — credential check, DB health export, worker typecheck.
 * Post-deploy /healthz smoke runs in GitHub Actions after wrangler deploy.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const WORKER_DIR = path.join(
  ROOT,
  "ops/cloudflare-workers/regulation-watch-monitor",
);

let passed = 0;
let failed = 0;

function runStep(label, fn) {
  try {
    fn();
    console.log(`PASS: ${label}`);
    passed++;
  } catch (err) {
    console.log(`FAIL: ${label} — ${err.message}`);
    failed++;
  }
}

function runNodeScript(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) throw new Error(`missing ${relPath}`);
  const r = spawnSync("node", [full], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (r.status !== 0) {
    throw new Error((r.stderr || r.stdout || "script failed").trim().slice(0, 200));
  }
}

runStep("worker typecheck", () => {
  const r = spawnSync("npm", ["run", "typecheck"], {
    cwd: WORKER_DIR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (r.status !== 0) {
    throw new Error((r.stderr || r.stdout || "typecheck failed").trim().slice(0, 200));
  }
});

runStep("runtime services check", () => {
  runNodeScript("scripts/runtime/check-service-credentials.mjs");
});

runStep("runtime db health", () => {
  runNodeScript("scripts/runtime/check-runtime-db-health.mjs");
});

const workerUrl = (process.env.WORKER_URL || process.env.REGWATCH_WORKER_URL || "").trim();
if (workerUrl) {
  runStep("worker /healthz remote", () => {
    const r = spawnSync(
      "curl",
      ["-sS", "-o", "/dev/null", "-w", "%{http_code}", `${workerUrl.replace(/\/$/, "")}/healthz`],
      { encoding: "utf8" },
    );
    if (r.stdout.trim() !== "200") {
      throw new Error(`HTTP ${r.stdout.trim()}`);
    }
  });
}

console.log(`\nruntime-smoke: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
