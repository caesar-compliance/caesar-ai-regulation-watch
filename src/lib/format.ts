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
}): boolean {
  if (record.requires_human_review === true) return true;
  if (record.record_origin === "manual_sample") return true;
  return isPendingReview(record.review_status);
}
