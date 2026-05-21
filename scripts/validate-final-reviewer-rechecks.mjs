#!/usr/bin/env node
/**
 * Validate final reviewer re-check records.
 * Cross-checks T064 response, decision, packet, source verification, draft, and safety invariants. No network.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RECHECKS_PATH = path.join(ROOT, "data/source-adapters/final-reviewer-rechecks.yml");
const RESPONSES_PATH = path.join(
  ROOT,
  "data/source-adapters/final-legal-review-revision-responses.yml",
);
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/final-legal-review-decisions.yml");
const PACKETS_PATH = path.join(ROOT, "data/source-adapters/final-legal-review-packets.yml");
const RESULTS_PATH = path.join(ROOT, "data/source-adapters/source-verification-results.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/final-reviewer-recheck.schema.json");
const DRAFT_SCHEMA_PATH = path.join(ROOT, "schemas/draft-regulatory-update.schema.json");
const PUBLIC_UPDATES_JSON = path.join(ROOT, "public/data/regulatory-updates.json");
const PUBLIC_SNAPSHOT_JSON = path.join(ROOT, "public/data/regulation-watch-snapshot.json");

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function loadSchema(filePath) {
  const schema = JSON.parse(fs.readFileSync(filePath, "utf8"));
  delete schema.$schema;
  return ajv.compile(schema);
}

const validateRechecksDoc = loadSchema(SCHEMA_PATH);
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
  const alwaysFalse = [
    "publication_allowed",
    "public_export_allowed",
    "evidence_export_allowed",
    "final_legal_approval_completed",
    "final_source_verification_completed",
  ];
  for (const key of alwaysFalse) {
    if (safety?.[key] !== false) {
      errors.push(`${prefix}: safety.${key} must be false`);
    }
  }
  if (safety?.metadata_only !== true) {
    errors.push(`${prefix}: safety.metadata_only must be true`);
  }
  if (safety?.stores_full_text !== false) {
    errors.push(`${prefix}: safety.stores_full_text must be false`);
  }
  if (safety?.requires_separate_publication_approval !== true) {
    errors.push(`${prefix}: safety.requires_separate_publication_approval must be true`);
  }
  if (safety?.requires_separate_evidence_approval !== true) {
    errors.push(`${prefix}: safety.requires_separate_evidence_approval must be true`);
  }
  if (
    safety?.ready_for_publication_gate_review === true &&
    (safety?.publication_allowed !== false ||
      safety?.public_export_allowed !== false ||
      safety?.evidence_export_allowed !== false)
  ) {
    errors.push(
      `${prefix}: ready_for_publication_gate_review requires publication/export/evidence flags false`,
    );
  }
  return errors;
}

function recheckInvariantErrors(recheck, index, ctx) {
  const prefix = `rechecks[${index}] (${recheck?.recheck_id ?? "?"})`;
  const errors = [];

  if (recheck.recheck_scope !== "internal_final_recheck_only") {
    errors.push(`${prefix}: recheck_scope must be internal_final_recheck_only`);
  }
  if (recheck.recheck_status !== "recorded") {
    errors.push(`${prefix}: recheck_status must be recorded`);
  }
  if (recheck.next_required_step !== "publication_gate_packet") {
    errors.push(`${prefix}: next_required_step must be publication_gate_packet`);
  }

  errors.push(...gateErrors(prefix, recheck.gates));
  errors.push(...safetyErrors(prefix, recheck.safety));

  if (recheck.recheck_result === "ready_for_publication_gate_review") {
    if (recheck.safety?.ready_for_publication_gate_review !== true) {
      errors.push(
        `${prefix}: safety.ready_for_publication_gate_review must be true when recheck_result is ready_for_publication_gate_review`,
      );
    }
    errors.push(...gateErrors(`${prefix} (ready gate)`, recheck.gates));
  }

  const response = ctx.responseById.get(recheck.response_id);
  if (!response) {
    errors.push(`${prefix}: unknown response_id ${recheck.response_id}`);
  } else {
    if (response.decision_id !== recheck.decision_id) {
      errors.push(`${prefix}: decision_id must match response`);
    }
    if (response.packet_id !== recheck.packet_id) {
      errors.push(`${prefix}: packet_id must match response`);
    }
    if (response.draft_update_id !== recheck.draft_update_id) {
      errors.push(`${prefix}: draft_update_id must match response`);
    }
    if (response.draft_update_path !== recheck.draft_update_path) {
      errors.push(`${prefix}: draft_update_path must match response`);
    }
    if (response.source_verification_result_id !== recheck.source_verification_result_id) {
      errors.push(`${prefix}: source_verification_result_id must match response`);
    }
  }

  const decision = ctx.decisionById.get(recheck.decision_id);
  if (!decision) {
    errors.push(`${prefix}: unknown decision_id ${recheck.decision_id}`);
  }

  const packet = ctx.packetById.get(recheck.packet_id);
  if (!packet) {
    errors.push(`${prefix}: unknown packet_id ${recheck.packet_id}`);
  }

  const result = ctx.resultById.get(recheck.source_verification_result_id);
  if (!result) {
    errors.push(
      `${prefix}: unknown source_verification_result_id ${recheck.source_verification_result_id}`,
    );
  } else if (result.draft_update_id !== recheck.draft_update_id) {
    errors.push(`${prefix}: draft_update_id must match source verification result`);
  }

  const draftPath = path.join(ROOT, recheck.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    errors.push(`${prefix}: draft_update_path missing: ${recheck.draft_update_path}`);
  } else {
    const draft = normalizeDates(readYaml(draftPath));
    if (!validateDraft(draft)) {
      errors.push(`${recheck.draft_update_path}: draft schema validation failed`);
    } else {
      if (draft.update_id !== recheck.draft_update_id) {
        errors.push(`${prefix}: draft_update_id must match draft update_id`);
      }
      if (draft.latest_final_reviewer_recheck_id !== recheck.recheck_id) {
        errors.push(
          `${prefix}: draft latest_final_reviewer_recheck_id must be ${recheck.recheck_id}`,
        );
      }
      if (draft.final_reviewer_recheck_status !== recheck.recheck_status) {
        errors.push(`${prefix}: draft final_reviewer_recheck_status must match recheck`);
      }
      if (draft.final_reviewer_recheck_result !== recheck.recheck_result) {
        errors.push(`${prefix}: draft final_reviewer_recheck_result must match recheck`);
      }
      const allowedDraftNextSteps = [
        "publication_gate_packet",
        "publication_gate_decision_capture",
        "publication_staging_preview",
        "public_export_release_gate",
        "public_export_approval_decision",
        "public_update_release_decision",
      ];
      if (!allowedDraftNextSteps.includes(draft.next_required_step)) {
        errors.push(
          `${prefix}: draft next_required_step must be publication_gate_packet, publication_gate_decision_capture, publication_staging_preview, public_export_release_gate, public_export_approval_decision, or public_update_release_decision`,
        );
      }
      if (draft.ready_for_publication_gate_review !== true) {
        errors.push(`${prefix}: draft ready_for_publication_gate_review must be true`);
      }
      errors.push(...gateErrors(recheck.draft_update_path, draft));
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
  const doc = normalizeDates(readYaml(RECHECKS_PATH));
  if (!validateRechecksDoc(doc)) {
    console.error("Schema validation failed for final-reviewer-rechecks.yml");
    for (const err of validateRechecksDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const responsesDoc = readYaml(RESPONSES_PATH);
  const decisionsDoc = readYaml(DECISIONS_PATH);
  const packetsDoc = readYaml(PACKETS_PATH);
  const resultsDoc = readYaml(RESULTS_PATH);

  const ctx = {
    responseById: indexById(responsesDoc.responses, "response_id"),
    decisionById: indexById(decisionsDoc.decisions, "decision_id"),
    packetById: indexById(packetsDoc.packets, "packet_id"),
    resultById: indexById(resultsDoc.results, "result_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.rechecks ?? []).length; i++) {
    allErrors.push(...recheckInvariantErrors(doc.rechecks[i], i, ctx));
  }

  for (const file of [PUBLIC_UPDATES_JSON, PUBLIC_SNAPSHOT_JSON]) {
    if (!fs.existsSync(file)) continue;
    const exported = fs.readFileSync(file, "utf8");
    for (const needle of [
      "T065-001",
      "ready_for_publication_gate_review",
      "internal_final_recheck_only",
      "final-reviewer-rechecks",
      "publication_gate_packet",
    ]) {
      if (exported.includes(needle)) {
        allErrors.push(
          `public export must not contain internal recheck identifiers (${needle}) in ${file}`,
        );
      }
    }
  }

  if (allErrors.length > 0) {
    console.error("Final reviewer re-check validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: final reviewer re-checks validated");
  console.log(`  rechecks: ${doc.rechecks.length}`);
  console.log(`  file: ${RECHECKS_PATH}`);
}

main();
