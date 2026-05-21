#!/usr/bin/env node
/**
 * Runtime safety flags — must remain false unless explicitly approved elsewhere.
 */
import { envFlagTrue } from "./load-runtime-env.mjs";

export function assertRuntimeSafetyDisabled(env, context = "runtime") {
  const errors = [];
  const checks = [
    ["REGWATCH_ENABLE_LIVE_INGESTION", false],
    ["REGWATCH_ENABLE_SCHEDULED_MONITORING", false],
    ["REGWATCH_ENABLE_NETWORK_EXECUTION", false],
  ];
  for (const [key, expected] of checks) {
    const actual = envFlagTrue(env, key);
    if (actual !== expected) {
      errors.push(`${context}: ${key} must remain disabled (got enabled)`);
    }
  }
  return errors;
}

export function runtimeSafetySnapshot(env) {
  return {
    live_ingestion_enabled: envFlagTrue(env, "REGWATCH_ENABLE_LIVE_INGESTION"),
    scheduled_monitoring_enabled: envFlagTrue(env, "REGWATCH_ENABLE_SCHEDULED_MONITORING"),
    network_execution_enabled: envFlagTrue(env, "REGWATCH_ENABLE_NETWORK_EXECUTION"),
  };
}
