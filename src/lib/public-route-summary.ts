/**
 * T080A — Single build-time summary for homepage/tracker/map public routes.
 * Reads T080 public JSON exports so route pages stay aligned with tracker-summary.json.
 */
import {
  getJurisdictionProfileCards,
  getMapMarkers,
  getMonitoringStatus,
  getTrackerSummary,
} from "./runtime-monitoring-data";

export interface PublicRouteSummary {
  jurisdictionCount: number;
  profileCardCount: number;
  regulationRecordCount: number;
  monitoredSourceCount: number;
  automatedRssCount: number;
  manualReviewSourceCount: number;
  mapMarkerCount: number;
  workerDeployed: boolean;
  scheduledMonitoringEnabled: boolean;
}

export function getPublicRouteSummary(): PublicRouteSummary {
  const tracker = getTrackerSummary();
  const monitoring = getMonitoringStatus();
  const profileCards = getJurisdictionProfileCards();
  const mapMarkers = getMapMarkers();

  const jurisdictionCount =
    tracker.countries_covered ?? profileCards.length ?? mapMarkers.length;
  const monitoredSourceCount =
    tracker.monitored_source_count ?? monitoring.monitored_source_count ?? 0;
  const automatedRssCount =
    tracker.automated_rss_source_count ??
    tracker.automated_source_count ??
    monitoring.automated_rss_source_count ??
    monitoring.automated_source_count ??
    0;
  const manualReviewSourceCount =
    tracker.manual_review_source_count ??
    tracker.manual_source_count ??
    monitoring.manual_review_source_count ??
    monitoring.manual_source_count ??
    0;

  return {
    jurisdictionCount,
    profileCardCount: profileCards.length,
    regulationRecordCount: tracker.regulations_tracked ?? 0,
    monitoredSourceCount,
    automatedRssCount,
    manualReviewSourceCount,
    mapMarkerCount: mapMarkers.length || jurisdictionCount,
    workerDeployed: monitoring.worker_deployed === true,
    scheduledMonitoringEnabled: monitoring.scheduled_monitoring_enabled === true,
  };
}
