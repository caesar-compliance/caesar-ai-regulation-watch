#!/usr/bin/env node
/**
 * Validate manual review decision records for draft regulatory updates.
 * Cross-checks T056 promotions and draft paths. No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-decisions.yml");
const PROMOTIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-promotions.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/manual-review-decision.schema.json");
const DRAFT_SCHEMA_PATH = path.join(ROOT, "schemas/draft-regulatory-update.schema.json");
const PUBLIC_UPDATES_JSON = path.join(ROOT, "public/data/regulatory-updates.json");
const NOTES_CAP = 1000;

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function loadSchema(filePath) {
  const schema = JSON.parse(fs.readFileSync(filePath, "utf8"));
  delete schema.$schema;
  return ajv.compile(schema);
}

const validateDecisionDoc = loadSchema(SCHEMA_PATH);
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
    ["publication_allowed", false],
    ["public_export_allowed", false],
    ["evidence_export_allowed", false],
    ["source_verification_completed", false],
    ["metadata_only", true],
    ["stores_full_text", false],
    ["requires_followup_before_publication", true],
  ];
  for (const [key, val] of expected) {
    if (safety?.[key] !== val) {
      errors.push(`${prefix}: safety.${key} must be ${val}`);
    }
  }
  return errors;
}

function decisionInvariantErrors(decision, index, ctx) {
  const prefix = `decisions[${index}] (${decision?.decision_id ?? "?"})`;
  const errors = [];

  if (decision.decision_scope !== "internal_draft_only") {
    errors.push(`${prefix}: decision_scope must be internal_draft_only`);
  }
  errors.push(...gateErrors(prefix, decision.gates));
  errors.push(...safetyErrors(prefix, decision.safety));

  if ((decision.review_notes?.length ?? 0) > NOTES_CAP) {
    errors.push(`${prefix}: review_notes exceeds ${NOTES_CAP} characters`);
  }

  const promotion = ctx.promotionById.get(decision.promotion_id);
  if (!promotion) {
    errors.push(`${prefix}: unknown promotion_id ${decision.promotion_id}`);
  } else {
    if (promotion.draft_update_path !== decision.draft_update_path) {
      errors.push(`${prefix}: draft_update_path must match promotion`);
    }
    if (promotion.source_execution_id !== decision.source_execution_id) {
      errors.push(`${prefix}: source_execution_id must match promotion`);
    }
  }

  const draftPath = path.join(ROOT, decision.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    errors.push(`${prefix}: draft_update_path missing: ${decision.draft_update_path}`);
  } else if (!decision.draft_update_path.includes("/drafts/")) {
    errors.push(`${prefix}: draft_update_path must be under a drafts/ subdirectory`);
  } else {
    const draft = normalizeDates(readYaml(draftPath));
    if (!validateDraft(draft)) {
      errors.push(`${decision.draft_update_path}: draft schema validation failed`);
    } else {
      if (draft.update_id !== decision.draft_update_id) {
        errors.push(`${prefix}: draft_update_id must match draft update_id`);
      }
      if (draft.publication_allowed !== false || draft.public_export_allowed !== false) {
        errors.push(`${prefix}: draft must not allow publication or public export`);
      }
      if (draft.status !== "draft_manual_review") {
        errors.push(`${prefix}: draft status must remain draft_manual_review`);
      }
      errors.push(...gateErrors(`${decision.draft_update_path}`, draft));
    }
  }

  if (decision.decision === "approve_internal_draft") {
    if (decision.safety?.publication_allowed !== false) {
      errors.push(`${prefix}: approve_internal_draft must not set publication_allowed true`);
    }
  }

  return errors;
}

function main() {
  const doc = normalizeDates(readYaml(DECISIONS_PATH));
  if (!validateDecisionDoc(doc)) {
    console.error("Schema validation failed for manual-review-decisions.yml");
    for (const err of validateDecisionDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const promotionsDoc = readYaml(PROMOTIONS_PATH);
  const ctx = {
    promotionById: indexById(promotionsDoc.promotions, "promotion_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.decisions ?? []).length; i++) {
    allErrors.push(...decisionInvariantErrors(doc.decisions[i], i, ctx));
  }

  if (fs.existsSync(PUBLIC_UPDATES_JSON)) {
    const exported = fs.readFileSync(PUBLIC_UPDATES_JSON, "utf8");
    for (const needle of ["T057-001", "t056-001-draft-edpb-network-dry-run"]) {
      if (exported.includes(needle)) {
        allErrors.push(
          `public/data/regulatory-updates.json must not contain T057 decision or T056 draft identifiers`,
        );
      }
    }
  }

  if (allErrors.length > 0) {
    console.error("Manual review decision validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: manual review decisions validated");
  console.log(`  decisions: ${doc.decisions.length}`);
  console.log(`  file: ${DECISIONS_PATH}`);
}

main();
