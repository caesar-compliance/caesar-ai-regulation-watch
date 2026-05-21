#!/usr/bin/env node
/**
 * Validate source verification result records.
 * Cross-checks checklist, draft, and safety invariants. No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RESULTS_PATH = path.join(ROOT, "data/source-adapters/source-verification-results.yml");
const CHECKLISTS_PATH = path.join(ROOT, "data/source-adapters/source-verification-checklists.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/source-verification-result.schema.json");
const DRAFT_SCHEMA_PATH = path.join(ROOT, "schemas/draft-regulatory-update.schema.json");
const PUBLIC_UPDATES_JSON = path.join(ROOT, "public/data/regulatory-updates.json");

const REQUIRED_ITEM_IDS = [
  "source_url_accessibility_check",
  "source_identity_match_check",
  "publication_date_match_check",
  "title_match_check",
  "summary_rewrite_check",
  "topic_jurisdiction_confirmation_check",
  "no_full_text_storage_check",
  "public_export_exclusion_check",
];

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function loadSchema(filePath) {
  const schema = JSON.parse(fs.readFileSync(filePath, "utf8"));
  delete schema.$schema;
  return ajv.compile(schema);
}

const validateResultsDoc = loadSchema(SCHEMA_PATH);
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
    ["final_source_verification_completed", false],
    ["publication_allowed", false],
    ["public_export_allowed", false],
    ["evidence_export_allowed", false],
    ["metadata_only", true],
    ["stores_full_text", false],
    ["requires_final_legal_approval", true],
  ];
  for (const [key, val] of expected) {
    if (safety?.[key] !== val) {
      errors.push(`${prefix}: safety.${key} must be ${val}`);
    }
  }
  return errors;
}

function resultInvariantErrors(result, index, ctx) {
  const prefix = `results[${index}] (${result?.result_id ?? "?"})`;
  const errors = [];

  if (result.result_scope !== "source_url_manual_check_only") {
    errors.push(`${prefix}: result_scope must be source_url_manual_check_only`);
  }

  errors.push(...gateErrors(prefix, result.gates));
  errors.push(...safetyErrors(prefix, result.safety));

  const checklist = ctx.checklistById.get(result.checklist_id);
  if (!checklist) {
    errors.push(`${prefix}: unknown checklist_id ${result.checklist_id}`);
  } else {
    if (checklist.draft_update_id !== result.draft_update_id) {
      errors.push(`${prefix}: draft_update_id must match checklist`);
    }
    if (checklist.draft_update_path !== result.draft_update_path) {
      errors.push(`${prefix}: draft_update_path must match checklist`);
    }
    if (checklist.source_url !== result.source_url) {
      errors.push(`${prefix}: source_url must match checklist`);
    }
    const checklistItemKeys = new Set(
      (checklist.checklist_items ?? []).map((i) => i.item_key),
    );
    for (const item of result.item_results ?? []) {
      if (!checklistItemKeys.has(item.item_id)) {
        errors.push(`${prefix}: unknown item_id ${item.item_id} for checklist`);
      }
    }
  }

  const itemIds = (result.item_results ?? []).map((i) => i.item_id);
  for (const required of REQUIRED_ITEM_IDS) {
    if (!itemIds.includes(required)) {
      errors.push(`${prefix}: missing item_result for ${required}`);
    }
  }
  if (itemIds.length !== REQUIRED_ITEM_IDS.length) {
    errors.push(`${prefix}: item_results must contain exactly ${REQUIRED_ITEM_IDS.length} items`);
  }

  const hasFollowUpOrFail = (result.item_results ?? []).some(
    (i) => i.result === "needs_follow_up" || i.result === "manual_fail",
  );
  if (result.overall_result === "ready_for_final_legal_review" && hasFollowUpOrFail) {
    errors.push(
      `${prefix}: overall_result ready_for_final_legal_review not allowed with needs_follow_up or manual_fail items`,
    );
  }

  const draftPath = path.join(ROOT, result.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    errors.push(`${prefix}: draft_update_path missing: ${result.draft_update_path}`);
  } else {
    const draft = normalizeDates(readYaml(draftPath));
    if (!validateDraft(draft)) {
      errors.push(`${result.draft_update_path}: draft schema validation failed`);
    } else {
      if (draft.update_id !== result.draft_update_id) {
        errors.push(`${prefix}: draft_update_id must match draft update_id`);
      }
      if (draft.verified_on_source !== false) {
        errors.push(`${prefix}: draft verified_on_source must remain false`);
      }
      errors.push(...gateErrors(result.draft_update_path, draft));
      if (draft.publication_allowed !== false || draft.public_export_allowed !== false) {
        errors.push(`${prefix}: draft must not allow publication or public export`);
      }
      if (draft.final_source_verification_completed === true) {
        errors.push(`${prefix}: draft final_source_verification_completed must be false`);
      }
    }
  }

  return errors;
}

function main() {
  const doc = normalizeDates(readYaml(RESULTS_PATH));
  if (!validateResultsDoc(doc)) {
    console.error("Schema validation failed for source-verification-results.yml");
    for (const err of validateResultsDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const checklistsDoc = readYaml(CHECKLISTS_PATH);
  const ctx = {
    checklistById: indexById(checklistsDoc.checklists, "checklist_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.results ?? []).length; i++) {
    allErrors.push(...resultInvariantErrors(doc.results[i], i, ctx));
  }

  if (fs.existsSync(PUBLIC_UPDATES_JSON)) {
    const exported = fs.readFileSync(PUBLIC_UPDATES_JSON, "utf8");
    for (const needle of [
      "T061-001",
      "T060-001",
      "t056-001-draft-edpb-network-dry-run",
      "partial_pass_needs_follow_up",
      "final_legal_review_packet",
    ]) {
      if (exported.includes(needle)) {
        allErrors.push(
          `public/data/regulatory-updates.json must not contain internal result identifiers (${needle})`,
        );
      }
    }
  }

  if (allErrors.length > 0) {
    console.error("Source verification result validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: source verification results validated");
  console.log(`  results: ${doc.results.length}`);
  console.log(`  file: ${RESULTS_PATH}`);
}

main();
