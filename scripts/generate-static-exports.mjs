#!/usr/bin/env node
/**
 * Generate static JSON exports and RSS feed from local YAML (no remote fetch).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { readProjectVersion } from "./lib/read-project-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_VERSION = readProjectVersion();
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

function readSnapshots() {
  const root = path.join(ROOT, "data/snapshots");
  if (!fs.existsSync(root)) return [];
  const items = [];
  for (const sourceDir of fs.readdirSync(root)) {
    const dir = path.join(root, sourceDir);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".yml") || f === "latest.yml") continue;
      items.push(yaml.load(fs.readFileSync(path.join(dir, f), "utf8")));
    }
  }
  return items.sort((a, b) => b.checked_at.localeCompare(a.checked_at));
}

function readWatcherRuns() {
  return readYamlDir("data/watcher-runs").sort((a, b) =>
    b.run_date.localeCompare(a.run_date),
  );
}

function readMonitoringRuns() {
  return readYamlDir("data/monitoring-runs")
    .filter((r) => r?.monitoring_run_id)
    .sort((a, b) => b.run_date.localeCompare(a.run_date));
}

function readWatcherEligibility() {
  const dir = path.join(ROOT, "data/monitoring");
  if (!fs.existsSync(dir)) return { batch: null, entries: [] };
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("watcher-eligibility-") && (f.endsWith(".yml") || f.endsWith(".yaml")))
    .sort()
    .reverse();
  if (files.length === 0) return { batch: null, entries: [] };
  const batch = yaml.load(fs.readFileSync(path.join(dir, files[0]), "utf8"));
  const entries = (batch?.entries ?? []).map((e) => ({
    ...e,
    watcher_eligibility_batch_id: batch.watcher_eligibility_batch_id,
  }));
  return { batch, entries };
}

function readWatcherMonitoringRuns() {
  const dir = path.join(ROOT, "data/monitoring");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(
      (f) =>
        f.startsWith("monitoring-run-") && (f.endsWith(".yml") || f.endsWith(".yaml")),
    )
    .map((f) => yaml.load(fs.readFileSync(path.join(dir, f), "utf8")))
    .filter((r) => r?.monitoring_run_id)
    .sort(
      (a, b) =>
        b.run_date.localeCompare(a.run_date) ||
        b.monitoring_run_id.localeCompare(a.monitoring_run_id),
    );
}

function readMonitoringSourceConfigs() {
  const dir = path.join(ROOT, "data/monitoring");
  if (!fs.existsSync(dir)) return { batch: null, configs: [] };
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("source-configs-") && (f.endsWith(".yml") || f.endsWith(".yaml")))
    .sort()
    .reverse();
  if (files.length === 0) return { batch: null, configs: [] };
  const batch = yaml.load(fs.readFileSync(path.join(dir, files[0]), "utf8"));
  const configs = (batch?.configs ?? []).map((c) => ({
    ...c,
    monitoring_source_config_batch_id: batch.monitoring_source_config_batch_id,
  }));
  return { batch, configs };
}

function readDetectedChanges() {
  return readYamlDir("data/detected-changes").sort((a, b) =>
    b.detected_at.localeCompare(a.detected_at),
  );
}

function readEvidenceExportCandidates() {
  const dir = path.join(ROOT, "data/evidence-export-candidates");
  if (!fs.existsSync(dir)) return { batch: null, candidates: [] };
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    .sort()
    .reverse();
  if (files.length === 0) return { batch: null, candidates: [] };
  const batch = yaml.load(fs.readFileSync(path.join(dir, files[0]), "utf8"));
  const candidates = (batch?.candidates ?? []).map((c) => ({
    ...c,
    evidence_export_candidate_batch_id: batch.evidence_export_candidate_batch_id,
    is_candidate_not_final_export: true,
    not_client_evidence: true,
  }));
  return { batch, candidates };
}

function readSourceDiscoveryLeads() {
  const dir = path.join(ROOT, "data/source-discovery");
  if (!fs.existsSync(dir)) return { batch: null, leads: [] };
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    .sort()
    .reverse();
  if (files.length === 0) return { batch: null, leads: [] };
  const batch = yaml.load(fs.readFileSync(path.join(dir, files[0]), "utf8"));
  const leads = (batch?.leads ?? []).map((lead) => ({
    ...lead,
    source_discovery_batch_id: batch.source_discovery_batch_id,
    competitor_discovery_only:
      lead.discovered_from_type === "competitor_tracker",
    not_authority_source:
      lead.verification_status === "rejected_not_official" ||
      lead.discovered_from_type === "competitor_tracker",
  }));
  return { batch, leads };
}

function readEvidenceExportCandidateReviews() {
  const abs = path.join(ROOT, "data/verifications");
  if (!fs.existsSync(abs)) return { batch: null, reviews: [] };
  const files = fs
    .readdirSync(abs)
    .filter(
      (f) =>
        f.startsWith("evidence-export-candidate-review") &&
        (f.endsWith(".yml") || f.endsWith(".yaml")),
    )
    .sort()
    .reverse();
  if (files.length === 0) return { batch: null, reviews: [] };
  const batch = yaml.load(fs.readFileSync(path.join(abs, files[0]), "utf8"));
  const reviews = (batch?.candidate_reviews ?? []).map((r) => ({
    ...r,
    evidence_export_candidate_review_batch_id: batch.evidence_export_candidate_review_batch_id,
  }));
  return { batch, reviews };
}

function latestReviewByCandidateId(reviews) {
  const map = new Map();
  for (const r of reviews) {
    const existing = map.get(r.candidate_id);
    if (!existing || r.review_date >= existing.review_date) {
      map.set(r.candidate_id, r);
    }
  }
  return map;
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
function readVerificationDir(prefix) {
  const abs = path.join(ROOT, "data/verifications");
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.startsWith(prefix) && (f.endsWith(".yml") || f.endsWith(".yaml")))
    .map((f) => yaml.load(fs.readFileSync(path.join(abs, f), "utf8")));
}

const verificationBatches = [
  ...readVerificationDir("source-verification"),
  ...readVerificationDir("source-identity-review"),
];
const urlCheckBatches = readVerificationDir("url-check");
const contentReviewBatches = readVerificationDir("content-review");
const contentReviews = contentReviewBatches.flatMap((b) =>
  (b.content_reviews ?? []).map((cr) => ({
    ...cr,
    content_review_batch_id: b.content_review_batch_id,
  })),
);
const contentReviewByItem = Object.fromEntries(
  [...contentReviews]
    .sort((a, b) => b.review_date.localeCompare(a.review_date))
    .map((cr) => [cr.item_id, cr]),
);
const verifications = verificationBatches.flatMap((b) =>
  (b.verifications ?? []).map((v) => ({
    ...v,
    verification_batch_id: b.verification_batch_id,
  })),
);
const urlChecks = urlCheckBatches.flatMap((b) =>
  (b.url_checks ?? []).map((c) => ({
    ...c,
    url_check_batch_id: b.url_check_batch_id,
  })),
);
const watcherConfig = readYamlFile("data/watchers/official-source-watchers.yml");
const watchers = watcherConfig?.watchers ?? [];
const snapshots = readSnapshots();
const watcherRuns = readWatcherRuns();
const monitoringRuns = readMonitoringRuns();
const latestMonitoringRun = monitoringRuns[0] ?? null;
const { batch: watcherEligibilityBatch, entries: watcherEligibilityEntries } =
  readWatcherEligibility();
const watcherMonitoringRuns = readWatcherMonitoringRuns();
const latestWatcherMonitoringRun = watcherMonitoringRuns[0] ?? null;
const { batch: monitoringSourceConfigBatch, configs: monitoringSourceConfigs } =
  readMonitoringSourceConfigs();
const monitoringDiffSummaryPath = path.join(
  ROOT,
  "data/monitoring-runs/latest-monitoring-diff-summary.json",
);
let latestMonitoringDiffSummary = null;
if (fs.existsSync(monitoringDiffSummaryPath)) {
  try {
    latestMonitoringDiffSummary = JSON.parse(
      fs.readFileSync(monitoringDiffSummaryPath, "utf8"),
    );
  } catch {
    latestMonitoringDiffSummary = null;
  }
}
const detectedChanges = readDetectedChanges();
const { batch: sourceDiscoveryBatch, leads: sourceDiscoveryLeads } =
  readSourceDiscoveryLeads();
const { batch: evidenceCandidateBatch, candidates: rawEvidenceExportCandidates } =
  readEvidenceExportCandidates();
const { batch: evidenceCandidateReviewBatch, reviews: evidenceCandidateReviews } =
  readEvidenceExportCandidateReviews();
const reviewByCandidateId = latestReviewByCandidateId(evidenceCandidateReviews);
const evidenceExportCandidates = rawEvidenceExportCandidates.map((c) => {
  const review = reviewByCandidateId.get(c.candidate_id);
  return {
    ...c,
    candidate_review_status: review?.candidate_review_status ?? null,
    candidate_review_id: review?.candidate_review_id ?? null,
    final_evidence_allowed: false,
  };
});
const latestWatcherRun = watcherRuns[0] ?? null;

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

const generatedAt = evidenceCandidateBatch?.generated_at ?? "2026-05-20";

function needsReview(status) {
  return status !== "reviewed";
}

function urlCheckForRecord(recordId, urlChecks) {
  return (
    urlChecks.find((c) => c.item_id === recordId && c.item_type === "law") ??
    urlChecks.find((c) => c.item_id === recordId && c.item_type === "guidance")
  );
}

function technicalReasonsFromCheck(check, identityReviewed = false, includeContentReason = true) {
  if (!check) return ["technical_url_unchecked"];
  const reasons = [];
  const ok = check.check_result === "reachable" || check.check_result === "reachable_redirected";
  if (check.check_result === "not_checked" || check.check_result === "uncertain") {
    reasons.push("technical_url_unchecked");
  }
  if (["unreachable", "timeout", "dns_error", "network_error"].includes(check.check_result)) {
    reasons.push("technical_url_unreachable");
  } else if (ok && identityReviewed) {
    reasons.push("technical_url_fixed");
  }
  if ((check.check_result === "reachable_redirected" || check.redirect_detected) && !identityReviewed) {
    reasons.push("redirected_url_needs_review");
  }
  if (includeContentReason && check.content_review_status === "not_reviewed") {
    reasons.push("content_not_reviewed");
  }
  if (!check.client_use_allowed) {
    reasons.push("client_use_not_allowed");
  }
  return reasons;
}

function identityReasonsForSource(sourceId, identityBySource) {
  const identity = identityBySource[sourceId];
  if (!identity) return [];
  if (identity.review_status_after_check === "reviewed_source_identity_only") {
    return ["source_identity_reviewed_only"];
  }
  return [];
}

function mergeReasons(...groups) {
  return [...new Set(groups.flat())];
}

function contentReasonsForItem(itemId, recordContentStatus, contentReview) {
  const reasons = [];
  const status = recordContentStatus ?? contentReview?.content_review_status_after_check ?? "not_reviewed";
  if (status === "not_reviewed" || !contentReview) {
    reasons.push("content_not_reviewed");
  }
  if (status === "needs_update" || contentReview?.content_review_status_after_check === "needs_update") {
    reasons.push("content_review_needs_update");
  }
  if (
    contentReview?.source_support_level === "unclear" ||
    contentReview?.review_result === "source_support_unclear"
  ) {
    reasons.push("source_support_unclear");
  }
  if (status === "reviewed_content_summary") {
    reasons.push("client_use_not_allowed");
  }
  return reasons;
}

const REASON_LABELS = {
  pending_review: "Editorial review_status is not reviewed.",
  technical_url_unchecked: "Technical URL not checked or outcome uncertain.",
  technical_url_unreachable: "Official URL unreachable (HTTP/network error).",
  technical_url_fixed: "Technical URL reachable after remediation (content review still required).",
  redirected_url_needs_review: "URL redirects; confirm canonical destination.",
  source_identity_reviewed_only:
    "Official source identity reviewed only; content/legal review not done.",
  content_not_reviewed: "Content summary not human-reviewed.",
  content_review_needs_update: "Content review flagged fields needing update.",
  source_support_unclear: "Source support for summary/dates/status is unclear.",
  detected_change_needs_content_review: "Detected change has no completed content review.",
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
  api_detected_change_pending_review:
    "API watcher detected new result metadata; human review required.",
  simulated_api_detected_change_pending_review:
    "Simulated API diff for pipeline validation only; not an official API update.",
  watcher_error: "Latest watcher run reported a fetch or check error for this source.",
  watcher_soft_error:
    "Watcher soft-failed; last good snapshot preserved. Human triage required.",
  monitoring_run_failed:
    "Latest monitoring cycle did not complete successfully (validate/build or hard failure).",
  monitoring_manual_or_blocked:
    "Watcher eligibility marks source manual-only or blocked; automated fetch not performed.",
  monitoring_status_check_failed:
    "Deterministic monitoring run reported status_check_failed for this source.",
  monitoring_change_possible:
    "Monitoring run flagged possible change; human review required before record update.",
  snapshot_changed: "New metadata snapshot differs from previous; confirm on official source.",
  human_review_required: "Watcher output requires human review before any record update.",
};

function reasonText(reasons) {
  return reasons.map((r) => REASON_LABELS[r] ?? r).join(" ");
}

function buildReviewQueue() {
  const items = [];
  const sourceById = Object.fromEntries(sources.map((s) => [s.source_id, s]));
  const urlCheckBySource = Object.fromEntries(
    urlChecks.filter((c) => c.item_type === "source").map((c) => [c.item_id, c]),
  );
  const identityBySource = Object.fromEntries(
    verifications
      .filter((v) => v.verification_batch_id?.startsWith("source-identity-review"))
      .map((v) => [v.source_id, v]),
  );

  for (const j of jurisdictions) {
    if (!needsReview(j.review_status)) continue;
    const review_reasons = ["pending_review"];
    items.push({
      item_type: "jurisdiction",
      item_id: j.jurisdiction_id,
      title: j.name,
      jurisdiction_id: j.jurisdiction_id,
      review_status: j.review_status,
      reason_for_review: reasonText(review_reasons),
      review_reasons,
      official_url: null,
      page_href: `/jurisdictions/${j.jurisdiction_id}/`,
      missing_official_url: false,
      verified_on_source_false: false,
      technical_url_status: null,
      content_review_status: null,
      redirect_detected: false,
      client_use_allowed: null,
    });
  }

  for (const s of sources) {
    const urlCheck = urlCheckBySource[s.source_id];
    const idReasons = identityReasonsForSource(s.source_id, identityBySource);
    const identityDone = idReasons.includes("source_identity_reviewed_only");
    const review_reasons = mergeReasons(
      needsReview(s.review_status) ? ["pending_review"] : [],
      s.review_status === "needs_update" ? ["needs_update"] : [],
      idReasons,
      technicalReasonsFromCheck(urlCheck, identityDone),
    );
    if (!s.official_url) review_reasons.push("technical_url_unchecked");
    if (review_reasons.length === 0 && s.official_url && !needsReview(s.review_status)) continue;
    items.push({
      item_type: "source",
      item_id: s.source_id,
      title: s.title,
      jurisdiction_id: s.jurisdiction_id,
      review_status: s.review_status,
      reason_for_review: reasonText(review_reasons),
      review_reasons,
      official_url: s.official_url ?? null,
      page_href: `/sources/${s.source_id}/`,
      missing_official_url: !s.official_url,
      verified_on_source_false: false,
      technical_url_status: urlCheck?.check_result ?? null,
      content_review_status: urlCheck?.content_review_status ?? null,
      redirect_detected: urlCheck?.redirect_detected ?? false,
      client_use_allowed: urlCheck?.client_use_allowed ?? null,
    });
  }

  for (const r of records) {
    const urlCheck = urlCheckForRecord(r.record_id, urlChecks);
    const contentReview = contentReviewByItem[r.record_id];
    const recordContentStatus =
      r.content_review_status ?? contentReview?.content_review_status_after_check ?? "not_reviewed";
    const recordUnverified = r.verified_on_source !== true;
    const identityDone = identityReasonsForSource(r.source_id, identityBySource).includes(
      "source_identity_reviewed_only",
    );
    const review_reasons = mergeReasons(
      needsReview(r.review_status) ? ["pending_review"] : [],
      recordUnverified ? ["verified_on_source_false", "legal_review_not_done"] : [],
      contentReasonsForItem(r.record_id, recordContentStatus, contentReview),
      technicalReasonsFromCheck(urlCheck, identityDone, false),
    );
    const verification = verifications.find((v) => v.item_id === r.record_id);
    if (verification && !verification.client_use_allowed) {
      review_reasons.push("client_use_not_allowed");
    }
    if (review_reasons.length === 0) continue;
    items.push({
      item_type: "record",
      item_id: r.record_id,
      title: r.title,
      jurisdiction_id: r.jurisdiction_id,
      review_status: r.review_status,
      reason_for_review: reasonText(review_reasons),
      review_reasons,
      official_url: r.official_url ?? null,
      page_href: `/records/${r.record_id}/`,
      missing_official_url: !r.official_url,
      verified_on_source_false: recordUnverified,
      technical_url_status: urlCheck?.check_result ?? null,
      content_review_status: recordContentStatus,
      content_review_result: contentReview?.review_result ?? null,
      redirect_detected: urlCheck?.redirect_detected ?? false,
      client_use_allowed:
        contentReview?.client_use_allowed ??
        urlCheck?.client_use_allowed ??
        verification?.client_use_allowed ??
        null,
    });
  }

  for (const c of changes) {
    if (!needsReview(c.review_status)) continue;
    const review_reasons = ["pending_review"];
    items.push({
      item_type: "change",
      item_id: c.change_id,
      title: c.change_id,
      jurisdiction_id: c.jurisdiction_id,
      review_status: c.review_status,
      reason_for_review: reasonText(review_reasons),
      review_reasons,
      official_url: sourceById[c.source_id]?.official_url ?? null,
      page_href: `/changes/${c.change_id}/`,
      missing_official_url: false,
      verified_on_source_false: false,
      technical_url_status: null,
      content_review_status: null,
      redirect_detected: false,
      client_use_allowed: null,
    });
  }

  for (const t of timelines) {
    if (needsReview(t.review_status)) {
      const review_reasons = ["pending_review"];
      items.push({
        item_type: "timeline",
        item_id: t.timeline_id,
        title: t.title,
        jurisdiction_id: t.jurisdiction_id,
        review_status: t.review_status,
        reason_for_review: reasonText(review_reasons),
        review_reasons,
        official_url: null,
        page_href: `/timelines/${t.timeline_id}/`,
        missing_official_url: false,
        verified_on_source_false: false,
        technical_url_status: null,
        content_review_status: null,
        redirect_detected: false,
        client_use_allowed: null,
      });
    }
    for (const ev of t.events ?? []) {
      if (!needsReview(ev.review_status) && ev.verified_on_source) continue;
      const src = sourceById[ev.source_id];
      const urlCheck = urlCheckBySource[ev.source_id];
      const identityDone = identityReasonsForSource(ev.source_id, identityBySource).includes(
        "source_identity_reviewed_only",
      );
      const review_reasons = mergeReasons(
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
        reason_for_review: reasonText(review_reasons),
        review_reasons,
        official_url: src?.official_url ?? null,
        page_href: `/timelines/${t.timeline_id}/`,
        parent_timeline_id: t.timeline_id,
        missing_official_url: !src?.official_url,
        verified_on_source_false: !ev.verified_on_source,
        technical_url_status: urlCheck?.check_result ?? null,
        content_review_status: urlCheck?.content_review_status ?? null,
        redirect_detected: urlCheck?.redirect_detected ?? false,
        client_use_allowed: urlCheck?.client_use_allowed ?? null,
      });
    }
  }

  for (const e of exportSamples) {
    if (!needsReview(e.review_status)) continue;
    const review_reasons = ["pending_review"];
    items.push({
      item_type: "export_sample",
      item_id: e.export_record_id,
      title: e.export_record_id,
      jurisdiction_id: e.jurisdiction_id,
      review_status: e.review_status,
      reason_for_review: reasonText(review_reasons),
      review_reasons,
      official_url: null,
      page_href: "/exports/",
      missing_official_url: false,
      verified_on_source_false: false,
      technical_url_status: null,
      content_review_status: null,
      redirect_detected: false,
      client_use_allowed: null,
    });
  }

  for (const dc of detectedChanges) {
    if (!needsReview(dc.review_status)) continue;
    const src = sourceById[dc.source_id];
    const contentReview = contentReviewByItem[dc.detected_change_id];
    const dcContentStatus =
      dc.content_review_status ?? contentReview?.content_review_status_after_check ?? "not_reviewed";
    const adapterType =
      dc.source_adapter_type ?? dc.adapter_id ?? "official_page_metadata";
    const isFeed = adapterType === "official_rss_or_feed";
    const isApi = adapterType === "official_api_metadata";
    const review_reasons = mergeReasons(
      [
        dc.simulation
          ? isApi
            ? "simulated_api_detected_change_pending_review"
            : isFeed
              ? "simulated_feed_detected_change_pending_review"
              : "simulated_detected_change_pending_review"
          : isApi
            ? "api_detected_change_pending_review"
            : isFeed
              ? "feed_detected_change_pending_review"
              : "detected_change_pending_review",
        "human_review_required",
        "legal_review_not_done",
        "verified_on_source_false",
        "client_use_not_allowed",
      ],
      dcContentStatus === "not_reviewed" || !contentReview
        ? ["detected_change_needs_content_review", "content_not_reviewed"]
        : contentReasonsForItem(dc.detected_change_id, dcContentStatus, contentReview),
    );
    items.push({
      item_type: "detected_change",
      item_id: dc.detected_change_id,
      title: dc.simulation
        ? `[Simulation] ${isApi ? "API" : isFeed ? "Feed" : "Page"} change: ${dc.source_id}`
        : `${isApi ? "API" : isFeed ? "Feed" : "Page"} change: ${dc.source_id}`,
      jurisdiction_id: dc.jurisdiction_id,
      review_status: dc.review_status,
      reason_for_review: reasonText(review_reasons),
      review_reasons,
      official_url: src?.official_url ?? null,
      page_href: `/detected-changes/${dc.detected_change_id}/`,
      missing_official_url: !src?.official_url,
      verified_on_source_false: true,
      technical_url_status: null,
      content_review_status: dcContentStatus,
      content_review_result: dc.review_result ?? contentReview?.review_result ?? null,
      recommended_next_action:
        dc.recommended_next_action ?? contentReview?.recommended_next_action ?? null,
      redirect_detected: false,
      client_use_allowed: false,
    });
  }

  if (latestWatcherRun) {
    for (const r of latestWatcherRun.results ?? []) {
      if (r.status !== "error") continue;
      const src = sourceById[r.source_id];
      const isSoft = r.soft_fail !== false;
      const review_reasons = isSoft
        ? ["watcher_soft_error", "technical_url_unchecked", "human_review_required"]
        : ["watcher_error", "technical_url_unchecked", "human_review_required"];
      items.push({
        item_type: isSoft ? "watcher_soft_error" : "watcher_error",
        item_id: `${latestWatcherRun.run_id}-${r.watcher_id}`,
        title: `Watcher ${isSoft ? "soft error" : "error"}: ${r.source_id}`,
        jurisdiction_id: src?.jurisdiction_id ?? "eu",
        review_status: "needs_human_review",
        reason_for_review: `${r.error_message ?? "Watcher check failed."} ${reasonText(review_reasons)}`,
        review_reasons,
        official_url: src?.official_url ?? null,
        page_href: `/watchers/${r.watcher_id}/`,
        missing_official_url: !src?.official_url,
        verified_on_source_false: true,
        technical_url_status: null,
        content_review_status: "not_reviewed",
        redirect_detected: false,
        client_use_allowed: false,
      });
    }
  }

  if (latestWatcherMonitoringRun) {
    for (const chk of latestWatcherMonitoringRun.checks ?? []) {
      const needsQueue =
        chk.requires_human_review === true ||
        chk.check_result === "blocked_not_checked" ||
        chk.check_result === "manual_only_not_checked" ||
        chk.check_result === "status_check_failed" ||
        chk.check_result === "fetch_failed_needs_review" ||
        chk.change_detected === true;
      if (!needsQueue) continue;
      const src = sourceById[chk.source_id];
      const review_reasons = mergeReasons(
        chk.change_detected ? ["monitoring_change_possible"] : [],
        chk.check_result === "status_check_failed"
          ? ["monitoring_status_check_failed"]
          : ["monitoring_manual_or_blocked", "human_review_required"],
        ["verified_on_source_false", "client_use_not_allowed"],
      );
      items.push({
        item_type: "source",
        item_id: chk.source_id,
        title: `Monitoring review: ${chk.source_id} (${chk.check_result})`,
        jurisdiction_id: src?.jurisdiction_id ?? "eu",
        review_status: "needs_human_review",
        reason_for_review: `${chk.notes ?? ""} ${reasonText(review_reasons)}`.trim(),
        review_reasons,
        official_url: chk.url ?? src?.official_url ?? null,
        page_href: "/monitoring/",
        missing_official_url: !chk.url && !src?.official_url,
        verified_on_source_false: true,
        technical_url_status: null,
        content_review_status: "not_reviewed",
        redirect_detected: false,
        client_use_allowed: false,
      });
    }
  }

  if (latestMonitoringRun && latestMonitoringRun.overall_status === "failed") {
    items.push({
      item_type: "monitoring_run",
      item_id: latestMonitoringRun.monitoring_run_id,
      title: `Monitoring cycle failed: ${latestMonitoringRun.run_date}`,
      jurisdiction_id: "eu",
      review_status: "needs_human_review",
      reason_for_review: reasonText([
        "monitoring_run_failed",
        "human_review_required",
      ]),
      review_reasons: ["monitoring_run_failed", "human_review_required"],
      official_url: null,
      page_href: "/monitoring/",
      missing_official_url: false,
      verified_on_source_false: true,
      technical_url_status: null,
      content_review_status: "not_reviewed",
      redirect_detected: false,
      client_use_allowed: false,
    });
  }

  for (const v of verifications) {
    if (v.check_result !== "not_checked" && v.check_result !== "uncertain") continue;
    const related = records.find((r) => r.record_id === v.item_id);
    const src = sourceById[v.source_id];
    const review_reasons = [
      "content_not_reviewed",
      "client_use_not_allowed",
      "technical_url_unchecked",
    ];
    items.push({
      item_type: "source_verification",
      item_id: v.verification_id,
      title: `Source verification: ${v.item_id}`,
      jurisdiction_id: related?.jurisdiction_id ?? src?.jurisdiction_id ?? "oecd",
      review_status: v.review_status_after_check,
      reason_for_review: `Human source verification ${v.check_result}. ${reasonText(review_reasons)}`,
      review_reasons,
      official_url: v.official_url_checked,
      page_href: "/verification/",
      missing_official_url: false,
      verified_on_source_false: true,
      technical_url_status: null,
      content_review_status: "not_reviewed",
      redirect_detected: false,
      client_use_allowed: v.client_use_allowed,
    });
  }

  return items;
}

const reviewQueueItems = buildReviewQueue();
const countReason = (key) =>
  reviewQueueItems.filter((i) => i.review_reasons?.includes(key)).length;

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
  technical_url_unchecked: countReason("technical_url_unchecked"),
  technical_url_unreachable: countReason("technical_url_unreachable"),
  redirected_url_needs_review: countReason("redirected_url_needs_review"),
  content_not_reviewed: countReason("content_not_reviewed"),
  content_review_needs_update: countReason("content_review_needs_update"),
  source_support_unclear: countReason("source_support_unclear"),
  detected_change_needs_content_review: countReason("detected_change_needs_content_review"),
  client_use_not_allowed: countReason("client_use_not_allowed"),
  detected_change_pending_review: countReason("detected_change_pending_review"),
  watcher_errors: countReason("watcher_error"),
  watcher_soft_errors: countReason("watcher_soft_error"),
  monitoring_run_failed: countReason("monitoring_run_failed"),
  monitoring_manual_or_blocked: countReason("monitoring_manual_or_blocked"),
  monitoring_status_check_failed: countReason("monitoring_status_check_failed"),
  monitoring_change_possible: countReason("monitoring_change_possible"),
  human_review_required_watcher: countReason("human_review_required"),
};

const urlCheckSummary = {
  total: urlChecks.length,
  reachable: urlChecks.filter((c) => c.check_result === "reachable").length,
  reachable_redirected: urlChecks.filter((c) => c.check_result === "reachable_redirected").length,
  unreachable: urlChecks.filter((c) => c.check_result === "unreachable").length,
  timeout: urlChecks.filter((c) => c.check_result === "timeout").length,
  dns_error: urlChecks.filter((c) => c.check_result === "dns_error").length,
  network_error: urlChecks.filter((c) => c.check_result === "network_error").length,
  not_checked: urlChecks.filter((c) => c.check_result === "not_checked").length,
  uncertain: urlChecks.filter((c) => c.check_result === "uncertain").length,
  content_review_not_reviewed: urlChecks.filter(
    (c) => c.content_review_status === "not_reviewed",
  ).length,
  client_use_allowed_count: urlChecks.filter((c) => c.client_use_allowed).length,
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

const identityVerifications = verifications.filter((v) =>
  v.verification_batch_id?.startsWith("source-identity-review"),
);
const recordVerifications = verifications.filter((v) =>
  v.verification_batch_id?.startsWith("source-verification"),
);

const watcherErrorCount = latestWatcherRun?.error_count ?? 0;
const simulatedDetectedChanges = detectedChanges.filter((d) => d.simulation === true);
const realDetectedChanges = detectedChanges.filter((d) => !d.simulation);
const feedWatchers = watchers.filter(
  (w) => w.adapter_id === "official_rss_or_feed" || w.watcher_type === "official_rss_or_feed",
);
const feedSnapshots = snapshots.filter(
  (s) => s.snapshot_kind === "feed_metadata" || s.feed_url,
);
const isFeedChange = (d) =>
  d.adapter_id === "official_rss_or_feed" ||
  String(d.change_type ?? "").includes("feed");
const feedDetectedChanges = detectedChanges.filter(isFeedChange);
const simulatedFeedDetectedChanges = feedDetectedChanges.filter((d) => d.simulation);
const realFeedDetectedChanges = feedDetectedChanges.filter((d) => !d.simulation);
const apiWatchers = watchers.filter(
  (w) => w.adapter_id === "official_api_metadata" || w.watcher_type === "official_api_metadata",
);
const apiSnapshots = snapshots.filter(
  (s) => s.snapshot_kind === "api_metadata" || s.api_url,
);
const isApiChange = (d) =>
  d.source_adapter_type === "official_api_metadata" ||
  d.adapter_id === "official_api_metadata" ||
  String(d.change_type ?? "").includes("api");
const apiDetectedChanges = detectedChanges.filter(isApiChange);
const simulatedApiDetectedChanges = apiDetectedChanges.filter((d) => d.simulation);
const realApiDetectedChanges = apiDetectedChanges.filter((d) => !d.simulation);

const contentReviewSummary = {
  total: contentReviews.length,
  not_checked: contentReviews.filter((cr) => cr.review_result === "not_checked").length,
  matches_source: contentReviews.filter((cr) => cr.review_result === "matches_source_at_high_level")
    .length,
  needs_update: contentReviews.filter((cr) => cr.review_result === "needs_update").length,
  reviewed_content_summary: contentReviews.filter(
    (cr) => cr.content_review_status_after_check === "reviewed_content_summary",
  ).length,
  content_needs_update: contentReviews.filter(
    (cr) => cr.content_review_status_after_check === "needs_update",
  ).length,
  verified_on_source_after_check: contentReviews.filter((cr) => cr.verified_on_source_after_check)
    .length,
  client_use_allowed: contentReviews.filter((cr) => cr.client_use_allowed).length,
};

const recordsVerifiedOnSource = records.filter((r) => r.verified_on_source === true).length;

const sourceDiscoverySummary = {
  total: sourceDiscoveryLeads.length,
  official_source_confirmed: sourceDiscoveryLeads.filter(
    (l) => l.verification_status === "official_source_confirmed",
  ).length,
  pending_official_review: sourceDiscoveryLeads.filter(
    (l) => l.verification_status === "pending_official_review",
  ).length,
  official_source_unclear: sourceDiscoveryLeads.filter(
    (l) => l.verification_status === "official_source_unclear",
  ).length,
  rejected_not_official: sourceDiscoveryLeads.filter(
    (l) => l.verification_status === "rejected_not_official",
  ).length,
  promoted_new_sources: sourceDiscoveryLeads.filter((l) => l.promoted_source_id).length,
  competitor_tracker_leads: sourceDiscoveryLeads.filter(
    (l) => l.discovered_from_type === "competitor_tracker",
  ).length,
};

const evidenceCandidateSummary = {
  total: evidenceExportCandidates.length,
  ready_for_human_review: evidenceExportCandidates.filter(
    (c) => c.candidate_status === "ready_for_human_review",
  ).length,
  blocked_pending_content_review: evidenceExportCandidates.filter(
    (c) => c.candidate_status === "blocked_pending_content_review",
  ).length,
  blocked_simulation_only: evidenceExportCandidates.filter(
    (c) => c.candidate_status === "blocked_simulation_only",
  ).length,
  rejected_for_client_use: evidenceExportCandidates.filter(
    (c) => c.candidate_status === "rejected_for_client_use",
  ).length,
  client_use_allowed: evidenceExportCandidates.filter((c) => c.client_use_allowed).length,
  final_evidence_allowed: 0,
};

const watcherEligibilitySummary = {
  total: watcherEligibilityEntries.length,
  watcher_eligible_count: watcherEligibilityEntries.filter(
    (e) =>
      e.allowed_to_fetch === true &&
      e.monitoring_method === "url_status_check" &&
      e.watcher_eligibility?.eligible_basic_url_check === true,
  ).length,
  manual_only_count: watcherEligibilityEntries.filter(
    (e) => e.monitoring_method === "manual_only",
  ).length,
  blocked_monitoring_count: watcherEligibilityEntries.filter(
    (e) =>
      e.watcher_eligibility?.blocked_by_waf_or_bot_protection === true ||
      e.allowed_to_fetch === false,
  ).length,
  client_use_allowed: watcherEligibilityEntries.filter((e) => e.client_use_allowed).length,
  final_evidence_allowed: watcherEligibilityEntries.filter((e) => e.final_evidence_allowed)
    .length,
};

const monitoringSourceConfigSummary = {
  total: monitoringSourceConfigs.length,
  fetchable_count: monitoringSourceConfigs.filter((c) => c.allowed_to_fetch === true).length,
  manual_only_count: monitoringSourceConfigs.filter((c) => c.adapter_type === "manual_only").length,
  blocked_or_not_fetched_count: monitoringSourceConfigs.filter(
    (c) => c.allowed_to_fetch === false || c.fetch_scope === "not_fetched",
  ).length,
  client_use_allowed: monitoringSourceConfigs.filter((c) => c.client_use_allowed).length,
  final_evidence_allowed: monitoringSourceConfigs.filter((c) => c.final_evidence_allowed).length,
  verified_on_source_true: monitoringSourceConfigs.filter((c) => c.verified_on_source === true)
    .length,
};

const watcherMonitoringRunSummary = latestWatcherMonitoringRun
  ? {
      monitoring_run_id: latestWatcherMonitoringRun.monitoring_run_id,
      run_date: latestWatcherMonitoringRun.run_date,
      product_version: latestWatcherMonitoringRun.product_version ?? null,
      mode: latestWatcherMonitoringRun.mode,
      overall_status: latestWatcherMonitoringRun.overall_status ?? "completed",
      checks_total: latestWatcherMonitoringRun.checks?.length ?? 0,
      status_check_ok: (latestWatcherMonitoringRun.checks ?? []).filter(
        (c) => c.check_result === "status_check_ok",
      ).length,
      metadata_snapshot_created: (latestWatcherMonitoringRun.checks ?? []).filter(
        (c) => c.check_result === "metadata_snapshot_created",
      ).length,
      no_change_snapshot_created: (latestWatcherMonitoringRun.checks ?? []).filter(
        (c) => c.check_result === "no_change_snapshot_created",
      ).length,
      fetch_failed_needs_review: (latestWatcherMonitoringRun.checks ?? []).filter(
        (c) => c.check_result === "fetch_failed_needs_review",
      ).length,
      manual_only_not_checked: (latestWatcherMonitoringRun.checks ?? []).filter(
        (c) => c.check_result === "manual_only_not_checked",
      ).length,
      blocked_not_checked: (latestWatcherMonitoringRun.checks ?? []).filter(
        (c) => c.check_result === "blocked_not_checked",
      ).length,
      status_check_failed: (latestWatcherMonitoringRun.checks ?? []).filter(
        (c) => c.check_result === "status_check_failed",
      ).length,
      change_detected_count: latestWatcherMonitoringRun.change_detected_count ?? 0,
      requires_human_review_count: (latestWatcherMonitoringRun.checks ?? []).filter(
        (c) => c.requires_human_review === true,
      ).length,
      client_use_allowed: (latestWatcherMonitoringRun.checks ?? []).filter(
        (c) => c.client_use_allowed,
      ).length,
      final_evidence_allowed: (latestWatcherMonitoringRun.checks ?? []).filter(
        (c) => c.final_evidence_allowed,
      ).length,
    }
  : null;

const evidenceCandidateReviewSummary = {
  total_reviewed_candidates: evidenceCandidateReviews.length,
  reviewed_for_internal_governance_only: evidenceCandidateReviews.filter(
    (r) => r.candidate_review_status === "reviewed_for_internal_governance_only",
  ).length,
  needs_more_source_review: evidenceCandidateReviews.filter(
    (r) => r.candidate_review_status === "needs_more_source_review",
  ).length,
  needs_mapping_review: evidenceCandidateReviews.filter(
    (r) => r.candidate_review_status === "needs_mapping_review",
  ).length,
  rejected_for_export_candidate_use: evidenceCandidateReviews.filter(
    (r) => r.candidate_review_status === "rejected_for_export_candidate_use",
  ).length,
  client_use_allowed: evidenceCandidateReviews.filter((r) => r.client_use_allowed).length,
  final_evidence_allowed: evidenceCandidateReviews.filter((r) => r.final_evidence_allowed).length,
};

const snapshot = {
  generated_at: generatedAt,
  version: PROJECT_VERSION,
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
    url_checks: urlCheckSummary.total,
    url_checks_reachable: urlCheckSummary.reachable,
    url_checks_redirected: urlCheckSummary.reachable_redirected,
    url_checks_unreachable:
      urlCheckSummary.unreachable +
      urlCheckSummary.timeout +
      urlCheckSummary.dns_error +
      urlCheckSummary.network_error,
    content_review_not_reviewed: urlCheckSummary.content_review_not_reviewed,
    content_review_count: contentReviewSummary.total,
    content_reviewed_items_count: contentReviewSummary.reviewed_content_summary,
    content_needs_update_count: contentReviewSummary.content_needs_update,
    verified_on_source_count: recordsVerifiedOnSource,
    client_use_allowed_count:
      urlCheckSummary.client_use_allowed_count + contentReviewSummary.client_use_allowed,
    source_identity_reviewed_count: identityVerifications.filter(
      (v) => v.review_status_after_check === "reviewed_source_identity_only",
    ).length,
    unresolved_url_issue_count:
      urlCheckSummary.unreachable +
      urlCheckSummary.timeout +
      urlCheckSummary.dns_error +
      urlCheckSummary.network_error +
      urlCheckSummary.not_checked +
      urlCheckSummary.uncertain,
    export_samples: exportSamples.length,
    map_markers: mapMarkers.length,
    watchers: watchers.length,
    watchers_enabled: watchers.filter((w) => w.enabled).length,
    feed_watcher_count: feedWatchers.length,
    feed_watchers_enabled: feedWatchers.filter((w) => w.enabled).length,
    feed_snapshot_count: feedSnapshots.length,
    feed_detected_change_count: feedDetectedChanges.length,
    simulated_feed_detected_change_count: simulatedFeedDetectedChanges.length,
    real_feed_detected_change_count: realFeedDetectedChanges.length,
    api_watcher_count: apiWatchers.length,
    api_watchers_enabled: apiWatchers.filter((w) => w.enabled).length,
    api_snapshot_count: apiSnapshots.length,
    api_detected_change_count: apiDetectedChanges.length,
    simulated_api_detected_change_count: simulatedApiDetectedChanges.length,
    real_api_detected_change_count: realApiDetectedChanges.length,
    watcher_errors_by_category: latestWatcherRun?.errors_by_category ?? {},
    snapshots: snapshots.length,
    detected_changes: detectedChanges.length,
    detected_change_count: detectedChanges.length,
    simulated_detected_change_count: simulatedDetectedChanges.length,
    real_detected_change_count: realDetectedChanges.length,
    detected_changes_pending_review: detectedChanges.filter((d) =>
      needsReview(d.review_status),
    ).length,
    watcher_error_count: watcherErrorCount,
    latest_watcher_run: latestWatcherRun?.run_id ?? null,
    latest_watcher_run_mode: latestWatcherRun?.run_mode ?? latestWatcherRun?.mode ?? null,
    monitoring_run_count: monitoringRuns.length,
    latest_monitoring_run_id: latestMonitoringRun?.monitoring_run_id ?? null,
    latest_monitoring_run_mode: latestMonitoringRun?.mode ?? null,
    latest_monitoring_run_status: latestMonitoringRun?.overall_status ?? null,
    watcher_eligible_count: watcherEligibilitySummary.watcher_eligible_count,
    watcher_eligibility_manual_only_count: watcherEligibilitySummary.manual_only_count,
    blocked_monitoring_count: watcherEligibilitySummary.blocked_monitoring_count,
    latest_watcher_monitoring_run_id:
      latestWatcherMonitoringRun?.monitoring_run_id ?? null,
    latest_watcher_monitoring_run_status:
      latestWatcherMonitoringRun?.overall_status ?? null,
    monitoring_source_config_count: monitoringSourceConfigSummary.total,
    monitoring_pack_run_count: watcherMonitoringRuns.length,
    watcher_monitoring_change_detected_count:
      watcherMonitoringRunSummary?.change_detected_count ?? 0,
    monitoring_diff_has_meaningful_changes:
      latestMonitoringDiffSummary?.has_meaningful_changes ?? null,
    monitoring_diff_recommended_action: latestMonitoringDiffSummary?.recommended_action ?? null,
    evidence_export_candidate_count: evidenceCandidateSummary.total,
    evidence_export_candidates_ready_for_human_review:
      evidenceCandidateSummary.ready_for_human_review,
    evidence_export_candidates_blocked_content_review:
      evidenceCandidateSummary.blocked_pending_content_review,
    evidence_export_candidates_blocked_simulation:
      evidenceCandidateSummary.blocked_simulation_only,
    evidence_export_candidates_client_use_allowed:
      evidenceCandidateSummary.client_use_allowed,
    source_discovery_lead_count: sourceDiscoverySummary.total,
    source_discovery_confirmed: sourceDiscoverySummary.official_source_confirmed,
    source_discovery_pending: sourceDiscoverySummary.pending_official_review,
    source_discovery_unclear: sourceDiscoverySummary.official_source_unclear,
    source_discovery_rejected: sourceDiscoverySummary.rejected_not_official,
    evidence_export_candidate_reviews_count: evidenceCandidateReviewSummary.total_reviewed_candidates,
    evidence_export_candidate_reviews_governance_only:
      evidenceCandidateReviewSummary.reviewed_for_internal_governance_only,
    evidence_export_candidate_reviews_needs_source:
      evidenceCandidateReviewSummary.needs_more_source_review,
    review_queue_items: reviewSummary.total,
    pending_review: reviewSummary.pending_review,
    needs_update: reviewSummary.needs_update,
    unverified_timeline_events: reviewSummary.unverified_timeline_events,
    unverified_records: reviewSummary.unverified_records,
    pending_source_verifications: reviewSummary.pending_source_verifications,
    exports: 10,
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
    content_reviews: "/data/content-reviews.json",
    url_checks: "/data/url-checks.json",
    watchers: "/data/watchers.json",
    snapshots: "/data/snapshots.json",
    watcher_runs: "/data/watcher-runs.json",
    monitoring_runs: "/data/monitoring-runs.json",
    monitoring_source_configs: "/data/monitoring-source-configs.json",
    watcher_eligibility: "/data/watcher-eligibility.json",
    detected_changes: "/data/detected-changes.json",
    evidence_export_candidates: "/data/evidence-export-candidates.json",
    evidence_export_candidate_reviews: "/data/evidence-export-candidate-reviews.json",
    source_discovery_leads: "/data/source-discovery-leads.json",
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
  source_identity_items: identityVerifications,
  record_content_items: recordVerifications,
  content_review_batches: contentReviewBatches,
  content_review_items: contentReviews,
  summary: {
    total: verifications.length,
    source_identity_reviewed: identityVerifications.filter(
      (v) => v.review_status_after_check === "reviewed_source_identity_only",
    ).length,
    source_identity_needs_human_review: identityVerifications.filter(
      (v) => v.review_status_after_check === "needs_human_review",
    ).length,
    record_content_not_checked: recordVerifications.filter(
      (v) => v.check_result === "not_checked",
    ).length,
    not_checked: verifications.filter((v) => v.check_result === "not_checked").length,
    uncertain: verifications.filter((v) => v.check_result === "uncertain").length,
    client_use_allowed: verifications.filter((v) => v.client_use_allowed).length,
    content_review_count: contentReviewSummary.total,
    content_review_not_checked: contentReviewSummary.not_checked,
    content_review_client_use_allowed: contentReviewSummary.client_use_allowed,
  },
});

writeJson(path.join(PUBLIC_DATA, "content-reviews.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  batches: contentReviewBatches,
  items: contentReviews,
  summary: contentReviewSummary,
});

writeJson(path.join(PUBLIC_DATA, "url-checks.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  batches: urlCheckBatches,
  items: urlChecks,
  summary: urlCheckSummary,
});

writeJson(path.join(PUBLIC_DATA, "watchers.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  legal_safe_note: watcherConfig?.legal_safe_note ?? DISCLAIMER,
  items: watchers,
  summary: {
    total: watchers.length,
    enabled: watchers.filter((w) => w.enabled).length,
    official_page_metadata: watchers.filter(
      (w) => w.adapter_id === "official_page_metadata" || w.watcher_type === "official_page_metadata",
    ).length,
    official_rss_or_feed: feedWatchers.length,
    feed_watchers_enabled: feedWatchers.filter((w) => w.enabled).length,
  },
});

writeJson(path.join(PUBLIC_DATA, "snapshots.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  storage_policy: "metadata_only_no_body_storage",
  items: snapshots,
  summary: {
    total: snapshots.length,
    by_source: Object.fromEntries(
      [...new Set(snapshots.map((s) => s.source_id))].map((id) => [
        id,
        snapshots.filter((s) => s.source_id === id).length,
      ]),
    ),
  },
});

writeJson(path.join(PUBLIC_DATA, "watcher-runs.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  items: watcherRuns,
  latest: latestWatcherRun,
  summary: {
    total: watcherRuns.length,
    latest_run_id: latestWatcherRun?.run_id ?? null,
    latest_error_count: watcherErrorCount,
  },
});

writeJson(path.join(PUBLIC_DATA, "monitoring-runs.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  cycle_runs: monitoringRuns,
  items: monitoringRuns,
  watcher_monitoring_runs: watcherMonitoringRuns,
  latest: latestMonitoringRun,
  latest_watcher_monitoring_run: latestWatcherMonitoringRun,
  latest_diff_summary: latestMonitoringDiffSummary
    ? {
        generated_at: latestMonitoringDiffSummary.generated_at,
        has_meaningful_changes: latestMonitoringDiffSummary.has_meaningful_changes,
        has_detected_changes: latestMonitoringDiffSummary.has_detected_changes,
        has_watcher_errors: latestMonitoringDiffSummary.has_watcher_errors,
        recommended_action: latestMonitoringDiffSummary.recommended_action,
        new_real_detected_change_count: latestMonitoringDiffSummary.new_real_detected_change_count,
      }
    : null,
  summary: {
    total: monitoringRuns.length,
    latest_run_id: latestMonitoringRun?.monitoring_run_id ?? null,
    latest_mode: latestMonitoringRun?.mode ?? null,
    latest_status: latestMonitoringRun?.overall_status ?? null,
    latest_watcher_monitoring_run_id:
      latestWatcherMonitoringRun?.monitoring_run_id ?? null,
    latest_watcher_monitoring_run_status:
      latestWatcherMonitoringRun?.overall_status ?? null,
    watcher_monitoring_run_count: watcherMonitoringRuns.length,
    monitoring_source_config_count: monitoringSourceConfigSummary.total,
    has_meaningful_changes: latestMonitoringDiffSummary?.has_meaningful_changes ?? null,
    ...watcherMonitoringRunSummary,
    blocked_or_manual_count:
      (watcherMonitoringRunSummary?.blocked_not_checked ?? 0) +
      (watcherMonitoringRunSummary?.manual_only_not_checked ?? 0),
  },
});

writeJson(path.join(PUBLIC_DATA, "monitoring-source-configs.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  not_complete_coverage: true,
  not_client_evidence: true,
  deterministic_local_only: true,
  batch_id: monitoringSourceConfigBatch?.monitoring_source_config_batch_id ?? null,
  product_version: monitoringSourceConfigBatch?.product_version ?? PROJECT_VERSION,
  legal_safe_note: monitoringSourceConfigBatch?.legal_safe_note ?? DISCLAIMER,
  summary: monitoringSourceConfigSummary,
  items: monitoringSourceConfigs,
});

writeJson(path.join(PUBLIC_DATA, "watcher-eligibility.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  not_complete_coverage: true,
  not_client_evidence: true,
  batch_id: watcherEligibilityBatch?.watcher_eligibility_batch_id ?? null,
  legal_safe_note: watcherEligibilityBatch?.legal_safe_note ?? DISCLAIMER,
  summary: watcherEligibilitySummary,
  items: watcherEligibilityEntries,
});

writeJson(path.join(PUBLIC_DATA, "detected-changes.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  items: detectedChanges,
  summary: {
    total: detectedChanges.length,
    real: realDetectedChanges.length,
    simulated: simulatedDetectedChanges.length,
    pending_review: detectedChanges.filter((d) => needsReview(d.review_status)).length,
  },
});

writeJson(path.join(PUBLIC_DATA, "evidence-export-candidates.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  candidate_only: true,
  not_final_evidence: true,
  not_client_evidence: true,
  no_caesar_ai_evidence_write: true,
  batch_id: evidenceCandidateBatch?.evidence_export_candidate_batch_id ?? null,
  pipeline_version: evidenceCandidateBatch?.pipeline_version ?? null,
  legal_safe_note: evidenceCandidateBatch?.legal_safe_note ?? DISCLAIMER,
  summary: { ...evidenceCandidateSummary, candidate_review: evidenceCandidateReviewSummary },
  items: evidenceExportCandidates,
});

writeJson(path.join(PUBLIC_DATA, "source-discovery-leads.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  competitor_assisted_discovery_only: true,
  not_authority_sources: true,
  batch_id: sourceDiscoveryBatch?.source_discovery_batch_id ?? null,
  legal_safe_note: sourceDiscoveryBatch?.legal_safe_note ?? DISCLAIMER,
  policy_doc: "/docs/COMPETITOR_ASSISTED_SOURCE_DISCOVERY_POLICY.md",
  summary: sourceDiscoverySummary,
  items: sourceDiscoveryLeads,
});

writeJson(path.join(PUBLIC_DATA, "evidence-export-candidate-reviews.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  governance_review_only: true,
  not_final_evidence: true,
  not_client_evidence: true,
  batch_id: evidenceCandidateReviewBatch?.evidence_export_candidate_review_batch_id ?? null,
  legal_safe_note: evidenceCandidateReviewBatch?.legal_safe_note ?? DISCLAIMER,
  summary: evidenceCandidateReviewSummary,
  items: evidenceCandidateReviews,
});

writeJson(path.join(PUBLIC_DATA, "regulation-watch-snapshot.json"), snapshot);

// RSS feed — sample changes only
const siteBase = process.env.ASTRO_SITE || "https://regulation-watch.caesar.no";
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
console.log("  public/data/content-reviews.json");
console.log("  public/data/url-checks.json");
console.log("  public/data/watchers.json");
console.log("  public/data/snapshots.json");
console.log("  public/data/watcher-runs.json");
console.log("  public/data/monitoring-runs.json");
console.log("  public/data/watcher-eligibility.json");
console.log(`  ${watcherEligibilityEntries.length} watcher eligibility entr(ies)`);
console.log(`  ${monitoringSourceConfigs.length} monitoring source config(s)`);
console.log(`  ${watcherMonitoringRuns.length} watcher monitoring run(s)`);
console.log("  public/data/detected-changes.json");
console.log("  public/data/evidence-export-candidates.json");
console.log("  public/data/evidence-export-candidate-reviews.json");
console.log(`  ${sourceDiscoveryLeads.length} source discovery lead(s) exported`);
console.log(`  ${evidenceExportCandidates.length} evidence export candidate(s) exported`);
console.log("  public/data/regulation-watch-snapshot.json");
console.log(`  ${watchers.length} watcher(s) configured`);
console.log(`  ${snapshots.length} snapshot(s) exported`);
console.log(`  ${detectedChanges.length} detected change(s) exported`);
console.log(`  ${reviewQueueItems.length} item(s) in review queue export`);
console.log(`  ${verifications.length} verification(s) exported`);
console.log(`  ${contentReviews.length} content review(s) exported`);
console.log(`  ${urlChecks.length} URL check(s) exported`);
console.log("  public/feeds/changes.xml");
console.log(`  ${changes.length} change(s) in RSS feed`);
