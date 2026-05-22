#!/usr/bin/env node
/**
 * T082 — Validate operator-review-decisions.yml (static-first, gates closed).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  GATE_KEYS,
  SUPPORTED_DECISIONS,
  VALID_PUBLIC_VISIBILITY,
  decisionRequiresSourceUrl,
  loadOperatorDecisionsDoc,
  loadPublicJson,
  normalizeGateOverrides,
} from "./lib/review-queue-lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const EMAIL_PATTERN = /@[a-z0-9.-]+\.[a-z]{2,}/i;

const LEGAL_ADVICE_PATTERNS = [
  /\bwe\s+advise\b/i,
  /\byou\s+must\s+comply\b/i,
  /\bverified\s+legal\s+change\b/i,
  /\blegal\s+verification\s+complete\b/i,
  /\bconfirmed\s+regulatory\s+obligation\b/i,
  /\bthis\s+constitutes\s+legal\s+advice\b/i,
  /\bseek\s+legal\s+counsel\s+because\b/i,
];

const LEGAL_VERIFICATION_CLAIM_PATTERNS = [
  /\bverified\s+on\s+source\b/i,
  /\blegal\s+change\s+confirmed\b/i,
  /\bcompliance\s+required\b/i,
];

const FORBIDDEN_KEYS = ["full_text", "legal_text", "service_role", "password"];

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

function containsLegalAdvice(text) {
  if (!text || typeof text !== "string") return false;
  const normalized = text.replace(/\bnot\s+legal\s+advice\b/gi, "");
  return LEGAL_ADVICE_PATTERNS.some((re) => re.test(normalized));
}

function claimsLegalVerification(text) {
  if (!text || typeof text !== "string") return false;
  return LEGAL_VERIFICATION_CLAIM_PATTERNS.some((re) => re.test(text));
}

function main() {
  const errors = [];
  const doc = loadOperatorDecisionsDoc(ROOT);
  const decisions = doc?.decisions ?? [];
  const candidatesPayload = loadPublicJson(ROOT, "regulation-review-candidates.json");
  const candidateIds = new Set(
    (candidatesPayload?.candidates ?? []).map((c) => c.candidate_id),
  );
  const seenDecisionIds = new Set();

  scanForbidden(doc, "operator-review-decisions", errors);

  for (const [i, raw] of decisions.entries()) {
    const ctx = `decision[${i}]`;
    const decision = raw ?? {};

    if (!decision.decision_id) errors.push(`${ctx}: missing decision_id`);
    else if (seenDecisionIds.has(decision.decision_id)) {
      errors.push(`${ctx}: duplicate decision_id ${decision.decision_id}`);
    } else seenDecisionIds.add(decision.decision_id);

    if (!decision.candidate_id) errors.push(`${ctx}: missing candidate_id`);
    else if (candidateIds.size > 0 && !candidateIds.has(decision.candidate_id)) {
      errors.push(`${ctx}: unknown candidate_id ${decision.candidate_id}`);
    }

    if (!decision.decision) errors.push(`${ctx}: missing decision`);
    else if (!SUPPORTED_DECISIONS.has(decision.decision)) {
      errors.push(`${ctx}: unsupported decision ${decision.decision}`);
    }

    if (!decision.reviewer_label) {
      errors.push(`${ctx}: missing reviewer_label`);
    } else if (EMAIL_PATTERN.test(decision.reviewer_label)) {
      errors.push(`${ctx}: reviewer_label must not contain personal email`);
    }

    if (!decision.decided_at) errors.push(`${ctx}: missing decided_at`);
    if (!decision.rationale) errors.push(`${ctx}: missing rationale`);

    const visibility = decision.public_visibility ?? "internal_summary_only";
    if (!VALID_PUBLIC_VISIBILITY.has(visibility)) {
      errors.push(`${ctx}: invalid public_visibility ${visibility}`);
    }

    const gates = normalizeGateOverrides(decision.gate_overrides);
    for (const key of GATE_KEYS) {
      if (gates[key] === true) {
        errors.push(`${ctx}: gate ${key} must not be true`);
      }
    }

    if (decisionRequiresSourceUrl(decision.decision)) {
      const url = decision.source_checked_url;
      if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
        errors.push(
          `${ctx}: source_checked_url required for ${decision.decision}`,
        );
      }
    }

    for (const field of ["public_note", "rationale", "safety_notes"]) {
      const text = decision[field];
      if (containsLegalAdvice(text)) {
        errors.push(`${ctx}: ${field} must not contain legal advice claims`);
      }
    }

    if (decision.decision === "accept_for_tracking") {
      const combined = [
        decision.public_note,
        decision.rationale,
        decision.safety_notes,
      ]
        .filter(Boolean)
        .join(" ");
      if (claimsLegalVerification(combined)) {
        errors.push(
          `${ctx}: accept_for_tracking must not claim legal verification`,
        );
      }
    }
  }

  if (errors.length) {
    console.error("FAIL: validate-operator-decisions");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log(
    `PASS: validate-operator-decisions (${decisions.length} decision(s))`,
  );
}

main();
