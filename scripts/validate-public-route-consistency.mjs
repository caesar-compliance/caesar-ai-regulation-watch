#!/usr/bin/env node
/**
 * T080A — Fail when built HTML or source routes drift from T080 public exports / package version.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion, readProjectVersionLabel } from "./lib/read-project-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DATA = path.join(ROOT, "public/data");
const SRC_PAGES = path.join(ROOT, "src/pages");
const DIST = path.join(ROOT, "dist");

function readJson(name) {
  const full = path.join(PUBLIC_DATA, name);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function readText(rel, base = ROOT) {
  const full = path.join(base, rel);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, "utf8");
}

const STALE_VERSION_LABELS = ["v1.0.21", "v1.0.29", "v1.0.30", "v1.0.31"];

function main() {
  const errors = [];
  const projectVersion = readProjectVersion();
  const projectLabel = readProjectVersionLabel();

  if (fs.existsSync(path.join(SRC_PAGES, "map.astro"))) {
    errors.push("src/pages/map.astro must not exist — it shadows T080 src/pages/map/index.astro");
  }

  const tracker = readJson("tracker-summary.json");
  const profileCards = readJson("jurisdiction-profile-cards.json");
  const mapMetrics = readJson("regulation-map-metrics.json");

  const expectedJurisdictions =
    tracker?.countries_covered ?? profileCards?.cards?.length ?? 0;
  const expectedRegulations = tracker?.regulations_tracked ?? 0;
  const expectedSources = tracker?.monitored_source_count ?? 0;
  const expectedMarkers = mapMetrics?.markers?.length ?? expectedJurisdictions;

  if (!tracker) errors.push("missing public/data/tracker-summary.json");
  if (!profileCards?.cards?.length) {
    errors.push("jurisdiction-profile-cards.json must include cards[]");
  }
  if (!mapMetrics?.markers?.length) {
    errors.push("regulation-map-metrics.json must include markers[]");
  }

  if (expectedJurisdictions < 18) {
    errors.push(`T080 expects >=18 jurisdictions in exports, got ${expectedJurisdictions}`);
  }

  const indexSrc = readText("src/pages/index.astro");
  if (indexSrc?.includes("13 jurisdictions")) {
    errors.push("src/pages/index.astro still hardcodes 13 jurisdictions");
  }
  if (indexSrc && !indexSrc.includes("getPublicRouteSummary")) {
    errors.push("src/pages/index.astro must use getPublicRouteSummary for T080 counts");
  }
  if (indexSrc && !indexSrc.includes("T083 Signal Quality and Review Prioritization")) {
    errors.push("src/pages/index.astro must include T083 Signal Quality banner above T082");
  }
  if (indexSrc && !indexSrc.includes("getSignalQualitySummary")) {
    errors.push("src/pages/index.astro must use getSignalQualitySummary for T083 counts");
  }
  if (indexSrc && !indexSrc.includes("T082 Operator Decision Workflow")) {
    errors.push("src/pages/index.astro must include T082 Operator Decision Workflow banner");
  }
  if (
    indexSrc &&
    indexSrc.indexOf("T083 Signal Quality") > indexSrc.indexOf("T082 Operator Decision Workflow")
  ) {
    errors.push("src/pages/index.astro must place T083 banner before T082");
  }
  if (indexSrc && !indexSrc.includes("getRegulationReviewQueueSummary")) {
    errors.push("src/pages/index.astro must use regulation-review-queue summary for T082 counts");
  }
  if (indexSrc && !indexSrc.includes("getIngressFilterSummary")) {
    errors.push("src/pages/index.astro must use getIngressFilterSummary for T084 counts");
  }
  if (indexSrc && !indexSrc.includes("T084 Automated Source Expansion and Ingress Filtering")) {
    errors.push("src/pages/index.astro must include T084 ingress filtering banner");
  }
  if (
    indexSrc &&
    indexSrc.indexOf("T084 Automated Source Expansion") >
      indexSrc.indexOf("T083 Signal Quality")
  ) {
    errors.push("src/pages/index.astro must place T084 banner before T083");
  }
  if (indexSrc && !indexSrc.includes("gates closed")) {
    errors.push("src/pages/index.astro must state gates closed on T084 banner");
  }

  const trackerSrc = readText("src/pages/tracker/index.astro");
  if (trackerSrc && !trackerSrc.includes("Signal quality dashboard (T083)")) {
    errors.push("src/pages/tracker/index.astro must include T083 signal quality dashboard");
  }
  if (trackerSrc && !trackerSrc.includes("Operator review pipeline (T082)")) {
    errors.push("src/pages/tracker/index.astro must include T082 operator review pipeline section");
  }
  if (
    trackerSrc &&
    trackerSrc.indexOf("Signal quality dashboard (T083)") >
      trackerSrc.indexOf("Operator review pipeline (T082)")
  ) {
    errors.push("src/pages/tracker/index.astro must place T083 before T082 operator pipeline");
  }
  if (
    trackerSrc &&
    trackerSrc.indexOf("Operator review pipeline (T082)") >
      trackerSrc.indexOf("Coverage dashboard (T080)")
  ) {
    errors.push("src/pages/tracker/index.astro must place T082 section before T080 coverage");
  }
  if (trackerSrc && !trackerSrc.includes("Ingress filter dashboard (T084)")) {
    errors.push("src/pages/tracker/index.astro must include Ingress filter dashboard (T084)");
  }
  if (
    trackerSrc &&
    trackerSrc.indexOf("Ingress filter dashboard (T084)") >
      trackerSrc.indexOf("Signal quality dashboard (T083)")
  ) {
    errors.push("src/pages/tracker/index.astro must place T084 ingress dashboard before T083");
  }
  if (trackerSrc && !trackerSrc.includes("/sources/")) {
    errors.push("src/pages/tracker/index.astro must link to /sources/");
  }
  if (trackerSrc && !trackerSrc.includes("/runtime-health/")) {
    errors.push("src/pages/tracker/index.astro must link to /runtime-health/ in T084 section");
  }

  const ingressSummary = readJson("ingress-filter-summary.json");
  const ingressAutomated = ingressSummary?.automated_source_count ?? 0;
  const ingressManual = ingressSummary?.manual_source_count ?? 0;
  const ingressVisible = ingressSummary?.operator_visible_count ?? 0;
  const ingressSuppressed = ingressSummary?.suppress_noise_count ?? 0;

  const reviewQueueSrc = readText("src/pages/review-queue.astro");
  if (reviewQueueSrc && !reviewQueueSrc.includes("Signal quality (T083)")) {
    errors.push("src/pages/review-queue.astro must include Signal quality (T083) section");
  }
  if (reviewQueueSrc && !reviewQueueSrc.includes("data-signal-score")) {
    errors.push("src/pages/review-queue.astro must expose data-signal-score on queue cards");
  }
  if (reviewQueueSrc && !reviewQueueSrc.includes("reason_codes")) {
    errors.push("src/pages/review-queue.astro must expose reason_codes on queue cards");
  }

  const mapIndexSrc = readText("src/pages/map/index.astro");
  if (mapIndexSrc && !mapIndexSrc.includes("regulation-map-metrics")) {
    errors.push("src/pages/map/index.astro must reference regulation-map-metrics exports");
  }

  if (fs.existsSync(DIST)) {
    const indexHtml = readText("index.html", DIST);
    const mapHtml = readText("map/index.html", DIST);
    const trackerHtml = readText("tracker/index.html", DIST);

    for (const label of STALE_VERSION_LABELS) {
      for (const [page, html] of [
        ["index.html", indexHtml],
        ["map/index.html", mapHtml],
        ["tracker/index.html", trackerHtml],
      ]) {
        if (html?.includes(label)) {
          errors.push(`dist/${page} contains stale footer/version label ${label}`);
        }
      }
    }

    if (indexHtml && !indexHtml.includes(projectLabel)) {
      errors.push(`dist/index.html missing ${projectLabel}`);
    }
    if (indexHtml && !indexHtml.includes("T083 Signal Quality and Review Prioritization")) {
      errors.push("dist/index.html missing T083 Signal Quality banner");
    }
    if (
      indexHtml &&
      indexHtml.indexOf("T083 Signal Quality") >
        indexHtml.indexOf("T082 Operator Decision Workflow")
    ) {
      errors.push("dist/index.html must lead with T083 before T082");
    }
    if (indexHtml && !indexHtml.includes("T082 Operator Decision Workflow")) {
      errors.push("dist/index.html missing T082 Operator Decision Workflow banner");
    }
    if (indexHtml && !indexHtml.includes("T084 Automated Source Expansion and Ingress Filtering")) {
      errors.push("dist/index.html missing T084 ingress filtering banner");
    }
    if (
      indexHtml &&
      indexHtml.indexOf("T084 Automated Source Expansion") >
        indexHtml.indexOf("T083 Signal Quality")
    ) {
      errors.push("dist/index.html must lead with T084 before T083");
    }
    if (indexHtml && !indexHtml.includes("gates closed")) {
      errors.push("dist/index.html missing gates closed on T084 banner");
    }
    if (indexHtml && !indexHtml.includes("operator decisions")) {
      errors.push("dist/index.html missing operator decisions copy");
    }
    if (indexHtml?.includes("T080 coverage model") && !indexHtml.includes("T082 Operator Decision Workflow")) {
      errors.push("dist/index.html shows T080 without T082 operator workflow");
    }
    if (indexHtml?.includes("13 jurisdictions")) {
      errors.push("dist/index.html still shows 13 jurisdictions copy");
    }

    if (mapHtml?.includes("Global coverage map") && !mapHtml.includes("Global regulation map")) {
      errors.push(
        "dist/map/index.html serves legacy map.astro — expected T080 Global regulation map",
      );
    }
    if (mapHtml && !mapHtml.includes(projectLabel)) {
      errors.push(`dist/map/index.html missing ${projectLabel}`);
    }

    if (trackerHtml && !trackerHtml.includes("Ingress filter dashboard (T084)")) {
      errors.push("dist/tracker/index.html missing Ingress filter dashboard (T084)");
    }
    if (
      trackerHtml &&
      trackerHtml.indexOf("Ingress filter dashboard (T084)") >
        trackerHtml.indexOf("Signal quality dashboard (T083)")
    ) {
      errors.push("dist/tracker/index.html must place T084 before T083");
    }
    if (trackerHtml && !trackerHtml.includes("Signal quality dashboard (T083)")) {
      errors.push("dist/tracker/index.html missing T083 signal quality dashboard");
    }
    if (trackerHtml && !trackerHtml.includes("/sources/")) {
      errors.push("dist/tracker/index.html missing link to /sources/");
    }
    if (
      trackerHtml &&
      trackerHtml.indexOf("Signal quality dashboard (T083)") >
        trackerHtml.indexOf("Operator review pipeline (T082)")
    ) {
      errors.push("dist/tracker/index.html must place T083 before T082");
    }
    if (trackerHtml && !/Operator review pipeline \(T082\)/i.test(trackerHtml)) {
      errors.push("dist/tracker/index.html missing T082 operator review pipeline section");
    }
    if (
      trackerHtml &&
      trackerHtml.indexOf("Operator review pipeline (T082)") >
        trackerHtml.indexOf("Coverage dashboard (T080)")
    ) {
      errors.push("dist/tracker/index.html must place T082 before T080 coverage section");
    }
    if (
      trackerHtml &&
      !/not legal verification/i.test(trackerHtml)
    ) {
      errors.push("dist/tracker/index.html missing not legal verification wording");
    }
    if (trackerHtml?.includes("Coverage dashboard (T080)") === false) {
      errors.push("dist/tracker/index.html missing T080 coverage dashboard section");
    }

    const reviewQueueHtml = readText("review-queue/index.html", DIST);
    if (reviewQueueHtml && !reviewQueueHtml.includes("Regulation review queue")) {
      errors.push("dist/review-queue/index.html missing T081 regulation review queue heading");
    }
    if (reviewQueueHtml && !reviewQueueHtml.includes("Signal quality (T083)")) {
      errors.push("dist/review-queue/index.html missing Signal quality (T083) section");
    }
    if (reviewQueueHtml && !reviewQueueHtml.includes("data-signal-score=")) {
      errors.push("dist/review-queue/index.html missing data-signal-score on cards");
    }
    if (reviewQueueHtml && !reviewQueueHtml.includes("signal_score")) {
      errors.push("dist/review-queue/index.html missing visible signal_score markers");
    }
    if (reviewQueueHtml && !reviewQueueHtml.includes("ai_regulation_relevance")) {
      errors.push("dist/review-queue/index.html missing ai_regulation_relevance markers");
    }
    if (reviewQueueHtml && !reviewQueueHtml.includes("reason_codes")) {
      errors.push("dist/review-queue/index.html missing reason_codes markers");
    }

    const runtimeHealthHtml = readText("runtime-health/index.html", DIST);
    if (runtimeHealthHtml && !runtimeHealthHtml.includes("Signal quality (T083)")) {
      errors.push("dist/runtime-health/index.html missing Signal quality (T083) section");
    }
    if (runtimeHealthHtml && !runtimeHealthHtml.includes("validate:signal-quality")) {
      errors.push("dist/runtime-health/index.html missing validate:signal-quality status");
    }

    const signalSummary = readJson("signal-quality-summary.json");
    if (signalSummary?.product_version === projectVersion) {
      if (indexHtml && indexHtml.includes("v1.0.33") && !indexHtml.includes(projectLabel)) {
        errors.push("dist/index.html stale v1.0.33 while signal-quality-summary is current");
      }
      if (
        indexHtml &&
        indexHtml.includes("T082 Operator Decision Workflow") &&
        !indexHtml.includes("T083 Signal Quality")
      ) {
        errors.push(
          "dist/index.html leads with T082 only while signal-quality-summary is v1.0.34",
        );
      }
    }

    if (trackerHtml && expectedJurisdictions > 0) {
      const countriesBlock = trackerHtml.match(
        /metrics-strip__value">(\d+)<\/span>\s*<span class="metrics-strip__label">Countries covered/i,
      );
      const regulationsBlock = trackerHtml.match(
        /metrics-strip__value">(\d+)<\/span>\s*<span class="metrics-strip__label">Regulations tracked/i,
      );
      const renderedCountries = countriesBlock?.[1];
      const renderedRegulations = regulationsBlock?.[1];
      if (renderedCountries && Number(renderedCountries) !== expectedJurisdictions) {
        errors.push(
          `tracker HTML countries_covered ${renderedCountries} != tracker-summary ${expectedJurisdictions}`,
        );
      }
      if (
        renderedRegulations &&
        expectedRegulations > 0 &&
        Number(renderedRegulations) !== expectedRegulations
      ) {
        errors.push(
          `tracker HTML regulations_tracked ${renderedRegulations} != tracker-summary ${expectedRegulations}`,
        );
      }
    }

    if (indexHtml && expectedRegulations > 0) {
      const regMatch = indexHtml.match(
        /<strong>(\d+)<\/strong>\s*<span>Regulation records<\/span>/,
      );
      if (regMatch && Number(regMatch[1]) !== expectedRegulations) {
        errors.push(
          `homepage regulation records ${regMatch[1]} != tracker-summary ${expectedRegulations}`,
        );
      }
    }

    if (projectVersion === "1.0.35" && indexHtml) {
      const indexNorm = indexHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      for (const label of STALE_VERSION_LABELS) {
        if (indexHtml.includes(label)) {
          errors.push(`dist/index.html contains stale version ${label} at package 1.0.35`);
        }
      }
      if (indexHtml.includes("13 jurisdictions")) {
        errors.push("dist/index.html still shows 13 jurisdictions at package 1.0.35");
      }
      if (expectedSources > 0 && !indexNorm.includes(`${expectedSources} official sources`)) {
        errors.push(
          `dist/index.html missing ${expectedSources} official sources in T084 banner`,
        );
      }
      if (
        ingressAutomated > 0 &&
        !indexNorm.includes(`${ingressAutomated} automated RSS/Atom`)
      ) {
        errors.push(
          `dist/index.html missing ${ingressAutomated} automated RSS/Atom in T084 banner`,
        );
      }
      if (ingressManual > 0 && !indexNorm.includes(`${ingressManual} manual-review`)) {
        errors.push(`dist/index.html missing ${ingressManual} manual-review in T084 banner`);
      }
      if (
        ingressVisible > 0 &&
        !indexNorm.includes(`${ingressVisible} operator-visible`)
      ) {
        errors.push(
          `dist/index.html missing ${ingressVisible} operator-visible in T084 banner`,
        );
      }
      if (
        ingressSuppressed > 0 &&
        !indexNorm.includes(`${ingressSuppressed} suppressed noise`)
      ) {
        errors.push(
          `dist/index.html missing ${ingressSuppressed} suppressed noise in T084 banner`,
        );
      }
    }

    if (projectVersion === "1.0.35" && trackerHtml) {
      for (const label of STALE_VERSION_LABELS) {
        if (trackerHtml.includes(label)) {
          errors.push(`dist/tracker/index.html contains stale version ${label} at package 1.0.35`);
        }
      }
      if (trackerHtml.includes("Product tracker dashboard (T080)")) {
        errors.push("dist/tracker/index.html still uses legacy T080-only dashboard title");
      }
      if (trackerHtml.includes("not_configured")) {
        errors.push("dist/tracker/index.html must not show not_configured automation status");
      }
      if (
        ingressSuppressed > 0 &&
        !trackerHtml.includes(`${ingressSuppressed}`)
      ) {
        errors.push(
          `dist/tracker/index.html missing suppressed noise count ${ingressSuppressed}`,
        );
      }
    }

    if (mapHtml && expectedMarkers > 0) {
      const markerCards = (mapHtml.match(/country-status-list__item/g) ?? []).length;
      if (markerCards > 0 && markerCards < expectedMarkers) {
        errors.push(`map page lists ${markerCards} jurisdictions, expected ${expectedMarkers}`);
      }
    }
  } else {
    console.log("  (dist/ not present — skipping built HTML checks; run after npm run build)");
  }

  console.log("Public route consistency (T083A)");
  console.log(`  package version: ${projectVersion} (${projectLabel})`);
  console.log(
    `  exports: jurisdictions=${expectedJurisdictions} regulations=${expectedRegulations} sources=${expectedSources} markers=${expectedMarkers}`,
  );

  if (errors.length) {
    console.error(`  FAIL: ${errors.length} issue(s)`);
    for (const e of errors) console.error(`    ✗ ${e}`);
    process.exit(1);
  }

  console.log("  PASS: route sources and exports aligned\n");
  process.exit(0);
}

main();
