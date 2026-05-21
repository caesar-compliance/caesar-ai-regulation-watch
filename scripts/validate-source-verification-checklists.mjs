#!/usr/bin/env node
/**
 * Validate source verification checklist records.
 * Cross-checks draft, readiness gate, and safety invariants. No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECKLISTS_PATH = path.join(ROOT, "data/source-adapters/source-verification-checklists.yml");
const GATES_PATH = path.join(ROOT, "data/source-adapters/internal-draft-readiness-gates.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/source-verification-checklist.schema.json");
const DRAFT_SCHEMA_PATH = path.join(ROOT, "schemas/draft-regulatory-update.schema.json");
const PUBLIC_UPDATES_JSON = path.join(ROOT, "public/data/regulatory-updates.json");

const REQUIRED_ITEM_KEYS = [
  "source_url_accessibility_check",
  "source_identity_match_check",
  "publication_date_match_check",
  "title_match_check",
  "summary_rewrite_check",
  "topic_jurisdiction_confirmation_check",
  "no_full_text_storage_check",
  "public_export_exclusion_check",
];

const FORBIDDEN_ITEM_STATUSES = ["passed", "verified", "complete", "approved"];

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function loadSchema(filePath) {
  const schema = JSON.parse(fs.readFileSync(filePath, "utf8"));
  delete schema.$schema;
  return ajv.compile(schema);
}

const validateChecklistDoc = loadSchema(SCHEMA_PATH);
const validateDraft = loadSchema(DRAFT_SCHEMA_PATH);

function normalizeDates(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(normalizeDates);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalizeDates(v);
    return out;
  }
  return value;
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function indexById(items, key) {
  const map = new Map();
  for (const item of items ?? []) {
    if (item?.[key]) map.set(item[key], item);
  }
  return map;
}

function gateErrors(prefix, gates) {
  const errors = [];
  for (const key of [
    "verified_on_source",
    "client_use_allowed",
    "client_evidence_allowed",
    "final_evidence_allowed",
    "legal_change_claimed",
  ]) {
    if (gates?.[key] !== false) {
      errors.push(`${prefix}: gates.${key} must be false`);
    }
  }
  return errors;
}

function safetyErrors(prefix, safety) {
  const errors = [];
  const expected = [
    ["verified_on_source", false],
    ["publication_allowed", false],
    ["public_export_allowed", false],
    ["client_use_allowed", false],
    ["final_evidence_allowed", false],
    ["legal_change_claimed", false],
    ["source_verification_completed", false],
    ["metadata_only", true],
    ["stores_full_text", false],
  ];
  for (const [key, val] of expected) {
    if (safety?.[key] !== val) {
      errors.push(`${prefix}: safety.${key} must be ${val}`);
    }
  }
  return errors;
}

function checklistInvariantErrors(checklist, index, ctx) {
  const prefix = `checklists[${index}] (${checklist?.checklist_id ?? "?"})`;
  const errors = [];

  if (checklist.verification_scope !== "internal_source_check_only") {
    errors.push(`${prefix}: verification_scope must be internal_source_check_only`);
  }
  if (checklist.status === "complete") {
    errors.push(`${prefix}: status must not be complete in T060`);
  }
  if (
    checklist.status !== "pending_source_verification" &&
    checklist.status !== "blocked"
  ) {
    errors.push(`${prefix}: status must be pending_source_verification or blocked`);
  }

  errors.push(...gateErrors(prefix, checklist.gates));
  errors.push(...safetyErrors(prefix, checklist.safety));

  const itemKeys = (checklist.checklist_items ?? []).map((i) => i.item_key);
  for (const required of REQUIRED_ITEM_KEYS) {
    if (!itemKeys.includes(required)) {
      errors.push(`${prefix}: missing checklist item ${required}`);
    }
  }
  if (itemKeys.length !== REQUIRED_ITEM_KEYS.length) {
    errors.push(`${prefix}: checklist_items must contain exactly ${REQUIRED_ITEM_KEYS.length} items`);
  }

  for (const item of checklist.checklist_items ?? []) {
    if (FORBIDDEN_ITEM_STATUSES.includes(item.status)) {
      errors.push(`${prefix}: item ${item.item_key} must not use status ${item.status}`);
    }
    if (item.status === "passed" || item.status === "verified") {
      errors.push(`${prefix}: item ${item.item_key} must not claim passed/verified`);
    }
  }

  const gate = ctx.readinessById.get(checklist.source_readiness_gate_id);
  if (checklist.source_readiness_gate_id && !gate) {
    errors.push(`${prefix}: unknown source_readiness_gate_id ${checklist.source_readiness_gate_id}`);
  } else if (gate && gate.draft_update_id !== checklist.draft_update_id) {
    errors.push(`${prefix}: draft_update_id must match readiness gate`);
  }

  const draftPath = path.join(ROOT, checklist.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    errors.push(`${prefix}: draft_update_path missing: ${checklist.draft_update_path}`);
  } else {
    const draft = normalizeDates(readYaml(draftPath));
    if (!validateDraft(draft)) {
      errors.push(`${checklist.draft_update_path}: draft schema validation failed`);
    } else {
      if (draft.update_id !== checklist.draft_update_id) {
        errors.push(`${prefix}: draft_update_id must match draft update_id`);
      }
      if (draft.source_url !== checklist.source_url) {
        errors.push(`${prefix}: source_url must match draft source_url`);
      }
      if (draft.source_adapter_id !== checklist.source_adapter_id) {
        errors.push(`${prefix}: source_adapter_id must match draft`);
      }
      if (draft.source_id !== checklist.source_id) {
        errors.push(`${prefix}: source_id must match draft`);
      }
      errors.push(...gateErrors(checklist.draft_update_path, draft));
      if (draft.publication_allowed !== false || draft.public_export_allowed !== false) {
        errors.push(`${prefix}: draft must not allow publication or public export`);
      }
    }
  }

  return errors;
}

function main() {
  const doc = normalizeDates(readYaml(CHECKLISTS_PATH));
  if (!validateChecklistDoc(doc)) {
    console.error("Schema validation failed for source-verification-checklists.yml");
    for (const err of validateChecklistDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const gatesDoc = readYaml(GATES_PATH);
  const ctx = {
    readinessById: indexById(gatesDoc.gates, "readiness_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.checklists ?? []).length; i++) {
    allErrors.push(...checklistInvariantErrors(doc.checklists[i], i, ctx));
  }

  if (fs.existsSync(PUBLIC_UPDATES_JSON)) {
    const exported = fs.readFileSync(PUBLIC_UPDATES_JSON, "utf8");
    for (const needle of [
      "T060-001",
      "T059-001",
      "t056-001-draft-edpb-network-dry-run",
      "pending_source_verification",
    ]) {
      if (exported.includes(needle)) {
        allErrors.push(
          `public/data/regulatory-updates.json must not contain internal checklist identifiers (${needle})`,
        );
      }
    }
  }

  if (allErrors.length > 0) {
    console.error("Source verification checklist validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: source verification checklists validated");
  console.log(`  checklists: ${doc.checklists.length}`);
  console.log(`  file: ${CHECKLISTS_PATH}`);
}

main();
