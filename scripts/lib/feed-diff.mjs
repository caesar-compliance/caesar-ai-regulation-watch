/**
 * Feed snapshot diff (v0.7.2). Metadata-only; no legal conclusions.
 */

export const FEED_DETECTED_CHANGE_LEGAL_NOTE =
  "Feed-detected item requires human review before use. Metadata-only signal (title/link/date). Not legal advice. Does not set verified_on_source or client_use_allowed.";

export const FEED_SIMULATION_LEGAL_NOTE =
  "Simulation only; not an official feed update. Feed metadata fixture diff for pipeline validation. Human review required.";

function entryMap(entries) {
  return new Map((entries ?? []).map((e) => [e.entry_id, e]));
}

export function classifyFeedSnapshotDiff(prev, curr, watcher, options = {}) {
  const results = [];
  const simulation = Boolean(options.simulation);
  const runDate = options.runDate ?? "2026-05-19";
  const dateSlug = runDate.replace(/-/g, "");

  if (prev.fetch_error || curr.fetch_error) return results;

  const prevUrl = prev.feed_url ?? prev.final_url;
  const currUrl = curr.final_url ?? curr.feed_url;
  if (prevUrl && currUrl && prevUrl !== currUrl && curr.http_status === 200) {
    results.push(
      buildFeedDetectedChange({
        prev,
        curr,
        watcher,
        changeType: "feed_redirected",
        changedFields: ["feed_redirected"],
        significance: "medium",
        summary: `Feed final URL changed (${prevUrl} → ${currUrl}). Confirm official feed endpoint.`,
        simulation,
        runDate,
        suffix: "redirect",
      }),
    );
  }

  if (curr.http_status && curr.http_status >= 400) {
    results.push(
      buildFeedDetectedChange({
        prev,
        curr,
        watcher,
        changeType: "feed_unreachable",
        changedFields: ["feed_unreachable"],
        significance: "high",
        summary: `Feed returned HTTP ${curr.http_status}. Previous snapshot preserved; investigate reachability.`,
        simulation,
        runDate,
        suffix: "unreachable",
      }),
    );
    return results;
  }

  const prevMap = entryMap(prev.entries);
  const currMap = entryMap(curr.entries);

  const newEntries = [];
  for (const [id, entry] of currMap) {
    if (!prevMap.has(id)) newEntries.push(entry);
  }

  const removedEntries = [];
  for (const [id, entry] of prevMap) {
    if (!currMap.has(id)) removedEntries.push(entry);
  }

  const changedEntries = [];
  for (const [id, entry] of currMap) {
    const p = prevMap.get(id);
    if (p && p.entry_hash !== entry.entry_hash) changedEntries.push({ previous: p, current: entry });
  }

  if (
    newEntries.length > 0 &&
    watcher.create_detected_change_for_new_entries !== false
  ) {
    const titles = newEntries
      .slice(0, 5)
      .map((e) => e.title ?? e.link ?? e.entry_id)
      .join("; ");
    results.push(
      buildFeedDetectedChange({
        prev,
        curr,
        watcher,
        changeType: "new_feed_entry",
        changedFields: ["new_feed_entry"],
        significance: "medium",
        summary: simulation
          ? `[SIMULATION] ${newEntries.length} new feed entry(ies): ${titles}. Not an official update confirmation.`
          : `${newEntries.length} new feed entry(ies) detected: ${titles}. Review on official source; not a legal conclusion.`,
        simulation,
        runDate,
        suffix: `new-${newEntries.length}`,
        feedEntries: newEntries,
      }),
    );
  }

  if (
    removedEntries.length > 0 &&
    watcher.create_detected_change_for_changed_entries !== false
  ) {
    results.push(
      buildFeedDetectedChange({
        prev,
        curr,
        watcher,
        changeType: "removed_feed_entry",
        changedFields: ["removed_feed_entry"],
        significance: "low",
        summary: `${removedEntries.length} feed entry(ies) no longer in latest feed window (may be normal feed rotation).`,
        simulation,
        runDate,
        suffix: `removed-${removedEntries.length}`,
      }),
    );
  }

  if (
    changedEntries.length > 0 &&
    watcher.create_detected_change_for_changed_entries !== false
  ) {
    const sample = changedEntries[0];
    results.push(
      buildFeedDetectedChange({
        prev,
        curr,
        watcher,
        changeType: "changed_feed_entry_metadata",
        changedFields: ["changed_feed_entry_metadata"],
        significance: "medium",
        summary: `${changedEntries.length} feed entry metadata change(s). Example: "${sample.current.title ?? sample.current.entry_id}".`,
        simulation,
        runDate,
        suffix: `changed-${changedEntries.length}`,
      }),
    );
  }

  return results;
}

function buildFeedDetectedChange({
  prev,
  curr,
  watcher,
  changeType,
  changedFields,
  significance,
  summary,
  simulation,
  runDate,
  suffix,
  feedEntries,
}) {
  const dateSlug = runDate.replace(/-/g, "");
  const detectedChangeId = simulation
    ? `simulated-${watcher.source_id}-feed-change-${runDate}`
    : `detected-${watcher.source_id}-feed-${suffix}-${dateSlug}`;

  return {
    detected_change_id: detectedChangeId,
    watcher_id: watcher.watcher_id,
    source_id: watcher.source_id,
    jurisdiction_id: watcher.jurisdiction_id,
    detected_at: curr.checked_at,
    adapter_id: "official_rss_or_feed",
    source_adapter_type: "official_rss_or_feed",
    simulation,
    change_type: changeType,
    changed_fields: changedFields,
    previous_snapshot_id: prev.snapshot_id,
    current_snapshot_id: curr.snapshot_id,
    previous_value_summary: {
      feed_entry_count: String(prev.feed_entry_count ?? 0),
      entries_aggregate_hash: String(prev.entries_aggregate_hash ?? "—").slice(0, 40),
    },
    current_value_summary: {
      feed_entry_count: String(curr.feed_entry_count ?? 0),
      entries_aggregate_hash: String(curr.entries_aggregate_hash ?? "—").slice(0, 40),
    },
    previous_snapshot_summary: {
      snapshot_id: prev.snapshot_id,
      feed_title: prev.feed_title,
      feed_entry_count: prev.feed_entry_count,
    },
    current_snapshot_summary: {
      snapshot_id: curr.snapshot_id,
      feed_title: curr.feed_title,
      feed_entry_count: curr.feed_entry_count,
    },
    change_summary_for_review: summary,
    significance_level: significance,
    confidence_level: significance,
    human_review_required: true,
    review_status: "pending_review",
    review_queue_reason: simulation
      ? "simulated_feed_detected_change_pending_review"
      : "feed_detected_change_pending_review",
    client_use_allowed: false,
    legal_safe_note: simulation ? FEED_SIMULATION_LEGAL_NOTE : FEED_DETECTED_CHANGE_LEGAL_NOTE,
    minimum_change_policy: "feed_entry_identity_and_metadata_only",
    feed_entries_affected: feedEntries?.map((e) => ({
      entry_id: e.entry_id,
      title: e.title,
      link: e.link,
      published_at: e.published_at,
    })),
  };
}
