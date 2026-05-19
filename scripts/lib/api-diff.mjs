/**
 * API snapshot diff (v0.7.3). Metadata-only; no legal conclusions.
 */

export const API_DETECTED_CHANGE_LEGAL_NOTE =
  "API-detected result metadata requires human review before use. Not legal advice. Does not set verified_on_source or client_use_allowed.";

export const API_SIMULATION_LEGAL_NOTE =
  "Simulation only; not an official API update. Fixture metadata diff for pipeline validation.";

function resultMap(results) {
  return new Map((results ?? []).map((r) => [r.result_id, r]));
}

export function classifyApiSnapshotDiff(prev, curr, watcher, options = {}) {
  const simulation = Boolean(options.simulation);
  const runDate = options.runDate ?? "2026-05-19";
  const results = [];

  if (prev.fetch_error || curr.fetch_error) return results;

  const prevMap = resultMap(prev.results);
  const currMap = resultMap(curr.results);

  const newResults = [];
  for (const [id, r] of currMap) {
    if (!prevMap.has(id)) newResults.push(r);
  }

  if (
    newResults.length > 0 &&
    watcher.create_detected_change_for_new_results !== false
  ) {
    const titles = newResults
      .slice(0, 5)
      .map((r) => r.title ?? r.result_id)
      .join("; ");
    results.push(
      buildApiChange({
        prev,
        curr,
        watcher,
        changeType: "new_api_result",
        changedFields: ["new_api_result"],
        significance: "medium",
        summary: simulation
          ? `[SIMULATION] ${newResults.length} new API result(s): ${titles}. Not an official update confirmation.`
          : `${newResults.length} new API result(s) in scoped query: ${titles}. Review on official source; not a legal conclusion.`,
        simulation,
        runDate,
        apiResults: newResults,
      }),
    );
  }

  return results;
}

function buildApiChange({
  prev,
  curr,
  watcher,
  changeType,
  changedFields,
  significance,
  summary,
  simulation,
  runDate,
  apiResults,
}) {
  const detectedChangeId = simulation
    ? `simulated-${watcher.source_id}-api-change-${runDate}`
    : `detected-${watcher.source_id}-api-new-${runDate.replace(/-/g, "")}`;

  return {
    detected_change_id: detectedChangeId,
    watcher_id: watcher.watcher_id,
    source_id: watcher.source_id,
    jurisdiction_id: watcher.jurisdiction_id,
    detected_at: curr.checked_at,
    adapter_id: "official_api_metadata",
    source_adapter_type: "official_api_metadata",
    simulation,
    change_type: changeType,
    changed_fields: changedFields,
    previous_snapshot_id: prev.snapshot_id,
    current_snapshot_id: curr.snapshot_id,
    previous_value_summary: {
      result_count: String(prev.result_count ?? 0),
    },
    current_value_summary: {
      result_count: String(curr.result_count ?? 0),
    },
    previous_snapshot_summary: {
      snapshot_id: prev.snapshot_id,
      query_scope_note: prev.query_scope_note,
    },
    current_snapshot_summary: {
      snapshot_id: curr.snapshot_id,
      query_scope_note: curr.query_scope_note,
    },
    change_summary_for_review: summary,
    significance_level: significance,
    confidence_level: significance,
    human_review_required: true,
    review_status: "pending_review",
    review_queue_reason: simulation
      ? "simulated_api_detected_change_pending_review"
      : "api_detected_change_pending_review",
    client_use_allowed: false,
    legal_safe_note: simulation ? API_SIMULATION_LEGAL_NOTE : API_DETECTED_CHANGE_LEGAL_NOTE,
    minimum_change_policy: "api_result_metadata_only",
    api_results_affected: apiResults?.map((r) => ({
      result_id: r.result_id,
      title: r.title,
      link: r.link,
      publication_date: r.publication_date,
    })),
  };
}
