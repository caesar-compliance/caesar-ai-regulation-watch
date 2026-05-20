#!/usr/bin/env node
/**
 * Load regulatory update records from data/regulatory-updates/ (manual + generated batch).
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export const GENERATED_BATCH_FILENAME = "generated-from-metadata.yml";

export function listRegulatoryUpdateFiles(root) {
  const dir = path.join(root, "data/regulatory-updates");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    .map((f) => path.join(dir, f));
}

export function expandRegulatoryUpdateFile(data) {
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data.items)) return data.items;
  if (data.update_id) return [data];
  return [];
}

export function loadRegulatoryUpdates(root) {
  const records = [];
  for (const file of listRegulatoryUpdateFiles(root)) {
    const data = yaml.load(fs.readFileSync(file, "utf8"));
    for (const item of expandRegulatoryUpdateFile(data)) {
      records.push(item);
    }
  }
  return records;
}

export function loadYamlDir(root, relativeDir) {
  const abs = path.join(root, relativeDir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    .map((f) => yaml.load(fs.readFileSync(path.join(abs, f), "utf8")));
}

export function loadYamlByPrefix(root, relativeDir, prefix) {
  const abs = path.join(root, relativeDir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter(
      (f) =>
        (f.endsWith(".yml") || f.endsWith(".yaml")) &&
        (prefix ? f.startsWith(prefix) : true),
    )
    .map((f) => yaml.load(fs.readFileSync(path.join(abs, f), "utf8")));
}
