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
import { analyzeSupabaseApiKeys } from "./lib/supabase-api-keys.mjs";
import { runtimeSafetySnapshot } from "./lib/runtime-safety.mjs";

const OUTPUT = path.join(
  SERVICE_ENV_ROOT,
  "public/data/runtime-services-readiness.json",
);

const SUPABASE_PROJECT_REQUIRED = [
  "SUPABASE_PROJECT_NAME",
  "SUPABASE_URL",
  "SUPABASE_PROJECT_REF",
  "SUPABASE_DB_URL",
  "SUPABASE_SCHEMA",
];
const SUPABASE_KEY_FIELDS = [
  "SUPABASE_API_KEY_MODE",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
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

function printPresenceReport(files, services, supabaseKeys) {
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
  console.log("  [supabase_api_keys]");
  console.log(`    supabase_key_mode: ${supabaseKeys.supabase_key_mode}`);
  for (const [key, prefix] of Object.entries(supabaseKeys.key_prefix_types)) {
    const present = supabaseKeys[
      key === "SUPABASE_PUBLISHABLE_KEY"
        ? "supabase_publishable_key_present"
        : key === "SUPABASE_SECRET_KEY"
          ? "supabase_secret_key_present"
          : key === "SUPABASE_ANON_KEY"
            ? "supabase_legacy_anon_key_present"
            : "supabase_legacy_service_role_key_present"
    ];
    console.log(
      `    ${key}: ${present ? "present" : "missing"} (prefix: ${prefix})`,
    );
  }
  for (const svc of services) {
    console.log(`  [${svc.service}]`);
    for (const row of svc.fields) {
      console.log(`    ${row.key}: ${row.present ? "present" : "missing"}`);
    }
  }
  for (const w of supabaseKeys.warnings) {
    console.warn(`  WARN: ${w}`);
  }
}

function buildNextAction(readiness, supabaseKeys) {
  if (!readiness.supabase_project_ready) {
    return "Copy .env.runtime.example to .env.runtime.local and add Supabase project fields for Account A project caesar-regulation-watch-dev (hub policy). Do not commit local env files.";
  }
  if (!supabaseKeys.new_keys_ready) {
    return "Set SUPABASE_API_KEY_MODE=new and fill SUPABASE_PUBLISHABLE_KEY (sb_publishable_...) and SUPABASE_SECRET_KEY (sb_secret_...) in .env.runtime.local. Legacy anon/service_role keys are optional fallback only.";
  }
  if (!readiness.cloudflare_ready) {
    return "Copy .env.cloudflare.example to .env.cloudflare.local and add Cloudflare Account A token and worker name. Keep CLOUDFLARE_ENABLE_WORKER_DEPLOY=false until Control Tower approves deploy.";
  }
  if (readiness.uptime_manual_setup_required) {
    return "Create UptimeRobot (or equivalent) free account and add HTTP monitors for public Regulation Watch URLs listed in docs/runtime/EXTERNAL_SERVICE_ONBOARDING_CHECKLIST.md.";
  }
  return "Local credentials present with safety disabled. Ready for manual schema review and manual worker review — still no deploy, migration, or network execution.";
}

function resolveStatus({
  safetyErrors,
  supabaseProjectReady,
  newKeysReady,
  cloudflareReady,
}) {
  if (safetyErrors.length > 0) return "unsafe_local_flags";
  if (supabaseProjectReady && newKeysReady && cloudflareReady) {
    return "ready_for_manual_worker_review";
  }
  if (supabaseProjectReady && newKeysReady) {
    return "ready_for_manual_schema_review";
  }
  if (
    supabaseProjectReady ||
    newKeysReady ||
    cloudflareReady
  ) {
    return "partial";
  }
  return "onboarding_incomplete";
}

function main() {
  const { runtime, cloudflare, github, files } = loadAllServiceEnv();
  const safetyFlags = collectSafetyFlags(runtime, cloudflare);
  const safetyErrors = assertSafetyDisabled(safetyFlags);
  const runtimeSafety = runtimeSafetySnapshot(runtime);
  const supabaseKeys = analyzeSupabaseApiKeys(runtime);

  const supabaseProjectRows = fieldRows(runtime, SUPABASE_PROJECT_REQUIRED);
  const supabaseKeyRows = fieldRows(runtime, SUPABASE_KEY_FIELDS);
  const cloudflareRows = fieldRows(cloudflare, CLOUDFLARE_REQUIRED);
  const githubRows = fieldRows(github, GITHUB_OPTIONAL);

  const supabaseProjectReady = allPresent(supabaseProjectRows);

  const readiness = {
    supabase_project_ready: supabaseProjectReady,
    supabase_new_keys_ready: supabaseKeys.new_keys_ready,
    supabase_legacy_keys_ready: supabaseKeys.legacy_keys_ready,
    supabase_key_mode: supabaseKeys.supabase_key_mode,
    supabase_publishable_key_present: supabaseKeys.supabase_publishable_key_present,
    supabase_secret_key_present: supabaseKeys.supabase_secret_key_present,
    supabase_legacy_anon_key_present: supabaseKeys.supabase_legacy_anon_key_present,
    supabase_legacy_service_role_key_present:
      supabaseKeys.supabase_legacy_service_role_key_present,
    cloudflare_ready: allPresent(cloudflareRows),
    github_optional_ready: anyPresent(githubRows),
    uptime_manual_setup_required: true,
  };

  const services = [
    {
      service: "supabase",
      role: "required",
      fields: [...supabaseProjectRows, ...supabaseKeyRows],
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

  const status = resolveStatus({
    safetyErrors,
    supabaseProjectReady,
    newKeysReady: supabaseKeys.new_keys_ready,
    cloudflareReady: readiness.cloudflare_ready,
  });

  const payload = {
    status,
    checked_at: new Date().toISOString(),
    account_allocation: "account_a",
    live_ingestion_enabled: runtimeSafety.live_ingestion_enabled,
    scheduled_monitoring_enabled: runtimeSafety.scheduled_monitoring_enabled,
    network_execution_enabled: runtimeSafety.network_execution_enabled,
    supabase_key_mode: supabaseKeys.supabase_key_mode,
    supabase_publishable_key_present: supabaseKeys.supabase_publishable_key_present,
    supabase_secret_key_present: supabaseKeys.supabase_secret_key_present,
    supabase_legacy_anon_key_present: supabaseKeys.supabase_legacy_anon_key_present,
    supabase_legacy_service_role_key_present:
      supabaseKeys.supabase_legacy_service_role_key_present,
    readiness,
    services,
    safety_flags: safetyFlags,
    local_env_files: {
      env_runtime_local: files.runtime,
      env_cloudflare_local: files.cloudflare,
      env_github_local: files.github,
    },
    next_required_action: buildNextAction(readiness, supabaseKeys),
    public_note:
      "Metadata-only services onboarding readiness. No emails, tokens, keys, database URLs, or hosts in this export. Prefer sb_publishable_/sb_secret_ keys; legacy JWT keys are optional fallback only.",
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUTPUT}`);
  printPresenceReport(files, services, supabaseKeys);

  if (safetyErrors.length > 0) {
    console.error("check-service-credentials: FAILED — unsafe local flags");
    for (const e of safetyErrors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log("PASS: check-service-credentials");
}

main();
