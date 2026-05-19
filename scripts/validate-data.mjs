#!/usr/bin/env node
/**
 * Validate YAML data files against JSON Schemas in schemas/
 * Exit 1 on any validation failure.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMAS_DIR = path.join(ROOT, "schemas");

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function loadSchema(name) {
  const file = path.join(SCHEMAS_DIR, name);
  const schema = JSON.parse(fs.readFileSync(file, "utf8"));
  delete schema.$schema;
  return schema;
}

const schemas = {
  jurisdiction: loadSchema("jurisdiction.schema.json"),
  source: loadSchema("source.schema.json"),
  law: loadSchema("law.schema.json"),
  guidance: loadSchema("guidance.schema.json"),
  change: loadSchema("change.schema.json"),
  taxonomy: loadSchema("taxonomy.schema.json"),
  exportRecord: loadSchema("evidence-export-record.schema.json"),
  controlMapping: loadSchema("change-control-mapping.schema.json"),
  evidenceMapping: loadSchema("change-evidence-mapping.schema.json"),
};

function readYaml(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return yaml.load(raw);
}

function listYamlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    .map((f) => path.join(dir, f));
}

function validate(label, data, schema) {
  const validateFn = ajv.compile(schema);
  const ok = validateFn(data);
  if (!ok) {
    return { label, errors: validateFn.errors ?? [] };
  }
  return null;
}

const failures = [];
let passed = 0;

function check(result) {
  if (result) {
    failures.push(result);
  } else {
    passed += 1;
  }
}

// Jurisdictions
for (const file of listYamlFiles(path.join(ROOT, "data/jurisdictions"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.jurisdiction));
}

// Sources
for (const file of listYamlFiles(path.join(ROOT, "data/sources"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.source));
}

// Laws
for (const file of listYamlFiles(path.join(ROOT, "data/laws"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.law));
}

// Guidance
for (const file of listYamlFiles(path.join(ROOT, "data/guidance"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.guidance));
}

// Changes
for (const file of listYamlFiles(path.join(ROOT, "data/changes"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.change));
}

// Taxonomies
for (const file of listYamlFiles(path.join(ROOT, "data/taxonomies"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.taxonomy));
}

// Mappings
for (const file of listYamlFiles(path.join(ROOT, "mappings"))) {
  const data = readYaml(file);
  const items = data?.mappings ?? [];
  if (!Array.isArray(items) || items.length === 0) {
    failures.push({ label: file, errors: [{ message: "expected non-empty mappings array" }] });
    continue;
  }
  const schema = file.includes("evidence")
    ? schemas.evidenceMapping
    : schemas.controlMapping;
  for (const item of items) {
    check(validate(`${file} → ${item.mapping_id ?? "?"}`, item, schema));
  }
}

// Export samples
for (const file of listYamlFiles(path.join(ROOT, "exports/samples"))) {
  const data = readYaml(file);
  const items = data?.exports ?? [];
  if (!Array.isArray(items) || items.length === 0) {
    failures.push({ label: file, errors: [{ message: "expected non-empty exports array" }] });
    continue;
  }
  for (const item of items) {
    check(validate(`${file} → ${item.export_record_id ?? "?"}`, item, schemas.exportRecord));
  }
}

console.log(`\nCaesar AI Regulation Watch — data validation`);
console.log(`Root: ${ROOT}`);
console.log(`Passed: ${passed}`);

if (failures.length > 0) {
  console.log(`Failed: ${failures.length}\n`);
  for (const f of failures) {
    console.log(`✗ ${f.label}`);
    for (const err of f.errors) {
      const loc = err.instancePath || err.schemaPath || "";
      console.log(`  ${loc}: ${err.message}`);
    }
  }
  process.exit(1);
}

console.log(`Failed: 0\nAll YAML files validated successfully.\n`);
process.exit(0);
