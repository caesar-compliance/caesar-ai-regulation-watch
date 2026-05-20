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
  monitoringRun: loadSchema("monitoring-run.schema.json"),
  contentReview: loadSchema("content-review.schema.json"),
  evidenceExportCandidate: loadSchema("evidence-export-candidate.schema.json"),
  evidenceExportCandidateReview: loadSchema("evidence-export-candidate-review.schema.json"),
  sourceDiscoveryLead: loadSchema("source-discovery-lead.schema.json"),
};

const COMPETITOR_DISCOVERY_HOST_PATTERNS = [
  /techieray\.com/i,
  /verifywise\.ai/i,
  /dlapiper\.com/i,
  /iapp\.org/i,
  /artificialintelligenceact\.eu/i,
  /github\.com\/delschlangen\/ai-legislation-tracker/i,
  /fairlyai/i,
];

function isCompetitorDiscoveryUrl(url) {
  if (!url || typeof url !== "string") return false;
  return COMPETITOR_DISCOVERY_HOST_PATTERNS.some((re) => re.test(url));
}

const COMPLIANCE_GUARANTEE_LANGUAGE =
  /\b(compliant|non-compliant|guarantees?|complete coverage|definitive legal interpretation)\b/i;

function hasComplianceGuaranteeLanguage(text) {
  if (!text || typeof text !== "string") return true;
  const lower = text.toLowerCase();
  const disclaimers = [
    "no compliance guarantee",
    "not a compliance guarantee",
    "does not guarantee compliance",
    "no complete coverage claim",
    "not complete coverage",
    "no complete regulatory coverage",
  ];
  if (disclaimers.some((d) => lower.includes(d))) {
    return false;
  }
  return COMPLIANCE_GUARANTEE_LANGUAGE.test(text);
}

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
  } else if (base.startsWith("content-review")) {
    check(validate(file, data, schemas.contentReview));
    for (const cr of data.content_reviews ?? []) {
      if (cr.client_use_allowed !== false) {
        failures.push({
          label: `${file} → ${cr.content_review_id} (policy)`,
          errors: [{ message: "content review must have client_use_allowed: false" }],
        });
      }
      if (cr.review_result === "not_checked" && cr.verified_on_source_after_check === true) {
        failures.push({
          label: `${file} → ${cr.content_review_id} (policy)`,
          errors: [
            { message: "verified_on_source_after_check cannot be true when review_result is not_checked" },
          ],
        });
      }
      if (
        cr.review_result !== "matches_source_at_high_level" &&
        cr.verified_on_source_after_check === true
      ) {
        failures.push({
          label: `${file} → ${cr.content_review_id} (policy)`,
          errors: [
            {
              message:
                "verified_on_source_after_check true requires review_result matches_source_at_high_level",
            },
          ],
        });
      }
    }
  } else if (base.startsWith("source-verification") || base.startsWith("source-identity-review")) {
    check(validate(file, data, schemas.sourceVerification));
  } else if (base.startsWith("evidence-export-candidate-review")) {
    check(validate(file, data, schemas.evidenceExportCandidateReview));
  } else {
    failures.push({
      label: file,
      errors: [
        {
          message:
            "unknown verification file prefix; use source-verification-*, source-identity-review-*, content-review-*, evidence-export-candidate-review-*, or url-check-*",
        },
      ],
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

// Monitoring runs
const monitoringDir = path.join(ROOT, "data/monitoring-runs");
if (fs.existsSync(monitoringDir)) {
  for (const file of listYamlFiles(monitoringDir)) {
    if (path.basename(file).startsWith(".")) continue;
    const data = readYaml(file);
    check(validate(file, data, schemas.monitoringRun));
  }
}

// Detected changes
for (const file of listYamlFiles(path.join(ROOT, "data/detected-changes"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.detectedChange));
}

// Evidence export candidates (v0.8.3)
const candidateDir = path.join(ROOT, "data/evidence-export-candidates");
for (const file of listYamlFiles(candidateDir)) {
  const data = readYaml(file);
  check(validate(file, data, schemas.evidenceExportCandidate));
  for (const c of data.candidates ?? []) {
    const label = `${file} → ${c.candidate_id ?? "?"}`;
    if (c.client_use_allowed !== false) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "evidence export candidate must have client_use_allowed: false" }],
      });
    }
    if (c.human_review_required !== true) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "evidence export candidate must have human_review_required: true" }],
      });
    }
    if (c.verified_on_source_required !== true) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "evidence export candidate must have verified_on_source_required: true" }],
      });
    }
    if (
      c.created_from === "simulated_detected_change" &&
      c.candidate_status === "ready_for_human_review"
    ) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "simulated detected change candidate cannot be ready_for_human_review (client-ready implication)",
          },
        ],
      });
    }
    if (
      c.candidate_status === "ready_for_human_review" &&
      Array.isArray(c.blocking_reasons) &&
      c.blocking_reasons.length > 0
    ) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "ready_for_human_review cannot be set while blocking_reasons is non-empty",
          },
        ],
      });
    }
    if (!c.legal_safe_note || hasComplianceGuaranteeLanguage(c.legal_safe_note)) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "legal_safe_note missing or contains compliance-guarantee language",
          },
        ],
      });
    }
    if (data.legal_safe_note && hasComplianceGuaranteeLanguage(data.legal_safe_note)) {
      failures.push({
        label: `${file} (policy)`,
        errors: [
          {
            message: "batch legal_safe_note contains compliance-guarantee language",
          },
        ],
      });
    }
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

// Source discovery leads (v0.9.1) — after jurisdiction/source sets
const sourceDiscoveryDir = path.join(ROOT, "data/source-discovery");
for (const file of listYamlFiles(sourceDiscoveryDir)) {
  const batch = readYaml(file);
  check(validate(file, batch, schemas.sourceDiscoveryLead));
  if (batch.no_competitor_text_copied !== true) {
    failures.push({
      label: `${file} (policy)`,
      errors: [{ message: "source discovery batch must have no_competitor_text_copied: true" }],
    });
  }
  if (batch.no_bulk_extraction !== true) {
    failures.push({
      label: `${file} (policy)`,
      errors: [{ message: "source discovery batch must have no_bulk_extraction: true" }],
    });
  }
  for (const lead of batch.leads ?? []) {
    const label = `${file} → ${lead.lead_id ?? "?"}`;
    if (lead.no_competitor_text_copied !== true) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "lead must have no_competitor_text_copied: true" }],
      });
    }
    if (lead.no_bulk_extraction !== true) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "lead must have no_bulk_extraction: true" }],
      });
    }
    if (
      lead.official_source_verified === true &&
      (!lead.verified_title || lead.http_status == null)
    ) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "official_source_verified true requires verified_title and http_status",
          },
        ],
      });
    }
    if (
      lead.verification_status === "official_source_confirmed" &&
      isCompetitorDiscoveryUrl(lead.candidate_official_url)
    ) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "competitor or third-party URL cannot be confirmed official source (candidate_official_url)",
          },
        ],
      });
    }
    if (
      lead.verification_status === "rejected_not_official" &&
      lead.promoted_source_id
    ) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "rejected_not_official lead cannot have promoted_source_id" }],
      });
    }
    if (lead.jurisdiction_id && !jurisdictionIds.has(lead.jurisdiction_id)) {
      failures.push({
        label: `${label} (referential)`,
        errors: [{ message: `unknown jurisdiction_id: ${lead.jurisdiction_id}` }],
      });
    }
    if (lead.promoted_source_id && !sourceIds.has(lead.promoted_source_id)) {
      failures.push({
        label: `${label} (referential)`,
        errors: [
          {
            message: `promoted_source_id not in registry: ${lead.promoted_source_id}`,
          },
        ],
      });
    }
    if (lead.existing_source_id && !sourceIds.has(lead.existing_source_id)) {
      failures.push({
        label: `${label} (referential)`,
        errors: [
          {
            message: `existing_source_id not in registry: ${lead.existing_source_id}`,
          },
        ],
      });
    }
  }
}

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
  if (dc.content_review_status && dc.client_use_allowed !== false) {
    failures.push({
      label: `${file} (policy)`,
      errors: [{ message: "detected change with content_review_status must have client_use_allowed: false" }],
    });
  }
}

// Referential integrity (content reviews)
const detectedChangeIds = new Set(
  listYamlFiles(path.join(ROOT, "data/detected-changes")).map((f) => readYaml(f).detected_change_id),
);
const timelineEventIds = new Set();
for (const file of listYamlFiles(timelineDir)) {
  const t = readYaml(file);
  for (const ev of t.events ?? []) {
    timelineEventIds.add(ev.event_id);
  }
}

for (const file of listYamlFiles(path.join(ROOT, "data/verifications"))) {
  const base = path.basename(file);
  if (!base.startsWith("content-review")) continue;
  const batch = readYaml(file);
  for (const cr of batch.content_reviews ?? []) {
    if (!jurisdictionIds.has(cr.jurisdiction_id)) {
      failures.push({
        label: `${file} → ${cr.content_review_id} (referential)`,
        errors: [{ message: `unknown jurisdiction_id: ${cr.jurisdiction_id}` }],
      });
    }
    if (!sourceIds.has(cr.source_id)) {
      failures.push({
        label: `${file} → ${cr.content_review_id} (referential)`,
        errors: [{ message: `unknown source_id: ${cr.source_id}` }],
      });
    }
    const recordTypes = ["law", "guidance", "policy_framework", "implementation_update"];
    if (recordTypes.includes(cr.item_type) && !recordIds.has(cr.item_id)) {
      failures.push({
        label: `${file} → ${cr.content_review_id} (referential)`,
        errors: [{ message: `unknown item_id (record): ${cr.item_id}` }],
      });
    }
    if (cr.item_type === "detected_change" && !detectedChangeIds.has(cr.item_id)) {
      failures.push({
        label: `${file} → ${cr.content_review_id} (referential)`,
        errors: [{ message: `unknown item_id (detected_change): ${cr.item_id}` }],
      });
    }
    if (cr.item_type === "timeline_event" && !timelineEventIds.has(cr.item_id)) {
      failures.push({
        label: `${file} → ${cr.content_review_id} (referential)`,
        errors: [{ message: `unknown item_id (timeline_event): ${cr.item_id}` }],
      });
    }
  }
}

const changeIds = new Set(
  listYamlFiles(path.join(ROOT, "data/changes")).map((f) => readYaml(f).change_id),
);

const candidateIds = new Set();
const candidateStatusById = new Map();
for (const file of listYamlFiles(candidateDir)) {
  const batch = readYaml(file);
  for (const c of batch.candidates ?? []) {
    if (c.candidate_id) {
      candidateIds.add(c.candidate_id);
      candidateStatusById.set(c.candidate_id, c.candidate_status);
    }
    if (!jurisdictionIds.has(c.jurisdiction_id)) {
      failures.push({
        label: `${file} → ${c.candidate_id} (referential)`,
        errors: [{ message: `unknown jurisdiction_id: ${c.jurisdiction_id}` }],
      });
    }
    if (!sourceIds.has(c.source_id)) {
      failures.push({
        label: `${file} → ${c.candidate_id} (referential)`,
        errors: [{ message: `unknown source_id: ${c.source_id}` }],
      });
    }
    if (c.related_record_id && !recordIds.has(c.related_record_id)) {
      failures.push({
        label: `${file} → ${c.candidate_id} (referential)`,
        errors: [{ message: `unknown related_record_id: ${c.related_record_id}` }],
      });
    }
    if (c.source_item_type === "change_record" && !changeIds.has(c.source_item_id)) {
      failures.push({
        label: `${file} → ${c.candidate_id} (referential)`,
        errors: [{ message: `unknown source_item_id (change): ${c.source_item_id}` }],
      });
    }
    if (c.source_item_type === "detected_change" && !detectedChangeIds.has(c.source_item_id)) {
      failures.push({
        label: `${file} → ${c.candidate_id} (referential)`,
        errors: [{ message: `unknown source_item_id (detected_change): ${c.source_item_id}` }],
      });
    }
  }
}

// Evidence export candidate reviews (v0.8.7)
for (const file of listYamlFiles(path.join(ROOT, "data/verifications"))) {
  const base = path.basename(file);
  if (!base.startsWith("evidence-export-candidate-review")) continue;
  const batch = readYaml(file);
  if (batch.legal_safe_note && hasComplianceGuaranteeLanguage(batch.legal_safe_note)) {
    failures.push({
      label: `${file} (policy)`,
      errors: [{ message: "batch legal_safe_note contains compliance-guarantee language" }],
    });
  }
  for (const r of batch.candidate_reviews ?? []) {
    const label = `${file} → ${r.candidate_review_id ?? "?"}`;
    if (!candidateIds.has(r.candidate_id)) {
      failures.push({
        label: `${label} (referential)`,
        errors: [{ message: `unknown candidate_id: ${r.candidate_id}` }],
      });
    }
    if (r.client_use_allowed !== false) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "candidate review must have client_use_allowed: false" }],
      });
    }
    if (r.final_evidence_allowed !== false) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "candidate review must have final_evidence_allowed: false" }],
      });
    }
    if (r.human_review_required !== true) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "candidate review must have human_review_required: true" }],
      });
    }
    const pipelineStatus = candidateStatusById.get(r.candidate_id);
    if (
      pipelineStatus === "blocked_simulation_only" &&
      r.candidate_review_status === "reviewed_for_internal_governance_only"
    ) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "simulated/blocked_simulation_only candidate cannot be reviewed_for_internal_governance_only",
          },
        ],
      });
    }
    if (
      pipelineStatus === "blocked_simulation_only" &&
      r.candidate_review_status !== "review_not_applicable"
    ) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "simulated/blocked_simulation_only candidate review must use review_not_applicable or be omitted",
          },
        ],
      });
    }
    if (!r.legal_safe_note || hasComplianceGuaranteeLanguage(r.legal_safe_note)) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "legal_safe_note missing or contains compliance-guarantee language",
          },
        ],
      });
    }
  }
}

// Policy: records must not claim verified_on_source without evidence
for (const file of listYamlFiles(path.join(ROOT, "data/laws"))) {
  const r = readYaml(file);
  if (r.verified_on_source === true && r.content_review_status !== "reviewed_content_summary") {
    failures.push({
      label: `${file} (policy)`,
      errors: [
        {
          message:
            "verified_on_source true requires content_review_status reviewed_content_summary with documented batch",
        },
      ],
    });
  }
}
for (const file of listYamlFiles(path.join(ROOT, "data/guidance"))) {
  const r = readYaml(file);
  if (r.verified_on_source === true && r.content_review_status !== "reviewed_content_summary") {
    failures.push({
      label: `${file} (policy)`,
      errors: [
        {
          message:
            "verified_on_source true requires content_review_status reviewed_content_summary with documented batch",
        },
      ],
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
