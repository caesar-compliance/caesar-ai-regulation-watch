#!/usr/bin/env node
/**
 * Dev seed — metadata-only runtime rows. Requires ENABLE_DEV_SEED=true.
 * No full legal text. Idempotent where possible.
 */
import { spawnSync } from "node:child_process";
import {
  loadRuntimeEnv,
  getDbUrl,
  envFlagTrue,
} from "./lib/load-runtime-env.mjs";
import { assertRuntimeSafetyDisabled } from "./lib/runtime-safety.mjs";
import { withPgClient } from "./lib/pg-client.mjs";

const SEED_SOURCE_KEY = "dev-seed-regulation-source";

async function main() {
  const env = loadRuntimeEnv();
  const safetyErrors = assertRuntimeSafetyDisabled(env, "seed-dev-data");
  if (safetyErrors.length > 0) {
    console.error("seed-dev-data: REFUSED — unsafe runtime flags enabled");
    for (const e of safetyErrors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  if (!envFlagTrue(env, "ENABLE_DEV_SEED")) {
    console.log(
      "seed-dev-data: no-op (set ENABLE_DEV_SEED=true in .env.runtime.local to seed)",
    );
    return;
  }

  const dbUrl = getDbUrl(env);
  if (!dbUrl) {
    console.error("seed-dev-data: SUPABASE_DB_URL not configured");
    process.exit(1);
  }

  await withPgClient(dbUrl, async (client) => {
    await client.query(
      `INSERT INTO regulation_sources (
         source_key, source_name, source_type, source_url, status, metadata_only
       ) VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (source_key) DO NOTHING`,
      [
        SEED_SOURCE_KEY,
        "Dev seed regulation source",
        "rss",
        "https://example.com/dev-seed-feed",
        "draft",
      ],
    );
    await client.query(
      `INSERT INTO runtime_events (event_type, event_status, source_key, message, metadata_json)
       SELECT $1, $2, $3, $4, $5::jsonb
       WHERE NOT EXISTS (
         SELECT 1 FROM runtime_events
         WHERE event_type = $1 AND source_key = $3
       )`,
      [
        "dev_seed",
        "completed",
        SEED_SOURCE_KEY,
        "metadata-only dev seed",
        JSON.stringify({ note: "metadata-only dev seed", seeded: true }),
      ],
    );
  });

  console.log("PASS: seed-dev-data (metadata-only dev rows)");
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(
    `seed-dev-data: error — ${message.replace(/postgres:\/\/[^\s]+/gi, "[redacted]")}`,
  );
  process.exit(1);
});
