#!/usr/bin/env node
/**
 * Validate draft regulatory update revision packets.
 * Cross-checks T057 decisions, T056 promotions, and draft paths. No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REVISIONS_PATH = path.join(ROOT, "data/source-adapters/draft-regulatory-update-revisions.yml");
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-decisions.yml");
const PROMOTIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-promotions.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/draft-regulatory-update-revision.schema.json");
const DRAFT_SCHEMA_PATH = path.join(ROOT, "schemas/draft-regulatory-update.schema.json");
const PUBLIC_UPDATES_JSON = path.join(ROOT, "public/data/regulatory-updates.json");
const SUMMARY_CAP = 1000;

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function loadSchema(filePath) {
  const schema = JSON.parse(fs.readFileSync(filePath, "utf8"));
  delete schema.$schema;
  return ajv.compile(schema);
}

const validateRevisionDoc = loadSchema(SCHEMA_PATH);
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

function revisionInvariantErrors(revision, index, ctx) {
  const prefix = `revisions[${index}] (${revision?.revision_id ?? "?"})`;
  const errors = [];

  if (revision.revision_scope !== "internal_draft_metadata_only") {
    errors.push(`${prefix}: revision_scope must be internal_draft_metadata_only`);
  }
  if (revision.reviewer_followup_required !== true) {
    errors.push(`${prefix}: reviewer_followup_required must be true`);
  }
  errors.push(...gateErrors(prefix, revision.gates));
  errors.push(...safetyErrors(prefix, revision.safety));

  const decision = ctx.decisionById.get(revision.source_decision_id);
  if (!decision) {
    errors.push(`${prefix}: unknown source_decision_id ${revision.source_decision_id}`);
  } else if (decision.decision !== "request_changes") {
    errors.push(`${prefix}: source decision must be request_changes for T058 revision`);
  }

  const promotion = ctx.promotionById.get(revision.source_promotion_id);
  if (!promotion) {
    errors.push(`${prefix}: unknown source_promotion_id ${revision.source_promotion_id}`);
  } else if (promotion.draft_update_path !== revision.draft_update_path) {
    errors.push(`${prefix}: draft_update_path must match promotion`);
  }

  const draftPath = path.join(ROOT, revision.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    errors.push(`${prefix}: draft_update_path missing: ${revision.draft_update_path}`);
  } else {
    const draft = normalizeDates(readYaml(draftPath));
    if (!validateDraft(draft)) {
      errors.push(`${revision.draft_update_path}: draft schema validation failed`);
    } else {
      if (draft.update_id !== revision.draft_update_id) {
        errors.push(`${prefix}: draft_update_id must match draft update_id`);
      }
      if (draft.latest_revision_id !== revision.revision_id) {
        errors.push(`${prefix}: draft latest_revision_id must match revision_id`);
      }
      if (draft.latest_review_decision_id !== revision.source_decision_id) {
        errors.push(`${prefix}: draft latest_review_decision_id must match source_decision_id`);
      }
      if (draft.review_status !== "revised_after_request_changes") {
        errors.push(`${prefix}: draft review_status must be revised_after_request_changes`);
      }
      if (draft.source_verification_required_before_publication !== true) {
        errors.push(`${prefix}: draft source_verification_required_before_publication must be true`);
      }
      if (draft.topic_jurisdiction_confirmation_required !== true) {
        errors.push(`${prefix}: draft topic_jurisdiction_confirmation_required must be true`);
      }
      if (draft.publication_allowed !== false || draft.public_export_allowed !== false) {
        errors.push(`${prefix}: draft must not allow publication or public export`);
      }
      if ((draft.summary?.length ?? 0) > SUMMARY_CAP) {
        errors.push(`${prefix}: draft summary exceeds ${SUMMARY_CAP} characters`);
      }
      errors.push(...gateErrors(`${revision.draft_update_path}`, draft));
    }
  }

  return errors;
}

function main() {
  const doc = normalizeDates(readYaml(REVISIONS_PATH));
  if (!validateRevisionDoc(doc)) {
    console.error("Schema validation failed for draft-regulatory-update-revisions.yml");
    for (const err of validateRevisionDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const decisionsDoc = readYaml(DECISIONS_PATH);
  const promotionsDoc = readYaml(PROMOTIONS_PATH);
  const ctx = {
    decisionById: indexById(decisionsDoc.decisions, "decision_id"),
    promotionById: indexById(promotionsDoc.promotions, "promotion_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.revisions ?? []).length; i++) {
    allErrors.push(...revisionInvariantErrors(doc.revisions[i], i, ctx));
  }

  if (fs.existsSync(PUBLIC_UPDATES_JSON)) {
    const exported = fs.readFileSync(PUBLIC_UPDATES_JSON, "utf8");
    for (const needle of ["T058-001", "T057-001", "t056-001-draft-edpb-network-dry-run"]) {
      if (exported.includes(needle)) {
        allErrors.push(
          `public/data/regulatory-updates.json must not contain T058/T057/T056 draft identifiers`,
        );
      }
    }
  }

  if (allErrors.length > 0) {
    console.error("Draft revision validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: draft regulatory update revisions validated");
  console.log(`  revisions: ${doc.revisions.length}`);
  console.log(`  file: ${REVISIONS_PATH}`);
}

main();
