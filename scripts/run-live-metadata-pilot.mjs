#!/usr/bin/env node
/**
 * Cautious live metadata pilot (v0.9.6).
 * One HEAD or GET per allowlisted official URL; metadata only; no full text storage.
 * Compares against v0.9.5 deterministic monitoring run baseline where available.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { readProjectVersion } from "./lib/read-project-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MONITORING_DIR = path.join(ROOT, "data/monitoring");
const PRODUCT_VERSION = readProjectVersion();
const RUN_DATE = process.env.LIVE_METADATA_RUN_DATE ?? "2026-05-20";
const RUN_SUFFIX = process.env.LIVE_METADATA_SUFFIX ?? "v096";
const RUN_ID = `live-metadata-run-${RUN_DATE}-${RUN_SUFFIX}`;
const PACK_ID = `change-review-pack-${RUN_DATE}-${RUN_SUFFIX}`;
const DRY_RUN = process.argv.includes("--dry-run");
const LIVE_FETCH = !process.argv.includes("--offline");

const BLOCKED_SOURCE_IDS = new Set(["eu-ai-act", "edpb-ai-topic", "australia-industry-ai"]);
const USER_AGENT =
  "CaesarRegulationWatch/0.9.6 (metadata-pilot; +https://regulation-watch.caesar.no/methodology/)";
const FETCH_TIMEOUT_MS = 25_000;
const TITLE_READ_BYTES = 12_288;

const LEGAL_SAFE_NOTE =
  "v0.9.6 cautious live metadata pilot. One request per allowlisted official URL; metadata headers and title only; no full legal text storage. Not scheduled monitoring. Not legal advice. Not client evidence. Human review required for detected metadata differences.";

function readYaml(rel) {
  return yaml.load(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function findAllowlist() {
  const files = fs
    .readdirSync(MONITORING_DIR)
    .filter((f) => f.startsWith("live-metadata-pilot-allowlist-") && f.endsWith(".yml"))
    .sort()
    .reverse();
  if (files.length === 0) throw new Error("No live-metadata-pilot-allowlist-*.yml");
  return readYaml(`data/monitoring/${files[0]}`);
}

function loadV095Baseline() {
  const refPath = path.join(MONITORING_DIR, "monitoring-run-2026-05-20-v095.yml");
  if (!fs.existsSync(refPath)) return new Map();
  const run = yaml.load(fs.readFileSync(refPath, "utf8"));
  const map = new Map();
  for (const chk of run.checks ?? []) {
    map.set(chk.source_id, {
      url: chk.url,
      http_status: chk.http_status,
      title: chk.title ?? null,
      last_modified: chk.last_modified ?? null,
      etag: chk.etag ?? null,
      content_type: null,
      content_length: null,
    });
  }
  return map;
}

function normalizeUrlForCompare(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

function metadataFingerprint(fields) {
  const payload = JSON.stringify({
    http_status: fields.http_status,
    final_url: normalizeUrlForCompare(fields.final_url),
    page_title: fields.page_title?.trim() ?? null,
    last_modified: fields.last_modified ?? null,
    etag: fields.etag ?? null,
    content_type: fields.content_type ?? null,
  });
  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

function extractTitleFromHtmlSnippet(html) {
  const m = html.match(/<title[^>]*>([^<]{1,500})<\/title>/i);
  if (!m) return null;
  return m[1].replace(/\s+/g, " ").trim() || null;
}

async function fetchMetadata(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const method = source.request_method ?? "HEAD";
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  };

  try {
    let res = await fetch(source.official_url, {
      method,
      headers,
      redirect: "follow",
      signal: controller.signal,
    });

    let page_title = null;
    if (method === "GET" && res.ok) {
      const reader = res.body?.getReader?.();
      if (reader) {
        const chunks = [];
        let total = 0;
        while (total < TITLE_READ_BYTES) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          total += value.length;
        }
        reader.cancel().catch(() => {});
        const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
        page_title = extractTitleFromHtmlSnippet(buf.toString("utf8", 0, TITLE_READ_BYTES));
      }
    } else if (method === "HEAD" && !res.ok && res.status === 405) {
      res = await fetch(source.official_url, {
        method: "GET",
        headers: { ...headers, Range: "bytes=0-0" },
        redirect: "follow",
        signal: controller.signal,
      });
    }

    const final_url = res.url ?? source.official_url;
    const content_type = res.headers.get("content-type");
    const content_lengthRaw = res.headers.get("content-length");
    const content_length = content_lengthRaw ? Number.parseInt(content_lengthRaw, 10) : null;

    return {
      http_status: res.status,
      final_url,
      content_type: content_type ? content_type.split(";")[0].trim() : null,
      content_length: Number.isFinite(content_length) ? content_length : null,
      last_modified: res.headers.get("last-modified"),
      etag: res.headers.get("etag"),
      page_title,
      fetch_error: null,
    };
  } catch (err) {
    return {
      http_status: null,
      final_url: null,
      content_type: null,
      content_length: null,
      last_modified: null,
      etag: null,
      page_title: null,
      fetch_error: err.name === "AbortError" ? "timeout" : String(err.message ?? err),
    };
  } finally {
    clearTimeout(timer);
  }
}

function compareCheck(live, baseline, refRunId) {
  if (live.fetch_error || live.http_status == null) {
    return {
      check_result: "metadata_check_failed",
      change_detected: false,
      requires_human_review: true,
      notes: `Live fetch failed: ${live.fetch_error ?? "no HTTP status"}. Human corroboration on official source required.`,
    };
  }

  const officialNorm = normalizeUrlForCompare(live.official_url);
  const finalNorm = normalizeUrlForCompare(live.final_url);
  if (finalNorm && officialNorm && finalNorm !== officialNorm) {
    const baselineUrl = baseline ? normalizeUrlForCompare(baseline.url) : officialNorm;
    if (finalNorm !== baselineUrl) {
      return {
        check_result: "redirect_changed_needs_review",
        change_detected: true,
        requires_human_review: true,
        notes:
          "Final URL after redirect differs from allowlisted official URL and v0.9.5 baseline. Confirm canonical destination manually.",
        previous_reference_run_id: refRunId,
      };
    }
  }

  if (!baseline) {
    return {
      check_result: "metadata_check_ok",
      change_detected: false,
      requires_human_review: false,
      notes: "Live metadata captured; no v0.9.5 baseline entry for comparison.",
      previous_reference_run_id: refRunId,
    };
  }

  const changedFields = [];
  if (live.http_status !== baseline.http_status) changedFields.push("http_status");
  const skipTitleCompare =
    live.request_method === "HEAD" && (live.page_title == null || live.page_title === "");
  if (!skipTitleCompare && (live.page_title ?? null) !== (baseline.title ?? null)) {
    changedFields.push("page_title");
  }
  if ((live.last_modified ?? null) !== (baseline.last_modified ?? null)) changedFields.push("last_modified");
  if ((live.etag ?? null) !== (baseline.etag ?? null)) changedFields.push("etag");

  if (changedFields.length > 0) {
    return {
      check_result: "metadata_changed_needs_review",
      change_detected: true,
      requires_human_review: true,
      notes: `Metadata differs from v0.9.5 baseline (${changedFields.join(", ")}). Not a legal/regulatory change claim — human review required.`,
      previous_reference_run_id: refRunId,
      changed_fields: changedFields,
    };
  }

  return {
    check_result: "metadata_check_ok",
    change_detected: false,
    requires_human_review: false,
    notes: "Live metadata matches v0.9.5 deterministic baseline for compared fields.",
    previous_reference_run_id: refRunId,
    changed_fields: [],
  };
}

function reviewStatusFromCheck(check) {
  if (check.check_result === "metadata_check_failed") return "check_failed_needs_review";
  if (check.check_result === "redirect_changed_needs_review") return "redirect_changed_needs_review";
  if (check.check_result === "metadata_changed_needs_review") return "metadata_change_needs_review";
  return "no_change_observed";
}

async function main() {
  const allowlist = findAllowlist();
  const sources = allowlist.sources ?? [];

  if (sources.length > 5) throw new Error("Allowlist exceeds 5 sources");
  for (const s of sources) {
    if (BLOCKED_SOURCE_IDS.has(s.source_id)) {
      throw new Error(`Blocked source in allowlist: ${s.source_id}`);
    }
    if (s.client_use_allowed || s.final_evidence_allowed || s.verified_on_source) {
      throw new Error(`Unsafe flags on ${s.source_id}`);
    }
  }

  const baseline = loadV095Baseline();
  const refRunId = allowlist.previous_reference_run_id ?? "monitoring-run-2026-05-20-v095";
  const runTimestamp = new Date().toISOString();
  const checks = [];

  for (const source of sources) {
    const checked_at = new Date().toISOString();
    let live;
    if (LIVE_FETCH && !DRY_RUN) {
      live = await fetchMetadata(source);
      await new Promise((r) => setTimeout(r, 500));
    } else {
      const base = baseline.get(source.source_id);
      live = {
        http_status: base?.http_status ?? null,
        final_url: source.official_url,
        content_type: null,
        content_length: null,
        last_modified: base?.last_modified ?? null,
        etag: base?.etag ?? null,
        page_title: base?.title ?? null,
        fetch_error: null,
      };
    }

    const prev = baseline.get(source.source_id);
    const cmp = compareCheck(
      { ...live, official_url: source.official_url, request_method: source.request_method },
      prev,
      refRunId,
    );

    const metadata_hash = metadataFingerprint({
      http_status: live.http_status,
      final_url: live.final_url ?? source.official_url,
      page_title: live.page_title,
      last_modified: live.last_modified,
      etag: live.etag,
      content_type: live.content_type,
    });

    checks.push({
      source_id: source.source_id,
      official_url: source.official_url,
      final_url: live.final_url,
      request_method: source.request_method,
      http_status: live.http_status,
      content_type: live.content_type,
      content_length: live.content_length,
      last_modified: live.last_modified,
      etag: live.etag,
      page_title: live.page_title,
      metadata_hash,
      check_result: cmp.check_result,
      change_detected: cmp.change_detected,
      previous_reference_run_id: cmp.previous_reference_run_id ?? refRunId,
      requires_human_review: cmp.requires_human_review,
      checked_at,
      client_use_allowed: false,
      final_evidence_allowed: false,
      verified_on_source: false,
      notes: cmp.notes,
    });
  }

  const run = {
    run_id: RUN_ID,
    run_mode: "cautious_live_metadata_pilot",
    run_date: RUN_DATE,
    run_timestamp: runTimestamp,
    product_version: PRODUCT_VERSION,
    pilot_id: allowlist.pilot_id,
    previous_reference_run_id: refRunId,
    legal_safe_note: LEGAL_SAFE_NOTE,
    no_crawl: true,
    no_full_text_storage: true,
    no_competitor_source: true,
    client_use_allowed: false,
    final_evidence_allowed: false,
    overall_status: checks.some((c) => c.check_result === "metadata_check_failed")
      ? "partial"
      : "completed",
    change_detected_count: checks.filter((c) => c.change_detected).length,
    requires_human_review_count: checks.filter((c) => c.requires_human_review).length,
    checks,
  };

  const reviews = checks.map((chk) => {
    const prev = baseline.get(chk.source_id);
    return {
      source_id: chk.source_id,
      official_url: chk.official_url,
      previous_metadata_summary: prev
        ? {
            http_status: prev.http_status,
            title: prev.title,
            last_modified: prev.last_modified,
            etag: prev.etag,
            url: prev.url,
          }
        : null,
      current_metadata_summary: {
        http_status: chk.http_status,
        page_title: chk.page_title,
        last_modified: chk.last_modified,
        etag: chk.etag,
        final_url: chk.final_url,
        content_type: chk.content_type,
        metadata_hash: chk.metadata_hash,
      },
      changed_fields:
        chk.check_result === "metadata_changed_needs_review"
          ? ["http_status", "page_title", "last_modified", "etag"].filter((f) => {
              const skipTitle =
                chk.request_method === "HEAD" &&
                (chk.page_title == null || chk.page_title === "");
              const pmap = {
                http_status: prev?.http_status !== chk.http_status,
                page_title:
                  !skipTitle && (prev?.title ?? null) !== (chk.page_title ?? null),
                last_modified: (prev?.last_modified ?? null) !== (chk.last_modified ?? null),
                etag: (prev?.etag ?? null) !== (chk.etag ?? null),
              };
              return pmap[f];
            })
          : [],
      change_detected: chk.change_detected,
      review_status: reviewStatusFromCheck(chk),
      human_review_required: chk.requires_human_review,
      client_use_allowed: false,
      final_evidence_allowed: false,
      notes: chk.notes,
    };
  });

  const pack = {
    change_review_pack_id: PACK_ID,
    generated_at: RUN_DATE,
    product_version: PRODUCT_VERSION,
    live_metadata_run_id: RUN_ID,
    previous_reference_run_id: refRunId,
    legal_safe_note:
      "Metadata change review pack from cautious live pilot. Differences are not legal/regulatory change claims. Human review required before any record update.",
    no_full_text_storage: true,
    client_use_allowed: false,
    final_evidence_allowed: false,
    reviews,
  };

  if (DRY_RUN) {
    console.log(yaml.dump(run));
    return;
  }

  const runPath = path.join(MONITORING_DIR, `${RUN_ID}.yml`);
  const packPath = path.join(MONITORING_DIR, `${PACK_ID}.yml`);
  const header = `# Live metadata pilot run — v${PRODUCT_VERSION}\n# Generated by scripts/run-live-metadata-pilot.mjs\n\n`;
  const packHeader = `# Change review pack — v${PRODUCT_VERSION}\n# Generated by scripts/run-live-metadata-pilot.mjs\n\n`;

  fs.writeFileSync(runPath, header + yaml.dump(run), "utf8");
  fs.writeFileSync(packPath, packHeader + yaml.dump(pack), "utf8");

  console.log(`Wrote ${path.relative(ROOT, runPath)}`);
  console.log(`Wrote ${path.relative(ROOT, packPath)}`);
  console.log(
    `Checks: ${checks.length} | ok: ${checks.filter((c) => c.check_result === "metadata_check_ok").length} | changed: ${checks.filter((c) => c.change_detected).length} | failed: ${checks.filter((c) => c.check_result === "metadata_check_failed").length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
