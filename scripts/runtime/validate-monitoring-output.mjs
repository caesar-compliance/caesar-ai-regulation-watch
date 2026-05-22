#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC_DATA = path.join(ROOT, "public/data");

const REQUIRED_FILES = [
  "runtime-monitoring-status.json",
  "regulation-source-runs.json",
  "regulation-detected-changes.json",
  "regulation-review-candidates.json",
  "regulation-country-coverage.json",
  "regulation-map-metrics.json",
];

const FORBIDDEN_KEYS = [
  "service_role",
  "password",
  "secret_key",
  "SUPABASE_SECRET",
  "full_text",
  "legal_text",
];

function scanObject(obj, pathPrefix, errors) {
  if (obj == null || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => scanObject(v, `${pathPrefix}[${i}]`, errors));
    return;
  }
  for (const [key, value] of Object.entries(obj)) {
    const full = pathPrefix ? `${pathPrefix}.${key}` : key;
    for (const forbidden of FORBIDDEN_KEYS) {
      if (key.toLowerCase().includes(forbidden)) {
        errors.push(`forbidden key: ${full}`);
      }
    }
    if (key === "legal_change_claimed" && value === true) {
      errors.push(`legal_change_claimed must not be true at ${full}`);
    }
    if (key === "verified_on_source" && value === true) {
      errors.push(`verified_on_source must not be true at ${full}`);
    }
    scanObject(value, full, errors);
  }
}

function main() {
  const errors = [];
  for (const file of REQUIRED_FILES) {
    const full = path.join(PUBLIC_DATA, file);
    if (!fs.existsSync(full)) {
      errors.push(`missing export: ${file}`);
      continue;
    }
    let data;
    try {
      data = JSON.parse(fs.readFileSync(full, "utf8"));
    } catch (e) {
      errors.push(`invalid JSON: ${file}`);
      continue;
    }
    if (!data.generated_at) errors.push(`${file}: missing generated_at`);
    if (data.review_required !== true && file !== "regulation-map-metrics.json") {
      if (data.review_required !== undefined && data.review_required !== true) {
        errors.push(`${file}: review_required should be true`);
      }
    }
    scanObject(data, file, errors);
    const raw = fs.readFileSync(full, "utf8");
    if (raw.includes("postgres://") || raw.includes("sb_secret_")) {
      errors.push(`${file}: possible secret leak`);
    }
  }

  if (errors.length > 0) {
    console.error("validate-monitoring-output: FAILED");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log(`PASS: validate-monitoring-output (${REQUIRED_FILES.length} files)`);
}

main();
