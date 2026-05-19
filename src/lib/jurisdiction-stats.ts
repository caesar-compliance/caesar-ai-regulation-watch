import type { Jurisdiction } from "./data";
import {
  getJurisdictions,
  sourcesForJurisdiction,
  recordsForJurisdiction,
  changesForJurisdiction,
  timelinesForJurisdiction,
} from "./data";

export interface JurisdictionCounts {
  sources: number;
  records: number;
  changes: number;
  timelines: number;
}

export function countsForJurisdiction(jurisdictionId: string): JurisdictionCounts {
  return {
    sources: sourcesForJurisdiction(jurisdictionId).length,
    records: recordsForJurisdiction(jurisdictionId).length,
    changes: changesForJurisdiction(jurisdictionId).length,
    timelines: timelinesForJurisdiction(jurisdictionId).length,
  };
}

export interface MapMarker extends Jurisdiction {
  counts: JurisdictionCounts;
}

export function getMapMarkers(): MapMarker[] {
  return getJurisdictions()
    .filter((j) => j.map)
    .map((j) => ({
      ...j,
      counts: countsForJurisdiction(j.jurisdiction_id),
    }));
}
