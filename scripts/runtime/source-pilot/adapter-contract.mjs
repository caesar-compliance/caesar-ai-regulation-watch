#!/usr/bin/env node
/**
 * Source pilot adapter contract — metadata-only, fixture-first, no network by default.
 */

/** @typedef {object} SourcePilotRegistryEntry */
/** @typedef {object} FixtureSnapshot */
/** @typedef {object} MetadataSnapshotItem */

/**
 * @param {SourcePilotRegistryEntry} entry
 * @returns {string[]}
 */
export function validateRegistryEntryForAdapter(entry) {
  const errors = [];
  if (entry.stores_full_text === true) {
    errors.push(`${entry.source_id}: stores_full_text must be false`);
  }
  if (entry.allowed_for_network_check === true) {
    errors.push(`${entry.source_id}: allowed_for_network_check must be false in T075A`);
  }
  if (entry.stores_metadata_only !== true) {
    errors.push(`${entry.source_id}: stores_metadata_only must be true`);
  }
  return errors;
}

/**
 * Adapter interface shape (fixture implementations only in T075A).
 * @typedef {object} SourcePilotAdapter
 * @property {string} adapterId
 * @property {(entry: SourcePilotRegistryEntry, options?: { fixtureVersion?: string }) => Promise<FixtureSnapshot>} loadFixtureSnapshot
 */

export const ADAPTER_CONTRACT_NOTE =
  "T075A adapters are fixture-only. Network adapters require Control Tower approval and REGWATCH_ENABLE_NETWORK_EXECUTION.";
