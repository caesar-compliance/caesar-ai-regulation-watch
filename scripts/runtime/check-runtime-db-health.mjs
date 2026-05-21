#!/usr/bin/env node
/**
 * Runtime DB health check — safe public JSON export. No secrets in output.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadRuntimeEnv,
  getDbUrl,
  RUNTIME_ROOT,
} from "./lib/load-runtime-env.mjs";
import {
  assertRuntimeSafetyDisabled,
  runtimeSafetySnapshot,
} from "./lib/runtime-safety.mjs";
import {
  EXPECTED_RUNTIME_TABLES,
  RUNTIME_SCHEMA_NAME,
} from "./lib/expected-tables.mjs";
import { withPgClient } from "./lib/pg-client.mjs";

const ROOT = RUNTIME_ROOT;
const OUTPUT = path.join(ROOT, "public/data/runtime-db-health.json");
const STRICT = process.argv.includes("--strict");

function buildBasePayload(env) {
  const safety = runtimeSafetySnapshot(env);
  return {
    checked_at: new Date().toISOString(),
    runtime_environment: (env.REGWATCH_RUNTIME_ENV || "local").trim() || "local",
    schema_name: RUNTIME_SCHEMA_NAME,
    live_ingestion_enabled: safety.live_ingestion_enabled,
    scheduled_monitoring_enabled: safety.scheduled_monitoring_enabled,
    network_execution_enabled: safety.network_execution_enabled,
    public_note:
      "Metadata-only runtime health. No DB credentials, legal text, or secrets in this file. Live ingestion and scheduled monitoring remain disabled.",
  };
}

async function queryHealth(dbUrl) {
  return withPgClient(dbUrl, async (client) => {
    const tableRows = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = $1 AND table_name = ANY($2::text[])`,
      [RUNTIME_SCHEMA_NAME, EXPECTED_RUNTIME_TABLES],
    );
    const present = new Set(tableRows.rows.map((r) => r.table_name));
    const missing_tables = EXPECTED_RUNTIME_TABLES.filter((t) => !present.has(t));

    let runtime_event_count = null;
    let latest_runtime_event_at = null;
    if (present.has("runtime_events")) {
      const countRes = await client.query(
        "SELECT COUNT(*)::int AS c FROM runtime_events",
      );
      runtime_event_count = countRes.rows[0]?.c ?? 0;
      const latestRes = await client.query(
        "SELECT MAX(created_at) AS latest FROM runtime_events",
      );
      latest_runtime_event_at = latestRes.rows[0]?.latest
        ? new Date(latestRes.rows[0].latest).toISOString()
        : null;
    }

    const status =
      missing_tables.length === 0 ? "connected" : "schema_missing";

    return {
      status,
      expected_tables_present: EXPECTED_RUNTIME_TABLES.filter((t) =>
        present.has(t),
      ),
      missing_tables,
      runtime_event_count,
      latest_runtime_event_at,
    };
  });
}

async function main() {
  const env = loadRuntimeEnv();
  const safetyErrors = assertRuntimeSafetyDisabled(env, "check-runtime-db-health");
  const base = buildBasePayload(env);

  if (safetyErrors.length > 0) {
    const payload = {
      ...base,
      status: "error",
      expected_tables_present: [],
      missing_tables: EXPECTED_RUNTIME_TABLES,
      runtime_event_count: null,
      latest_runtime_event_at: null,
      public_note: `${base.public_note} Safety flags must remain disabled.`,
    };
    writeOutput(payload);
    console.error("check-runtime-db-health: FAILED — unsafe runtime flags");
    for (const e of safetyErrors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  const dbUrl = getDbUrl(env);
  if (!dbUrl) {
    const payload = {
      ...base,
      status: "not_configured",
      expected_tables_present: [],
      missing_tables: [],
      runtime_event_count: null,
      latest_runtime_event_at: null,
    };
    writeOutput(payload);
    console.log("PASS: check-runtime-db-health (not_configured)");
    return;
  }

  try {
    const health = await queryHealth(dbUrl);
    const payload = { ...base, ...health };
    writeOutput(payload);
    if (health.status === "connected") {
      console.log("PASS: check-runtime-db-health (connected)");
      return;
    }
    console.log(`PASS: check-runtime-db-health (${health.status})`);
    if (STRICT && health.status !== "connected") {
      process.exit(1);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const payload = {
      ...base,
      status: "error",
      expected_tables_present: [],
      missing_tables: EXPECTED_RUNTIME_TABLES,
      runtime_event_count: null,
      latest_runtime_event_at: null,
      public_note: `${base.public_note} Connection or query failed (details not exported).`,
    };
    writeOutput(payload);
    console.error("check-runtime-db-health: error (sanitized)");
    console.error(`  ${message.replace(/postgres:\/\/[^\s]+/gi, "[redacted]")}`);
    if (STRICT) process.exit(1);
    console.log("PASS: check-runtime-db-health (error recorded for export)");
  }
}

function writeOutput(payload) {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUTPUT}`);
}

main();
