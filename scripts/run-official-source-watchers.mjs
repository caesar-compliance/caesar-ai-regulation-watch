#!/usr/bin/env node
/**
 * Manual official-source metadata watcher (v0.7.0 pilot).
 * Metadata-only snapshots; no full body storage; no legal conclusions; not in CI.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUN_DATE = process.env.WATCHER_RUN_DATE ?? "2026-05-19";
const RUN_ID = `watcher-run-${RUN_DATE}`;
const TIMEOUT_MS = Number(process.env.WATCHER_TIMEOUT_MS ?? 20000);
const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_NETWORK = process.argv.includes("--skip-network");

const WATCHER_CONFIG = path.join(ROOT, "data/watchers/official-source-watchers.yml");
const SNAPSHOTS_ROOT = path.join(ROOT, "data/snapshots");
const DETECTED_ROOT = path.join(ROOT, "data/detected-changes");
const RUNS_ROOT = path.join(ROOT, "data/watcher-runs");

const LEGAL_SAFE_NOTE =
  "Metadata-only watcher output for governance review support. Not legal advice. Not a compliance guarantee. Human review required before any record update. Does not set verified_on_source or client_use_allowed.";

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function writeYaml(filePath, data, header = "") {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const body =
    header +
    yaml.dump(data, { lineWidth: 120, noRefs: true, sortKeys: false });
  fs.writeFileSync(filePath, body, "utf8");
}

function listYamlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yml") && f !== "latest.yml")
    .map((f) => path.join(dir, f));
}

function sha256Hex(bufferOrString) {
  const buf =
    typeof bufferOrString === "string"
      ? Buffer.from(bufferOrString, "utf8")
      : bufferOrString;
  return `sha256:${crypto.createHash("sha256").update(buf).digest("hex")}`;
}

function normalizeText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return null;
  return m[1].replace(/\s+/g, " ").trim().slice(0, 500) || null;
}

function loadSources() {
  const dir = path.join(ROOT, "data/sources");
  const map = {};
  for (const file of listYamlFiles(dir)) {
    const s = readYaml(file);
    if (s?.source_id) map[s.source_id] = s;
  }
  return map;
}

function latestSnapshotForSource(sourceId) {
  const latestPath = path.join(SNAPSHOTS_ROOT, sourceId, "latest.yml");
  if (!fs.existsSync(latestPath)) return null;
  const pointer = readYaml(latestPath);
  if (!pointer?.snapshot_id) return null;
  const snapPath = path.join(SNAPSHOTS_ROOT, sourceId, `${pointer.snapshot_id}.yml`);
  if (!fs.existsSync(snapPath)) return null;
  return readYaml(snapPath);
}

function snapshotIdFor(sourceId, checkedAt) {
  const stamp = checkedAt.replace(/[:.]/g, "").replace("T", "t").slice(0, 20);
  return `snap-${sourceId}-${stamp}`;
}

async function fetchOfficial(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Caesar-AI-Regulation-Watch/0.7.0 official-source-watcher (governance review support)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    });
    const body = await res.arrayBuffer();
    return { res, body: Buffer.from(body) };
  } finally {
    clearTimeout(timer);
  }
}

function detectChanges(prev, curr) {
  if (!prev || prev.fetch_error || curr.fetch_error) return null;
  const signals = [];
  if (prev.content_hash && curr.content_hash && prev.content_hash !== curr.content_hash) {
    signals.push("content_hash");
  }
  if (
    prev.normalized_text_hash &&
    curr.normalized_text_hash &&
    prev.normalized_text_hash !== curr.normalized_text_hash
  ) {
    signals.push("normalized_text_hash");
  }
  if (prev.title !== curr.title && (prev.title || curr.title)) {
    signals.push("title");
  }
  if (prev.final_url !== curr.final_url) {
    signals.push("redirect");
  }
  if (prev.http_status !== curr.http_status) {
    signals.push("http_status");
  }
  if (
    (prev.etag || curr.etag) &&
    prev.etag !== curr.etag &&
    prev.etag &&
    curr.etag
  ) {
    signals.push("etag");
  }
  if (
    (prev.last_modified || curr.last_modified) &&
    prev.last_modified !== curr.last_modified &&
    prev.last_modified &&
    curr.last_modified
  ) {
    signals.push("last_modified");
  }
  if (signals.length === 0) return null;

  let changeType = "combined_metadata_change";
  if (signals.length === 1) {
    if (signals[0] === "content_hash") changeType = "content_hash_changed";
    else if (signals[0] === "normalized_text_hash") changeType = "normalized_text_hash_changed";
    else if (signals[0] === "title") changeType = "title_changed";
    else if (signals[0] === "redirect") changeType = "redirect_changed";
    else if (signals[0] === "http_status") changeType = "http_status_changed";
    else changeType = "http_metadata_changed";
  }

  const parts = [];
  if (signals.includes("content_hash")) parts.push("content hash changed");
  if (signals.includes("normalized_text_hash")) parts.push("normalized text hash changed");
  if (signals.includes("title")) parts.push(`title: "${prev.title ?? "—"}" → "${curr.title ?? "—"}"`);
  if (signals.includes("redirect")) parts.push(`final URL: ${prev.final_url} → ${curr.final_url}`);
  if (signals.includes("http_status")) parts.push(`HTTP status: ${prev.http_status} → ${curr.http_status}`);
  if (signals.includes("etag")) parts.push("ETag changed");
  if (signals.includes("last_modified")) parts.push("Last-Modified changed");

  const confidence =
    signals.includes("content_hash") || signals.includes("normalized_text_hash")
      ? "medium"
      : "low";

  return {
    change_type: changeType,
    change_summary_for_review: `Watcher detected possible official page change (${parts.join("; ")}). Confirm on live source; not a legal conclusion.`,
    confidence_level: confidence,
  };
}

async function checkWatcher(watcher, sources, previousSnapshot) {
  const source = sources[watcher.source_id];
  const checkedAt = new Date().toISOString();
  const snapId = snapshotIdFor(watcher.source_id, checkedAt);
  const base = {
    snapshot_id: snapId,
    watcher_id: watcher.watcher_id,
    source_id: watcher.source_id,
    jurisdiction_id: watcher.jurisdiction_id,
    checked_at: checkedAt,
    original_url: watcher.official_url,
    final_url: watcher.official_url,
    http_status: null,
    content_type: null,
    etag: null,
    last_modified: null,
    title: null,
    content_hash: null,
    normalized_text_hash: null,
    content_length: null,
    snapshot_kind: previousSnapshot ? "periodic_check" : "baseline",
    storage_policy: "metadata_only_no_body_storage",
    legal_safe_note: watcher.legal_safe_note,
  };

  if (DRY_RUN || SKIP_NETWORK) {
    return {
      snapshot: {
        ...base,
        fetch_error: DRY_RUN ? "Dry run; no HTTP request." : "Network skipped (--skip-network).",
        snapshot_kind: "error_placeholder",
      },
      error: DRY_RUN ? "dry_run" : "skip_network",
    };
  }

  if (!source) {
    return { snapshot: null, error: `Unknown source_id: ${watcher.source_id}` };
  }

  if (source.official_url && source.official_url !== watcher.official_url) {
    console.warn(
      `  Warning: watcher URL differs from source registry for ${watcher.source_id}`,
    );
  }

  try {
    const { res, body } = await fetchOfficial(watcher.official_url);
    const text = body.toString("utf8");
    const normalized = normalizeText(text);
    return {
      snapshot: {
        ...base,
        final_url: res.url || watcher.official_url,
        http_status: res.status,
        content_type: res.headers.get("content-type"),
        etag: res.headers.get("etag"),
        last_modified: res.headers.get("last-modified"),
        title: extractTitle(text),
        content_hash: sha256Hex(body),
        normalized_text_hash: sha256Hex(normalized),
        content_length: body.length,
      },
      error: null,
    };
  } catch (err) {
    const msg = String(err?.message ?? err);
    return {
      snapshot: {
        ...base,
        fetch_error: msg,
        snapshot_kind: "error_placeholder",
      },
      error: msg,
    };
  }
}

function writeSnapshot(snapshot) {
  const dir = path.join(SNAPSHOTS_ROOT, snapshot.source_id);
  const file = path.join(dir, `${snapshot.snapshot_id}.yml`);
  const header = `# Metadata-only snapshot — ${snapshot.checked_at}\n# No full page body stored.\n\n`;
  writeYaml(file, snapshot, header);
  const pointer = {
    snapshot_id: snapshot.snapshot_id,
    checked_at: snapshot.checked_at,
    watcher_id: snapshot.watcher_id,
    storage_policy: snapshot.storage_policy,
  };
  writeYaml(
    path.join(dir, "latest.yml"),
    pointer,
    `# Latest snapshot pointer for ${snapshot.source_id}\n\n`,
  );
  return file;
}

function writeDetectedChange(change) {
  const file = path.join(DETECTED_ROOT, `${change.detected_change_id}.yml`);
  const header = `# Detected change — pending human review\n# Not a legal conclusion.\n\n`;
  writeYaml(file, change, header);
  return file;
}

async function main() {
  console.log("\nCaesar AI Regulation Watch — official source watchers (v0.7.0)");
  console.log(`Run date: ${RUN_DATE}`);
  console.log(`Run ID: ${RUN_ID}`);
  if (DRY_RUN) console.log("Mode: dry-run");
  if (SKIP_NETWORK) console.log("Mode: skip-network");

  const config = readYaml(WATCHER_CONFIG);
  const watchers = (config.watchers ?? []).filter((w) => w.enabled);
  const sources = loadSources();

  const results = [];
  let changedCount = 0;
  let errorCount = 0;
  let checkedCount = 0;

  for (const watcher of config.watchers ?? []) {
    if (!watcher.enabled) {
      results.push({
        watcher_id: watcher.watcher_id,
        source_id: watcher.source_id,
        status: "skipped_disabled",
        snapshot_id: null,
        previous_snapshot_id: null,
        detected_change_id: null,
        error_message: null,
      });
      continue;
    }

    process.stdout.write(`  Checking ${watcher.watcher_id} (${watcher.source_id})… `);
    const previous = latestSnapshotForSource(watcher.source_id);
    const { snapshot, error } = await checkWatcher(watcher, sources, previous);

    if (!snapshot) {
      errorCount += 1;
      results.push({
        watcher_id: watcher.watcher_id,
        source_id: watcher.source_id,
        status: "error",
        snapshot_id: null,
        previous_snapshot_id: previous?.snapshot_id ?? null,
        detected_change_id: null,
        error_message: error,
      });
      console.log("error");
      continue;
    }

    if (error && error !== "dry_run" && error !== "skip_network") {
      errorCount += 1;
      results.push({
        watcher_id: watcher.watcher_id,
        source_id: watcher.source_id,
        status: "error",
        snapshot_id: null,
        previous_snapshot_id: previous?.snapshot_id ?? null,
        detected_change_id: null,
        error_message: error,
      });
      console.log("fetch error (previous snapshot preserved)");
      continue;
    }

    if (!DRY_RUN && !SKIP_NETWORK) {
      writeSnapshot(snapshot);
    }
    checkedCount += 1;

    let detectedChangeId = null;
    let status = previous ? "unchanged" : "checked";

    if (previous && !snapshot.fetch_error) {
      const diff = detectChanges(previous, snapshot);
      if (diff) {
        detectedChangeId = `detected-${watcher.source_id}-${RUN_DATE.replace(/-/g, "")}`;
        const change = {
          detected_change_id: detectedChangeId,
          watcher_id: watcher.watcher_id,
          source_id: watcher.source_id,
          jurisdiction_id: watcher.jurisdiction_id,
          detected_at: snapshot.checked_at,
          change_type: diff.change_type,
          previous_snapshot_id: previous.snapshot_id,
          current_snapshot_id: snapshot.snapshot_id,
          change_summary_for_review: diff.change_summary_for_review,
          confidence_level: diff.confidence_level,
          human_review_required: true,
          review_status: "pending_review",
          legal_safe_note: LEGAL_SAFE_NOTE,
        };
        if (!DRY_RUN && !SKIP_NETWORK) {
          writeDetectedChange(change);
        }
        changedCount += 1;
        status = "change_detected";
        console.log("change detected");
      } else {
        console.log("unchanged");
      }
    } else {
      console.log(previous ? "baseline refresh" : "baseline");
    }

    results.push({
      watcher_id: watcher.watcher_id,
      source_id: watcher.source_id,
      status,
      snapshot_id: snapshot.snapshot_id,
      previous_snapshot_id: previous?.snapshot_id ?? null,
      detected_change_id: detectedChangeId,
      error_message: snapshot.fetch_error ?? null,
    });
  }

  const runLog = {
    run_id: RUN_ID,
    run_date: RUN_DATE,
    mode: DRY_RUN ? "dry_run" : "manual_cli",
    watcher_count: (config.watchers ?? []).length,
    checked_count: checkedCount,
    changed_count: changedCount,
    error_count: errorCount,
    results,
    legal_safe_note: LEGAL_SAFE_NOTE,
  };

  if (!DRY_RUN) {
    fs.mkdirSync(RUNS_ROOT, { recursive: true });
    const runPath = path.join(RUNS_ROOT, `${RUN_ID}.yml`);
    writeYaml(
      runPath,
      runLog,
      `# Watcher run log — ${RUN_DATE}\n# Manual CLI only; not CI.\n\n`,
    );
    console.log(`\nWrote ${path.relative(ROOT, runPath)}`);
  }

  console.log(
    `Summary: watchers=${(config.watchers ?? []).length} checked=${checkedCount} changes=${changedCount} errors=${errorCount}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
