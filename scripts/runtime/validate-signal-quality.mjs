#!/usr/bin/env node
/**
 * T083 — Validate signal quality fields on review queue and summary exports.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion } from "../lib/read-project-version.mjs";
import {
  VALID_RELEVANCE,
  VALID_CATEGORIES,
  VALID_RECOMMENDED_ACTIONS,
  loadSignalQualityRules,
} from "./lib/signal-quality.mjs";
import { CLOSED_GATES, GATE_KEYS } from "./lib/review-queue-lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC_DATA = path.join(ROOT, "public/data");

const GATE_KEYS_LIST = GATE_KEYS ?? Object.keys(CLOSED_GATES);
const FORBIDDEN_LEGAL_CLAIMS = [
  "verified legal change",
  "legal change confirmed",
  "binding legal obligation",
];

function readJson(name) {
  const full = path.join(PUBLIC_DATA, name);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function main() {
  const errors = [];
  const version = readProjectVersion();

  let rules;
  try {
    rules = loadSignalQualityRules(ROOT);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "signal rules load failed");
    rules = null;
  }

  const queue = readJson("regulation-review-queue.json");
  const signalSummary = readJson("signal-quality-summary.json");

  if (!queue) errors.push("missing regulation-review-queue.json");
  if (!signalSummary) errors.push("missing signal-quality-summary.json");

  if (signalSummary) {
    if (signalSummary.gates_closed !== true) {
      errors.push("signal-quality-summary gates_closed must be true");
    }
    for (const key of GATE_KEYS_LIST) {
      if (signalSummary.gates?.[key] === true) {
        errors.push(`signal-quality-summary gate ${key} must not be true`);
      }
    }
    if (
      signalSummary.product_version &&
      signalSummary.product_version !== version
    ) {
      errors.push(
        `signal-quality-summary product_version ${signalSummary.product_version} != ${version}`,
      );
    }
  }

  const cards = queue?.cards ?? [];
  const summaryCounts = signalSummary ?? {};

  const countFields = [
    ["total_candidates", cards.length],
    ["high_relevance_count", cards.filter((c) => c.ai_regulation_relevance === "high").length],
    ["medium_relevance_count", cards.filter((c) => c.ai_regulation_relevance === "medium").length],
    ["low_relevance_count", cards.filter((c) => c.ai_regulation_relevance === "low").length],
    ["noise_count", cards.filter((c) => c.ai_regulation_relevance === "noise").length],
    [
      "review_now_count",
      cards.filter((c) => c.recommended_operator_action === "review_now").length,
    ],
    [
      "source_check_count",
      cards.filter((c) => c.recommended_operator_action === "source_check").length,
    ],
    [
      "keep_for_monitoring_count",
      cards.filter((c) => c.recommended_operator_action === "keep_for_monitoring").length,
    ],
    [
      "dismiss_recommended_count",
      cards.filter((c) => c.recommended_operator_action === "dismiss_as_noise").length,
    ],
  ];

  for (const [field, expected] of countFields) {
    if (summaryCounts[field] != null && summaryCounts[field] !== expected) {
      errors.push(
        `signal-quality-summary.${field} (${summaryCounts[field]}) != queue (${expected})`,
      );
    }
  }

  if (queue?.signal_quality_rules_version && rules) {
    if (queue.signal_quality_rules_version !== rules.rules_version) {
      errors.push("queue signal_quality_rules_version != rules file");
    }
  }

  let highPriorityWithoutSignal = 0;
  let noiseAsHighPriority = 0;

  for (const card of cards) {
    const ctx = `card ${card.candidate_id}`;

    if (card.signal_score == null || card.signal_score < 0 || card.signal_score > 100) {
      errors.push(`${ctx}: signal_score must be 0–100`);
    }
    if (!VALID_RELEVANCE.has(card.ai_regulation_relevance)) {
      errors.push(`${ctx}: invalid ai_regulation_relevance ${card.ai_regulation_relevance}`);
    }
    if (!VALID_CATEGORIES.has(card.signal_category)) {
      errors.push(`${ctx}: invalid signal_category ${card.signal_category}`);
    }
    if (!VALID_RECOMMENDED_ACTIONS.has(card.recommended_operator_action)) {
      errors.push(
        `${ctx}: invalid recommended_operator_action ${card.recommended_operator_action}`,
      );
    }
    if (!Array.isArray(card.reason_codes) || card.reason_codes.length === 0) {
      errors.push(`${ctx}: missing reason_codes`);
    }

    const blob = JSON.stringify(card).toLowerCase();
    for (const phrase of FORBIDDEN_LEGAL_CLAIMS) {
      if (blob.includes(phrase)) {
        errors.push(`${ctx}: presents forbidden legal claim phrase`);
      }
    }

    if (
      card.ai_regulation_relevance === "noise" &&
      (card.signal_category === "binding_law_or_regulation" ||
        card.legal_change_claimed === true)
    ) {
      errors.push(`${ctx}: noise item presented as legal/regulatory change`);
    }

    if (card.priority === "high" && !card.operator_decision) {
      if (
        card.ai_regulation_relevance === "noise" ||
        card.recommended_operator_action === "dismiss_as_noise"
      ) {
        noiseAsHighPriority += 1;
      }
      if (
        (card.signal_score ?? 0) < 50 &&
        card.ai_regulation_relevance !== "high"
      ) {
        highPriorityWithoutSignal += 1;
      }
    }
  }

  if (cards.length > 0) {
    const allHigh =
      cards.filter((c) => c.priority === "high" && !c.operator_decision).length ===
      cards.filter((c) => !c.operator_decision).length;
    const hasVariety =
      cards.some((c) => c.priority === "low" || c.priority === "medium") ||
      cards.some((c) => c.ai_regulation_relevance === "noise") ||
      cards.some((c) => c.recommended_operator_action === "dismiss_as_noise");
    if (allHigh && !hasVariety) {
      errors.push(
        "all non-operator candidates are high priority without signal variety — scoring may be broken",
      );
    }
    if (noiseAsHighPriority > 0) {
      errors.push(
        `${noiseAsHighPriority} noise/dismiss-recommended card(s) still high priority without operator override`,
      );
    }
  }

  if (errors.length) {
    console.error("FAIL: validate-signal-quality");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }
  console.log(
    `PASS: validate-signal-quality (${cards.length} cards, rules ${rules?.rules_version ?? "—"})`,
  );
}

main();
