#!/usr/bin/env node
/**
 * Validate final legal review packet records.
 * Cross-checks draft, pipeline refs, and safety invariants. No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKETS_PATH = path.join(ROOT, "data/source-adapters/final-legal-review-packets.yml");
const RESULTS_PATH = path.join(ROOT, "data/source-adapters/source-verification-results.yml");
const CHECKLISTS_PATH = path.join(ROOT, "data/source-adapters/source-verification-checklists.yml");
const PROMOTIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-promotions.yml");
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-decisions.yml");
const REVISIONS_PATH = path.join(ROOT, "data/source-adapters/draft-regulatory-update-revisions.yml");
const READINESS_PATH = path.join(ROOT, "data/source-adapters/internal-draft-readiness-gates.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/final-legal-review-packet.schema.json");
const DRAFT_SCHEMA_PATH = path.join(ROOT, "schemas/draft-regulatory-update.schema.json");
const PUBLIC_UPDATES_JSON = path.join(ROOT, "public/data/regulatory-updates.json");

const REQUIRED_ITEM_IDS = [
  "source_url_final_confirmation",
  "publication_date_final_confirmation",
  "title_accuracy_review",
  "summary_accuracy_review",
  "topic_jurisdiction_legal_review",
  "no_legal_advice_wording_check",
  "public_export_readiness_check",
  "evidence_client_gate_check",
];

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function loadSchema(filePath) {
  const schema = JSON.parse(fs.readFileSync(filePath, "utf8"));
  delete schema.$schema;
  return ajv.compile(schema);
}

const validatePacketsDoc = loadSchema(SCHEMA_PATH);
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
    ["final_legal_approval_completed", false],
    ["final_source_verification_completed", false],
    ["publication_allowed", false],
    ["public_export_allowed", false],
    ["evidence_export_allowed", false],
    ["metadata_only", true],
    ["stores_full_text", false],
    ["requires_final_approval_before_publication", true],
  ];
  for (const [key, val] of expected) {
    if (safety?.[key] !== val) {
      errors.push(`${prefix}: safety.${key} must be ${val}`);
    }
  }
  return errors;
}

function packetInvariantErrors(packet, index, ctx) {
  const prefix = `packets[${index}] (${packet?.packet_id ?? "?"})`;
  const errors = [];

  if (packet.packet_scope !== "internal_final_legal_review_packet") {
    errors.push(`${prefix}: packet_scope must be internal_final_legal_review_packet`);
  }
  if (packet.packet_status !== "pending_final_legal_review") {
    errors.push(`${prefix}: packet_status must be pending_final_legal_review`);
  }
  if (packet.review_stage !== "pre_publication_internal_review") {
    errors.push(`${prefix}: review_stage must be pre_publication_internal_review`);
  }

  errors.push(...gateErrors(prefix, packet.gates));
  errors.push(...safetyErrors(prefix, packet.safety));

  const result = ctx.resultById.get(packet.source_verification_result_id);
  if (!result) {
    errors.push(`${prefix}: unknown source_verification_result_id ${packet.source_verification_result_id}`);
  } else {
    if (result.draft_update_id !== packet.draft_update_id) {
      errors.push(`${prefix}: draft_update_id must match source verification result`);
    }
    if (result.checklist_id !== packet.checklist_id) {
      errors.push(`${prefix}: checklist_id must match source verification result`);
    }
  }

  const checklist = ctx.checklistById.get(packet.checklist_id);
  if (!checklist) {
    errors.push(`${prefix}: unknown checklist_id ${packet.checklist_id}`);
  }

  const promotion = ctx.promotionById.get(packet.promotion_id);
  if (!promotion) {
    errors.push(`${prefix}: unknown promotion_id ${packet.promotion_id}`);
  }

  const decision = ctx.decisionById.get(packet.decision_id);
  if (!decision) {
    errors.push(`${prefix}: unknown decision_id ${packet.decision_id}`);
  }

  const revision = ctx.revisionById.get(packet.revision_id);
  if (!revision) {
    errors.push(`${prefix}: unknown revision_id ${packet.revision_id}`);
  }

  const readiness = ctx.readinessById.get(packet.readiness_id);
  if (!readiness) {
    errors.push(`${prefix}: unknown readiness_id ${packet.readiness_id}`);
  }

  const itemIds = (packet.legal_review_items ?? []).map((i) => i.item_id);
  for (const required of REQUIRED_ITEM_IDS) {
    if (!itemIds.includes(required)) {
      errors.push(`${prefix}: missing legal_review_item ${required}`);
    }
  }
  if (itemIds.length !== REQUIRED_ITEM_IDS.length) {
    errors.push(`${prefix}: legal_review_items must contain exactly ${REQUIRED_ITEM_IDS.length} items`);
  }

  const draftPath = path.join(ROOT, packet.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    errors.push(`${prefix}: draft_update_path missing: ${packet.draft_update_path}`);
  } else {
    const draft = normalizeDates(readYaml(draftPath));
    if (!validateDraft(draft)) {
      errors.push(`${packet.draft_update_path}: draft schema validation failed`);
    } else {
      if (draft.update_id !== packet.draft_update_id) {
        errors.push(`${prefix}: draft_update_id must match draft update_id`);
      }
      if (draft.latest_final_legal_review_packet_id !== packet.packet_id) {
        errors.push(`${prefix}: draft latest_final_legal_review_packet_id must be ${packet.packet_id}`);
      }
      const allowedReviewStatuses = [
        "pending_final_legal_review",
        "request_changes_recorded",
        "revision_response_recorded",
        "reviewer_recheck_recorded",
        "reject_recorded",
        "approve_internal_review_only_recorded",
      ];
      if (!allowedReviewStatuses.includes(draft.final_legal_review_status)) {
        errors.push(
          `${prefix}: draft final_legal_review_status must be a known internal review status`,
        );
      }
      if (
        draft.latest_final_legal_review_decision_id &&
        draft.final_legal_review_status === "pending_final_legal_review"
      ) {
        errors.push(
          `${prefix}: draft with final legal decision cannot remain pending_final_legal_review`,
        );
      }
      if (draft.final_legal_approval_completed !== false) {
        errors.push(`${prefix}: draft final_legal_approval_completed must be false`);
      }
      if (draft.final_source_verification_completed !== false) {
        errors.push(`${prefix}: draft final_source_verification_completed must be false`);
      }
      if (draft.verified_on_source !== false) {
        errors.push(`${prefix}: draft verified_on_source must remain false`);
      }
      errors.push(...gateErrors(packet.draft_update_path, draft));
      if (draft.publication_allowed !== false || draft.public_export_allowed !== false) {
        errors.push(`${prefix}: draft must not allow publication or public export`);
      }
      if (draft.evidence_export_allowed !== false) {
        errors.push(`${prefix}: draft evidence_export_allowed must be false`);
      }
    }
  }

  return errors;
}

function main() {
  const doc = normalizeDates(readYaml(PACKETS_PATH));
  if (!validatePacketsDoc(doc)) {
    console.error("Schema validation failed for final-legal-review-packets.yml");
    for (const err of validatePacketsDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const resultsDoc = readYaml(RESULTS_PATH);
  const checklistsDoc = readYaml(CHECKLISTS_PATH);
  const promotionsDoc = readYaml(PROMOTIONS_PATH);
  const decisionsDoc = readYaml(DECISIONS_PATH);
  const revisionsDoc = readYaml(REVISIONS_PATH);
  const readinessDoc = readYaml(READINESS_PATH);

  const ctx = {
    resultById: indexById(resultsDoc.results, "result_id"),
    checklistById: indexById(checklistsDoc.checklists, "checklist_id"),
    promotionById: indexById(promotionsDoc.promotions, "promotion_id"),
    decisionById: indexById(decisionsDoc.decisions, "decision_id"),
    revisionById: indexById(revisionsDoc.revisions, "revision_id"),
    readinessById: indexById(readinessDoc.gates, "readiness_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.packets ?? []).length; i++) {
    allErrors.push(...packetInvariantErrors(doc.packets[i], i, ctx));
  }

  if (fs.existsSync(PUBLIC_UPDATES_JSON)) {
    const exported = fs.readFileSync(PUBLIC_UPDATES_JSON, "utf8");
    for (const needle of [
      "T063-001",
      "T062-001",
      "T061-001",
      "T060-001",
      "t056-001-draft-edpb-network-dry-run",
      "request_changes_recorded",
      "final_legal_review_packet",
      "internal_final_legal_review_packet",
      "internal_legal_review_only",
    ]) {
      if (exported.includes(needle)) {
        allErrors.push(
          `public/data/regulatory-updates.json must not contain internal packet identifiers (${needle})`,
        );
      }
    }
  }

  if (allErrors.length > 0) {
    console.error("Final legal review packet validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: final legal review packets validated");
  console.log(`  packets: ${doc.packets.length}`);
  console.log(`  file: ${PACKETS_PATH}`);
}

main();
