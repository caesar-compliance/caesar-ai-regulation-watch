#!/usr/bin/env node
/**
 * Validate final legal review revision response records.
 * Cross-checks decision, packet, source verification, draft, and safety invariants. No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RESPONSES_PATH = path.join(
  ROOT,
  "data/source-adapters/final-legal-review-revision-responses.yml",
);
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/final-legal-review-decisions.yml");
const PACKETS_PATH = path.join(ROOT, "data/source-adapters/final-legal-review-packets.yml");
const RESULTS_PATH = path.join(ROOT, "data/source-adapters/source-verification-results.yml");
const SCHEMA_PATH = path.join(
  ROOT,
  "schemas/final-legal-review-revision-response.schema.json",
);
const DRAFT_SCHEMA_PATH = path.join(ROOT, "schemas/draft-regulatory-update.schema.json");
const PUBLIC_UPDATES_JSON = path.join(ROOT, "public/data/regulatory-updates.json");
const PUBLIC_SNAPSHOT_JSON = path.join(ROOT, "public/data/regulation-watch-snapshot.json");

const ALLOWED_RESPONSE_STATUS = new Set(["draft_response_recorded", "ready_for_reviewer_recheck"]);

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function loadSchema(filePath) {
  const schema = JSON.parse(fs.readFileSync(filePath, "utf8"));
  delete schema.$schema;
  return ajv.compile(schema);
}

const validateResponsesDoc = loadSchema(SCHEMA_PATH);
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
    ["final_legal_approval_completed", false],
    ["final_source_verification_completed", false],
    ["metadata_only", true],
    ["stores_full_text", false],
    ["requires_reviewer_recheck", true],
    ["requires_separate_publication_approval", true],
    ["requires_separate_evidence_approval", true],
  ];
  for (const [key, val] of expected) {
    if (safety?.[key] !== val) {
      errors.push(`${prefix}: safety.${key} must be ${val}`);
    }
  }
  return errors;
}

function responseInvariantErrors(response, index, ctx) {
  const prefix = `responses[${index}] (${response?.response_id ?? "?"})`;
  const errors = [];

  if (response.response_scope !== "internal_legal_review_revision_response") {
    errors.push(`${prefix}: response_scope must be internal_legal_review_revision_response`);
  }
  if (!ALLOWED_RESPONSE_STATUS.has(response.response_status)) {
    errors.push(
      `${prefix}: response_status must be draft_response_recorded or ready_for_reviewer_recheck`,
    );
  }
  if (response.next_required_step !== "final_legal_reviewer_recheck") {
    errors.push(`${prefix}: next_required_step must be final_legal_reviewer_recheck`);
  }

  errors.push(...gateErrors(prefix, response.gates));
  errors.push(...safetyErrors(prefix, response.safety));

  const decision = ctx.decisionById.get(response.decision_id);
  if (!decision) {
    errors.push(`${prefix}: unknown decision_id ${response.decision_id}`);
  } else if (decision.decision !== "request_changes") {
    errors.push(`${prefix}: decision must be request_changes for revision response`);
  }

  const packet = ctx.packetById.get(response.packet_id);
  if (!packet) {
    errors.push(`${prefix}: unknown packet_id ${response.packet_id}`);
  } else {
    if (packet.draft_update_id !== response.draft_update_id) {
      errors.push(`${prefix}: draft_update_id must match packet`);
    }
    if (packet.draft_update_path !== response.draft_update_path) {
      errors.push(`${prefix}: draft_update_path must match packet`);
    }
    if (packet.source_verification_result_id !== response.source_verification_result_id) {
      errors.push(`${prefix}: source_verification_result_id must match packet`);
    }
  }

  const result = ctx.resultById.get(response.source_verification_result_id);
  if (!result) {
    errors.push(
      `${prefix}: unknown source_verification_result_id ${response.source_verification_result_id}`,
    );
  } else if (result.draft_update_id !== response.draft_update_id) {
    errors.push(`${prefix}: draft_update_id must match source verification result`);
  }

  const draftPath = path.join(ROOT, response.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    errors.push(`${prefix}: draft_update_path missing: ${response.draft_update_path}`);
  } else {
    const draft = normalizeDates(readYaml(draftPath));
    if (!validateDraft(draft)) {
      errors.push(`${response.draft_update_path}: draft schema validation failed`);
    } else {
      if (draft.update_id !== response.draft_update_id) {
        errors.push(`${prefix}: draft_update_id must match draft update_id`);
      }
      if (draft.latest_final_legal_review_response_id !== response.response_id) {
        errors.push(
          `${prefix}: draft latest_final_legal_review_response_id must be ${response.response_id}`,
        );
      }
      if (draft.final_legal_review_response_status !== response.response_status) {
        errors.push(`${prefix}: draft final_legal_review_response_status must match response`);
      }
      const allowedLegalStatuses = ["revision_response_recorded", "reviewer_recheck_recorded"];
      if (!allowedLegalStatuses.includes(draft.final_legal_review_status)) {
        errors.push(
          `${prefix}: draft final_legal_review_status must be revision_response_recorded or reviewer_recheck_recorded`,
        );
      }
      const hasRecheck = Boolean(draft.latest_final_reviewer_recheck_id);
      if (!hasRecheck && draft.next_required_step !== "final_legal_reviewer_recheck") {
        errors.push(`${prefix}: draft next_required_step must be final_legal_reviewer_recheck`);
      }
      if (hasRecheck) {
        const allowedAfterRecheck = [
          "publication_gate_packet",
          "publication_gate_decision_capture",
        ];
        if (!allowedAfterRecheck.includes(draft.next_required_step)) {
          errors.push(
            `${prefix}: draft next_required_step must be publication_gate_packet or publication_gate_decision_capture after reviewer re-check`,
          );
        }
      }
      errors.push(...gateErrors(response.draft_update_path, draft));
      if (draft.publication_allowed !== false || draft.public_export_allowed !== false) {
        errors.push(`${prefix}: draft must not allow publication or public export`);
      }
      if (draft.evidence_export_allowed !== false) {
        errors.push(`${prefix}: draft evidence_export_allowed must be false`);
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
    }
  }

  return errors;
}

function main() {
  const doc = normalizeDates(readYaml(RESPONSES_PATH));
  if (!validateResponsesDoc(doc)) {
    console.error("Schema validation failed for final-legal-review-revision-responses.yml");
    for (const err of validateResponsesDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const decisionsDoc = readYaml(DECISIONS_PATH);
  const packetsDoc = readYaml(PACKETS_PATH);
  const resultsDoc = readYaml(RESULTS_PATH);

  const ctx = {
    decisionById: indexById(decisionsDoc.decisions, "decision_id"),
    packetById: indexById(packetsDoc.packets, "packet_id"),
    resultById: indexById(resultsDoc.results, "result_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.responses ?? []).length; i++) {
    allErrors.push(...responseInvariantErrors(doc.responses[i], i, ctx));
  }

  for (const file of [PUBLIC_UPDATES_JSON, PUBLIC_SNAPSHOT_JSON]) {
    if (!fs.existsSync(file)) continue;
    const exported = fs.readFileSync(file, "utf8");
    for (const needle of [
      "T064-001",
      "revision_response_recorded",
      "ready_for_reviewer_recheck",
      "internal_legal_review_revision_response",
      "final-legal-review-revision-responses",
    ]) {
      if (exported.includes(needle)) {
        allErrors.push(
          `public export must not contain internal response identifiers (${needle}) in ${file}`,
        );
      }
    }
  }

  if (allErrors.length > 0) {
    console.error("Final legal review revision response validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: final legal review revision responses validated");
  console.log(`  responses: ${doc.responses.length}`);
  console.log(`  file: ${RESPONSES_PATH}`);
}

main();
