#!/usr/bin/env node
/**
 * Validate publication gate packet records.
 * Cross-checks T065 recheck through draft and safety invariants. No network.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKETS_PATH = path.join(ROOT, "data/source-adapters/publication-gate-packets.yml");
const RECHECKS_PATH = path.join(ROOT, "data/source-adapters/final-reviewer-rechecks.yml");
const RESPONSES_PATH = path.join(
  ROOT,
  "data/source-adapters/final-legal-review-revision-responses.yml",
);
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/final-legal-review-decisions.yml");
const LEGAL_PACKETS_PATH = path.join(ROOT, "data/source-adapters/final-legal-review-packets.yml");
const RESULTS_PATH = path.join(ROOT, "data/source-adapters/source-verification-results.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/publication-gate-packet.schema.json");
const DRAFT_SCHEMA_PATH = path.join(ROOT, "schemas/draft-regulatory-update.schema.json");
const PUBLIC_UPDATES_JSON = path.join(ROOT, "public/data/regulatory-updates.json");
const PUBLIC_SNAPSHOT_JSON = path.join(ROOT, "public/data/regulation-watch-snapshot.json");

const FORBIDDEN_CLAIM_PHRASES = [
  /\bpublished\b/i,
  /approved\s+for\s+public\s+use/i,
  /\bclient-ready\b/i,
  /\bevidence-ready\b/i,
  /verified\s+legal\s+change/i,
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
  const alwaysFalse = [
    "publication_allowed",
    "public_export_allowed",
    "evidence_export_allowed",
    "client_use_allowed",
    "final_source_verification_completed",
    "final_legal_approval_completed",
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
  if (safety?.requires_publication_gate_decision !== true) {
    errors.push(`${prefix}: safety.requires_publication_gate_decision must be true`);
  }
  if (safety?.requires_separate_public_export_approval !== true) {
    errors.push(`${prefix}: safety.requires_separate_public_export_approval must be true`);
  }
  if (safety?.requires_separate_client_evidence_approval !== true) {
    errors.push(`${prefix}: safety.requires_separate_client_evidence_approval must be true`);
  }
  return errors;
}

function forbiddenClaimErrors(prefix, packet) {
  const errors = [];
  const texts = [
    packet.gate_summary,
    ...(packet.blockers_remaining ?? []),
    ...(packet.publication_gate_items ?? []).flatMap((i) => [i.note, i.item_id]),
  ];
  for (const text of texts) {
    if (!text || typeof text !== "string") continue;
    for (const re of FORBIDDEN_CLAIM_PHRASES) {
      if (re.test(text)) {
        errors.push(`${prefix}: forbidden publication/approval claim in text`);
        break;
      }
    }
  }
  if (["published", "approved"].includes(packet.packet_status)) {
    errors.push(`${prefix}: packet_status must not imply publication/approval`);
  }
  return errors;
}

function packetInvariantErrors(packet, index, ctx) {
  const prefix = `packets[${index}] (${packet?.packet_id ?? "?"})`;
  const errors = [];

  if (packet.packet_scope !== "internal_publication_gate_packet") {
    errors.push(`${prefix}: packet_scope must be internal_publication_gate_packet`);
  }
  if (packet.packet_status !== "pending_publication_gate_decision") {
    errors.push(`${prefix}: packet_status must be pending_publication_gate_decision`);
  }
  if (packet.next_required_step !== "publication_gate_decision_capture") {
    errors.push(`${prefix}: next_required_step must be publication_gate_decision_capture`);
  }

  errors.push(...gateErrors(prefix, packet.gates));
  errors.push(...safetyErrors(prefix, packet.safety));
  errors.push(...forbiddenClaimErrors(prefix, packet));

  const recheck = ctx.recheckById.get(packet.final_reviewer_recheck_id);
  if (!recheck) {
    errors.push(`${prefix}: unknown final_reviewer_recheck_id ${packet.final_reviewer_recheck_id}`);
  } else {
    if (recheck.response_id !== packet.legal_review_response_id) {
      errors.push(`${prefix}: legal_review_response_id must match recheck`);
    }
    if (recheck.decision_id !== packet.legal_review_decision_id) {
      errors.push(`${prefix}: legal_review_decision_id must match recheck`);
    }
    if (recheck.packet_id !== packet.legal_review_packet_id) {
      errors.push(`${prefix}: legal_review_packet_id must match recheck`);
    }
    if (recheck.draft_update_id !== packet.draft_update_id) {
      errors.push(`${prefix}: draft_update_id must match recheck`);
    }
    if (recheck.draft_update_path !== packet.draft_update_path) {
      errors.push(`${prefix}: draft_update_path must match recheck`);
    }
    if (recheck.source_verification_result_id !== packet.source_verification_result_id) {
      errors.push(`${prefix}: source_verification_result_id must match recheck`);
    }
  }

  const response = ctx.responseById.get(packet.legal_review_response_id);
  if (!response) {
    errors.push(`${prefix}: unknown legal_review_response_id ${packet.legal_review_response_id}`);
  }

  const decision = ctx.decisionById.get(packet.legal_review_decision_id);
  if (!decision) {
    errors.push(`${prefix}: unknown legal_review_decision_id ${packet.legal_review_decision_id}`);
  }

  const legalPacket = ctx.legalPacketById.get(packet.legal_review_packet_id);
  if (!legalPacket) {
    errors.push(`${prefix}: unknown legal_review_packet_id ${packet.legal_review_packet_id}`);
  }

  const result = ctx.resultById.get(packet.source_verification_result_id);
  if (!result) {
    errors.push(
      `${prefix}: unknown source_verification_result_id ${packet.source_verification_result_id}`,
    );
  } else if (result.draft_update_id !== packet.draft_update_id) {
    errors.push(`${prefix}: draft_update_id must match source verification result`);
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
      if (draft.latest_publication_gate_packet_id !== packet.packet_id) {
        errors.push(
          `${prefix}: draft latest_publication_gate_packet_id must be ${packet.packet_id}`,
        );
      }
      if (draft.publication_gate_status !== packet.packet_status) {
        errors.push(`${prefix}: draft publication_gate_status must match packet`);
      }
      if (draft.publication_gate_result !== packet.gate_result) {
        errors.push(`${prefix}: draft publication_gate_result must match gate_result`);
      }
      const allowedDraftNextSteps = [
        "publication_gate_decision_capture",
        "publication_staging_preview",
        "public_export_release_gate",
        "public_export_approval_decision",
        "public_update_release_decision",
      ];
      if (!allowedDraftNextSteps.includes(draft.next_required_step)) {
        errors.push(
          `${prefix}: draft next_required_step must be publication_gate_decision_capture, publication_staging_preview, public_export_release_gate, public_export_approval_decision, or public_update_release_decision`,
        );
      }
      if (
        draft.latest_publication_gate_decision_id &&
        ![
          "publication_staging_preview",
          "public_export_release_gate",
          "public_export_approval_decision",
          "public_update_release_decision",
        ].includes(draft.next_required_step)
      ) {
        errors.push(
          `${prefix}: draft with publication gate decision must have next_required_step publication_staging_preview, public_export_release_gate, public_export_approval_decision, or public_update_release_decision`,
        );
      }
      if (
        draft.next_required_step === "public_export_release_gate" &&
        draft.staging_preview_created !== true
      ) {
        errors.push(
          `${prefix}: draft public_export_release_gate requires staging_preview_created true`,
        );
      }
      if (
        draft.next_required_step === "public_export_approval_decision" &&
        !draft.latest_public_export_release_gate_id
      ) {
        errors.push(
          `${prefix}: draft public_export_approval_decision requires latest_public_export_release_gate_id`,
        );
      }
      errors.push(...gateErrors(packet.draft_update_path, draft));
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
  const doc = normalizeDates(readYaml(PACKETS_PATH));
  if (!validatePacketsDoc(doc)) {
    console.error("Schema validation failed for publication-gate-packets.yml");
    for (const err of validatePacketsDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const rechecksDoc = readYaml(RECHECKS_PATH);
  const responsesDoc = readYaml(RESPONSES_PATH);
  const decisionsDoc = readYaml(DECISIONS_PATH);
  const legalPacketsDoc = readYaml(LEGAL_PACKETS_PATH);
  const resultsDoc = readYaml(RESULTS_PATH);

  const ctx = {
    recheckById: indexById(rechecksDoc.rechecks, "recheck_id"),
    responseById: indexById(responsesDoc.responses, "response_id"),
    decisionById: indexById(decisionsDoc.decisions, "decision_id"),
    legalPacketById: indexById(legalPacketsDoc.packets, "packet_id"),
    resultById: indexById(resultsDoc.results, "result_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.packets ?? []).length; i++) {
    allErrors.push(...packetInvariantErrors(doc.packets[i], i, ctx));
  }

  for (const file of [PUBLIC_UPDATES_JSON, PUBLIC_SNAPSHOT_JSON]) {
    if (!fs.existsSync(file)) continue;
    const exported = fs.readFileSync(file, "utf8");
    for (const needle of [
      "T066-001",
      "internal_publication_gate_packet",
      "publication-gate-packets",
      "blocked_pending_publication_decision",
      "publication_gate_decision_capture",
    ]) {
      if (exported.includes(needle)) {
        allErrors.push(
          `public export must not contain internal publication gate identifiers (${needle}) in ${file}`,
        );
      }
    }
  }

  if (allErrors.length > 0) {
    console.error("Publication gate packet validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: publication gate packets validated");
  console.log(`  packets: ${doc.packets.length}`);
  console.log(`  file: ${PACKETS_PATH}`);
}

main();
