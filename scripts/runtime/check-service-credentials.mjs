#!/usr/bin/env node
/**
 * Check local service credential presence — never print secret values.
 * Writes public/data/runtime-services-readiness.json (metadata only).
 */
import fs from "node:fs";
import path from "node:path";
import {
  loadAllServiceEnv,
  envPresent,
  envFlagTrue,
  SERVICE_ENV_FILES,
  SERVICE_ENV_ROOT,
} from "./lib/load-service-env.mjs";
import { runtimeSafetySnapshot } from "./lib/runtime-safety.mjs";

const OUTPUT = path.join(
  SERVICE_ENV_ROOT,
  "public/data/runtime-services-readiness.json",
);

const SUPABASE_REQUIRED = ["SUPABASE_URL", "SUPABASE_PROJECT_REF", "SUPABASE_DB_URL"];
const SUPABASE_OPTIONAL = ["SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
const CLOUDFLARE_REQUIRED = [
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_WORKER_NAME",
];
const GITHUB_OPTIONAL = ["GITHUB_TOKEN", "GH_TOKEN", "GITHUB_FINE_GRAINED_TOKEN"];

function fieldRows(env, keys) {
  return keys.map((key) => ({ key, present: envPresent(env, key) }));
}

function allPresent(rows) {
  return rows.length > 0 && rows.every((r) => r.present);
}

function anyPresent(rows) {
  return rows.some((r) => r.present);
}

function collectSafetyFlags(runtime, cloudflare) {
  return {
    regwatch_apply_supabase_schema: envFlagTrue(
      runtime,
      "REGWATCH_APPLY_SUPABASE_SCHEMA",
    ),
    regwatch_enable_live_ingestion: envFlagTrue(
      runtime,
      "REGWATCH_ENABLE_LIVE_INGESTION",
    ),
    regwatch_enable_scheduled_monitoring: envFlagTrue(
      runtime,
      "REGWATCH_ENABLE_SCHEDULED_MONITORING",
    ),
    regwatch_enable_network_execution: envFlagTrue(
      runtime,
      "REGWATCH_ENABLE_NETWORK_EXECUTION",
    ),
    cloudflare_enable_worker_deploy: envFlagTrue(
      cloudflare,
      "CLOUDFLARE_ENABLE_WORKER_DEPLOY",
    ),
    cloudflare_enable_cron_trigger: envFlagTrue(
      cloudflare,
      "CLOUDFLARE_ENABLE_CRON_TRIGGER",
    ),
  };
}

function assertSafetyDisabled(safetyFlags) {
  const errors = [];
  const checks = [
    ["regwatch_apply_supabase_schema", "REGWATCH_APPLY_SUPABASE_SCHEMA"],
    ["regwatch_enable_live_ingestion", "REGWATCH_ENABLE_LIVE_INGESTION"],
    [
      "regwatch_enable_scheduled_monitoring",
      "REGWATCH_ENABLE_SCHEDULED_MONITORING",
    ],
    ["regwatch_enable_network_execution", "REGWATCH_ENABLE_NETWORK_EXECUTION"],
    ["cloudflare_enable_worker_deploy", "CLOUDFLARE_ENABLE_WORKER_DEPLOY"],
    ["cloudflare_enable_cron_trigger", "CLOUDFLARE_ENABLE_CRON_TRIGGER"],
  ];
  for (const [flag, label] of checks) {
    if (safetyFlags[flag]) {
      errors.push(`${label} must be false in local env`);
    }
  }
  return errors;
}

function printPresenceReport(files, services) {
  console.log("Runtime services credential check (values not shown)");
  for (const [name, exists] of Object.entries(files)) {
    const file =
      name === "runtime"
        ? SERVICE_ENV_FILES.runtime
        : name === "cloudflare"
          ? SERVICE_ENV_FILES.cloudflare
          : SERVICE_ENV_FILES.github;
    console.log(`  ${file}: ${exists ? "found" : "missing"}`);
  }
  for (const svc of services) {
    console.log(`  [${svc.service}]`);
    for (const row of svc.fields) {
      console.log(`    ${row.key}: ${row.present ? "present" : "missing"}`);
    }
  }
}

function buildNextAction(readiness) {
  if (!readiness.supabase_required_ready) {
    return "Copy .env.runtime.example to .env.runtime.local and add Supabase credentials for Account A project caesar-regulation-watch-dev (hub policy). Do not commit local env files.";
  }
  if (!readiness.cloudflare_ready) {
    return "Copy .env.cloudflare.example to .env.cloudflare.local and add Cloudflare Account A token and worker name. Keep CLOUDFLARE_ENABLE_WORKER_DEPLOY=false until Control Tower approves deploy.";
  }
  if (readiness.uptime_manual_setup_required) {
    return "Create UptimeRobot (or equivalent) free account and add HTTP monitors for public Regulation Watch URLs listed in docs/runtime/EXTERNAL_SERVICE_ONBOARDING_CHECKLIST.md.";
  }
  return "Local credential placeholders present. Next: npm run runtime:db:health, then T075B runtime DB connection when approved — still no Worker deploy or network execution.";
}

function main() {
  const { runtime, cloudflare, github, files } = loadAllServiceEnv();
  const safetyFlags = collectSafetyFlags(runtime, cloudflare);
  const safetyErrors = assertSafetyDisabled(safetyFlags);
  const runtimeSafety = runtimeSafetySnapshot(runtime);

  const supabaseRequiredRows = fieldRows(runtime, SUPABASE_REQUIRED);
  const supabaseOptionalRows = fieldRows(runtime, SUPABASE_OPTIONAL);
  const cloudflareRows = fieldRows(cloudflare, CLOUDFLARE_REQUIRED);
  const githubRows = fieldRows(github, GITHUB_OPTIONAL);

  const readiness = {
    supabase_required_ready: allPresent(supabaseRequiredRows),
    supabase_optional_ready: allPresent(supabaseOptionalRows),
    cloudflare_ready: allPresent(cloudflareRows),
    github_optional_ready: anyPresent(githubRows),
    uptime_manual_setup_required: true,
  };

  const services = [
    {
      service: "supabase",
      role: "required",
      fields: [...supabaseRequiredRows, ...supabaseOptionalRows],
    },
    {
      service: "cloudflare",
      role: "required_for_worker_runtime",
      fields: cloudflareRows,
    },
    {
      service: "github",
      role: "optional",
      fields: githubRows,
    },
    {
      service: "uptimerobot",
      role: "manual_external",
      fields: [{ key: "operator_setup", present: false }],
    },
  ];

  let status = "onboarding_incomplete";
  if (safetyErrors.length > 0) {
    status = "unsafe_local_flags";
  } else if (
    readiness.supabase_required_ready &&
    readiness.cloudflare_ready
  ) {
    status = "local_credentials_ready";
  } else if (
    readiness.supabase_required_ready ||
    readiness.cloudflare_ready ||
    readiness.github_optional_ready
  ) {
    status = "partial";
  }

  const payload = {
    status,
    checked_at: new Date().toISOString(),
    account_allocation: "account_a",
    live_ingestion_enabled: runtimeSafety.live_ingestion_enabled,
    scheduled_monitoring_enabled: runtimeSafety.scheduled_monitoring_enabled,
    network_execution_enabled: runtimeSafety.network_execution_enabled,
    readiness,
    services,
    safety_flags: safetyFlags,
    local_env_files: {
      env_runtime_local: files.runtime,
      env_cloudflare_local: files.cloudflare,
      env_github_local: files.github,
    },
    next_required_action: buildNextAction(readiness),
    public_note:
      "Metadata-only services onboarding readiness. No emails, tokens, keys, database URLs, or hosts in this export. Exact account emails live only in hub .local/ files and ignored local env.",
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUTPUT}`);
  printPresenceReport(files, services);

  if (safetyErrors.length > 0) {
    console.error("check-service-credentials: FAILED — unsafe local flags");
    for (const e of safetyErrors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log("PASS: check-service-credentials");
}

main();
