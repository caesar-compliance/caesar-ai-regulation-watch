#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { RUNTIME_ROOT } from "./load-runtime-env.mjs";

export const REGISTRY_PATH = path.join(
  RUNTIME_ROOT,
  "data/runtime/monitoring-pilot-registry.yml",
);

const T084_VERIFIED_AT = "2026-05-22";

function defaultT084Fields(source) {
  const automated = source.fetch_mode === "automated_metadata";
  const automationMode =
    source.automation_mode ??
    (automated
      ? source.feed_format === "atom"
        ? "automated_rss"
        : "automated_rss"
      : "manual_review");
  return {
    automation_mode: automationMode,
    metadata_only: source.metadata_only ?? source.stores_metadata_only ?? true,
    max_items_per_run:
      source.max_items_per_run ?? (automated ? 20 : 0),
    default_signal_threshold: source.default_signal_threshold ?? (automated ? 40 : 35),
    noise_budget: source.noise_budget ?? (automated ? 5 : 3),
    topic_allowlist: source.topic_allowlist ?? source.topic_ids ?? [],
    topic_blocklist: source.topic_blocklist ?? [],
    review_policy:
      source.review_policy ??
      (automated ? "ingress_filter_then_operator" : "manual_operator_only"),
    fetch_risk:
      source.fetch_risk ??
      (source.captcha_or_waf_risk ? "high" : "low"),
    last_verified_at: source.last_verified_at ?? T084_VERIFIED_AT,
  };
}

export function normalizeRegistrySource(source) {
  return { ...source, ...defaultT084Fields(source) };
}

export function loadMonitoringPilotRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error(`Monitoring pilot registry not found: ${REGISTRY_PATH}`);
  }
  const doc = yaml.load(fs.readFileSync(REGISTRY_PATH, "utf8"));
  doc.sources = (doc.sources ?? []).map(normalizeRegistrySource);
  return doc;
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
