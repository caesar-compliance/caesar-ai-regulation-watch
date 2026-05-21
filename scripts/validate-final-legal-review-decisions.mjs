#!/usr/bin/env node
/**
 * Validate final legal review decision records.
 * Cross-checks packet, source verification, draft, and safety invariants. No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/final-legal-review-decisions.yml");
const PACKETS_PATH = path.join(ROOT, "data/source-adapters/final-legal-review-packets.yml");
const RESULTS_PATH = path.join(ROOT, "data/source-adapters/source-verification-results.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/final-legal-review-decision.schema.json");
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

const validateDecisionsDoc = loadSchema(SCHEMA_PATH);
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

function decisionInvariantErrors(decision, index, ctx) {
  const prefix = `decisions[${index}] (${decision?.decision_id ?? "?"})`;
  const errors = [];

  if (decision.decision_scope !== "internal_legal_review_only") {
    errors.push(`${prefix}: decision_scope must be internal_legal_review_only`);
  }
  if (decision.decision_status !== "recorded") {
    errors.push(`${prefix}: decision_status must be recorded`);
  }

  errors.push(...gateErrors(prefix, decision.gates));
  errors.push(...safetyErrors(prefix, decision.safety));

  const packet = ctx.packetById.get(decision.packet_id);
  if (!packet) {
    errors.push(`${prefix}: unknown packet_id ${decision.packet_id}`);
  } else {
    if (packet.draft_update_id !== decision.draft_update_id) {
      errors.push(`${prefix}: draft_update_id must match packet`);
    }
    if (packet.draft_update_path !== decision.draft_update_path) {
      errors.push(`${prefix}: draft_update_path must match packet`);
    }
    if (packet.source_verification_result_id !== decision.source_verification_result_id) {
      errors.push(`${prefix}: source_verification_result_id must match packet`);
    }
  }

  const result = ctx.resultById.get(decision.source_verification_result_id);
  if (!result) {
    errors.push(`${prefix}: unknown source_verification_result_id ${decision.source_verification_result_id}`);
  } else if (result.draft_update_id !== decision.draft_update_id) {
    errors.push(`${prefix}: draft_update_id must match source verification result`);
  }

  const draftPath = path.join(ROOT, decision.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    errors.push(`${prefix}: draft_update_path missing: ${decision.draft_update_path}`);
  } else {
    const draft = normalizeDates(readYaml(draftPath));
    if (!validateDraft(draft)) {
      errors.push(`${decision.draft_update_path}: draft schema validation failed`);
    } else {
      if (draft.update_id !== decision.draft_update_id) {
        errors.push(`${prefix}: draft_update_id must match draft update_id`);
      }
      if (draft.latest_final_legal_review_decision_id !== decision.decision_id) {
        errors.push(
          `${prefix}: draft latest_final_legal_review_decision_id must be ${decision.decision_id}`,
        );
      }
      if (draft.final_legal_review_decision !== decision.decision) {
        errors.push(`${prefix}: draft final_legal_review_decision must match decision`);
      }
      if (draft.latest_final_legal_review_packet_id !== decision.packet_id) {
        errors.push(`${prefix}: draft latest_final_legal_review_packet_id must be ${decision.packet_id}`);
      }
      errors.push(...gateErrors(decision.draft_update_path, draft));
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
  const doc = normalizeDates(readYaml(DECISIONS_PATH));
  if (!validateDecisionsDoc(doc)) {
    console.error("Schema validation failed for final-legal-review-decisions.yml");
    for (const err of validateDecisionsDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const packetsDoc = readYaml(PACKETS_PATH);
  const resultsDoc = readYaml(RESULTS_PATH);

  const ctx = {
    packetById: indexById(packetsDoc.packets, "packet_id"),
    resultById: indexById(resultsDoc.results, "result_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.decisions ?? []).length; i++) {
    allErrors.push(...decisionInvariantErrors(doc.decisions[i], i, ctx));
  }

  for (const file of [PUBLIC_UPDATES_JSON, PUBLIC_SNAPSHOT_JSON]) {
    if (!fs.existsSync(file)) continue;
    const exported = fs.readFileSync(file, "utf8");
    for (const needle of [
      "T063-001",
      "T062-001",
      "T061-001",
      "request_changes_recorded",
      "internal_legal_review_only",
      "final-legal-review-decisions",
    ]) {
      if (exported.includes(needle)) {
        allErrors.push(`public export must not contain internal decision identifiers (${needle}) in ${file}`);
      }
    }
  }

  if (allErrors.length > 0) {
    console.error("Final legal review decision validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: final legal review decisions validated");
  console.log(`  decisions: ${doc.decisions.length}`);
  console.log(`  file: ${DECISIONS_PATH}`);
}

main();
