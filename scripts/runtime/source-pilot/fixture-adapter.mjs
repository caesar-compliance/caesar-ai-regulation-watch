#!/usr/bin/env node
/**
 * Fixture-only source pilot adapter — reads local JSON snapshots, no network.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { validateRegistryEntryForAdapter } from "./adapter-contract.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const FIXTURES_ROOT = path.join(ROOT, "fixtures/runtime/source-pilot");

/**
 * @param {import('./adapter-contract.mjs').SourcePilotRegistryEntry} entry
 * @param {{ fixtureVersion?: string }} [options]
 */
export function loadFixtureSnapshot(entry, options = {}) {
  const errors = validateRegistryEntryForAdapter(entry);
  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  const sourceDir = path.join(FIXTURES_ROOT, entry.source_id);
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Missing fixture directory for ${entry.source_id}: ${sourceDir}`);
  }

  const versions = fs
    .readdirSync(sourceDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();

  const version = options.fixtureVersion ?? versions[versions.length - 1];
  const fixturePath = path.join(sourceDir, `${version}.json`);
  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Fixture not found: ${fixturePath}`);
  }

  const raw = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  const items = (raw.items ?? []).map((item) => ({
    external_id: String(item.external_id ?? "").slice(0, 128),
    title: item.title ? String(item.title).slice(0, 500) : null,
    url: item.url ? String(item.url).slice(0, 2000) : null,
    published_at: item.published_at ? String(item.published_at).slice(0, 80) : null,
    summary_snippet: item.summary_snippet
      ? String(item.summary_snippet).slice(0, 240)
      : null,
  }));

  const metadata_hash = createHash("sha256")
    .update(JSON.stringify({ source_id: entry.source_id, items }))
    .digest("hex")
    .slice(0, 16);

  return {
    source_id: entry.source_id,
    fixture_version: raw.fixture_version ?? version,
    snapshot_at: raw.snapshot_at ?? new Date().toISOString(),
    item_count: items.length,
    items,
    metadata_hash,
    adapter_type: entry.adapter_type,
    stores_metadata_only: true,
    network_used: false,
  };
}

/**
 * @param {string} sourceId
 * @returns {string[]}
 */
export function listFixtureVersions(sourceId) {
  const sourceDir = path.join(FIXTURES_ROOT, sourceId);
  if (!fs.existsSync(sourceDir)) return [];
  return fs
    .readdirSync(sourceDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}
