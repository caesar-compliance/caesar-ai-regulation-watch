#!/usr/bin/env node
/**
 * T084 — Validate ingress filtering on queue and summary exports.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion } from "../lib/read-project-version.mjs";
import { loadMonitoringPilotRegistry } from "./lib/monitoring-pilot-registry.mjs";
import {
  VALID_INGRESS_DECISIONS,
  isSuppressedIngress,
} from "./lib/ingress-filter.mjs";
import { loadSignalQualityRules } from "./lib/signal-quality.mjs";
import { CLOSED_GATES, GATE_KEYS } from "./lib/review-queue-lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC_DATA = path.join(ROOT, "public/data");

function readJson(name) {
  const full = path.join(PUBLIC_DATA, name);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function main() {
  const errors = [];
  const version = readProjectVersion();
  const registry = loadMonitoringPilotRegistry();
  const rules = loadSignalQualityRules(ROOT);
  const queue = readJson("regulation-review-queue.json");
  const ingressSummary = readJson("ingress-filter-summary.json");
  const signalSummary = readJson("signal-quality-summary.json");

  if (!queue) errors.push("missing regulation-review-queue.json");
  if (!ingressSummary) errors.push("missing ingress-filter-summary.json");

  if (ingressSummary) {
    if (ingressSummary.gates_closed !== true) {
      errors.push("ingress-filter-summary gates_closed must be true");
    }
    for (const key of GATE_KEYS) {
      if (ingressSummary.gates?.[key] === true) {
        errors.push(`ingress-filter-summary gate ${key} must not be true`);
      }
    }
    if (ingressSummary.product_version && ingressSummary.product_version !== version) {
      errors.push(`ingress-filter-summary product_version != ${version}`);
    }
    if (ingressSummary.scheduled_monitoring_enabled === true) {
      errors.push("ingress-filter-summary scheduled_monitoring_enabled must be false");
    }
    if (ingressSummary.cron_enabled === true) {
      errors.push("ingress-filter-summary cron_enabled must be false");
    }
    if (
      ingressSummary.rules_version &&
      rules?.rules_version &&
      ingressSummary.rules_version !== rules.rules_version
    ) {
      errors.push("ingress-filter-summary rules_version != signal-quality-rules");
    }
    const autoRegistry = registry.sources.filter(
      (s) => s.fetch_mode === "automated_metadata",
    ).length;
    if (
      ingressSummary.automated_source_count != null &&
      ingressSummary.automated_source_count !== autoRegistry
    ) {
      errors.push(
        `automated_source_count (${ingressSummary.automated_source_count}) != registry (${autoRegistry})`,
      );
    }
  }

  const cards = queue?.cards ?? [];
  const visible = queue?.operator_queue_cards ?? cards.filter((c) => !isSuppressedIngress(c.ingress_decision));

  for (const source of registry.sources ?? []) {
    if (source.fetch_mode === "automated_metadata") {
      if (!source.feed_url && !source.endpoint_url) {
        errors.push(`${source.source_key}: automated source missing feed_url/endpoint_url`);
      }
      if (source.fetch_risk === "high") {
        errors.push(`${source.source_key}: automated source must not have fetch_risk high`);
      }
      if (source.schedule_enabled === true) {
        errors.push(`${source.source_key}: schedule_enabled must be false`);
      }
    }
  }

  const ingressCounts = {
    candidate_review_now_count: 0,
    candidate_manual_later_count: 0,
    candidate_source_check_count: 0,
    suppress_noise_count: 0,
    suppress_duplicate_count: 0,
  };

  for (const card of cards) {
    const ctx = `card ${card.candidate_id}`;
    if (card.signal_score == null) errors.push(`${ctx}: missing signal_score`);
    if (!card.ai_regulation_relevance) errors.push(`${ctx}: missing ai_regulation_relevance`);
    if (!card.ingress_decision) {
      errors.push(`${ctx}: missing ingress_decision`);
    } else if (!VALID_INGRESS_DECISIONS.has(card.ingress_decision)) {
      errors.push(`${ctx}: unknown ingress_decision ${card.ingress_decision}`);
    }
    if (isSuppressedIngress(card.ingress_decision) && !card.suppression_reason) {
      errors.push(`${ctx}: suppression_reason required when suppressed`);
    }
    if (ingressCounts[`${card.ingress_decision}_count`] != null) {
      /* noop — keys differ */
    }
    if (card.ingress_decision === "candidate_review_now") {
      ingressCounts.candidate_review_now_count += 1;
    } else if (card.ingress_decision === "candidate_manual_later") {
      ingressCounts.candidate_manual_later_count += 1;
    } else if (card.ingress_decision === "candidate_source_check") {
      ingressCounts.candidate_source_check_count += 1;
    } else if (card.ingress_decision === "suppress_noise") {
      ingressCounts.suppress_noise_count += 1;
    } else if (card.ingress_decision === "suppress_duplicate") {
      ingressCounts.suppress_duplicate_count += 1;
    }
  }

  if (ingressSummary) {
    for (const [field, counted] of Object.entries(ingressCounts)) {
      if (ingressSummary[field] != null && ingressSummary[field] !== counted) {
        errors.push(`ingress-filter-summary.${field} (${ingressSummary[field]}) != cards (${counted})`);
      }
    }
    const visibleExpected =
      ingressCounts.candidate_review_now_count +
      ingressCounts.candidate_manual_later_count +
      ingressCounts.candidate_source_check_count;
    if (
      ingressSummary.operator_visible_count != null &&
      ingressSummary.operator_visible_count !== visibleExpected
    ) {
      errors.push(
        `operator_visible_count (${ingressSummary.operator_visible_count}) != visible ingress (${visibleExpected})`,
      );
    }
    const suppressedExpected =
      ingressCounts.suppress_noise_count + ingressCounts.suppress_duplicate_count;
    if (
      ingressSummary.suppressed_count != null &&
      ingressSummary.suppressed_count !== suppressedExpected
    ) {
      errors.push(
        `suppressed_count (${ingressSummary.suppressed_count}) != suppressed ingress (${suppressedExpected})`,
      );
    }
  }

  if (signalSummary && ingressSummary) {
    const totalIngress = ingressSummary.total_fetched_items ?? cards.length;
    if (totalIngress !== cards.length) {
      errors.push(`total_fetched_items (${totalIngress}) != queue cards (${cards.length})`);
    }
    if (
      signalSummary.total_candidates != null &&
      signalSummary.total_candidates !== cards.length
    ) {
      errors.push("signal-quality total_candidates diverges from queue card count");
    }
  }

  if (visible.length === 0 && cards.length > 0) {
    errors.push("operator_queue_cards empty but cards exist");
  }

  for (const card of visible) {
    if (isSuppressedIngress(card.ingress_decision)) {
      errors.push(`operator_queue_cards includes suppressed ${card.candidate_id}`);
    }
  }

  if (queue?.scheduled_monitoring_enabled === true) {
    errors.push("regulation-review-queue scheduled_monitoring_enabled must be false");
  }

  if (errors.length) {
    console.error("FAIL: validate-ingress-filtering");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }
  console.log(
    `PASS: validate-ingress-filtering (${cards.length} cards, ${visible.length} visible, ${ingressSummary?.suppressed_count ?? 0} suppressed)`,
  );
}

main();
