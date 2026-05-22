#!/usr/bin/env node
/**
 * Load runtime env from .env.runtime.local (never logged). Merges with process.env.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const RUNTIME_ENV_FILES = [".env.runtime.local", ".env.runtime"];

function parseEnvFile(content) {
  const out = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

export function loadRuntimeEnv() {
  const merged = {};
  for (const file of RUNTIME_ENV_FILES) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    Object.assign(merged, parseEnvFile(fs.readFileSync(full, "utf8")));
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (
      key.startsWith("REGWATCH_") ||
      key.startsWith("SUPABASE_") ||
      key === "DATABASE_URL" ||
      key === "RUN_TOKEN" ||
      key === "WORKER_URL"
    ) {
      if (value !== undefined && value !== "") merged[key] = value;
    }
  }
  for (const file of [".env.cloudflare.local", ".env.cloudflare"]) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    const parsed = parseEnvFile(fs.readFileSync(full, "utf8"));
    for (const key of ["RUN_TOKEN", "REGWATCH_RUN_TOKEN", "WORKER_URL", "REGWATCH_WORKER_URL"]) {
      if (parsed[key] && !merged[key]) merged[key] = parsed[key];
    }
  }
  if (!merged.SUPABASE_SERVICE_ROLE_KEY && merged.SUPABASE_SECRET_KEY) {
    merged.SUPABASE_SERVICE_ROLE_KEY = merged.SUPABASE_SECRET_KEY;
  }
  return merged;
}

export function getDbUrl(env) {
  return (
    env.SUPABASE_DB_URL ||
    env.REGWATCH_SUPABASE_DB_URL ||
    env.DATABASE_URL ||
    ""
  ).trim();
}

export function envFlagTrue(env, key) {
  const v = (env[key] ?? "").toString().trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export { ROOT as RUNTIME_ROOT };
