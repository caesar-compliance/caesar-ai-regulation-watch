import { XMLParser } from "fast-xml-parser";
import {
  sha256Hex,
  snapshotIdFor,
  normalizeEntryId,
  entryMetadataHash,
} from "./shared.mjs";
import { classifyFeedSnapshotDiff } from "../feed-diff.mjs";

export const ADAPTER_ID = "official_rss_or_feed";

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

export function parseFeedXml(xmlText, watcher) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: true,
  });
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

export async function fetchFeed(url, timeoutMs, userAgent) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": userAgent,
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });
    const body = await res.arrayBuffer();
    return { res, body: Buffer.from(body) };
  } finally {
    clearTimeout(timer);
  }
}

export async function runFeedWatcher(watcher, context) {
  const { previousSnapshot, dryRun, skipNetwork, timeoutMs, userAgent, runDate } = context;
  const checkedAt = new Date().toISOString();
  const snapId = snapshotIdFor(watcher.source_id, checkedAt, "snap-feed");

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
      detectedChanges: [],
    };
  }

  try {
    const { res, body } = await fetchFeed(watcher.feed_url, timeoutMs, userAgent);
    const xml = body.toString("utf8");
    const parsed = parseFeedXml(xml, watcher);
    const entries = parsed.entries;
    const snapshot = {
      ...base,
      final_url: res.url || watcher.feed_url,
      http_status: res.status,
      content_type: res.headers.get("content-type"),
      feed_title: parsed.feed_title,
      feed_format_detected: parsed.feed_format,
      feed_entry_count: entries.length,
      entries,
      entries_aggregate_hash: aggregateEntryHash(entries),
      content_hash: sha256Hex(body),
      content_length: body.length,
    };

    const detectedChanges = [];
    if (previousSnapshot && !previousSnapshot.fetch_error && !snapshot.fetch_error) {
      const diffs = classifyFeedSnapshotDiff(previousSnapshot, snapshot, watcher, {
        runDate,
        simulation: false,
      });
      detectedChanges.push(...diffs);
    }

    return { snapshot, error: null, detectedChanges };
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
