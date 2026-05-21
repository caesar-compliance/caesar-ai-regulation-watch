#!/usr/bin/env node
/**
 * Load local service env files (never log values).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

export const SERVICE_ENV_FILES = {
  runtime: ".env.runtime.local",
  cloudflare: ".env.cloudflare.local",
  github: ".env.github.local",
};

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

export function loadServiceEnvFile(filename) {
  const full = path.join(ROOT, filename);
  if (!fs.existsSync(full)) return { exists: false, env: {} };
  return { exists: true, env: parseEnvFile(fs.readFileSync(full, "utf8")) };
}

export function loadAllServiceEnv() {
  const runtime = loadServiceEnvFile(SERVICE_ENV_FILES.runtime);
  const cloudflare = loadServiceEnvFile(SERVICE_ENV_FILES.cloudflare);
  const github = loadServiceEnvFile(SERVICE_ENV_FILES.github);
  return {
    runtime: runtime.env,
    cloudflare: cloudflare.env,
    github: github.env,
    files: {
      runtime: runtime.exists,
      cloudflare: cloudflare.exists,
      github: github.exists,
    },
  };
}

export function envPresent(env, key) {
  const v = (env[key] ?? "").toString().trim();
  return v.length > 0;
}

export function envFlagTrue(env, key) {
  const v = (env[key] ?? "").toString().trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export { ROOT as SERVICE_ENV_ROOT };
