#!/usr/bin/env node
/**
 * Validate internal draft readiness gate records.
 * Cross-checks T056 promotion, T057 decision, T058 revision, and draft path. No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GATES_PATH = path.join(ROOT, "data/source-adapters/internal-draft-readiness-gates.yml");
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-decisions.yml");
const PROMOTIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-promotions.yml");
const REVISIONS_PATH = path.join(ROOT, "data/source-adapters/draft-regulatory-update-revisions.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/internal-draft-readiness-gate.schema.json");
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

const validateGateDoc = loadSchema(SCHEMA_PATH);
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
    ["requires_source_verification_before_publication", true],
    ["requires_legal_review_before_publication", true],
    ["requires_separate_publication_approval", true],
  ];
  for (const [key, val] of expected) {
    if (safety?.[key] !== val) {
      errors.push(`${prefix}: safety.${key} must be ${val}`);
    }
  }
  return errors;
}

function readinessInvariantErrors(gate, index, ctx) {
  const prefix = `gates[${index}] (${gate?.readiness_id ?? "?"})`;
  const errors = [];

  if (gate.gate_scope !== "internal_draft_readiness_only") {
    errors.push(`${prefix}: gate_scope must be internal_draft_readiness_only`);
  }
  if (gate.reviewer_followup_required !== true) {
    errors.push(`${prefix}: reviewer_followup_required must be true`);
  }
  if (gate.readiness_result !== "not_ready_for_publication_review") {
    errors.push(`${prefix}: readiness_result must be not_ready_for_publication_review for T059`);
  }
  if (gate.next_required_step !== "source_verification_checklist_packet") {
    errors.push(`${prefix}: next_required_step must be source_verification_checklist_packet`);
  }
  if ((gate.readiness_summary?.length ?? 0) > SUMMARY_CAP) {
    errors.push(`${prefix}: readiness_summary exceeds ${SUMMARY_CAP} characters`);
  }

  errors.push(...gateErrors(prefix, gate.gates));
  errors.push(...safetyErrors(prefix, gate.safety));

  const promotion = ctx.promotionById.get(gate.source_promotion_id);
  if (!promotion) {
    errors.push(`${prefix}: unknown source_promotion_id ${gate.source_promotion_id}`);
  } else if (promotion.draft_update_path !== gate.draft_update_path) {
    errors.push(`${prefix}: draft_update_path must match promotion`);
  }

  const decision = ctx.decisionById.get(gate.source_decision_id);
  if (!decision) {
    errors.push(`${prefix}: unknown source_decision_id ${gate.source_decision_id}`);
  }

  const revision = ctx.revisionById.get(gate.source_revision_id);
  if (!revision) {
    errors.push(`${prefix}: unknown source_revision_id ${gate.source_revision_id}`);
  } else if (revision.draft_update_id !== gate.draft_update_id) {
    errors.push(`${prefix}: draft_update_id must match revision`);
  }

  const draftPath = path.join(ROOT, gate.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    errors.push(`${prefix}: draft_update_path missing: ${gate.draft_update_path}`);
  } else {
    const draft = normalizeDates(readYaml(draftPath));
    if (!validateDraft(draft)) {
      errors.push(`${gate.draft_update_path}: draft schema validation failed`);
    } else {
      if (draft.update_id !== gate.draft_update_id) {
        errors.push(`${prefix}: draft_update_id must match draft update_id`);
      }
      if (draft.latest_readiness_gate_id !== gate.readiness_id) {
        errors.push(`${prefix}: draft latest_readiness_gate_id must match readiness_id`);
      }
      if (draft.readiness_result !== "not_ready_for_publication_review") {
        errors.push(`${prefix}: draft readiness_result must be not_ready_for_publication_review`);
      }
      const allowedDraftNextSteps = ["source_verification_checklist_packet"];
      if (draft.latest_source_verification_result_id) {
        allowedDraftNextSteps.push("final_legal_review_packet");
      }
      if (draft.latest_final_legal_review_packet_id) {
        allowedDraftNextSteps.push("final_legal_reviewer_decision");
      }
      if (draft.latest_final_legal_review_decision_id) {
        allowedDraftNextSteps.push("legal_review_revision_packet");
      }
      if (draft.latest_final_legal_review_response_id) {
        allowedDraftNextSteps.push("final_legal_reviewer_recheck");
      }
      if (draft.latest_final_reviewer_recheck_id) {
        allowedDraftNextSteps.push("publication_gate_packet");
      }
      if (draft.latest_publication_gate_packet_id) {
        allowedDraftNextSteps.push("publication_gate_decision_capture");
      }
      if (draft.latest_publication_gate_decision_id) {
        allowedDraftNextSteps.push("publication_staging_preview");
      }
      if (draft.staging_preview_created === true || draft.latest_publication_staging_preview_id) {
        allowedDraftNextSteps.push("public_export_release_gate");
      }
      if (!allowedDraftNextSteps.includes(draft.next_required_step)) {
        errors.push(
          `${prefix}: draft next_required_step must be one of ${allowedDraftNextSteps.join(", ")}`,
        );
      }
      if (draft.source_verification_required_before_publication !== true) {
        errors.push(`${prefix}: draft source_verification_required_before_publication must be true`);
      }
      if (draft.legal_review_required_before_publication !== true) {
        errors.push(`${prefix}: draft legal_review_required_before_publication must be true`);
      }
      if (draft.separate_publication_approval_required !== true) {
        errors.push(`${prefix}: draft separate_publication_approval_required must be true`);
      }
      if (draft.publication_allowed !== false || draft.public_export_allowed !== false) {
        errors.push(`${prefix}: draft must not allow publication or public export`);
      }
      if (draft.evidence_export_allowed !== false) {
        errors.push(`${prefix}: draft evidence_export_allowed must be false`);
      }
      errors.push(...gateErrors(`${gate.draft_update_path}`, draft));
    }
  }

  return errors;
}

function main() {
  const doc = normalizeDates(readYaml(GATES_PATH));
  if (!validateGateDoc(doc)) {
    console.error("Schema validation failed for internal-draft-readiness-gates.yml");
    for (const err of validateGateDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const decisionsDoc = readYaml(DECISIONS_PATH);
  const promotionsDoc = readYaml(PROMOTIONS_PATH);
  const revisionsDoc = readYaml(REVISIONS_PATH);
  const ctx = {
    decisionById: indexById(decisionsDoc.decisions, "decision_id"),
    promotionById: indexById(promotionsDoc.promotions, "promotion_id"),
    revisionById: indexById(revisionsDoc.revisions, "revision_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.gates ?? []).length; i++) {
    allErrors.push(...readinessInvariantErrors(doc.gates[i], i, ctx));
  }

  if (fs.existsSync(PUBLIC_UPDATES_JSON)) {
    const exported = fs.readFileSync(PUBLIC_UPDATES_JSON, "utf8");
    for (const needle of ["T059-001", "T058-001", "T057-001", "t056-001-draft-edpb-network-dry-run"]) {
      if (exported.includes(needle)) {
        allErrors.push(
          `public/data/regulatory-updates.json must not contain T059/T058/T057/T056 draft identifiers`,
        );
      }
    }
  }

  if (allErrors.length > 0) {
    console.error("Internal draft readiness gate validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: internal draft readiness gates validated");
  console.log(`  gates: ${doc.gates.length}`);
  console.log(`  file: ${GATES_PATH}`);
}

main();
