/**
 * T081 / T082 — Shared review queue, source freshness, and operator decision helpers.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { loadMonitoringPilotRegistry } from "./monitoring-pilot-registry.mjs";
import { enrichCardsWithSignalPriority } from "./signal-quality.mjs";
import { applyIngressFilteringToCards } from "./ingress-filter.mjs";

export const CLOSED_GATES = {
  verified_on_source: false,
  client_use_allowed: false,
  client_evidence_allowed: false,
  final_evidence_allowed: false,
  legal_change_claimed: false,
  publication_allowed: false,
  public_export_allowed: false,
};

export const GATE_KEYS = Object.keys(CLOSED_GATES);

export const SUPPORTED_DECISIONS = new Set([
  "keep_review_required",
  "mark_in_review",
  "dismiss_noise",
  "accept_for_tracking",
  "needs_source_check",
  "needs_legal_review",
]);

export const DECISION_TO_REVIEW_STATUS = {
  keep_review_required: "review_required",
  mark_in_review: "in_review",
  dismiss_noise: "dismissed",
  accept_for_tracking: "accepted_for_tracking",
  needs_source_check: "needs_source_check",
  needs_legal_review: "needs_legal_review",
};

export const VALID_REVIEW_STATUS = new Set(Object.values(DECISION_TO_REVIEW_STATUS));

export const VALID_PUBLIC_VISIBILITY = new Set([
  "blocked",
  "internal_summary_only",
  "public_summary_candidate",
]);

const CANDIDATE_STATUS_TO_REVIEW = {
  draft: "review_required",
  pending: "review_required",
  in_review: "in_review",
  dismissed: "dismissed",
  accepted: "accepted_for_tracking",
  needs_source_check: "needs_source_check",
};

const EMAIL_PATTERN = /@[a-z0-9.-]+\.[a-z]{2,}/i;

export function loadPublicJson(root, name) {
  const full = path.join(root, "public/data", name);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

export function loadOperatorDecisionsDoc(root) {
  const file = path.join(root, "data/runtime/operator-review-decisions.yml");
  if (!fs.existsSync(file)) return { decisions: [] };
  return yaml.load(fs.readFileSync(file, "utf8")) ?? { decisions: [] };
}

export function loadOperatorDecisions(root) {
  return loadOperatorDecisionsDoc(root)?.decisions ?? [];
}

export function normalizeGateOverrides(raw) {
  const merged = { ...CLOSED_GATES, ...(raw ?? {}) };
  for (const key of GATE_KEYS) {
    if (merged[key] !== true) merged[key] = false;
  }
  return merged;
}

export function decisionRequiresSourceUrl(decision) {
  return decision === "needs_source_check" || decision === "accept_for_tracking";
}

export function priorityForReviewStatus(reviewStatus, basePriority = "medium") {
  if (reviewStatus === "dismissed") return "low";
  if (
    reviewStatus === "review_required" ||
    reviewStatus === "needs_source_check" ||
    reviewStatus === "needs_legal_review"
  ) {
    return "high";
  }
  if (reviewStatus === "in_review") return "medium";
  if (reviewStatus === "accepted_for_tracking") return "medium";
  return basePriority;
}

export function operatorDecisionExportFields(decision) {
  if (!decision) return null;
  const gates = normalizeGateOverrides(decision.gate_overrides);
  return {
    decision_id: decision.decision_id,
    candidate_id: decision.candidate_id,
    decision: decision.decision,
    reviewer_label: decision.reviewer_label,
    decided_at: decision.decided_at,
    rationale: decision.rationale ?? null,
    public_note: decision.public_note ?? null,
    public_visibility: decision.public_visibility ?? "internal_summary_only",
    source_checked_url: decision.source_checked_url ?? null,
    safety_notes: decision.safety_notes ?? null,
    gates,
    tracking_only:
      decision.decision === "accept_for_tracking"
        ? "Tracking only — not legal verification. Gates remain closed."
        : null,
  };
}

export function applyOperatorDecisionToCard(card, decision) {
  if (!decision) return card;
  const reviewStatus =
    DECISION_TO_REVIEW_STATUS[decision.decision] ?? card.review_status;
  const operator = operatorDecisionExportFields(decision);
  const priority = priorityForReviewStatus(reviewStatus, card.priority);
  const reviewRequired =
    reviewStatus !== "dismissed" && reviewStatus !== "accepted_for_tracking";

  return {
    ...card,
    review_status: reviewStatus,
    priority,
    review_required: reviewRequired,
    operator_decision: operator,
    safety_notes:
      decision.safety_notes ??
      card.safety_notes ??
      "Metadata-only backend signal. Not verified on source. Not legal advice. Gates closed.",
    gates: operator?.gates ?? card.gates,
    legal_change_claimed: false,
  };
}

export function buildDecisionIndex(decisions) {
  const byCandidate = new Map();
  const byDecisionId = new Map();
  for (const decision of decisions) {
    if (decision?.decision_id) byDecisionId.set(decision.decision_id, decision);
    if (decision?.candidate_id) {
      const prev = byCandidate.get(decision.candidate_id);
      const prevAt = prev?.decided_at ? new Date(prev.decided_at).getTime() : 0;
      const nextAt = decision.decided_at
        ? new Date(decision.decided_at).getTime()
        : 0;
      if (!prev || nextAt >= prevAt) byCandidate.set(decision.candidate_id, decision);
    }
  }
  return { byCandidate, byDecisionId };
}

export function summarizeReviewStatuses(cards) {
  const summary = {
    total: cards.length,
    review_required: 0,
    in_review: 0,
    dismissed: 0,
    accepted_for_tracking: 0,
    needs_source_check: 0,
    needs_legal_review: 0,
    high_priority: 0,
    medium_priority: 0,
    low_priority: 0,
    with_operator_decision: 0,
    high_relevance: 0,
    medium_relevance: 0,
    low_relevance: 0,
    noise_relevance: 0,
    dismiss_recommended: 0,
    review_now_recommended: 0,
  };
  for (const card of cards) {
    const status = card.review_status;
    if (summary[status] != null) summary[status] += 1;
    if (card.priority === "high") summary.high_priority += 1;
    else if (card.priority === "medium") summary.medium_priority += 1;
    else if (card.priority === "low") summary.low_priority += 1;
    if (card.operator_decision) summary.with_operator_decision += 1;
    if (card.ai_regulation_relevance === "high") summary.high_relevance += 1;
    else if (card.ai_regulation_relevance === "medium") summary.medium_relevance += 1;
    else if (card.ai_regulation_relevance === "low") summary.low_relevance += 1;
    else if (card.ai_regulation_relevance === "noise") summary.noise_relevance += 1;
    if (card.recommended_operator_action === "dismiss_as_noise") {
      summary.dismiss_recommended += 1;
    }
    if (card.recommended_operator_action === "review_now") {
      summary.review_now_recommended += 1;
    }
  }
  return summary;
}

export function mapCandidateToCard(candidate, registryByKey, detectedById) {
  const sourceKey =
    detectedById?.get(candidate.detected_change_id)?.source_key ?? null;
  const regSource = sourceKey ? registryByKey.get(sourceKey) : null;
  const jurisdictionId = candidate.jurisdiction_ids?.[0] ?? "unknown";
  const reviewStatus =
    CANDIDATE_STATUS_TO_REVIEW[candidate.candidate_status] ?? "review_required";
  const priority = priorityForReviewStatus(reviewStatus);

  return {
    candidate_id: candidate.candidate_id,
    source_key: sourceKey ?? regSource?.source_key ?? "unknown",
    source_title: regSource?.source_name ?? sourceKey ?? "Unknown source",
    source_url: candidate.source_url ?? regSource?.official_url ?? null,
    jurisdiction_id: jurisdictionId,
    topic_tags: candidate.topic_ids ?? [],
    detected_at:
      detectedById?.get(candidate.detected_change_id)?.detected_at ??
      candidate.created_at ??
      null,
    change_type:
      detectedById?.get(candidate.detected_change_id)?.change_type ??
      "metadata_signal",
    title: candidate.proposed_title ?? "Untitled metadata signal",
    metadata_summary: candidate.proposed_summary ?? null,
    review_status: reviewStatus,
    priority,
    safety_notes:
      "Metadata-only backend signal. Not verified on source. Not legal advice. Gates closed.",
    gates: { ...CLOSED_GATES },
    review_required: true,
    legal_change_claimed: false,
    operator_decision: null,
  };
}

export function buildReviewQueueCards(root) {
  const registry = loadMonitoringPilotRegistry();
  const registryByKey = new Map(
    registry.sources.map((s) => [s.source_key, s]),
  );
  const candidatesPayload = loadPublicJson(root, "regulation-review-candidates.json");
  const changesPayload = loadPublicJson(root, "regulation-detected-changes.json");
  const detectedById = new Map(
    (changesPayload?.changes ?? []).map((c) => [c.change_id, c]),
  );
  const candidates = candidatesPayload?.candidates ?? [];
  const baseCards = candidates.map((c) =>
    mapCandidateToCard(c, registryByKey, detectedById),
  );
  const { byCandidate } = buildDecisionIndex(loadOperatorDecisions(root));
  const withDecisions = baseCards.map((card) =>
    applyOperatorDecisionToCard(card, byCandidate.get(card.candidate_id)),
  );
  const withSignal = enrichCardsWithSignalPriority(withDecisions, root);
  return applyIngressFilteringToCards(withSignal, root);
}

function daysSince(iso) {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export function freshnessStatusForSource(source, latestRun, reviewCount) {
  if (source.fetch_mode !== "automated_metadata") {
    return reviewCount > 0 ? "manual_review_needed" : "not_automated";
  }
  if (!latestRun) return reviewCount > 0 ? "aging" : "stale";
  if (latestRun.status && latestRun.status !== "completed") {
    return "stale";
  }
  const age = daysSince(latestRun.completed_at ?? latestRun.started_at);
  if (age == null) return "aging";
  if (age <= 7) return "fresh";
  if (age <= 30) return "aging";
  return "stale";
}

const ACTIVE_REVIEW_STATUSES = new Set([
  "review_required",
  "in_review",
  "needs_source_check",
  "needs_legal_review",
]);

export function buildSourceFreshnessRows(root) {
  const registry = loadMonitoringPilotRegistry();
  const runsPayload = loadPublicJson(root, "regulation-source-runs.json");
  const queueCards = buildReviewQueueCards(root);
  const reviewBySource = new Map();
  for (const card of queueCards) {
    if (ACTIVE_REVIEW_STATUSES.has(card.review_status)) {
      reviewBySource.set(
        card.source_key,
        (reviewBySource.get(card.source_key) ?? 0) + 1,
      );
    }
  }

  const latestRunBySource = new Map();
  for (const run of runsPayload?.runs ?? []) {
    const prev = latestRunBySource.get(run.source_key);
    const at = run.completed_at ?? run.started_at;
    const prevAt = prev?.completed_at ?? prev?.started_at;
    if (!prev || (at && (!prevAt || at > prevAt))) {
      latestRunBySource.set(run.source_key, run);
    }
  }

  return registry.sources.map((source) => {
    const latestRun = latestRunBySource.get(source.source_key) ?? null;
    const reviewRequiredCount = reviewBySource.get(source.source_key) ?? 0;
    const automated = source.fetch_mode === "automated_metadata";
    return {
      source_key: source.source_key,
      source_title: source.source_name,
      source_url: source.official_url,
      jurisdiction_ids: source.jurisdiction_ids ?? [],
      automation_mode: source.automation_mode ?? (automated ? "automated_rss" : "manual_review"),
      fetch_risk: source.fetch_risk ?? "low",
      feed_url: source.feed_url ?? source.endpoint_url ?? null,
      latest_run_at: latestRun?.completed_at ?? latestRun?.started_at ?? null,
      latest_item_at: null,
      freshness_status: freshnessStatusForSource(
        source,
        latestRun,
        reviewRequiredCount,
      ),
      automated,
      last_error:
        latestRun?.status && latestRun.status !== "completed"
          ? `Last run status: ${latestRun.status}`
          : null,
      review_required_count: reviewRequiredCount,
      schedule_enabled: source.schedule_enabled === true,
      gates: { ...CLOSED_GATES },
    };
  });
}

export function jurisdictionReviewState(root) {
  const cards = buildReviewQueueCards(root);
  const freshness = buildSourceFreshnessRows(root);
  const byJurisdiction = new Map();

  for (const card of cards) {
    const jid = card.jurisdiction_id;
    if (!byJurisdiction.has(jid)) {
      byJurisdiction.set(jid, {
        jurisdiction_id: jid,
        pending_review_count: 0,
        high_priority_count: 0,
        stale_source_count: 0,
        fresh_automated_count: 0,
        manual_review_only_count: 0,
        accepted_for_tracking_count: 0,
        dismissed_count: 0,
        needs_source_check_count: 0,
        needs_legal_review_count: 0,
        in_review_count: 0,
        review_state: "ok",
      });
    }
    const row = byJurisdiction.get(jid);
    if (ACTIVE_REVIEW_STATUSES.has(card.review_status)) {
      row.pending_review_count += 1;
      if (card.priority === "high") row.high_priority_count += 1;
    }
    if (card.review_status === "in_review") row.in_review_count += 1;
    if (card.review_status === "accepted_for_tracking") {
      row.accepted_for_tracking_count += 1;
    }
    if (card.review_status === "dismissed") row.dismissed_count += 1;
    if (card.review_status === "needs_source_check") {
      row.needs_source_check_count += 1;
    }
    if (card.review_status === "needs_legal_review") {
      row.needs_legal_review_count += 1;
    }
  }

  for (const src of freshness) {
    for (const jid of src.jurisdiction_ids) {
      if (!byJurisdiction.has(jid)) {
        byJurisdiction.set(jid, {
          jurisdiction_id: jid,
          pending_review_count: 0,
          high_priority_count: 0,
          stale_source_count: 0,
          fresh_automated_count: 0,
          manual_review_only_count: 0,
          accepted_for_tracking_count: 0,
          dismissed_count: 0,
          needs_source_check_count: 0,
          needs_legal_review_count: 0,
          in_review_count: 0,
          review_state: "ok",
        });
      }
      const row = byJurisdiction.get(jid);
      if (src.freshness_status === "stale" || src.freshness_status === "aging") {
        row.stale_source_count += 1;
      }
      if (src.freshness_status === "fresh") row.fresh_automated_count += 1;
      if (
        src.freshness_status === "manual_review_needed" ||
        src.freshness_status === "not_automated"
      ) {
        row.manual_review_only_count += 1;
      }
    }
  }

  for (const row of byJurisdiction.values()) {
    if (row.pending_review_count > 0) row.review_state = "pending_review";
    else if (row.accepted_for_tracking_count > 0) {
      row.review_state = "tracking_active";
    } else if (row.stale_source_count > 0) row.review_state = "stale_sources";
    else if (row.manual_review_only_count > 0 && row.fresh_automated_count === 0) {
      row.review_state = "manual_review_only";
    } else row.review_state = "fresh_coverage";
  }

  return [...byJurisdiction.values()];
}
