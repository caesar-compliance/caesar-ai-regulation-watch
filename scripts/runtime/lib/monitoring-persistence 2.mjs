#!/usr/bin/env node
import { snapshotHash, stableItemHash } from "./feed-metadata.mjs";

export async function ensureRegulationSource(client, source) {
  await client.query(
    `INSERT INTO regulation_sources (
       source_key, source_name, source_type, source_url, status, metadata_only, schedule_enabled
     ) VALUES ($1, $2, $3, $4, $5, true, false)
     ON CONFLICT (source_key) DO UPDATE SET
       source_name = EXCLUDED.source_name,
       source_type = EXCLUDED.source_type,
       source_url = EXCLUDED.source_url,
       updated_at = NOW()`,
    [
      source.source_key,
      source.source_name,
      source.source_type,
      source.official_url,
      source.monitoring_status === "active_pilot" ? "active" : "registered",
    ],
  );
}

export async function insertRuntimeEvent(client, { event_type, event_status, source_key, message, metadata }) {
  await client.query(
    `INSERT INTO runtime_events (event_type, event_status, source_key, message, metadata_json)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [event_type, event_status, source_key ?? null, message, JSON.stringify(metadata ?? {})],
  );
}

export async function loadPreviousItems(client, sourceKey) {
  const res = await client.query(
    `SELECT external_id, title, url, published_at, summary_excerpt, content_hash
     FROM source_items WHERE source_key = $1`,
    [sourceKey],
  );
  const map = new Map();
  for (const row of res.rows) {
    map.set(row.external_id, row);
  }
  return map;
}

export async function persistMonitoringRun(client, { source, items, runType, dryRun }) {
  if (dryRun) {
    const changes = diffItems(new Map(), items);
    return {
      run_id: "dry-run",
      snapshot_id: "dry-run",
      item_count: items.length,
      snapshot_hash: snapshotHash(items),
      detected_changes: changes,
      review_candidates: changes.filter((c) => c.material).map(toReviewCandidate),
    };
  }

  const startedAt = new Date();
  const runRes = await client.query(
    `INSERT INTO source_runs (source_key, run_type, status, started_at, item_count)
     VALUES ($1, $2, 'running', $3, 0)
     RETURNING id`,
    [source.source_key, runType, startedAt],
  );
  const runId = runRes.rows[0].id;

  try {
    const previous = await loadPreviousItems(client, source.source_key);
    const snapHash = snapshotHash(items);
    const snapRes = await client.query(
      `INSERT INTO source_snapshots (source_key, run_id, snapshot_hash, item_count, captured_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [source.source_key, runId, snapHash, items.length, new Date()],
    );
    const snapshotId = snapRes.rows[0].id;

    for (const item of items) {
      await client.query(
        `INSERT INTO source_items (
           source_key, external_id, title, url, published_at, summary_excerpt,
           content_hash, metadata_json, first_seen_at, last_seen_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW(), NOW())
         ON CONFLICT (source_key, external_id) DO UPDATE SET
           title = EXCLUDED.title,
           url = EXCLUDED.url,
           published_at = EXCLUDED.published_at,
           summary_excerpt = EXCLUDED.summary_excerpt,
           content_hash = EXCLUDED.content_hash,
           metadata_json = EXCLUDED.metadata_json,
           last_seen_at = NOW()`,
        [
          source.source_key,
          item.external_id,
          item.title,
          item.url,
          item.published_at,
          item.summary_excerpt,
          item.content_hash,
          JSON.stringify({ pilot: "T078", review_required: true }),
        ],
      );
    }

    const changes = diffItems(previous, items);
    const detected = [];
    const candidates = [];

    for (const change of changes) {
      const itemIdRes = change.external_id
        ? await client.query(
            `SELECT id FROM source_items WHERE source_key = $1 AND external_id = $2`,
            [source.source_key, change.external_id],
          )
        : { rows: [] };
      const itemId = itemIdRes.rows[0]?.id ?? null;

      const dcRes = await client.query(
        `INSERT INTO detected_changes (
           source_key, item_id, change_type, change_summary,
           old_hash, new_hash, detected_at, review_status, metadata_json
         ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'pending', $7::jsonb)
         RETURNING id`,
        [
          source.source_key,
          itemId,
          change.change_type,
          change.change_summary,
          change.old_hash ?? null,
          change.new_hash ?? null,
          JSON.stringify({
            material: change.material,
            review_required: true,
            legal_change_claimed: false,
          }),
        ],
      );
      const changeId = dcRes.rows[0].id;
      detected.push({ id: changeId, ...change });

      if (change.material) {
        const rcRes = await client.query(
          `INSERT INTO review_candidates (
             detected_change_id, candidate_status, jurisdiction_ids, topic_ids,
             proposed_title, proposed_summary, source_url, metadata_json
           ) VALUES ($1, 'draft', $2, $3, $4, $5, $6, $7::jsonb)
           RETURNING id`,
          [
            changeId,
            source.jurisdiction_ids ?? [],
            source.topic_ids ?? [],
            change.proposed_title ?? null,
            change.change_summary,
            change.source_url ?? source.official_url,
            JSON.stringify({ review_required: true, pilot: "T078" }),
          ],
        );
        candidates.push({ id: rcRes.rows[0].id, detected_change_id: changeId });
      }
    }

    await client.query(
      `UPDATE source_runs SET status = 'completed', completed_at = NOW(), item_count = $2
       WHERE id = $1`,
      [runId, items.length],
    );

    return {
      run_id: runId,
      snapshot_id: snapshotId,
      item_count: items.length,
      snapshot_hash: snapHash,
      detected_changes: detected,
      review_candidates: candidates,
    };
  } catch (err) {
    await client.query(
      `UPDATE source_runs SET status = 'failed', completed_at = NOW(), error_message = $2
       WHERE id = $1`,
      [runId, String(err.message ?? err).slice(0, 500)],
    );
    throw err;
  }
}

function diffItems(previousMap, currentItems) {
  const changes = [];
  const currentIds = new Set();

  for (const item of currentItems) {
    currentIds.add(item.external_id);
    const prev = previousMap.get(item.external_id);
    if (!prev) {
      changes.push({
        change_type: "added",
        external_id: item.external_id,
        change_summary: `New metadata item detected: ${item.title}`,
        old_hash: null,
        new_hash: item.content_hash,
        proposed_title: item.title,
        source_url: item.url,
        material: true,
      });
    } else if (prev.content_hash !== item.content_hash) {
      changes.push({
        change_type: "changed",
        external_id: item.external_id,
        change_summary: `Metadata hash changed for: ${item.title}`,
        old_hash: prev.content_hash,
        new_hash: item.content_hash,
        proposed_title: item.title,
        source_url: item.url,
        material: true,
      });
    }
  }

  for (const [externalId, prev] of previousMap) {
    if (!currentIds.has(externalId)) {
      changes.push({
        change_type: "removed",
        external_id: externalId,
        change_summary: `Metadata item no longer in feed snapshot: ${prev.title}`,
        old_hash: prev.content_hash,
        new_hash: null,
        proposed_title: prev.title,
        source_url: prev.url,
        material: false,
      });
    }
  }

  return changes;
}

function toReviewCandidate(change) {
  return {
    detected_change_id: null,
    proposed_title: change.proposed_title,
    change_summary: change.change_summary,
    source_url: change.source_url,
  };
}

export { stableItemHash, snapshotHash };
