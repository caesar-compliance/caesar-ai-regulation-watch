import {
  sha256Hex,
  snapshotIdFor,
  normalizeEntryId,
  entryMetadataHash,
} from "./shared.mjs";
import {
  fetchWithRetry,
  resolveReliability,
  buildFetchErrorMessage,
} from "./reliability.mjs";
import { classifyApiSnapshotDiff } from "../api-diff.mjs";

export const ADAPTER_ID = "official_api_metadata";

const API_LEGAL_SAFE_NOTE =
  "Official API metadata snapshot only. Result title/link/date for diff signals. No document body stored. Human review required.";

function resultMetadataHash(result) {
  const parts = [
    result.result_id ?? "",
    result.title ?? "",
    result.link ?? "",
    result.publication_date ?? "",
  ];
  return sha256Hex(parts.join("|"));
}

export function parseFederalRegisterDocuments(json, watcher) {
  if (!json || !Array.isArray(json.results)) {
    throw new Error("Invalid Federal Register API response shape");
  }
  const max = watcher.max_results_per_check ?? 10;
  return json.results.slice(0, max).map((doc) => {
    const result_id = String(doc.document_number ?? doc.slug ?? doc.id ?? "").slice(0, 200);
    const title = doc.title ? String(doc.title).replace(/\s+/g, " ").trim().slice(0, 500) : null;
    const link = doc.html_url ? String(doc.html_url).trim().slice(0, 2000) : null;
    const publication_date = doc.publication_date
      ? String(doc.publication_date).slice(0, 40)
      : doc.effective_on
        ? String(doc.effective_on).slice(0, 40)
        : null;
    const result = {
      result_id: result_id || normalizeEntryId({ link, title }, ["link", "title"]),
      title,
      link,
      publication_date,
      document_number: doc.document_number ? String(doc.document_number).slice(0, 120) : null,
      result_hash: null,
    };
    result.result_hash = resultMetadataHash(result);
    return result;
  });
}

export function aggregateResultsHash(results) {
  const ids = results.map((r) => r.result_id).sort();
  return sha256Hex(ids.join("\n"));
}

export async function runApiMetadataWatcher(watcher, context) {
  const {
    previousSnapshot,
    dryRun,
    skipNetwork,
    userAgent,
    runDate,
    defaultUserAgent,
  } = context;
  const reliability = resolveReliability(watcher, "api");
  const checkedAt = new Date().toISOString();
  const snapId = snapshotIdFor(watcher.source_id, checkedAt, "snap-api");
  const lastSuccessfulSnapshotId =
    previousSnapshot && !previousSnapshot.fetch_error ? previousSnapshot.snapshot_id : null;

  const base = {
    snapshot_id: snapId,
    watcher_id: watcher.watcher_id,
    source_id: watcher.source_id,
    jurisdiction_id: watcher.jurisdiction_id,
    adapter_id: ADAPTER_ID,
    checked_at: checkedAt,
    api_url: watcher.api_url,
    final_url: watcher.api_url,
    http_status: null,
    query_scope_note: watcher.query_scope_note ?? null,
    result_count: 0,
    results: [],
    results_aggregate_hash: null,
    snapshot_kind: "api_metadata",
    storage_policy: "metadata_only_no_body_storage",
    legal_safe_note: watcher.legal_safe_note ?? API_LEGAL_SAFE_NOTE,
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

  const ua = defaultUserAgent;
  try {
    const fetched = await fetchWithRetry(
      watcher.api_url,
      {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent": ua,
          Accept: "application/json",
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

    let json;
    try {
      json = JSON.parse(fetched.body.toString("utf8"));
    } catch {
      return {
        snapshot: {
          ...base,
          http_status: fetched.res.status,
          fetch_error: buildFetchErrorMessage("invalid_api_response", "JSON parse failed"),
          snapshot_kind: "error_placeholder",
          error_category: "invalid_api_response",
        },
        error: buildFetchErrorMessage("invalid_api_response", "JSON parse failed"),
        error_category: "invalid_api_response",
        retry_attempts: fetched.attempt,
        last_successful_snapshot_id: lastSuccessfulSnapshotId,
        detectedChanges: [],
      };
    }

    const results = parseFederalRegisterDocuments(json, watcher);
    const snapshot = {
      ...base,
      final_url: fetched.res.url || watcher.api_url,
      http_status: fetched.res.status,
      content_type: fetched.res.headers.get("content-type"),
      result_count: results.length,
      results,
      results_aggregate_hash: aggregateResultsHash(results),
      response_hash: sha256Hex(fetched.body),
      content_length: fetched.body.length,
      retry_attempts: fetched.attempt,
    };

    const detectedChanges = [];
    if (previousSnapshot && !previousSnapshot.fetch_error) {
      detectedChanges.push(
        ...classifyApiSnapshotDiff(previousSnapshot, snapshot, watcher, {
          runDate,
          simulation: false,
        }),
      );
    }

    return {
      snapshot,
      error: null,
      error_category: null,
      retry_attempts: fetched.attempt,
      last_successful_snapshot_id: lastSuccessfulSnapshotId,
      detectedChanges,
    };
  } catch (err) {
    const category = "unknown_error";
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
