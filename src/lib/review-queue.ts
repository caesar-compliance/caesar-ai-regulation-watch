import type { ReviewStatus } from "./data";
import {
  getJurisdictions,
  getSources,
  getRecords,
  getChanges,
  getTimelines,
  getExportSamples,
  getSource,
} from "./data";

export type ReviewQueueItemType =
  | "jurisdiction"
  | "source"
  | "record"
  | "change"
  | "timeline"
  | "timeline_event"
  | "export_sample";

export interface ReviewQueueItem {
  item_type: ReviewQueueItemType;
  item_id: string;
  title: string;
  jurisdiction_id: string;
  review_status: ReviewStatus;
  reason_for_review: string;
  official_url: string | null;
  page_href: string;
  suggested_action: string;
  missing_official_url: boolean;
  verified_on_source_false: boolean;
  parent_timeline_id?: string;
}

function needsReview(status: ReviewStatus): boolean {
  return status !== "reviewed";
}

const SUGGESTED: Record<ReviewQueueItemType, string> = {
  jurisdiction: "Verify coverage scope and notes; confirm monitoring priority with Control Tower.",
  source: "Verify official_url, monitoring scope, and credibility tier on the live authority site.",
  record: "Verify official_url, summary, and dates on the primary legal source.",
  change: "Confirm change against official source; validate impact notes are review-only.",
  timeline: "Review timeline scope and legal_safe_note; confirm linked sources.",
  timeline_event: "Verify event date and summary on the cited official source; set verified_on_source when confirmed.",
  export_sample: "Confirm export sample is not used as client evidence; validate mapping refs.",
};

export function buildReviewQueue(): ReviewQueueItem[] {
  const items: ReviewQueueItem[] = [];

  for (const j of getJurisdictions()) {
    if (!needsReview(j.review_status)) continue;
    items.push({
      item_type: "jurisdiction",
      item_id: j.jurisdiction_id,
      title: j.name,
      jurisdiction_id: j.jurisdiction_id,
      review_status: j.review_status,
      reason_for_review: `Jurisdiction review_status is ${j.review_status}.`,
      official_url: null,
      page_href: `/jurisdictions/${j.jurisdiction_id}/`,
      suggested_action: SUGGESTED.jurisdiction,
      missing_official_url: false,
      verified_on_source_false: false,
    });
  }

  for (const s of getSources()) {
    if (!needsReview(s.review_status)) continue;
    items.push({
      item_type: "source",
      item_id: s.source_id,
      title: s.title,
      jurisdiction_id: s.jurisdiction_id,
      review_status: s.review_status,
      reason_for_review: s.official_url
        ? `Source review_status is ${s.review_status}.`
        : `Source review_status is ${s.review_status}; official URL missing or unverified.`,
      official_url: s.official_url,
      page_href: `/sources/${s.source_id}/`,
      suggested_action: SUGGESTED.source,
      missing_official_url: !s.official_url,
      verified_on_source_false: false,
    });
  }

  for (const r of getRecords()) {
    if (!needsReview(r.review_status)) continue;
    items.push({
      item_type: "record",
      item_id: r.record_id,
      title: r.title,
      jurisdiction_id: r.jurisdiction_id,
      review_status: r.review_status,
      reason_for_review: `Record (${r.record_type}) review_status is ${r.review_status}.`,
      official_url: r.official_url,
      page_href: `/records/${r.record_id}/`,
      suggested_action: SUGGESTED.record,
      missing_official_url: !r.official_url,
      verified_on_source_false: false,
    });
  }

  for (const c of getChanges()) {
    if (!needsReview(c.review_status)) continue;
    items.push({
      item_type: "change",
      item_id: c.change_id,
      title: c.change_id,
      jurisdiction_id: c.jurisdiction_id,
      review_status: c.review_status,
      reason_for_review: `Change review_status is ${c.review_status}.`,
      official_url: getSource(c.source_id)?.official_url ?? null,
      page_href: `/changes/${c.change_id}/`,
      suggested_action: SUGGESTED.change,
      missing_official_url: false,
      verified_on_source_false: false,
    });
  }

  for (const t of getTimelines()) {
    if (needsReview(t.review_status)) {
      items.push({
        item_type: "timeline",
        item_id: t.timeline_id,
        title: t.title,
        jurisdiction_id: t.jurisdiction_id,
        review_status: t.review_status,
        reason_for_review: `Timeline review_status is ${t.review_status}.`,
        official_url: null,
        page_href: `/timelines/${t.timeline_id}/`,
        suggested_action: SUGGESTED.timeline,
        missing_official_url: false,
        verified_on_source_false: false,
      });
    }

    for (const ev of t.events) {
      const eventNeedsReview = needsReview(ev.review_status) || !ev.verified_on_source;
      if (!eventNeedsReview) continue;
      const src = getSource(ev.source_id);
      const reasons: string[] = [];
      if (needsReview(ev.review_status)) {
        reasons.push(`Event review_status is ${ev.review_status}.`);
      }
      if (!ev.verified_on_source) {
        reasons.push("Date/summary not verified on official source in this repository.");
      }
      items.push({
        item_type: "timeline_event",
        item_id: ev.event_id,
        title: `${t.title} — ${ev.title}`,
        jurisdiction_id: t.jurisdiction_id,
        review_status: ev.review_status,
        reason_for_review: reasons.join(" "),
        official_url: src?.official_url ?? null,
        page_href: `/timelines/${t.timeline_id}/`,
        suggested_action: SUGGESTED.timeline_event,
        missing_official_url: !src?.official_url,
        verified_on_source_false: !ev.verified_on_source,
        parent_timeline_id: t.timeline_id,
      });
    }
  }

  for (const e of getExportSamples()) {
    if (!needsReview(e.review_status)) continue;
    items.push({
      item_type: "export_sample",
      item_id: e.export_record_id,
      title: e.export_record_id,
      jurisdiction_id: e.jurisdiction_id,
      review_status: e.review_status,
      reason_for_review: `Export sample review_status is ${e.review_status}.`,
      official_url: null,
      page_href: "/exports/",
      suggested_action: SUGGESTED.export_sample,
      missing_official_url: false,
      verified_on_source_false: false,
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

  for (const item of items) {
    byStatus[item.review_status] = (byStatus[item.review_status] ?? 0) + 1;
    if (item.review_status === "pending_review") pendingReview += 1;
    if (item.review_status === "needs_update") needsUpdate += 1;
    if (item.verified_on_source_false) unverifiedEvents += 1;
    if (item.missing_official_url) missingUrl += 1;
  }

  return {
    total: items.length,
    pending_review: pendingReview,
    needs_update: needsUpdate,
    unverified_timeline_events: unverifiedEvents,
    missing_official_url: missingUrl,
    by_status: byStatus,
  };
}
