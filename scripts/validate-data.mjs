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
  timeline: loadSchema("timeline.schema.json"),
  sourceVerification: loadSchema("source-verification.schema.json"),
  urlVerification: loadSchema("url-verification.schema.json"),
  watcherConfig: loadSchema("watcher-config.schema.json"),
  sourceSnapshot: loadSchema("source-snapshot.schema.json"),
  feedSnapshot: loadSchema("feed-snapshot.schema.json"),
  apiSnapshot: loadSchema("api-snapshot.schema.json"),
  watcherRun: loadSchema("watcher-run.schema.json"),
  detectedChange: loadSchema("detected-change.schema.json"),
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

// Timelines
const timelineDir = path.join(ROOT, "data/timelines");
for (const file of listYamlFiles(timelineDir)) {
  const data = readYaml(file);
  check(validate(file, data, schemas.timeline));
}

// Source verifications
for (const file of listYamlFiles(path.join(ROOT, "data/verifications"))) {
  const base = path.basename(file);
  const data = readYaml(file);
  if (base.startsWith("url-check")) {
    check(validate(file, data, schemas.urlVerification));
  } else if (base.startsWith("source-verification") || base.startsWith("source-identity-review")) {
    check(validate(file, data, schemas.sourceVerification));
  } else {
    failures.push({
      label: file,
      errors: [{ message: "unknown verification file prefix; use source-verification-*, source-identity-review-*, or url-check-*" }],
    });
  }
}

// Watcher configuration
const watcherConfigPath = path.join(ROOT, "data/watchers/official-source-watchers.yml");
if (fs.existsSync(watcherConfigPath)) {
  const watcherConfig = readYaml(watcherConfigPath);
  check(validate(watcherConfigPath, watcherConfig, schemas.watcherConfig));
}

// Source snapshots (per-source dirs; exclude latest.yml pointer)
const snapshotsRoot = path.join(ROOT, "data/snapshots");
if (fs.existsSync(snapshotsRoot)) {
  for (const sourceDir of fs.readdirSync(snapshotsRoot)) {
    const dir = path.join(snapshotsRoot, sourceDir);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of listYamlFiles(dir)) {
      if (path.basename(file) === "latest.yml") continue;
      const data = readYaml(file);
      let schema = schemas.sourceSnapshot;
      if (data.snapshot_kind === "api_metadata" || data.api_url) {
        schema = schemas.apiSnapshot;
      } else if (data.snapshot_kind === "feed_metadata" || data.feed_url) {
        schema = schemas.feedSnapshot;
      }
      check(validate(file, data, schema));
    }
    const latestPath = path.join(dir, "latest.yml");
    if (fs.existsSync(latestPath)) {
      const pointer = readYaml(latestPath);
      if (!pointer?.snapshot_id) {
        failures.push({
          label: latestPath,
          errors: [{ message: "latest.yml must include snapshot_id" }],
        });
      } else {
        const snapPath = path.join(dir, `${pointer.snapshot_id}.yml`);
        if (!fs.existsSync(snapPath)) {
          failures.push({
            label: latestPath,
            errors: [{ message: `snapshot file missing: ${pointer.snapshot_id}.yml` }],
          });
        }
      }
    }
  }
}

// Watcher runs
for (const file of listYamlFiles(path.join(ROOT, "data/watcher-runs"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.watcherRun));
}

// Detected changes
for (const file of listYamlFiles(path.join(ROOT, "data/detected-changes"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.detectedChange));
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

// Referential integrity (timelines)
const jurisdictionIds = new Set(
  listYamlFiles(path.join(ROOT, "data/jurisdictions")).map((f) => readYaml(f).jurisdiction_id),
);
const sourceIds = new Set(
  listYamlFiles(path.join(ROOT, "data/sources")).map((f) => readYaml(f).source_id),
);
const recordIds = new Set([
  ...listYamlFiles(path.join(ROOT, "data/laws")).map((f) => readYaml(f).record_id),
  ...listYamlFiles(path.join(ROOT, "data/guidance")).map((f) => readYaml(f).record_id),
]);

for (const file of listYamlFiles(timelineDir)) {
  const t = readYaml(file);
  const label = path.basename(file);
  if (!jurisdictionIds.has(t.jurisdiction_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown jurisdiction_id: ${t.jurisdiction_id}` }],
    });
  }
  if (t.related_record_id && !recordIds.has(t.related_record_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown related_record_id: ${t.related_record_id}` }],
    });
  }
  for (const sid of t.source_ids ?? []) {
    if (!sourceIds.has(sid)) {
      failures.push({
        label: `${file} (referential)`,
        errors: [{ message: `unknown source_id in source_ids: ${sid}` }],
      });
    }
  }
  for (const ev of t.events ?? []) {
    if (!sourceIds.has(ev.source_id)) {
      failures.push({
        label: `${file} → ${ev.event_id} (referential)`,
        errors: [{ message: `unknown source_id on event: ${ev.source_id}` }],
      });
    }
  }
}

// Referential integrity (records → jurisdiction, source)
for (const file of listYamlFiles(path.join(ROOT, "data/laws"))) {
  const r = readYaml(file);
  if (!jurisdictionIds.has(r.jurisdiction_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown jurisdiction_id: ${r.jurisdiction_id}` }],
    });
  }
  if (!sourceIds.has(r.source_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown source_id: ${r.source_id}` }],
    });
  }
}
for (const file of listYamlFiles(path.join(ROOT, "data/guidance"))) {
  const r = readYaml(file);
  if (!jurisdictionIds.has(r.jurisdiction_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown jurisdiction_id: ${r.jurisdiction_id}` }],
    });
  }
  if (!sourceIds.has(r.source_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown source_id: ${r.source_id}` }],
    });
  }
}

// Referential integrity (verifications)
for (const file of listYamlFiles(path.join(ROOT, "data/verifications"))) {
  const base = path.basename(file);
  const batch = readYaml(file);
  if (base.startsWith("source-verification") || base.startsWith("source-identity-review")) {
    for (const v of batch.verifications ?? []) {
      if (!sourceIds.has(v.source_id)) {
        failures.push({
          label: `${file} → ${v.verification_id} (referential)`,
          errors: [{ message: `unknown source_id: ${v.source_id}` }],
        });
      }
      if (v.item_type === "record" && !recordIds.has(v.item_id)) {
        failures.push({
          label: `${file} → ${v.verification_id} (referential)`,
          errors: [{ message: `unknown item_id (record): ${v.item_id}` }],
        });
      }
      if (v.item_type === "source" && !sourceIds.has(v.item_id)) {
        failures.push({
          label: `${file} → ${v.verification_id} (referential)`,
          errors: [{ message: `unknown item_id (source): ${v.item_id}` }],
        });
      }
    }
  }
  if (base.startsWith("url-check")) {
    for (const c of batch.url_checks ?? []) {
      if (c.source_id && !sourceIds.has(c.source_id)) {
        failures.push({
          label: `${file} → ${c.url_check_id} (referential)`,
          errors: [{ message: `unknown source_id: ${c.source_id}` }],
        });
      }
      if (
        (c.item_type === "law" || c.item_type === "guidance" || c.item_type === "record") &&
        !recordIds.has(c.item_id)
      ) {
        failures.push({
          label: `${file} → ${c.url_check_id} (referential)`,
          errors: [{ message: `unknown item_id (record): ${c.item_id}` }],
        });
      }
      if (c.item_type === "source" && !sourceIds.has(c.item_id)) {
        failures.push({
          label: `${file} → ${c.url_check_id} (referential)`,
          errors: [{ message: `unknown source item_id: ${c.item_id}` }],
        });
      }
    }
  }
}

// Referential integrity (watchers)
if (fs.existsSync(watcherConfigPath)) {
  const watcherConfig = readYaml(watcherConfigPath);
  const watcherIds = new Set();
  for (const w of watcherConfig.watchers ?? []) {
    if (watcherIds.has(w.watcher_id)) {
      failures.push({
        label: watcherConfigPath,
        errors: [{ message: `duplicate watcher_id: ${w.watcher_id}` }],
      });
    }
    watcherIds.add(w.watcher_id);
    if (!sourceIds.has(w.source_id)) {
      failures.push({
        label: `${watcherConfigPath} → ${w.watcher_id} (referential)`,
        errors: [{ message: `unknown source_id: ${w.source_id}` }],
      });
    }
    if (!jurisdictionIds.has(w.jurisdiction_id)) {
      failures.push({
        label: `${watcherConfigPath} → ${w.watcher_id} (referential)`,
        errors: [{ message: `unknown jurisdiction_id: ${w.jurisdiction_id}` }],
      });
    }
    if (w.adapter_id === "official_rss_or_feed" && !w.feed_url) {
      failures.push({
        label: `${watcherConfigPath} → ${w.watcher_id} (policy)`,
        errors: [{ message: "feed watcher requires feed_url" }],
      });
    }
    if (w.adapter_id === "official_api_metadata" && !w.api_url) {
      failures.push({
        label: `${watcherConfigPath} → ${w.watcher_id} (policy)`,
        errors: [{ message: "API watcher requires api_url" }],
      });
    }
    if (w.adapter_id === "official_page_metadata" && !w.official_url) {
      failures.push({
        label: `${watcherConfigPath} → ${w.watcher_id} (policy)`,
        errors: [{ message: "page metadata watcher requires official_url" }],
      });
    }
  }
}

const snapshotIds = new Set();
if (fs.existsSync(snapshotsRoot)) {
  for (const sourceDir of fs.readdirSync(snapshotsRoot)) {
    const dir = path.join(snapshotsRoot, sourceDir);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of listYamlFiles(dir)) {
      if (path.basename(file) === "latest.yml") continue;
      const snap = readYaml(file);
      snapshotIds.add(snap.snapshot_id);
      if (!sourceIds.has(snap.source_id)) {
        failures.push({
          label: `${file} (referential)`,
          errors: [{ message: `unknown source_id: ${snap.source_id}` }],
        });
      }
      if (!jurisdictionIds.has(snap.jurisdiction_id)) {
        failures.push({
          label: `${file} (referential)`,
          errors: [{ message: `unknown jurisdiction_id: ${snap.jurisdiction_id}` }],
        });
      }
    }
  }
}

for (const file of listYamlFiles(path.join(ROOT, "data/detected-changes"))) {
  const dc = readYaml(file);
  if (!sourceIds.has(dc.source_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown source_id: ${dc.source_id}` }],
    });
  }
  if (!jurisdictionIds.has(dc.jurisdiction_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown jurisdiction_id: ${dc.jurisdiction_id}` }],
    });
  }
  if (!snapshotIds.has(dc.previous_snapshot_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown previous_snapshot_id: ${dc.previous_snapshot_id}` }],
    });
  }
  if (!snapshotIds.has(dc.current_snapshot_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown current_snapshot_id: ${dc.current_snapshot_id}` }],
    });
  }
  if (dc.simulation === true && dc.client_use_allowed !== false) {
    failures.push({
      label: `${file} (policy)`,
      errors: [{ message: "simulated detected change must have client_use_allowed: false" }],
    });
  }
  if (dc.human_review_required !== true) {
    failures.push({
      label: `${file} (policy)`,
      errors: [{ message: "detected change must have human_review_required: true" }],
    });
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
