import { sha256Hex, snapshotIdFor } from "./shared.mjs";
import {
  fetchWithRetry,
  resolveReliability,
  buildFetchErrorMessage,
} from "./reliability.mjs";

export const ADAPTER_ID = "official_page_metadata";

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

export async function runPageMetadataWatcher(watcher, context) {
  const { sources, previousSnapshot, dryRun, skipNetwork, userAgent, defaultUserAgent } =
    context;
  const reliability = resolveReliability(watcher, "page");
  const source = sources[watcher.source_id];
  const checkedAt = new Date().toISOString();
  const snapId = snapshotIdFor(watcher.source_id, checkedAt);
  const lastSuccessfulSnapshotId =
    previousSnapshot && !previousSnapshot.fetch_error ? previousSnapshot.snapshot_id : null;

  const base = {
    snapshot_id: snapId,
    watcher_id: watcher.watcher_id,
    source_id: watcher.source_id,
    jurisdiction_id: watcher.jurisdiction_id,
    adapter_id: ADAPTER_ID,
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

  if (dryRun || skipNetwork) {
    return {
      snapshot: {
        ...base,
        fetch_error: dryRun ? "Dry run; no HTTP request." : "Network skipped (--skip-network).",
        snapshot_kind: "error_placeholder",
      },
      error: dryRun ? "dry_run" : "skip_network",
      error_category: null,
      retry_attempts: 0,
      last_successful_snapshot_id: lastSuccessfulSnapshotId,
      detectedChanges: [],
    };
  }

  if (!source) {
    return {
      snapshot: null,
      error: `Unknown source_id: ${watcher.source_id}`,
      error_category: "unknown_error",
      retry_attempts: 0,
      last_successful_snapshot_id: lastSuccessfulSnapshotId,
      detectedChanges: [],
    };
  }

  const ua = defaultUserAgent ?? userAgent;
  try {
    const fetched = await fetchWithRetry(
      watcher.official_url,
      {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent": ua,
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        },
      },
      reliability,
    );

    if (!fetched.ok) {
      const category = fetched.error_category ?? "unknown_error";
      const detail = fetched.res
        ? `HTTP ${fetched.res.status} after ${fetched.attempt} attempt(s)`
        : String(fetched.error?.message ?? "fetch failed");
      return {
        snapshot: {
          ...base,
          http_status: fetched.res?.status ?? null,
          fetch_error: buildFetchErrorMessage(category, detail),
          snapshot_kind: "error_placeholder",
          error_category: category,
        },
        error: buildFetchErrorMessage(category, detail),
        error_category: category,
        retry_attempts: fetched.attempt,
        last_successful_snapshot_id: lastSuccessfulSnapshotId,
        detectedChanges: [],
      };
    }

    const text = fetched.body.toString("utf8");
    const normalized = normalizeText(text);
    return {
      snapshot: {
        ...base,
        final_url: fetched.res.url || watcher.official_url,
        http_status: fetched.res.status,
        content_type: fetched.res.headers.get("content-type"),
        etag: fetched.res.headers.get("etag"),
        last_modified: fetched.res.headers.get("last-modified"),
        title: extractTitle(text),
        content_hash: sha256Hex(fetched.body),
        normalized_text_hash: sha256Hex(normalized),
        content_length: fetched.body.length,
        retry_attempts: fetched.attempt,
      },
      error: null,
      error_category: null,
      retry_attempts: fetched.attempt,
      last_successful_snapshot_id: lastSuccessfulSnapshotId,
      detectedChanges: [],
    };
  } catch (err) {
    const category = "network_error";
    const msg = buildFetchErrorMessage(category, String(err?.message ?? err));
    return {
      snapshot: {
        ...base,
        fetch_error: msg,
        snapshot_kind: "error_placeholder",
        error_category: category,
      },
      error: msg,
      error_category: category,
      retry_attempts: 0,
      last_successful_snapshot_id: lastSuccessfulSnapshotId,
      detectedChanges: [],
    };
  }
}
