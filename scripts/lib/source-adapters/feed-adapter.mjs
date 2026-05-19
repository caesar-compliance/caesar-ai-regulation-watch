import { XMLParser } from "fast-xml-parser";
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
import { classifyFeedSnapshotDiff } from "../feed-diff.mjs";

export const ADAPTER_ID = "official_rss_or_feed";

/** Safe XML parser limits for official RSS/Atom feeds (see docs/WATCHER_RELIABILITY_POLICY.md). */
export const FEED_XML_PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  processEntities: {
    enabled: true,
    // Default fast-xml-parser limit is 1000; EDPS official news feed exceeds it (~1026 DOCTYPE entities).
    maxTotalExpansions: 2048,
    maxExpandedLength: 8192,
  },
};

const FEED_LEGAL_SAFE_NOTE =
  "Feed metadata snapshot only. Entry title/link/date for diff signals. No article body stored. Feed-detected items require human review before use. Not legal advice.";

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function pickDate(item, dateFields) {
  for (const field of dateFields) {
    const parts = field.split(":");
    let cur = item;
    for (const p of parts) {
      cur = cur?.[p];
    }
    if (cur) return String(cur).trim().slice(0, 80);
  }
  return null;
}

function parseRssItems(channel, watcher) {
  const items = asArray(channel.item);
  const identityFields = watcher.entry_identity_fields ?? ["guid", "link"];
  const dateFields = watcher.entry_date_fields ?? ["pubDate", "dc:date", "updated"];
  const max = watcher.max_entries_per_check ?? 50;

  return items.slice(0, max).map((item) => {
    const title = item.title ? String(item.title).replace(/\s+/g, " ").trim().slice(0, 500) : null;
    const link = item.link ? String(item.link).trim().slice(0, 2000) : null;
    const guid =
      item.guid?.["#text"] ??
      item.guid ??
      (typeof item.guid === "object" ? item.guid?.["@_isPermaLink"] : null);
    const guidStr = guid ? String(guid).trim().slice(0, 500) : null;
    const published_at = pickDate(item, dateFields);
    const raw = { guid: guidStr, link, title };
    const entry_id = normalizeEntryId(raw, identityFields);
    const entry = {
      entry_id,
      guid: guidStr,
      link,
      title,
      published_at,
      updated_at: item.updated ? String(item.updated).slice(0, 80) : null,
      entry_hash: null,
    };
    entry.entry_hash = entryMetadataHash(entry);
    return entry;
  });
}

function parseAtomEntries(feed, watcher) {
  const entries = asArray(feed.entry);
  const identityFields = watcher.entry_identity_fields ?? ["id", "link"];
  const dateFields = watcher.entry_date_fields ?? ["updated", "published"];
  const max = watcher.max_entries_per_check ?? 50;

  return entries.slice(0, max).map((entry) => {
    const title = entry.title?.["#text"] ?? entry.title;
    const titleStr = title ? String(title).replace(/\s+/g, " ").trim().slice(0, 500) : null;
    let link = entry.link;
    if (Array.isArray(link)) link = link.find((l) => l?.["@_rel"] !== "self") ?? link[0];
    if (typeof link === "object") link = link?.["@_href"] ?? link?.href;
    const linkStr = link ? String(link).trim().slice(0, 2000) : null;
    const id = entry.id ? String(entry.id).trim().slice(0, 500) : null;
    const published_at = pickDate(entry, dateFields);
    const raw = { id, link: linkStr, title: titleStr };
    const entry_id = normalizeEntryId(raw, identityFields);
    const normalized = {
      entry_id,
      guid: id,
      link: linkStr,
      title: titleStr,
      published_at,
      updated_at: entry.updated ? String(entry.updated).slice(0, 80) : null,
      entry_hash: null,
    };
    normalized.entry_hash = entryMetadataHash(normalized);
    return normalized;
  });
}

function classifyResponseShape(text) {
  const sample = text ?? "";
  return {
    response_appears_xml: /^\s*</.test(sample),
    response_appears_html: /<html/i.test(sample.slice(0, 500)),
  };
}

/** Metadata-only diagnostics for feed fetch/parse failures (no full body stored). */
export function buildFeedDiagnostics(fetched, xmlText, parseErr) {
  const prefix = xmlText ? xmlText.slice(0, 300).replace(/\s+/g, " ").trim() : "";
  const shape = classifyResponseShape(xmlText ?? "");
  const parseMessage = parseErr ? String(parseErr?.message ?? parseErr).slice(0, 500) : null;
  let diagnostic_note = parseMessage;
  if (!diagnostic_note && shape.response_appears_html) {
    diagnostic_note = "Response appears HTML, not RSS/Atom XML";
  } else if (!diagnostic_note && xmlText && !shape.response_appears_xml) {
    diagnostic_note = "Response does not appear to be XML";
  }
  const diagnostics = {
    response_status: fetched?.res?.status ?? null,
    response_content_type: fetched?.res?.headers?.get("content-type") ?? null,
    final_url: fetched?.res?.url ?? null,
    parse_error_code: parseErr ? "invalid_feed" : null,
    diagnostic_note,
    diagnostic_prefix_hash: prefix ? sha256Hex(prefix) : null,
    ...shape,
  };
  if (
    prefix.length > 0 &&
    prefix.length <= 300 &&
    shape.response_appears_xml &&
    !shape.response_appears_html
  ) {
    diagnostics.diagnostic_prefix = prefix;
  }
  return diagnostics;
}

export function parseFeedXml(xmlText, watcher) {
  const parser = new XMLParser(FEED_XML_PARSER_OPTIONS);
  const doc = parser.parse(xmlText);

  if (doc?.rss?.channel) {
    const channel = doc.rss.channel;
    const entries = parseRssItems(channel, watcher);
    return {
      feed_format: "rss",
      feed_title: channel.title ? String(channel.title).slice(0, 500) : null,
      entries,
    };
  }

  if (doc?.feed) {
    const feed = doc.feed;
    const entries = parseAtomEntries(feed, watcher);
    const title = feed.title?.["#text"] ?? feed.title;
    return {
      feed_format: "atom",
      feed_title: title ? String(title).slice(0, 500) : null,
      entries,
    };
  }

  throw new Error("Unrecognized feed format (expected RSS or Atom)");
}

export function aggregateEntryHash(entries) {
  const ids = entries.map((e) => e.entry_id).sort();
  return sha256Hex(ids.join("\n"));
}

export async function runFeedWatcher(watcher, context) {
  const { previousSnapshot, dryRun, skipNetwork, userAgent, runDate, defaultUserAgent } =
    context;
  const reliability = resolveReliability(watcher, "feed");
  const checkedAt = new Date().toISOString();
  const snapId = snapshotIdFor(watcher.source_id, checkedAt, "snap-feed");
  const lastSuccessfulSnapshotId =
    previousSnapshot && !previousSnapshot.fetch_error ? previousSnapshot.snapshot_id : null;

  const base = {
    snapshot_id: snapId,
    watcher_id: watcher.watcher_id,
    source_id: watcher.source_id,
    jurisdiction_id: watcher.jurisdiction_id,
    adapter_id: ADAPTER_ID,
    checked_at: checkedAt,
    feed_url: watcher.feed_url,
    final_url: watcher.feed_url,
    http_status: null,
    content_type: null,
    feed_title: null,
    feed_entry_count: 0,
    entries: [],
    entries_aggregate_hash: null,
    snapshot_kind: "feed_metadata",
    storage_policy: "metadata_only_no_body_storage",
    legal_safe_note: watcher.legal_safe_note ?? FEED_LEGAL_SAFE_NOTE,
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

  const ua = defaultUserAgent ?? userAgent;
  try {
    const fetched = await fetchWithRetry(
      watcher.feed_url,
      {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent": ua,
          Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
        },
      },
      reliability,
    );

    if (!fetched.ok) {
      const category = fetched.error_category ?? "unknown_error";
      const detail = fetched.res
        ? `HTTP ${fetched.res.status} after ${fetched.attempt} attempt(s)`
        : String(fetched.error?.message ?? "fetch failed");
      const feedDiagnostics = buildFeedDiagnostics(fetched, null, null);
      return {
        snapshot: {
          ...base,
          http_status: fetched.res?.status ?? null,
          content_type: feedDiagnostics.response_content_type,
          final_url: feedDiagnostics.final_url ?? watcher.feed_url,
          fetch_error: buildFetchErrorMessage(category, detail),
          snapshot_kind: "error_placeholder",
          error_category: category,
        },
        error: buildFetchErrorMessage(category, detail),
        error_category: category,
        feed_diagnostics: feedDiagnostics,
        retry_attempts: fetched.attempt,
        last_successful_snapshot_id: lastSuccessfulSnapshotId,
        detectedChanges: [],
      };
    }

    const xml = fetched.body.toString("utf8");
    let parsed;
    try {
      parsed = parseFeedXml(xml, watcher);
    } catch (parseErr) {
      const feedDiagnostics = buildFeedDiagnostics(fetched, xml, parseErr);
      const msg = buildFetchErrorMessage(
        "invalid_feed",
        String(parseErr?.message ?? parseErr),
      );
      return {
        snapshot: {
          ...base,
          http_status: fetched.res.status,
          content_type: feedDiagnostics.response_content_type,
          final_url: feedDiagnostics.final_url ?? watcher.feed_url,
          fetch_error: msg,
          snapshot_kind: "error_placeholder",
          error_category: "invalid_feed",
        },
        error: msg,
        error_category: "invalid_feed",
        feed_diagnostics: feedDiagnostics,
        retry_attempts: fetched.attempt,
        last_successful_snapshot_id: lastSuccessfulSnapshotId,
        detectedChanges: [],
      };
    }

    const entries = parsed.entries;
    const snapshot = {
      ...base,
      final_url: fetched.res.url || watcher.feed_url,
      http_status: fetched.res.status,
      content_type: fetched.res.headers.get("content-type"),
      feed_title: parsed.feed_title,
      feed_format_detected: parsed.feed_format,
      feed_entry_count: entries.length,
      entries,
      entries_aggregate_hash: aggregateEntryHash(entries),
      content_hash: sha256Hex(fetched.body),
      content_length: fetched.body.length,
      retry_attempts: fetched.attempt,
    };

    const detectedChanges = [];
    if (previousSnapshot && !previousSnapshot.fetch_error) {
      detectedChanges.push(
        ...classifyFeedSnapshotDiff(previousSnapshot, snapshot, watcher, {
          runDate,
          simulation: false,
        }),
      );
    }

    return {
      snapshot,
      error: null,
      error_category: null,
      feed_diagnostics: null,
      retry_attempts: fetched.attempt,
      last_successful_snapshot_id: lastSuccessfulSnapshotId,
      detectedChanges,
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
      feed_diagnostics: null,
      retry_attempts: 0,
      last_successful_snapshot_id: lastSuccessfulSnapshotId,
      detectedChanges: [],
    };
  }
}
