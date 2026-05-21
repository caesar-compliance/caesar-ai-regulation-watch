#!/usr/bin/env node
/**
 * Apply Supabase runtime schema — manual only with explicit local approval flag.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  loadRuntimeEnv,
  getDbUrl,
  envFlagTrue,
  RUNTIME_ROOT,
} from "./lib/load-runtime-env.mjs";
import { assertRuntimeSafetyDisabled } from "./lib/runtime-safety.mjs";
import { withPgClient } from "./lib/pg-client.mjs";

const ROOT = RUNTIME_ROOT;
const SCHEMA_FILE = path.join(
  ROOT,
  "ops/supabase/001_regulation_watch_runtime_schema.sql",
);

function hasPsql() {
  const r = spawnSync("which", ["psql"], { encoding: "utf8" });
  return r.status === 0 && r.stdout.trim().length > 0;
}

function applyWithPsql(dbUrl) {
  const result = spawnSync(
    "psql",
    [dbUrl, "-v", "ON_ERROR_STOP=1", "-f", SCHEMA_FILE],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || "psql failed").trim();
    throw new Error(err.replace(/postgres:\/\/[^\s]+/gi, "[redacted]"));
  }
}

async function applyWithPg(dbUrl) {
  const sql = fs.readFileSync(SCHEMA_FILE, "utf8");
  await withPgClient(dbUrl, async (client) => {
    await client.query(sql);
  });
}

async function main() {
  const env = loadRuntimeEnv();

  const safetyErrors = assertRuntimeSafetyDisabled(env, "apply-supabase-schema");
  if (safetyErrors.length > 0) {
    console.error("apply-supabase-schema: REFUSED — unsafe runtime flags enabled");
    for (const e of safetyErrors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  if (!envFlagTrue(env, "REGWATCH_APPLY_SUPABASE_SCHEMA")) {
    console.log(
      "apply-supabase-schema: no-op (set REGWATCH_APPLY_SUPABASE_SCHEMA=true in .env.runtime.local to apply)",
    );
    process.exit(0);
  }

  const dbUrl = getDbUrl(env);
  if (!dbUrl) {
    console.error(
      "apply-supabase-schema: REFUSED — SUPABASE_DB_URL or REGWATCH_SUPABASE_DB_URL required",
    );
    process.exit(1);
  }

  if (!fs.existsSync(SCHEMA_FILE)) {
    console.error(`apply-supabase-schema: missing schema file ${SCHEMA_FILE}`);
    process.exit(1);
  }

  console.log("apply-supabase-schema: applying (credentials not logged)");

  try {
    if (hasPsql()) {
      applyWithPsql(dbUrl);
      console.log("PASS: apply-supabase-schema (psql)");
    } else {
      console.log("psql not found — using pg client");
      await applyWithPg(dbUrl);
      console.log("PASS: apply-supabase-schema (pg)");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("apply-supabase-schema: FAILED");
    console.error(`  ${message.replace(/postgres:\/\/[^\s]+/gi, "[redacted]")}`);
    if (!hasPsql()) {
      console.error(
        "\nInstall PostgreSQL client (psql) or run: npm ci (includes pg devDependency)",
      );
    }
    process.exit(1);
  }
}

main();
