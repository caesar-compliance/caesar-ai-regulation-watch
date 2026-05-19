/** Format helpers for display — no external dependencies. */

export function humanizeId(id: string): string {
  return id
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString(
      "en-GB",
      { day: "numeric", month: "short", year: "numeric" },
    );
  } catch {
    return iso;
  }
}

export function truncate(text: string, max = 200): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + "…";
}

export function isPendingReview(status: string | undefined): boolean {
  return status === "pending_review" || status === "draft";
}

export function needsHumanReview(record: {
  review_status?: string;
  requires_human_review?: boolean;
  record_origin?: string;
  verified_on_source?: boolean;
}): boolean {
  if (record.requires_human_review === true) return true;
  if (record.record_origin === "manual_sample") return true;
  if (record.verified_on_source === false) return true;
  return isPendingReview(record.review_status);
}

export function recordTypeLabel(recordType: string): string {
  const labels: Record<string, string> = {
    law: "Law",
    guidance: "Guidance",
    policy_framework: "Policy framework",
    implementation_update: "Implementation update",
  };
  return labels[recordType] ?? humanizeId(recordType);
}

export function verificationCheckLabel(result: string): string {
  const labels: Record<string, string> = {
    reachable_matches_expected_source: "Reachable — matches expected source",
    reachable_needs_human_review: "Reachable — needs human review",
    unreachable: "Unreachable",
    redirected: "Redirected",
    not_checked: "Not checked",
    uncertain: "Uncertain",
  };
  return labels[result] ?? humanizeId(result);
}

export function urlCheckResultLabel(result: string): string {
  const labels: Record<string, string> = {
    reachable: "Reachable",
    reachable_redirected: "Reachable (redirected)",
    unreachable: "Unreachable",
    timeout: "Timeout",
    dns_error: "DNS error",
    network_error: "Network error",
    not_checked: "Not checked",
    uncertain: "Uncertain",
  };
  return labels[result] ?? humanizeId(result);
}

export function contentReviewStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    not_reviewed: "Not reviewed",
    needs_human_review: "Needs human review",
    reviewed_source_identity_only: "Source identity reviewed",
    reviewed_content_summary: "Content summary reviewed",
    rejected_for_client_use: "Rejected for client use",
  };
  return labels[status] ?? humanizeId(status);
}
