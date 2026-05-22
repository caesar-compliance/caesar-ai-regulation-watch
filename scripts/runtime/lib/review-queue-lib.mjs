/**
 * T081 — Shared review queue, source freshness, and operator decision helpers.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { loadMonitoringPilotRegistry } from "./monitoring-pilot-registry.mjs";

export const CLOSED_GATES = {
  verified_on_source: false,
  client_use_allowed: false,
  client_evidence_allowed: false,
  final_evidence_allowed: false,
  legal_change_claimed: false,
  publication_allowed: false,
  public_export_allowed: false,
};

const CANDIDATE_STATUS_TO_REVIEW = {
  draft: "review_required",
  pending: "review_required",
  in_review: "in_review",
  dismissed: "dismissed",
  accepted: "accepted_for_tracking",
  needs_source_check: "needs_source_check",
};

export function loadPublicJson(root, name) {
  const full = path.join(root, "public/data", name);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

export function loadOperatorDecisions(root) {
  const file = path.join(root, "data/runtime/operator-review-decisions.yml");
  if (!fs.existsSync(file)) return [];
  const doc = yaml.load(fs.readFileSync(file, "utf8"));
  return doc?.decisions ?? [];
}

export function mapCandidateToCard(candidate, registryByKey, detectedById) {
  const sourceKey =
    detectedById?.get(candidate.detected_change_id)?.source_key ?? null;
  const regSource = sourceKey ? registryByKey.get(sourceKey) : null;
  const jurisdictionId = candidate.jurisdiction_ids?.[0] ?? "unknown";
  const reviewStatus =
    CANDIDATE_STATUS_TO_REVIEW[candidate.candidate_status] ?? "review_required";
  const priority =
    reviewStatus === "review_required" && candidate.review_required !== false
      ? "high"
      : reviewStatus === "needs_source_check"
        ? "high"
        : "medium";

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
  return candidates.map((c) =>
    mapCandidateToCard(c, registryByKey, detectedById),
  );
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

export function buildSourceFreshnessRows(root) {
  const registry = loadMonitoringPilotRegistry();
  const runsPayload = loadPublicJson(root, "regulation-source-runs.json");
  const queueCards = buildReviewQueueCards(root);
  const reviewBySource = new Map();
  for (const card of queueCards) {
    if (card.review_status === "review_required" || card.review_status === "in_review") {
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
        review_state: "ok",
      });
    }
    const row = byJurisdiction.get(jid);
    if (
      card.review_status === "review_required" ||
      card.review_status === "in_review"
    ) {
      row.pending_review_count += 1;
      if (card.priority === "high") row.high_priority_count += 1;
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
    else if (row.stale_source_count > 0) row.review_state = "stale_sources";
    else if (row.manual_review_only_count > 0 && row.fresh_automated_count === 0) {
      row.review_state = "manual_review_only";
    } else row.review_state = "fresh_coverage";
  }

  return [...byJurisdiction.values()];
}
