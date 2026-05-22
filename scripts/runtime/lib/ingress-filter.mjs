/**
 * T084 — Ingress signal filtering at export/ingestion (metadata only).
 */
import { loadMonitoringPilotRegistry } from "./monitoring-pilot-registry.mjs";
import { getRulesVersion } from "./signal-quality.mjs";

export const VALID_INGRESS_DECISIONS = new Set([
  "candidate_review_now",
  "candidate_manual_later",
  "candidate_source_check",
  "suppress_noise",
  "suppress_duplicate",
]);

const SUPPRESSED_DECISIONS = new Set(["suppress_noise", "suppress_duplicate"]);

export function isSuppressedIngress(ingressDecision) {
  return SUPPRESSED_DECISIONS.has(ingressDecision);
}

export function isOperatorVisibleIngress(ingressDecision) {
  return !isSuppressedIngress(ingressDecision);
}

function sourceConfigFor(card, registryByKey) {
  return registryByKey.get(card.source_key) ?? null;
}

function topicBlocked(card, source) {
  const blocklist = source?.topic_blocklist ?? [];
  if (!blocklist.length) return false;
  const tags = card.topic_tags ?? [];
  return tags.some((t) => blocklist.includes(t));
}

function belowSourceThreshold(card, source) {
  const threshold = source?.default_signal_threshold;
  if (threshold == null) return false;
  return (card.signal_score ?? 0) < threshold;
}

/**
 * Map signal + source policy to ingress decision (operator decisions override suppression).
 */
export function resolveIngressDecision(card, source = null) {
  if (card.operator_decision) {
    if (card.review_status === "dismissed") {
      return {
        ingress_decision: "candidate_manual_later",
        suppression_reason: null,
        ingress_note: "Operator dismissed — retained in full export, hidden from default queue.",
      };
    }
    if (
      card.review_status === "needs_source_check" ||
      card.recommended_operator_action === "source_check"
    ) {
      return {
        ingress_decision: "candidate_source_check",
        suppression_reason: null,
        ingress_note: "Operator or signal routed to source check.",
      };
    }
    if (card.priority === "high" || card.recommended_operator_action === "review_now") {
      return {
        ingress_decision: "candidate_review_now",
        suppression_reason: null,
        ingress_note: "Operator decision keeps item in active review queue.",
      };
    }
    return {
      ingress_decision: "candidate_manual_later",
      suppression_reason: null,
      ingress_note: "Operator decision applied; manual follow-up.",
    };
  }

  if (
    card.signal_category === "duplicate_or_near_duplicate" ||
    (card.reason_codes ?? []).includes("duplicate_title")
  ) {
    return {
      ingress_decision: "suppress_duplicate",
      suppression_reason: "duplicate_title",
      ingress_note: "Near-duplicate title suppressed from default operator queue.",
    };
  }

  if (topicBlocked(card, source)) {
    return {
      ingress_decision: "suppress_noise",
      suppression_reason: "topic_blocklist",
      ingress_note: "Source topic blocklist — metadata retained.",
    };
  }

  if (
    card.ai_regulation_relevance === "noise" ||
    card.recommended_operator_action === "dismiss_as_noise"
  ) {
    const reason =
      (card.reason_codes ?? []).find((c) =>
        ["contains_newsletter", "contains_event", "weak_ai_signal", "duplicate_title"].includes(
          c,
        ),
      ) ?? "low_ai_relevance";
    return {
      ingress_decision: "suppress_noise",
      suppression_reason: reason,
      ingress_note: "Ingress noise filter — not shown in default review cards.",
    };
  }

  if (belowSourceThreshold(card, source)) {
    return {
      ingress_decision: "suppress_noise",
      suppression_reason: "below_source_signal_threshold",
      ingress_note: "Below per-source default_signal_threshold.",
    };
  }

  if (card.recommended_operator_action === "review_now") {
    return {
      ingress_decision: "candidate_review_now",
      suppression_reason: null,
      ingress_note: "High signal — review now.",
    };
  }

  if (card.recommended_operator_action === "source_check") {
    return {
      ingress_decision: "candidate_source_check",
      suppression_reason: null,
      ingress_note: "Elevated signal — verify on official source.",
    };
  }

  if (
    card.recommended_operator_action === "keep_for_monitoring" ||
    card.ai_regulation_relevance === "medium"
  ) {
    return {
      ingress_decision: "candidate_manual_later",
      suppression_reason: null,
      ingress_note: "Monitor or manual review when capacity allows.",
    };
  }

  return {
    ingress_decision: "candidate_manual_later",
    suppression_reason: null,
    ingress_note: "Default ingress path for low-priority metadata signals.",
  };
}

export function applyIngressFilteringToCards(cards, root) {
  const registry = loadMonitoringPilotRegistry();
  const registryByKey = new Map(registry.sources.map((s) => [s.source_key, s]));
  return cards.map((card) => {
    const source = sourceConfigFor(card, registryByKey);
    const ingress = resolveIngressDecision(card, source);
    return {
      ...card,
      ingress_decision: ingress.ingress_decision,
      suppression_reason: ingress.suppression_reason,
      ingress_note: ingress.ingress_note,
      ingress_rules_version: getRulesVersion(root),
    };
  });
}

export function summarizeIngressFiltering(cards) {
  const summary = {
    total_fetched_items: cards.length,
    candidate_review_now_count: 0,
    candidate_manual_later_count: 0,
    candidate_source_check_count: 0,
    suppress_noise_count: 0,
    suppress_duplicate_count: 0,
    operator_visible_count: 0,
    suppressed_count: 0,
  };
  for (const card of cards) {
    const d = card.ingress_decision;
    if (d === "candidate_review_now") summary.candidate_review_now_count += 1;
    else if (d === "candidate_manual_later") summary.candidate_manual_later_count += 1;
    else if (d === "candidate_source_check") summary.candidate_source_check_count += 1;
    else if (d === "suppress_noise") summary.suppress_noise_count += 1;
    else if (d === "suppress_duplicate") summary.suppress_duplicate_count += 1;
    if (isSuppressedIngress(d)) summary.suppressed_count += 1;
    else summary.operator_visible_count += 1;
  }
  return summary;
}

export function buildIngressFilterSummaryExport(root, cards) {
  const registry = loadMonitoringPilotRegistry();
  const automated = registry.sources.filter((s) => s.fetch_mode === "automated_metadata");
  const manual = registry.sources.filter((s) => s.fetch_mode === "manual_review");
  const counts = summarizeIngressFiltering(cards);
  return {
    ...counts,
    automated_source_count: automated.length,
    manual_source_count: manual.length,
    rules_version: getRulesVersion(root),
    gates_closed: true,
    gates: {
      verified_on_source: false,
      client_use_allowed: false,
      client_evidence_allowed: false,
      final_evidence_allowed: false,
      legal_change_claimed: false,
      publication_allowed: false,
      public_export_allowed: false,
    },
    public_note:
      "Aggregated ingress filter counts from deterministic T083/T084 rules. Suppressed items remain in full export metadata only.",
  };
}
