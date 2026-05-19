#!/usr/bin/env node
/**
 * Generate static JSON exports and RSS feed from local YAML (no remote fetch).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DATA = path.join(ROOT, "public/data");
const PUBLIC_FEEDS = path.join(ROOT, "public/feeds");

const DISCLAIMER =
  "Pilot data for governance review support only. Not legal advice. Not a compliance guarantee. Not complete global coverage. Sample records require human review before client use. Official sources control.";

function readYamlDir(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    .map((f) => yaml.load(fs.readFileSync(path.join(abs, f), "utf8")));
}

function readYamlFile(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return null;
  return yaml.load(fs.readFileSync(abs, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toUTCString();
}

function stripMultiline(s) {
  return String(s).replace(/\s+/g, " ").trim();
}

// Load data
const jurisdictions = readYamlDir("data/jurisdictions");
const sources = readYamlDir("data/sources");
const laws = readYamlDir("data/laws");
const guidance = readYamlDir("data/guidance");
const changes = readYamlDir("data/changes").sort((a, b) =>
  b.detected_date.localeCompare(a.detected_date),
);
const timelines = readYamlDir("data/timelines");
const verificationBatches = readYamlDir("data/verifications");
const verifications = verificationBatches.flatMap((b) =>
  (b.verifications ?? []).map((v) => ({
    ...v,
    verification_batch_id: b.verification_batch_id,
  })),
);
const exportFile = readYamlFile("exports/samples/regulation-change-export.sample.yml");
const exportSamples = (exportFile?.exports ?? []).map((e) => ({
  ...e,
  sample_only: true,
  not_client_evidence: true,
}));

const records = [
  ...laws.map((r) => ({ ...r, record_type: "law", status: r.legal_status })),
  ...guidance.map((r) => ({
    ...r,
    record_type: "guidance",
    status: r.guidance_status,
  })),
];

const generatedAt = "2026-05-19";

function needsReview(status) {
  return status !== "reviewed";
}

function buildReviewQueue() {
  const items = [];
  const sourceById = Object.fromEntries(sources.map((s) => [s.source_id, s]));

  for (const j of jurisdictions) {
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
      missing_official_url: false,
      verified_on_source_false: false,
    });
  }
  for (const s of sources) {
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
      official_url: s.official_url ?? null,
      page_href: `/sources/${s.source_id}/`,
      missing_official_url: !s.official_url,
      verified_on_source_false: false,
    });
  }
  const recordById = Object.fromEntries(records.map((r) => [r.record_id, r]));

  for (const r of records) {
    const recordUnverified = r.verified_on_source === false;
    const recordNeedsReview = needsReview(r.review_status) || recordUnverified;
    if (!recordNeedsReview) continue;
    const reasons = [];
    if (needsReview(r.review_status)) {
      reasons.push(`Record (${r.record_type}) review_status is ${r.review_status}.`);
    }
    if (recordUnverified) {
      reasons.push("Record not verified on official source in this repository.");
    }
    items.push({
      item_type: "record",
      item_id: r.record_id,
      title: r.title,
      jurisdiction_id: r.jurisdiction_id,
      review_status: r.review_status,
      reason_for_review: reasons.join(" "),
      official_url: r.official_url ?? null,
      page_href: `/records/${r.record_id}/`,
      missing_official_url: !r.official_url,
      verified_on_source_false: recordUnverified,
    });
  }
  for (const c of changes) {
    if (!needsReview(c.review_status)) continue;
    items.push({
      item_type: "change",
      item_id: c.change_id,
      title: c.change_id,
      jurisdiction_id: c.jurisdiction_id,
      review_status: c.review_status,
      reason_for_review: `Change review_status is ${c.review_status}.`,
      official_url: sourceById[c.source_id]?.official_url ?? null,
      page_href: `/changes/${c.change_id}/`,
      missing_official_url: false,
      verified_on_source_false: false,
    });
  }
  for (const t of timelines) {
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
        missing_official_url: false,
        verified_on_source_false: false,
      });
    }
    for (const ev of t.events ?? []) {
      if (!needsReview(ev.review_status) && ev.verified_on_source) continue;
      const src = sourceById[ev.source_id];
      const reasons = [];
      if (needsReview(ev.review_status)) reasons.push(`Event review_status is ${ev.review_status}.`);
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
        parent_timeline_id: t.timeline_id,
        missing_official_url: !src?.official_url,
        verified_on_source_false: !ev.verified_on_source,
      });
    }
  }
  for (const e of exportSamples) {
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
      missing_official_url: false,
      verified_on_source_false: false,
    });
  }

  for (const v of verifications) {
    if (v.check_result !== "not_checked" && v.check_result !== "uncertain") continue;
    const related = recordById[v.item_id];
    const src = sourceById[v.source_id];
    items.push({
      item_type: "source_verification",
      item_id: v.verification_id,
      title: `Verification: ${v.item_id} (${v.check_result})`,
      jurisdiction_id: related?.jurisdiction_id ?? src?.jurisdiction_id ?? "oecd",
      review_status: v.review_status_after_check,
      reason_for_review: `Source verification check_result is ${v.check_result}.`,
      official_url: v.official_url_checked,
      page_href: "/verification/",
      missing_official_url: false,
      verified_on_source_false: true,
    });
  }

  return items;
}

const reviewQueueItems = buildReviewQueue();
const reviewSummary = {
  total: reviewQueueItems.length,
  pending_review: reviewQueueItems.filter((i) => i.review_status === "pending_review").length,
  needs_update: reviewQueueItems.filter((i) => i.review_status === "needs_update").length,
  unverified_timeline_events: reviewQueueItems.filter(
    (i) => i.item_type === "timeline_event" && i.verified_on_source_false,
  ).length,
  unverified_records: reviewQueueItems.filter(
    (i) => i.item_type === "record" && i.verified_on_source_false,
  ).length,
  pending_source_verifications: reviewQueueItems.filter(
    (i) => i.item_type === "source_verification",
  ).length,
  missing_official_url: reviewQueueItems.filter((i) => i.missing_official_url).length,
};

function countsForJurisdiction(jurisdictionId) {
  return {
    sources: sources.filter((s) => s.jurisdiction_id === jurisdictionId).length,
    records: records.filter((r) => r.jurisdiction_id === jurisdictionId).length,
    changes: changes.filter((c) => c.jurisdiction_id === jurisdictionId).length,
    timelines: timelines.filter((t) => t.jurisdiction_id === jurisdictionId).length,
  };
}

const mapMarkers = jurisdictions
  .filter((j) => j.map)
  .map((j) => ({
    jurisdiction_id: j.jurisdiction_id,
    name: j.name,
    region: j.region,
    type: j.type,
    monitoring_priority: j.monitoring_priority,
    review_status: j.review_status,
    map: j.map,
    counts: countsForJurisdiction(j.jurisdiction_id),
    page_href: `/jurisdictions/${j.jurisdiction_id}/`,
  }));

const snapshot = {
  generated_at: generatedAt,
  version: "0.6.0",
  disclaimer: DISCLAIMER,
  pilot_jurisdictions: jurisdictions.map((j) => j.jurisdiction_id),
  counts: {
    jurisdictions: jurisdictions.length,
    sources: sources.length,
    records: records.length,
    laws: laws.length,
    guidance: guidance.length,
    changes: changes.length,
    timelines: timelines.length,
    verifications: verifications.length,
    export_samples: exportSamples.length,
    map_markers: mapMarkers.length,
    review_queue_items: reviewSummary.total,
    pending_review: reviewSummary.pending_review,
    needs_update: reviewSummary.needs_update,
    unverified_timeline_events: reviewSummary.unverified_timeline_events,
    unverified_records: reviewSummary.unverified_records,
    pending_source_verifications: reviewSummary.pending_source_verifications,
    exports: 9,
  },
  feeds: {
    changes_rss: "/feeds/changes.xml",
  },
  data_files: {
    jurisdictions: "/data/jurisdictions.json",
    sources: "/data/sources.json",
    records: "/data/records.json",
    changes: "/data/changes.json",
    export_samples: "/data/export-samples.json",
    timelines: "/data/timelines.json",
    map_coverage: "/data/map-coverage.json",
    review_queue: "/data/review-queue.json",
    verifications: "/data/verifications.json",
  },
  review_notice:
    "All pilot content is curated manual YAML. Human review required before client use.",
};

// Write JSON files
writeJson(path.join(PUBLIC_DATA, "jurisdictions.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  items: jurisdictions,
});

writeJson(path.join(PUBLIC_DATA, "sources.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  items: sources,
});

writeJson(path.join(PUBLIC_DATA, "records.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  items: records,
});

writeJson(path.join(PUBLIC_DATA, "changes.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  items: changes.map((c) => ({
    ...c,
    sample_only: c.record_origin === "manual_sample",
    human_review_required: c.requires_human_review !== false,
  })),
});

writeJson(path.join(PUBLIC_DATA, "timelines.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  items: timelines.map((t) => ({
    ...t,
    event_count: t.events?.length ?? 0,
  })),
});

writeJson(path.join(PUBLIC_DATA, "export-samples.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  sample_only: true,
  not_client_evidence: true,
  items: exportSamples,
});

writeJson(path.join(PUBLIC_DATA, "map-coverage.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  implementation: {
    type: "static-svg",
    leaflet_used: false,
    remote_tiles: false,
    attribution: null,
    note: "Equirectangular SVG projection from manual YAML coordinates. Display markers only.",
  },
  marker_count: mapMarkers.length,
  markers: mapMarkers,
});

writeJson(path.join(PUBLIC_DATA, "review-queue.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  read_only: true,
  summary: reviewSummary,
  items: reviewQueueItems,
});

writeJson(path.join(PUBLIC_DATA, "verifications.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  batches: verificationBatches,
  items: verifications,
  summary: {
    total: verifications.length,
    not_checked: verifications.filter((v) => v.check_result === "not_checked").length,
    uncertain: verifications.filter((v) => v.check_result === "uncertain").length,
    client_use_allowed: verifications.filter((v) => v.client_use_allowed).length,
  },
});

writeJson(path.join(PUBLIC_DATA, "regulation-watch-snapshot.json"), snapshot);

// RSS feed — sample changes only
const siteBase = "https://regulations.caesar.no";
const channelTitle = "Caesar AI Regulation Watch — Sample changes (pilot)";
const channelDescription = stripMultiline(
  "Manual sample regulatory change records for governance review. Not legal advice. Not automated monitoring. Human review required.",
);

const items = changes
  .map((c) => {
    const title = `Sample change: ${c.change_id} (${c.jurisdiction_id})`;
    const link = `${siteBase}/changes/${c.change_id}/`;
    const description = stripMultiline(
      `${c.change_summary_for_review} Possible impact (for review only): ${stripMultiline(c.possible_impact)} Not legal advice. Human review required.`,
    );
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${toRfc822(c.detected_date)}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
  })
  .join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${siteBase}/changes/</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>en</language>
    <lastBuildDate>${toRfc822(generatedAt)}</lastBuildDate>
    <atom:link href="${siteBase}/feeds/changes.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>Feed notice: sample data only</title>
      <link>${siteBase}/methodology/</link>
      <guid isPermaLink="true">${siteBase}/feeds/changes.xml#notice</guid>
      <pubDate>${toRfc822(generatedAt)}</pubDate>
      <description>${escapeXml(DISCLAIMER)}</description>
    </item>
${items}
  </channel>
</rss>
`;

fs.mkdirSync(PUBLIC_FEEDS, { recursive: true });
fs.writeFileSync(path.join(PUBLIC_FEEDS, "changes.xml"), rss, "utf8");

console.log("Generated static exports:");
console.log("  public/data/jurisdictions.json");
console.log("  public/data/sources.json");
console.log("  public/data/records.json");
console.log("  public/data/changes.json");
console.log("  public/data/export-samples.json");
console.log("  public/data/timelines.json");
console.log("  public/data/map-coverage.json");
console.log("  public/data/review-queue.json");
console.log("  public/data/verifications.json");
console.log("  public/data/regulation-watch-snapshot.json");
console.log(`  ${reviewQueueItems.length} item(s) in review queue export`);
console.log(`  ${verifications.length} verification(s) exported`);
console.log("  public/feeds/changes.xml");
console.log(`  ${changes.length} change(s) in RSS feed`);
