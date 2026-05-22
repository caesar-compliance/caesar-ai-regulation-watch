#!/usr/bin/env node
/**
 * T081 — Validate regulation review queue exports.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion } from "../lib/read-project-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC_DATA = path.join(ROOT, "public/data");

const GATE_KEYS = [
  "verified_on_source",
  "client_use_allowed",
  "client_evidence_allowed",
  "final_evidence_allowed",
  "legal_change_claimed",
  "publication_allowed",
  "public_export_allowed",
];

const VALID_REVIEW_STATUS = new Set([
  "review_required",
  "in_review",
  "dismissed",
  "accepted_for_tracking",
  "needs_source_check",
]);

const VALID_PRIORITY = new Set(["high", "medium", "low"]);
const FORBIDDEN_KEYS = ["full_text", "legal_text", "service_role", "password"];

function readJson(name) {
  const full = path.join(PUBLIC_DATA, name);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function scanForbidden(obj, prefix, errors) {
  if (obj == null || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => scanForbidden(v, `${prefix}[${i}]`, errors));
    return;
  }
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    for (const f of FORBIDDEN_KEYS) {
      if (key.toLowerCase().includes(f)) errors.push(`forbidden key: ${full}`);
    }
    scanForbidden(value, full, errors);
  }
}

function assertGatesClosed(gates, ctx, errors) {
  if (!gates) return;
  for (const key of GATE_KEYS) {
    if (gates[key] === true) {
      errors.push(`${ctx}: gate ${key} must not be true`);
    }
  }
}

function main() {
  const errors = [];
  const version = readProjectVersion();
  const queue = readJson("regulation-review-queue.json");
  const summary = readJson("operator-review-summary.json");
  const tracker = readJson("tracker-summary.json");
  const candidates = readJson("regulation-review-candidates.json");

  if (!queue) errors.push("missing regulation-review-queue.json");
  if (!summary) errors.push("missing operator-review-summary.json");

  if (queue) {
    if (queue.product_version && queue.product_version !== version) {
      errors.push(
        `regulation-review-queue product_version ${queue.product_version} != ${version}`,
      );
    }
    if (queue.legal_change_claimed === true) {
      errors.push("regulation-review-queue legal_change_claimed must be false");
    }
    if (queue.scheduled_monitoring_enabled === true) {
      errors.push("scheduled_monitoring_enabled must be false");
    }
    scanForbidden(queue, "regulation-review-queue", errors);

    const cards = queue.cards ?? [];
    if (cards.length !== (candidates?.candidates?.length ?? cards.length)) {
      if (
        candidates?.candidates?.length != null &&
        cards.length !== candidates.candidates.length
      ) {
        errors.push(
          `review queue cards (${cards.length}) != regulation-review-candidates (${candidates.candidates.length})`,
        );
      }
    }

    if (
      tracker?.review_candidates_count != null &&
      cards.length !== tracker.review_candidates_count
    ) {
      errors.push(
        `review queue cards (${cards.length}) != tracker-summary review_candidates_count (${tracker.review_candidates_count})`,
      );
    }

    for (const card of cards) {
      const ctx = `card ${card.candidate_id}`;
      if (!card.candidate_id) errors.push(`${ctx}: missing candidate_id`);
      if (!VALID_REVIEW_STATUS.has(card.review_status)) {
        errors.push(`${ctx}: invalid review_status ${card.review_status}`);
      }
      if (!VALID_PRIORITY.has(card.priority)) {
        errors.push(`${ctx}: invalid priority ${card.priority}`);
      }
      assertGatesClosed(card.gates, ctx, errors);
      if (card.legal_change_claimed === true) {
        errors.push(`${ctx}: legal_change_claimed must be false`);
      }
    }
  }

  if (summary) {
    scanForbidden(summary, "operator-review-summary", errors);
    for (const d of summary.decisions ?? []) {
      assertGatesClosed(d.gates, `decision ${d.decision_id}`, errors);
    }
    if (summary.operator_workflow?.cron_enabled === true) {
      errors.push("operator_workflow.cron_enabled must be false");
    }
  }

  if (errors.length) {
    console.error("FAIL: validate-review-queue");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }
  console.log("PASS: validate-review-queue");
}

main();
