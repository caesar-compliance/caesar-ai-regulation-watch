import type { ReviewStatus, UrlCheckResult, ContentReviewStatus } from "./data";
import {
  getJurisdictions,
  getSources,
  getRecords,
  getChanges,
  getTimelines,
  getExportSamples,
  getSource,
  getRecord,
  getVerifications,
  getUrlChecks,
  latestIdentityVerificationForSource,
  getDetectedChanges,
  latestWatcherRun,
} from "./data";

export type ReviewQueueItemType =
  | "jurisdiction"
  | "source"
  | "record"
  | "change"
  | "timeline"
  | "timeline_event"
  | "export_sample"
  | "source_verification"
  | "url_check"
  | "detected_change"
  | "watcher_error";

export type ReviewQueueReason =
  | "pending_review"
  | "technical_url_unchecked"
  | "technical_url_unreachable"
  | "technical_url_fixed"
  | "redirected_url_needs_review"
  | "source_identity_reviewed_only"
  | "content_not_reviewed"
  | "legal_review_not_done"
  | "verified_on_source_false"
  | "client_use_not_allowed"
  | "needs_update"
  | "detected_change_pending_review"
  | "simulated_detected_change_pending_review"
  | "feed_detected_change_pending_review"
  | "simulated_feed_detected_change_pending_review"
  | "watcher_error"
  | "snapshot_changed"
  | "human_review_required";

export interface ReviewQueueItem {
  item_type: ReviewQueueItemType;
  item_id: string;
  title: string;
  jurisdiction_id: string;
  review_status: ReviewStatus;
  reason_for_review: string;
  review_reasons: ReviewQueueReason[];
  official_url: string | null;
  page_href: string;
  suggested_action: string;
  missing_official_url: boolean;
  verified_on_source_false: boolean;
  technical_url_status: UrlCheckResult | null;
  content_review_status: ContentReviewStatus | null;
  redirect_detected: boolean;
  client_use_allowed: boolean | null;
  parent_timeline_id?: string;
}

function needsReview(status: ReviewStatus): boolean {
  return status !== "reviewed";
}

function urlCheckFor(
  itemType: string,
  itemId: string,
  urlChecks: ReturnType<typeof getUrlChecks>,
) {
  return urlChecks.find((c) => c.item_type === itemType && c.item_id === itemId);
}

function urlCheckForRecord(
  recordId: string,
  recordType: string,
  urlChecks: ReturnType<typeof getUrlChecks>,
) {
  return (
    urlChecks.find((c) => c.item_id === recordId && c.item_type === "law") ??
    urlChecks.find((c) => c.item_id === recordId && c.item_type === "guidance") ??
    urlChecks.find(
      (c) =>
        c.item_id === recordId &&
        (c.item_type === "record" || c.item_type === recordType),
    )
  );
}

function technicalReasonsFromCheck(
  check: ReturnType<typeof getUrlChecks>[0] | undefined,
  identityReviewed = false,
): ReviewQueueReason[] {
  if (!check) return ["technical_url_unchecked"];
  const reasons: ReviewQueueReason[] = [];
  const ok =
    check.check_result === "reachable" || check.check_result === "reachable_redirected";
  if (check.check_result === "not_checked" || check.check_result === "uncertain") {
    reasons.push("technical_url_unchecked");
  }
  if (
    check.check_result === "unreachable" ||
    check.check_result === "timeout" ||
    check.check_result === "dns_error" ||
    check.check_result === "network_error"
  ) {
    reasons.push("technical_url_unreachable");
  } else if (ok && identityReviewed) {
    reasons.push("technical_url_fixed");
  }
  if (
    (check.check_result === "reachable_redirected" || check.redirect_detected) &&
    !identityReviewed
  ) {
    reasons.push("redirected_url_needs_review");
  }
  if (check.content_review_status === "not_reviewed") {
    reasons.push("content_not_reviewed");
  }
  if (!check.client_use_allowed) {
    reasons.push("client_use_not_allowed");
  }
  return reasons;
}

function identityReasonsForSource(sourceId: string): ReviewQueueReason[] {
  const identity = latestIdentityVerificationForSource(sourceId);
  if (!identity) return [];
  if (identity.review_status_after_check === "reviewed_source_identity_only") {
    return ["source_identity_reviewed_only"];
  }
  if (identity.review_status_after_check === "needs_human_review") {
    return [];
  }
  return [];
}

function mergeReasons(...groups: ReviewQueueReason[][]): ReviewQueueReason[] {
  return [...new Set(groups.flat())];
}

function reasonText(reasons: ReviewQueueReason[]): string {
  const labels: Record<ReviewQueueReason, string> = {
    pending_review: "Editorial review_status is not reviewed.",
    technical_url_unchecked: "Technical URL not checked or outcome uncertain.",
    technical_url_unreachable: "Official URL unreachable (HTTP/network error).",
    technical_url_fixed: "Technical URL reachable after remediation (content review still required).",
    redirected_url_needs_review: "URL redirects; confirm canonical destination.",
    source_identity_reviewed_only:
      "Official source identity reviewed only; content/legal review not done.",
    content_not_reviewed: "Content summary not human-reviewed.",
    legal_review_not_done: "Legal/content verification on official source not completed.",
    verified_on_source_false: "Not verified on official source in this repository.",
    client_use_not_allowed: "Client use not allowed.",
    needs_update: "Marked needs_update.",
    detected_change_pending_review:
      "Watcher detected a possible metadata change; human review required.",
    simulated_detected_change_pending_review:
      "Simulated watcher diff for pipeline validation only; not an official source update.",
    feed_detected_change_pending_review:
      "Feed watcher detected new or changed entries; human review required.",
    simulated_feed_detected_change_pending_review:
      "Simulated feed diff for pipeline validation only; not an official feed update.",
    watcher_error: "Latest watcher run reported a fetch or check error for this source.",
    snapshot_changed: "New metadata snapshot differs from previous; confirm on official source.",
    human_review_required:
      "Watcher output requires human review before any record update.",
  };
  return reasons.map((r) => labels[r]).join(" ");
}

const SUGGESTED: Record<ReviewQueueItemType, string> = {
  jurisdiction: "Verify coverage scope and notes; confirm monitoring priority with Control Tower.",
  source:
    "Verify official_url on live authority site; separate technical URL check from legal/content review.",
  record: "Verify official_url, summary, and dates on primary source; do not equate reachability with review.",
  change: "Confirm change against official source; validate impact notes are review-only.",
  timeline: "Review timeline scope and legal_safe_note; confirm linked sources.",
  timeline_event:
    "Verify event date and summary on cited official source; set verified_on_source when confirmed.",
  export_sample: "Confirm export sample is not used as client evidence; validate mapping refs.",
  source_verification:
    "Complete human source identity and content review per SOURCE_VERIFICATION_WORKFLOW.md.",
  url_check:
    "Review technical URL outcome; if redirected or domain mismatch, update registry URL after human confirmation.",
  detected_change:
    "Compare snapshots and live official source; do not treat hash diff as legal change until human confirms.",
  watcher_error:
    "Investigate watcher fetch error; re-run watch:official when network available; previous snapshot preserved.",
};

export function buildReviewQueue(): ReviewQueueItem[] {
  const items: ReviewQueueItem[] = [];
  const urlChecks = getUrlChecks();
  const urlCheckBySource = Object.fromEntries(
    urlChecks.filter((c) => c.item_type === "source").map((c) => [c.item_id, c]),
  );

  for (const j of getJurisdictions()) {
    if (!needsReview(j.review_status)) continue;
    const reasons: ReviewQueueReason[] = ["pending_review"];
    items.push({
      item_type: "jurisdiction",
      item_id: j.jurisdiction_id,
      title: j.name,
      jurisdiction_id: j.jurisdiction_id,
      review_status: j.review_status,
      reason_for_review: reasonText(reasons),
      review_reasons: reasons,
      official_url: null,
      page_href: `/jurisdictions/${j.jurisdiction_id}/`,
      suggested_action: SUGGESTED.jurisdiction,
      missing_official_url: false,
      verified_on_source_false: false,
      technical_url_status: null,
      content_review_status: null,
      redirect_detected: false,
      client_use_allowed: null,
    });
  }

  for (const s of getSources()) {
    const urlCheck = urlCheckBySource[s.source_id];
    const identityReasons = identityReasonsForSource(s.source_id);
    const identityDone = identityReasons.includes("source_identity_reviewed_only");
    const techReasons = technicalReasonsFromCheck(urlCheck, identityDone);
    const editorialReasons: ReviewQueueReason[] = [];
    if (needsReview(s.review_status)) editorialReasons.push("pending_review");
    if (s.review_status === "needs_update") editorialReasons.push("needs_update");
    const reasons = mergeReasons(editorialReasons, identityReasons, techReasons);
    if (!s.official_url) reasons.push("technical_url_unchecked");
    const inQueue =
      reasons.length > 0 || !s.official_url || needsReview(s.review_status);
    if (!inQueue) continue;

    items.push({
      item_type: "source",
      item_id: s.source_id,
      title: s.title,
      jurisdiction_id: s.jurisdiction_id,
      review_status: s.review_status,
      reason_for_review: s.official_url
        ? reasonText(reasons)
        : `Official URL missing. ${reasonText(reasons)}`,
      review_reasons: reasons,
      official_url: s.official_url,
      page_href: `/sources/${s.source_id}/`,
      suggested_action: SUGGESTED.source,
      missing_official_url: !s.official_url,
      verified_on_source_false: false,
      technical_url_status: urlCheck?.check_result ?? null,
      content_review_status: urlCheck?.content_review_status ?? null,
      redirect_detected: urlCheck?.redirect_detected ?? false,
      client_use_allowed: urlCheck?.client_use_allowed ?? null,
    });
  }

  for (const r of getRecords()) {
    const urlCheck = urlCheckForRecord(r.record_id, r.record_type, urlChecks);
    const recordUnverified = r.verified_on_source === false;
    const identityDone =
      identityReasonsForSource(r.source_id).includes("source_identity_reviewed_only");
    const editorialReasons: ReviewQueueReason[] = [];
    if (needsReview(r.review_status)) editorialReasons.push("pending_review");
    if (recordUnverified) {
      editorialReasons.push("verified_on_source_false");
      editorialReasons.push("legal_review_not_done");
    }
    editorialReasons.push("content_not_reviewed");
    const techReasons = technicalReasonsFromCheck(urlCheck, identityDone);
    const verification = getVerifications().find((v) => v.item_id === r.record_id);
    if (verification && !verification.client_use_allowed) {
      techReasons.push("client_use_not_allowed");
    }
    const reasons = mergeReasons(editorialReasons, techReasons);
    const recordNeedsReview =
      reasons.length > 0 || needsReview(r.review_status) || recordUnverified;
    if (!recordNeedsReview) continue;

    items.push({
      item_type: "record",
      item_id: r.record_id,
      title: r.title,
      jurisdiction_id: r.jurisdiction_id,
      review_status: r.review_status,
      reason_for_review: reasonText(reasons),
      review_reasons: reasons,
      official_url: r.official_url,
      page_href: `/records/${r.record_id}/`,
      suggested_action: SUGGESTED.record,
      missing_official_url: !r.official_url,
      verified_on_source_false: recordUnverified,
      technical_url_status: urlCheck?.check_result ?? null,
      content_review_status: urlCheck?.content_review_status ?? null,
      redirect_detected: urlCheck?.redirect_detected ?? false,
      client_use_allowed: urlCheck?.client_use_allowed ?? verification?.client_use_allowed ?? null,
    });
  }

  for (const c of getChanges()) {
    if (!needsReview(c.review_status)) continue;
    const reasons: ReviewQueueReason[] = ["pending_review"];
    items.push({
      item_type: "change",
      item_id: c.change_id,
      title: c.change_id,
      jurisdiction_id: c.jurisdiction_id,
      review_status: c.review_status,
      reason_for_review: reasonText(reasons),
      review_reasons: reasons,
      official_url: getSource(c.source_id)?.official_url ?? null,
      page_href: `/changes/${c.change_id}/`,
      suggested_action: SUGGESTED.change,
      missing_official_url: false,
      verified_on_source_false: false,
      technical_url_status: null,
      content_review_status: null,
      redirect_detected: false,
      client_use_allowed: null,
    });
  }

  for (const t of getTimelines()) {
    if (needsReview(t.review_status)) {
      const reasons: ReviewQueueReason[] = ["pending_review"];
      items.push({
        item_type: "timeline",
        item_id: t.timeline_id,
        title: t.title,
        jurisdiction_id: t.jurisdiction_id,
        review_status: t.review_status,
        reason_for_review: reasonText(reasons),
        review_reasons: reasons,
        official_url: null,
        page_href: `/timelines/${t.timeline_id}/`,
        suggested_action: SUGGESTED.timeline,
        missing_official_url: false,
        verified_on_source_false: false,
        technical_url_status: null,
        content_review_status: null,
        redirect_detected: false,
        client_use_allowed: null,
      });
    }

    for (const ev of t.events) {
      const eventNeedsReview = needsReview(ev.review_status) || !ev.verified_on_source;
      if (!eventNeedsReview) continue;
      const src = getSource(ev.source_id);
      const urlCheck = urlCheckBySource[ev.source_id];
      const identityDone = identityReasonsForSource(ev.source_id).includes(
        "source_identity_reviewed_only",
      );
      const reasons = mergeReasons(
        needsReview(ev.review_status) ? ["pending_review"] : [],
        !ev.verified_on_source ? ["verified_on_source_false", "legal_review_not_done"] : [],
        technicalReasonsFromCheck(urlCheck, identityDone),
      );
      items.push({
        item_type: "timeline_event",
        item_id: ev.event_id,
        title: `${t.title} — ${ev.title}`,
        jurisdiction_id: t.jurisdiction_id,
        review_status: ev.review_status,
        reason_for_review: reasonText(reasons),
        review_reasons: reasons,
        official_url: src?.official_url ?? null,
        page_href: `/timelines/${t.timeline_id}/`,
        suggested_action: SUGGESTED.timeline_event,
        missing_official_url: !src?.official_url,
        verified_on_source_false: !ev.verified_on_source,
        parent_timeline_id: t.timeline_id,
        technical_url_status: urlCheck?.check_result ?? null,
        content_review_status: urlCheck?.content_review_status ?? null,
        redirect_detected: urlCheck?.redirect_detected ?? false,
        client_use_allowed: urlCheck?.client_use_allowed ?? null,
      });
    }
  }

  for (const e of getExportSamples()) {
    if (!needsReview(e.review_status)) continue;
    const reasons: ReviewQueueReason[] = ["pending_review"];
    items.push({
      item_type: "export_sample",
      item_id: e.export_record_id,
      title: e.export_record_id,
      jurisdiction_id: e.jurisdiction_id,
      review_status: e.review_status,
      reason_for_review: reasonText(reasons),
      review_reasons: reasons,
      official_url: null,
      page_href: "/exports/",
      suggested_action: SUGGESTED.export_sample,
      missing_official_url: false,
      verified_on_source_false: false,
      technical_url_status: null,
      content_review_status: null,
      redirect_detected: false,
      client_use_allowed: null,
    });
  }

  for (const dc of getDetectedChanges()) {
    if (!needsReview(dc.review_status)) continue;
    const src = getSource(dc.source_id);
    const isFeed =
      dc.adapter_id === "official_rss_or_feed" ||
      String(dc.change_type ?? "").includes("feed");
    const reasons: ReviewQueueReason[] = [
      dc.simulation
        ? isFeed
          ? "simulated_feed_detected_change_pending_review"
          : "simulated_detected_change_pending_review"
        : isFeed
          ? "feed_detected_change_pending_review"
          : "detected_change_pending_review",
      "human_review_required",
      "content_not_reviewed",
      "legal_review_not_done",
    ];
    items.push({
      item_type: "detected_change",
      item_id: dc.detected_change_id,
      title: dc.simulation
        ? `[Simulation] ${isFeed ? "Feed" : "Page"} change: ${dc.source_id}`
        : `${isFeed ? "Feed" : "Page"} change: ${dc.source_id}`,
      jurisdiction_id: dc.jurisdiction_id,
      review_status: dc.review_status,
      reason_for_review: reasonText(reasons),
      review_reasons: reasons,
      official_url: src?.official_url ?? null,
      page_href: `/detected-changes/${dc.detected_change_id}/`,
      suggested_action: SUGGESTED.detected_change,
      missing_official_url: !src?.official_url,
      verified_on_source_false: true,
      technical_url_status: null,
      content_review_status: "not_reviewed",
      redirect_detected: false,
      client_use_allowed: false,
    });
  }

  const latestRun = latestWatcherRun();
  if (latestRun) {
    for (const r of latestRun.results) {
      if (r.status !== "error") continue;
      const src = getSource(r.source_id);
      const reasons: ReviewQueueReason[] = [
        "watcher_error",
        "technical_url_unchecked",
        "human_review_required",
      ];
      items.push({
        item_type: "watcher_error",
        item_id: `${latestRun.run_id}-${r.watcher_id}`,
        title: `Watcher error: ${r.source_id}`,
        jurisdiction_id: src?.jurisdiction_id ?? "eu",
        review_status: "needs_human_review",
        reason_for_review: `${r.error_message ?? "Watcher check failed."} ${reasonText(reasons)}`,
        review_reasons: reasons,
        official_url: src?.official_url ?? null,
        page_href: `/watchers/${r.watcher_id}/`,
        suggested_action: SUGGESTED.watcher_error,
        missing_official_url: !src?.official_url,
        verified_on_source_false: true,
        technical_url_status: null,
        content_review_status: "not_reviewed",
        redirect_detected: false,
        client_use_allowed: false,
      });
    }
  }

  for (const v of getVerifications()) {
    if (v.check_result !== "not_checked" && v.check_result !== "uncertain") continue;
    const src = getSource(v.source_id);
    const relatedRecord = v.item_type === "record" ? getRecord(v.item_id) : undefined;
    const jurisdictionId =
      relatedRecord?.jurisdiction_id ?? src?.jurisdiction_id ?? "oecd";
    const reasons: ReviewQueueReason[] = [
      "content_not_reviewed",
      "client_use_not_allowed",
      "technical_url_unchecked",
    ];
    items.push({
      item_type: "source_verification",
      item_id: v.verification_id,
      title: `Source verification: ${v.item_id}`,
      jurisdiction_id: jurisdictionId,
      review_status: v.review_status_after_check,
      reason_for_review: `Human source verification ${v.check_result}. ${reasonText(reasons)}`,
      review_reasons: reasons,
      official_url: v.official_url_checked,
      page_href: "/verification/",
      suggested_action: SUGGESTED.source_verification,
      missing_official_url: false,
      verified_on_source_false: true,
      technical_url_status: null,
      content_review_status: "not_reviewed",
      redirect_detected: false,
      client_use_allowed: v.client_use_allowed,
    });
  }

  return items.sort((a, b) => {
    const j = a.jurisdiction_id.localeCompare(b.jurisdiction_id);
    if (j !== 0) return j;
    return a.title.localeCompare(b.title);
  });
}

export function getReviewQueueSummary() {
  const items = buildReviewQueue();
  const byStatus: Record<string, number> = {};
  let pendingReview = 0;
  let needsUpdate = 0;
  let unverifiedEvents = 0;
  let missingUrl = 0;
  let technicalUrlUnchecked = 0;
  let technicalUrlUnreachable = 0;
  let redirectedNeedsReview = 0;
  let contentNotReviewed = 0;
  let clientUseNotAllowed = 0;
  let sourceIdentityReviewed = 0;
  let legalReviewNotDone = 0;
  let detectedChangePending = 0;
  let watcherErrors = 0;

  for (const item of items) {
    byStatus[item.review_status] = (byStatus[item.review_status] ?? 0) + 1;
    if (item.review_status === "pending_review") pendingReview += 1;
    if (item.review_status === "needs_update") needsUpdate += 1;
    if (item.verified_on_source_false) unverifiedEvents += 1;
    if (item.missing_official_url) missingUrl += 1;
    if (item.review_reasons.includes("technical_url_unchecked")) technicalUrlUnchecked += 1;
    if (item.review_reasons.includes("technical_url_unreachable")) technicalUrlUnreachable += 1;
    if (item.review_reasons.includes("redirected_url_needs_review")) redirectedNeedsReview += 1;
    if (item.review_reasons.includes("content_not_reviewed")) contentNotReviewed += 1;
    if (item.review_reasons.includes("client_use_not_allowed")) clientUseNotAllowed += 1;
    if (item.review_reasons.includes("source_identity_reviewed_only")) {
      sourceIdentityReviewed += 1;
    }
    if (item.review_reasons.includes("legal_review_not_done")) legalReviewNotDone += 1;
    if (item.review_reasons.includes("detected_change_pending_review")) {
      detectedChangePending += 1;
    }
    if (item.review_reasons.includes("watcher_error")) watcherErrors += 1;
  }

  return {
    total: items.length,
    pending_review: pendingReview,
    needs_update: needsUpdate,
    unverified_timeline_events: unverifiedEvents,
    missing_official_url: missingUrl,
    technical_url_unchecked: technicalUrlUnchecked,
    technical_url_unreachable: technicalUrlUnreachable,
    redirected_url_needs_review: redirectedNeedsReview,
    content_not_reviewed: contentNotReviewed,
    client_use_not_allowed: clientUseNotAllowed,
    source_identity_reviewed_only: sourceIdentityReviewed,
    legal_review_not_done: legalReviewNotDone,
    detected_change_pending_review: detectedChangePending,
    watcher_errors: watcherErrors,
    by_status: byStatus,
  };
}
