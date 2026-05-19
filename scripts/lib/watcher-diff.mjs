/**
 * Watcher diff classification (v0.7.1).
 * Metadata-only signals; prototype semantic diff — not legal conclusions.
 */

export const LEGAL_SAFE_NOTE =
  "Metadata-only watcher output for governance review support. Not legal advice. Not a compliance guarantee. Human review required before any record update. Does not set verified_on_source or client_use_allowed.";

export const SIMULATION_LEGAL_SAFE_NOTE =
  "Simulation only; not an official source update. Metadata-only fixture diff for pipeline validation. Not legal advice. Human review required. Does not set verified_on_source or client_use_allowed.";

/** Fields compared for change detection (order affects summary priority). */
const FIELD_CHECKS = [
  {
    key: "normalized_text_hash",
    changeType: "normalized_text_hash_changed",
    contentSignal: true,
    defaultSignificance: "high",
  },
  {
    key: "title",
    changeType: "title_changed",
    contentSignal: true,
    defaultSignificance: "high",
  },
  {
    key: "content_hash",
    changeType: "content_hash_changed",
    contentSignal: true,
    defaultSignificance: "medium",
    volatileNote:
      "Raw content hash may reflect non-semantic assets (scripts, timestamps). Prefer normalized_text_hash for significance.",
  },
  {
    key: "final_url",
    changeType: "final_url_changed",
    contentSignal: false,
    defaultSignificance: "medium",
  },
  {
    key: "http_status",
    changeType: "http_status_changed",
    contentSignal: false,
    defaultSignificance: "medium",
  },
  {
    key: "etag",
    changeType: "etag_changed",
    contentSignal: false,
    defaultSignificance: "low",
    volatile: true,
  },
  {
    key: "last_modified",
    changeType: "last_modified_changed",
    contentSignal: false,
    defaultSignificance: "low",
    volatile: true,
  },
  {
    key: "content_length",
    changeType: "content_length_changed",
    contentSignal: false,
    defaultSignificance: "low",
    volatile: true,
  },
];

const MINIMUM_CHANGE_POLICY =
  "high_significance_requires_content_signal_or_url_status_change";

function valuesDiffer(prev, curr, key) {
  const a = prev?.[key];
  const b = curr?.[key];
  if (a == null && b == null) return false;
  if (key === "etag" || key === "last_modified") {
    if (!a || !b) return false;
  }
  return a !== b;
}

function summarizeValue(key, value) {
  if (value == null || value === "") return "—";
  if (key === "content_hash" || key === "normalized_text_hash") {
    const s = String(value);
    return s.length > 20 ? `${s.slice(0, 14)}…${s.slice(-8)}` : s;
  }
  if (key === "title") return String(value).slice(0, 120);
  if (key === "content_length") return `${value} bytes`;
  return String(value).slice(0, 200);
}

function buildSnapshotSummary(snap) {
  if (!snap) return {};
  return {
    snapshot_id: snap.snapshot_id,
    checked_at: snap.checked_at,
    http_status: snap.http_status ?? null,
    final_url: snap.final_url ?? null,
    title: snap.title ?? null,
    content_hash: summarizeValue("content_hash", snap.content_hash),
    normalized_text_hash: summarizeValue(
      "normalized_text_hash",
      snap.normalized_text_hash,
    ),
    content_length: snap.content_length ?? null,
    etag: snap.etag ?? null,
    last_modified: snap.last_modified ?? null,
  };
}

/**
 * Classify metadata diff between two snapshots.
 * @returns {object|null} Detected change fields (without ids) or null if no meaningful diff
 */
export function classifySnapshotDiff(prev, curr, options = {}) {
  if (!prev || !curr || prev.fetch_error || curr.fetch_error) return null;

  const changed = [];
  const ignored = [];
  let volatileFieldNote = null;

  for (const check of FIELD_CHECKS) {
    if (!valuesDiffer(prev, curr, check.key)) continue;
    changed.push({
      ...check,
      previous: prev[check.key],
      current: curr[check.key],
    });
  }

  if (changed.length === 0) return null;

  const contentSignals = changed.filter((c) => c.contentSignal);
  const volatileOnly =
    changed.length > 0 &&
    changed.every((c) => c.volatile) &&
    contentSignals.length === 0;

  let significance = "low";
  if (contentSignals.some((c) => c.defaultSignificance === "high")) {
    significance = "high";
  } else if (
    contentSignals.length > 0 ||
    changed.some((c) => c.changeType === "http_status_changed") ||
    changed.some((c) => c.changeType === "final_url_changed")
  ) {
    significance = "medium";
  }

  if (volatileOnly) {
    volatileFieldNote =
      "Only volatile HTTP metadata changed (ETag, Last-Modified, or content length) with no content hash or title signal. Treated as low significance per minimum_change_policy.";
    for (const c of changed) {
      if (c.volatile) ignored.push(c.key);
    }
    significance = "low";
  }

  const activeChanges = changed.filter((c) => !ignored.includes(c.key));
  if (activeChanges.length === 0) return null;

  const changed_fields = activeChanges.map((c) => c.changeType);
  const primaryType =
    activeChanges.length === 1
      ? activeChanges[0].changeType
      : activeChanges.some((c) => c.contentSignal)
        ? "metadata_changed"
        : "metadata_changed";

  const previous_value_summary = {};
  const current_value_summary = {};
  for (const c of activeChanges) {
    previous_value_summary[c.key] = summarizeValue(c.key, c.previous);
    current_value_summary[c.key] = summarizeValue(c.key, c.current);
  }

  const summaryParts = activeChanges.map((c) => {
    if (c.key === "title") {
      return `title: "${summarizeValue("title", c.previous)}" → "${summarizeValue("title", c.current)}"`;
    }
    if (c.key === "final_url") {
      return `final URL changed`;
    }
    if (c.key === "http_status") {
      return `HTTP status: ${c.previous} → ${c.current}`;
    }
    if (c.key === "content_hash" || c.key === "normalized_text_hash") {
      return `${c.key.replace(/_/g, " ")} changed`;
    }
    return `${c.key.replace(/_/g, " ")} changed`;
  });

  const change_summary_for_review = options.simulation
    ? `[SIMULATION] Fixture metadata diff (${summaryParts.join("; ")}). Not an official source update. Confirm on live source before any record update; not a legal conclusion.`
    : `Watcher detected possible official page change (${summaryParts.join("; ")}). Confirm on live source; not a legal conclusion.`;

  const review_queue_reason = options.simulation
    ? "simulated_detected_change_pending_review"
    : "detected_change_pending_review";

  return {
    change_type: primaryType,
    changed_fields,
    previous_value_summary,
    current_value_summary,
    previous_snapshot_summary: buildSnapshotSummary(prev),
    current_snapshot_summary: buildSnapshotSummary(curr),
    significance_level: significance,
    confidence_level: significance,
    change_summary_for_review,
    human_review_required: true,
    review_status: "pending_review",
    review_queue_reason,
    legal_safe_note: options.simulation ? SIMULATION_LEGAL_SAFE_NOTE : LEGAL_SAFE_NOTE,
    ignored_fields: ignored,
    volatile_field_note: volatileFieldNote,
    minimum_change_policy: MINIMUM_CHANGE_POLICY,
    client_use_allowed: false,
    simulation: Boolean(options.simulation),
  };
}

export function buildDetectedChangeRecord({
  detectedChangeId,
  watcherId,
  sourceId,
  jurisdictionId,
  detectedAt,
  previousSnapshotId,
  currentSnapshotId,
  diff,
}) {
  return {
    detected_change_id: detectedChangeId,
    watcher_id: watcherId,
    source_id: sourceId,
    jurisdiction_id: jurisdictionId,
    detected_at: detectedAt,
    previous_snapshot_id: previousSnapshotId,
    current_snapshot_id: currentSnapshotId,
    ...diff,
  };
}
