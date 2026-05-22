#!/usr/bin/env node
/**
 * T085 — Print row counts for core runtime tables (metadata only).
 */
import { loadRuntimeEnv, getDbUrl } from "./lib/load-runtime-env.mjs";
import { withPgClient } from "./lib/pg-client.mjs";

const TABLES = [
  "source_runs",
  "source_items",
  "detected_changes",
  "review_candidates",
  "runtime_events",
];

async function main() {
  const env = loadRuntimeEnv();
  const dbUrl = getDbUrl(env);
  if (!dbUrl) {
    console.error("query-runtime-table-counts: no SUPABASE_DB_URL configured");
    process.exit(1);
  }

  const counts = {};
  await withPgClient(dbUrl, async (client) => {
    for (const table of TABLES) {
      const res = await client.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
      counts[table] = res.rows[0]?.n ?? 0;
    }
  });

  console.log(JSON.stringify({ captured_at: new Date().toISOString(), counts }, null, 2));
}

main().catch((err) => {
  console.error(`query-runtime-table-counts: ${err.message}`);
  process.exit(1);
});
