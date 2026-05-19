import { sha256Hex, snapshotIdFor } from "./shared.mjs";

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

export async function fetchPage(url, timeoutMs, userAgent) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    });
    const body = await res.arrayBuffer();
    return { res, body: Buffer.from(body) };
  } finally {
    clearTimeout(timer);
  }
}

export async function runPageMetadataWatcher(watcher, context) {
  const { sources, previousSnapshot, dryRun, skipNetwork, timeoutMs, userAgent } = context;
  const source = sources[watcher.source_id];
  const checkedAt = new Date().toISOString();
  const snapId = snapshotIdFor(watcher.source_id, checkedAt);

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
      detectedChanges: [],
    };
  }

  if (!source) {
    return { snapshot: null, error: `Unknown source_id: ${watcher.source_id}`, detectedChanges: [] };
  }

  try {
    const { res, body } = await fetchPage(watcher.official_url, timeoutMs, userAgent);
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
      detectedChanges: [],
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
      detectedChanges: [],
    };
  }
}
