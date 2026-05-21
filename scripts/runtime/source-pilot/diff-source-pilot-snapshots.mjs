#!/usr/bin/env node
/**
 * Diff two metadata-only fixture snapshots — no network, no legal text.
 */
/**
 * @param {{ items: { external_id: string }[] }} prev
 * @param {{ items: { external_id: string }[] }} next
 */
export function diffSnapshots(prev, next) {
  const prevIds = new Set((prev.items ?? []).map((i) => i.external_id));
  const nextIds = new Set((next.items ?? []).map((i) => i.external_id));

  const added = [...nextIds].filter((id) => !prevIds.has(id));
  const removed = [...prevIds].filter((id) => !nextIds.has(id));

  const prevById = new Map((prev.items ?? []).map((i) => [i.external_id, i]));
  const changed = [];
  for (const item of next.items ?? []) {
    const old = prevById.get(item.external_id);
    if (!old) continue;
    const oldHash = JSON.stringify({
      title: old.title,
      url: old.url,
      published_at: old.published_at,
    });
    const newHash = JSON.stringify({
      title: item.title,
      url: item.url,
      published_at: item.published_at,
    });
    if (oldHash !== newHash) changed.push(item.external_id);
  }

  return {
    added_count: added.length,
    removed_count: removed.length,
    changed_count: changed.length,
    total_changes: added.length + removed.length + changed.length,
    added_ids: added,
    removed_ids: removed,
    changed_ids: changed,
  };
}
