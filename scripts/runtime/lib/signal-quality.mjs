/**
 * T083 — Deterministic signal quality scoring for regulation review candidates.
 * Metadata only — not legal verification.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export const VALID_RELEVANCE = new Set(["high", "medium", "low", "noise"]);
export const VALID_CATEGORIES = new Set([
  "binding_law_or_regulation",
  "regulator_guidance",
  "enforcement_or_supervisory_action",
  "consultation_or_proposal",
  "standards_or_framework",
  "official_news",
  "generic_privacy_item",
  "newsletter_or_event",
  "duplicate_or_near_duplicate",
  "unknown",
]);
export const VALID_RECOMMENDED_ACTIONS = new Set([
  "review_now",
  "source_check",
  "keep_for_monitoring",
  "dismiss_as_noise",
  "manual_review_later",
]);

const SIGNAL_DISCLAIMER =
  "Metadata signal score only — not legal verification. Operator decision overrides automated recommendation.";

let cachedRules = null;

export function loadSignalQualityRules(root) {
  if (cachedRules) return cachedRules;
  const file = path.join(root, "data/runtime/signal-quality-rules.yml");
  if (!fs.existsSync(file)) {
    throw new Error("missing data/runtime/signal-quality-rules.yml");
  }
  cachedRules = yaml.load(fs.readFileSync(file, "utf8"));
  return cachedRules;
}

export function getRulesVersion(root) {
  const rules = loadSignalQualityRules(root);
  return rules.rules_version ?? "unknown";
}

function normalizeText(text) {
  return (text ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textBlob(card) {
  return normalizeText(
    [card.title, card.metadata_summary, card.source_url, card.source_key]
      .filter(Boolean)
      .join(" "),
  );
}

function matchesPattern(blob, pattern) {
  const p = normalizeText(pattern);
  if (!p) return false;
  if (p === "ai" || p === "gpa") {
    return new RegExp(`\\b${p}\\b`, "i").test(blob);
  }
  if (p.startsWith(" ") || p.endsWith(" ")) {
    return blob.includes(p.trim()) || blob.includes(p);
  }
  if (p.length <= 4) {
    return new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(blob);
  }
  return blob.includes(p);
}

function normalizeGroups(groups) {
  if (!groups) return [];
  if (Array.isArray(groups)) return groups;
  return Object.entries(groups).map(([key, value]) => ({
    group_id: key,
    ...(typeof value === "object" ? value : {}),
  }));
}

function scoreKeywordGroups(blob, groups, hits) {
  let score = 0;
  for (const group of normalizeGroups(groups)) {
    const matched = (group.patterns ?? []).some((pat) => matchesPattern(blob, pat));
    if (!matched) continue;
    if (group.requires_any?.length) {
      const anyOk = group.requires_any.some((pat) => matchesPattern(blob, pat));
      if (!anyOk) continue;
    }
    score += group.weight ?? 0;
    if (group.reason_code && !hits.includes(group.reason_code)) {
      hits.push(group.reason_code);
    }
  }
  return score;
}

function applySourceWeight(score, card, rules, hits) {
  const sw = rules.source_weights?.[card.source_key];
  if (!sw) return score;
  let s = score + (sw.weight_adjust ?? 0);
  if (sw.noise_bias && hits.includes("contains_newsletter")) {
    s -= 5;
  }
  return s;
}

function applyTopicBoost(score, card, rules, hits) {
  let s = score;
  for (const tag of card.topic_tags ?? []) {
    const tm = rules.topic_mappings?.[tag];
    if (tm?.boost) s += tm.boost;
    if (tm?.reason_code && !hits.includes(tm.reason_code)) hits.push(tm.reason_code);
  }
  return s;
}

function hitsIncludeAiAct(hits) {
  return hits?.includes("contains_ai_act") || hits?.includes("contains_artificial_intelligence");
}

function resolveCategory(score, hits, rules) {
  void rules;
  if (hits.includes("duplicate_title")) return "duplicate_or_near_duplicate";
  if (hits.includes("contains_newsletter") || hits.includes("contains_event")) {
    return "newsletter_or_event";
  }
  if (
    hits.includes("privacy_only_signal") &&
    !hits.includes("contains_artificial_intelligence") &&
    !hits.includes("contains_ai_act") &&
    !hits.includes("privacy_mentions_ai")
  ) {
    return "generic_privacy_item";
  }
  if (hits.includes("contains_ai_act") && score >= 70) {
    return "binding_law_or_regulation";
  }
  if (hits.includes("contains_guidance") || hits.includes("contains_opinion")) {
    return "regulator_guidance";
  }
  if (hits.includes("contains_enforcement")) return "enforcement_or_supervisory_action";
  if (hits.includes("contains_consultation")) return "consultation_or_proposal";
  if (hits.includes("contains_standards")) return "standards_or_framework";
  if (hits.includes("non_ai_cybersecurity_signal") && !hitsIncludeAiAct(hits)) {
    return "official_news";
  }
  if (score >= 50 && hitsIncludeAiAct(hits)) return "regulator_guidance";
  if (score >= 30) return "official_news";
  return "unknown";
}

function resolveRelevance(score, category, rules) {
  const th = rules.relevance_thresholds ?? {};
  if (
    category === "newsletter_or_event" ||
    category === "duplicate_or_near_duplicate"
  ) {
    return "noise";
  }
  if (category === "generic_privacy_item" && score < (th.medium_min_score ?? 40)) {
    return score <= (th.noise_max_score ?? 14) ? "noise" : "low";
  }
  if (score >= (th.high_min_score ?? 70)) return "high";
  if (score >= (th.medium_min_score ?? 40)) return "medium";
  if (score <= (th.noise_max_score ?? 14)) return "noise";
  if (score >= (th.low_min_score ?? 15)) return "low";
  return "noise";
}

function resolveRecommendedAction(score, relevance, category, hits, rules) {
  const actionRules = rules.recommended_action_rules ?? {};

  if (
    relevance === "noise" ||
    category === "newsletter_or_event" ||
    category === "duplicate_or_near_duplicate"
  ) {
    return "dismiss_as_noise";
  }

  const reviewNow = actionRules.review_now;
  if (
    reviewNow &&
    score >= (reviewNow.min_score ?? 65) &&
    (reviewNow.relevance ?? []).includes(relevance) &&
    !(reviewNow.exclude_categories ?? []).includes(category)
  ) {
    return "review_now";
  }

  const sourceCheck = actionRules.source_check;
  if (
    sourceCheck &&
    score >= (sourceCheck.min_score ?? 50) &&
    (sourceCheck.include_reason_codes ?? []).some((c) => hits.includes(c))
  ) {
    return "source_check";
  }

  const dismiss = actionRules.dismiss_as_noise;
  if (
    dismiss &&
    score <= (dismiss.max_score ?? 25) &&
    ((dismiss.relevance ?? []).includes(relevance) ||
      (dismiss.include_categories ?? []).includes(category))
  ) {
    return "dismiss_as_noise";
  }

  const keep = actionRules.keep_for_monitoring;
  if (
    keep &&
    score >= (keep.min_score ?? 35) &&
    score <= (keep.max_score ?? 64) &&
    (keep.relevance ?? []).includes(relevance)
  ) {
    return "keep_for_monitoring";
  }

  return "manual_review_later";
}

function priorityFromSignalScore(score, rules, reviewStatus) {
  if (reviewStatus === "dismissed") return "low";
  const th = rules.priority_thresholds ?? {};
  if (score >= (th.high_min_score ?? 65)) return "high";
  if (score >= (th.medium_min_score ?? 35)) return "medium";
  return "low";
}

function buildDedupeIndex(cards) {
  const byNorm = new Map();
  for (const card of cards) {
    const norm = normalizeText(card.title);
    if (!norm) continue;
    if (!byNorm.has(norm)) byNorm.set(norm, []);
    byNorm.get(norm).push(card.candidate_id);
  }
  const duplicateIds = new Set();
  for (const ids of byNorm.values()) {
    if (ids.length > 1) {
      for (const id of ids.slice(1)) duplicateIds.add(id);
    }
  }
  return duplicateIds;
}

export function scoreReviewCard(card, rules, duplicateIds = new Set()) {
  const hits = [];
  const blob = textBlob(card);
  let score = 15;

  score += scoreKeywordGroups(blob, rules.keyword_groups, hits);
  score += scoreKeywordGroups(blob, rules.noise_keyword_groups, hits);
  score = applySourceWeight(score, card, rules, hits);
  score = applyTopicBoost(score, card, rules, hits);

  if (duplicateIds.has(card.candidate_id) && !hits.includes("duplicate_title")) {
    hits.push("duplicate_title");
    score = Math.max(0, score - 25);
  }

  if (
    hits.includes("privacy_only_signal") &&
    !hits.includes("privacy_mentions_ai") &&
    !hitsIncludeAiAct(hits)
  ) {
    if (!hits.includes("weak_ai_signal")) hits.push("weak_ai_signal");
    score = Math.min(score, 35);
  }

  if (hits.includes("non_ai_cybersecurity_signal") && !hitsIncludeAiAct(hits)) {
    score = Math.min(score, 45);
  }

  const sw = rules.source_weights?.[card.source_key];
  if (sw?.default_relevance_cap === "low" && score > 55 && !hitsIncludeAiAct(hits)) {
    score = Math.min(score, 55);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const signal_category = resolveCategory(score, hits, rules);
  const ai_regulation_relevance = resolveRelevance(score, signal_category, rules);
  const recommended_operator_action = resolveRecommendedAction(
    score,
    ai_regulation_relevance,
    signal_category,
    hits,
    rules,
  );

  if (hits.length === 0) hits.push("weak_ai_signal");

  return {
    signal_score: score,
    ai_regulation_relevance,
    signal_category,
    recommended_operator_action,
    reason_codes: [...new Set(hits)],
    signal_quality_note: SIGNAL_DISCLAIMER,
    rules_version: rules.rules_version ?? "unknown",
  };
}

export function applySignalQualityToCards(cards, root) {
  const rules = loadSignalQualityRules(root);
  const duplicateIds = buildDedupeIndex(cards);
  return cards.map((card) => {
    const signal = scoreReviewCard(card, rules, duplicateIds);
    return { ...card, ...signal };
  });
}

export function priorityWithSignal(card, rules) {
  if (card.operator_decision) {
    return priorityForReviewStatusFromOperator(card);
  }
  return priorityFromSignalScore(card.signal_score ?? 0, rules, card.review_status);
}

function priorityForReviewStatusFromOperator(card) {
  const status = card.review_status;
  if (status === "dismissed") return "low";
  if (
    status === "review_required" ||
    status === "needs_source_check" ||
    status === "needs_legal_review"
  ) {
    return "high";
  }
  if (status === "in_review") return "medium";
  if (status === "accepted_for_tracking") return "medium";
  return card.priority ?? "medium";
}

export function enrichCardsWithSignalPriority(cards, root) {
  const rules = loadSignalQualityRules(root);
  const duplicateIds = buildDedupeIndex(cards);
  return cards.map((card) => {
    const signal = scoreReviewCard(card, rules, duplicateIds);
    const priority = card.operator_decision
      ? priorityForReviewStatusFromOperator({ ...card, ...signal })
      : priorityFromSignalScore(signal.signal_score, rules, card.review_status);
    return {
      ...card,
      ...signal,
      priority,
      signal_priority_source: card.operator_decision
        ? "operator_decision"
        : "signal_score",
    };
  });
}

export function summarizeSignalQuality(cards) {
  const summary = {
    total_candidates: cards.length,
    high_relevance_count: 0,
    medium_relevance_count: 0,
    low_relevance_count: 0,
    noise_count: 0,
    review_now_count: 0,
    source_check_count: 0,
    keep_for_monitoring_count: 0,
    dismiss_recommended_count: 0,
    manual_review_later_count: 0,
    high_priority_count: 0,
    medium_priority_count: 0,
    low_priority_count: 0,
  };
  for (const card of cards) {
    if (card.ai_regulation_relevance === "high") summary.high_relevance_count += 1;
    else if (card.ai_regulation_relevance === "medium") summary.medium_relevance_count += 1;
    else if (card.ai_regulation_relevance === "low") summary.low_relevance_count += 1;
    else if (card.ai_regulation_relevance === "noise") summary.noise_count += 1;

    if (card.recommended_operator_action === "review_now") {
      summary.review_now_count += 1;
    } else if (card.recommended_operator_action === "source_check") {
      summary.source_check_count += 1;
    } else if (card.recommended_operator_action === "keep_for_monitoring") {
      summary.keep_for_monitoring_count += 1;
    } else if (card.recommended_operator_action === "dismiss_as_noise") {
      summary.dismiss_recommended_count += 1;
    } else if (card.recommended_operator_action === "manual_review_later") {
      summary.manual_review_later_count += 1;
    }

    if (card.priority === "high") summary.high_priority_count += 1;
    else if (card.priority === "medium") summary.medium_priority_count += 1;
    else if (card.priority === "low") summary.low_priority_count += 1;
  }
  return summary;
}

export function buildSignalQualitySummaryExport(root, cards) {
  const rules = loadSignalQualityRules(root);
  const counts = summarizeSignalQuality(cards);
  return {
    ...counts,
    rules_version: rules.rules_version ?? "unknown",
    signal_quality_rules_id: rules.signal_quality_rules_id ?? null,
    generated_at: new Date().toISOString(),
    gates_closed: true,
    public_note:
      "Aggregated signal-quality metadata from deterministic rules. Not legal verification.",
    gates: {
      verified_on_source: false,
      client_use_allowed: false,
      client_evidence_allowed: false,
      final_evidence_allowed: false,
      legal_change_claimed: false,
      publication_allowed: false,
      public_export_allowed: false,
    },
  };
}
