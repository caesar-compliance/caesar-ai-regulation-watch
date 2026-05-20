#!/usr/bin/env node
/**
 * Validate manual review promotion packets and linked draft regulatory updates.
 * Cross-checks T053/T054/T055 registries. No network access.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROMOTIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-promotions.yml");
const EXECUTIONS_PATH = path.join(ROOT, "data/source-adapters/single-network-dry-run-executions.yml");
const APPROVALS_PATH = path.join(ROOT, "data/source-adapters/network-dry-run-approvals.yml");
const RUNS_PATH = path.join(ROOT, "data/source-adapters/manual-intake-runs.yml");
const ALLOWLIST_PATH = path.join(ROOT, "data/source-adapters/source-adapter-allowlist.yml");
const PROMOTION_SCHEMA_PATH = path.join(ROOT, "schemas/manual-review-promotion.schema.json");
const DRAFT_SCHEMA_PATH = path.join(ROOT, "schemas/draft-regulatory-update.schema.json");
const GENERATED_CANDIDATE_PREFIX = "generated/network-dry-run-candidates/";
const FIXTURE_CANDIDATE_PREFIX = "fixtures/promotion/";
const PUBLIC_UPDATES_JSON = path.join(ROOT, "public/data/regulatory-updates.json");
const SUMMARY_CAP = 1000;
const SNIPPET_CAP = 500;

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function loadSchema(filePath) {
  const schema = JSON.parse(fs.readFileSync(filePath, "utf8"));
  delete schema.$schema;
  return ajv.compile(schema);
}

const validatePromotionDoc = loadSchema(PROMOTION_SCHEMA_PATH);
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

function allowedCandidatePath(relPath) {
  return (
    relPath.startsWith(GENERATED_CANDIDATE_PREFIX) ||
    relPath.startsWith(FIXTURE_CANDIDATE_PREFIX)
  );
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
    ["metadata_only", true],
    ["stores_full_text", false],
    ["publication_allowed", false],
    ["public_export_allowed", false],
    ["requires_human_review", true],
    ["source_verification_required_before_publication", true],
  ];
  for (const [key, val] of expected) {
    if (safety?.[key] !== val) {
      errors.push(`${prefix}: safety.${key} must be ${val}`);
    }
  }
  return errors;
}

function draftPolicyErrors(prefix, draft) {
  const errors = [];
  errors.push(...gateErrors(prefix, draft));
  if (draft.publication_allowed !== false) {
    errors.push(`${prefix}: publication_allowed must be false`);
  }
  if (draft.public_export_allowed !== false) {
    errors.push(`${prefix}: public_export_allowed must be false`);
  }
  if (draft.evidence_export_allowed !== false) {
    errors.push(`${prefix}: evidence_export_allowed must be false`);
  }
  if (draft.review_required !== true) {
    errors.push(`${prefix}: review_required must be true`);
  }
  if (draft.status !== "draft_manual_review") {
    errors.push(`${prefix}: status must be draft_manual_review`);
  }
  if ((draft.summary?.length ?? 0) > SUMMARY_CAP) {
    errors.push(`${prefix}: summary exceeds ${SUMMARY_CAP} characters`);
  }
  if ((draft.title?.length ?? 0) > SNIPPET_CAP) {
    errors.push(`${prefix}: title exceeds ${SNIPPET_CAP} characters`);
  }
  return errors;
}

function promotionInvariantErrors(promotion, index, ctx) {
  const prefix = `promotions[${index}] (${promotion?.promotion_id ?? "?"})`;
  const errors = [];

  if (promotion.promotion_id !== "T056-001") {
    errors.push(`${prefix}: promotion_id must be T056-001 for T056 pilot`);
  }
  if (promotion.review_required !== true) {
    errors.push(`${prefix}: review_required must be true`);
  }
  errors.push(...gateErrors(prefix, promotion.gates));
  errors.push(...safetyErrors(prefix, promotion.safety));

  if ((promotion.fields?.title?.length ?? 0) > SNIPPET_CAP) {
    errors.push(`${prefix}: fields.title exceeds ${SNIPPET_CAP} characters`);
  }
  if (
    promotion.fields?.summary_snippet &&
    promotion.fields.summary_snippet.length > SNIPPET_CAP
  ) {
    errors.push(`${prefix}: fields.summary_snippet exceeds ${SNIPPET_CAP} characters`);
  }

  if (!allowedCandidatePath(promotion.source_candidate_path ?? "")) {
    errors.push(
      `${prefix}: source_candidate_path must be under ${GENERATED_CANDIDATE_PREFIX} or ${FIXTURE_CANDIDATE_PREFIX}`,
    );
  }

  const candidateAbs = path.join(ROOT, promotion.source_candidate_path);
  if (!fs.existsSync(candidateAbs)) {
    errors.push(`${prefix}: source candidate file missing: ${promotion.source_candidate_path}`);
  } else if (promotion.promotion_mode === "local_generated_candidate") {
    try {
      const payload = JSON.parse(fs.readFileSync(candidateAbs, "utf8"));
      const found = (payload.candidates ?? []).some(
        (c) => c.candidate_id === promotion.candidate_id,
      );
      if (!found) {
        errors.push(`${prefix}: candidate_id not found in ${promotion.source_candidate_path}`);
      }
    } catch (e) {
      errors.push(`${prefix}: invalid candidate JSON: ${e.message}`);
    }
  }

  const draftAbs = path.join(ROOT, promotion.draft_update_path);
  if (!fs.existsSync(draftAbs)) {
    errors.push(`${prefix}: draft_update_path missing: ${promotion.draft_update_path}`);
  } else if (!promotion.draft_update_path.includes("/drafts/")) {
    errors.push(`${prefix}: draft_update_path must be under a drafts/ subdirectory`);
  }

  const execution = ctx.executionById.get(promotion.source_execution_id);
  if (!execution) {
    errors.push(`${prefix}: unknown source_execution_id ${promotion.source_execution_id}`);
  }
  const approval = ctx.approvalById.get(promotion.source_approval_id);
  if (!approval) {
    errors.push(`${prefix}: unknown source_approval_id ${promotion.source_approval_id}`);
  } else if (approval.run_id !== promotion.source_run_id) {
    errors.push(`${prefix}: source_run_id does not match approval`);
  }
  const run = ctx.runById.get(promotion.source_run_id);
  if (!run) {
    errors.push(`${prefix}: unknown source_run_id ${promotion.source_run_id}`);
  }
  const adapter = ctx.adapterById.get(promotion.source_adapter_id);
  if (!adapter) {
    errors.push(`${prefix}: unknown source_adapter_id ${promotion.source_adapter_id}`);
  }

  return errors;
}

function main() {
  const doc = normalizeDates(readYaml(PROMOTIONS_PATH));
  if (!validatePromotionDoc(doc)) {
    console.error("Schema validation failed for manual-review-promotions.yml");
    for (const err of validatePromotionDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const executionsDoc = readYaml(EXECUTIONS_PATH);
  const approvalsDoc = readYaml(APPROVALS_PATH);
  const runsDoc = readYaml(RUNS_PATH);
  const allowlistDoc = readYaml(ALLOWLIST_PATH);

  const ctx = {
    executionById: indexById(executionsDoc.executions, "execution_id"),
    approvalById: indexById(approvalsDoc.approvals, "approval_id"),
    runById: indexById(runsDoc.runs, "run_id"),
    adapterById: indexById(allowlistDoc.adapters, "adapter_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.promotions ?? []).length; i++) {
    allErrors.push(...promotionInvariantErrors(doc.promotions[i], i, ctx));

    const promotion = doc.promotions[i];
    const draftPath = path.join(ROOT, promotion.draft_update_path);
    if (fs.existsSync(draftPath)) {
      const draft = normalizeDates(readYaml(draftPath));
      if (!validateDraft(draft)) {
        allErrors.push(`${promotion.draft_update_path}: draft schema validation failed`);
        for (const err of validateDraft.errors ?? []) {
          allErrors.push(`  ${err.instancePath}: ${err.message}`);
        }
      } else {
        allErrors.push(...draftPolicyErrors(promotion.draft_update_path, draft));
        if (draft.promotion_id !== promotion.promotion_id) {
          allErrors.push(
            `${promotion.draft_update_path}: promotion_id must match ${promotion.promotion_id}`,
          );
        }
        if (draft.candidate_id !== promotion.candidate_id) {
          allErrors.push(
            `${promotion.draft_update_path}: candidate_id must match ${promotion.candidate_id}`,
          );
        }
      }
    }
  }

  if (fs.existsSync(PUBLIC_UPDATES_JSON)) {
    const exported = fs.readFileSync(PUBLIC_UPDATES_JSON, "utf8");
    if (exported.includes("T056-001") || exported.includes("t056-001-draft-edpb-network-dry-run")) {
      allErrors.push("public/data/regulatory-updates.json must not contain T056 draft identifiers");
    }
  }

  if (allErrors.length > 0) {
    console.error("Manual review promotion validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: manual review promotions validated");
  console.log(`  promotions: ${doc.promotions.length}`);
  console.log(`  file: ${PROMOTIONS_PATH}`);
}

main();
