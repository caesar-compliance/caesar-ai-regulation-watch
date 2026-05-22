#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { RUNTIME_ROOT } from "./load-runtime-env.mjs";

export const REGISTRY_PATH = path.join(
  RUNTIME_ROOT,
  "data/runtime/monitoring-pilot-registry.yml",
);

export function loadMonitoringPilotRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error(`Monitoring pilot registry not found: ${REGISTRY_PATH}`);
  }
  return yaml.load(fs.readFileSync(REGISTRY_PATH, "utf8"));
}

export function getAllowlistedSourceKeys(registry) {
  return new Set((registry.sources ?? []).map((s) => s.source_key));
}

export function filterRegistrySources(registry, { maxSources, fetchMode } = {}) {
  let sources = [...(registry.sources ?? [])];
  if (fetchMode) {
    sources = sources.filter((s) => s.fetch_mode === fetchMode);
  }
  if (maxSources != null && maxSources > 0) {
    sources = sources.slice(0, maxSources);
  }
  return sources;
}

export function assertSourceAllowlisted(registry, sourceKey) {
  const keys = getAllowlistedSourceKeys(registry);
  if (!keys.has(sourceKey)) {
    throw new Error(`source_key not in monitoring pilot registry: ${sourceKey}`);
  }
}

export function hostMatchesAllowed(source, url) {
  try {
    const host = new URL(url).hostname;
    return host === source.allowed_host || host.endsWith(`.${source.allowed_host}`);
  } catch {
    return false;
  }
}
