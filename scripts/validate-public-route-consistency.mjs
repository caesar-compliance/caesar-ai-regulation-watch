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
  if (indexSrc && !indexSrc.includes("T082 Operator Decision Workflow")) {
    errors.push("src/pages/index.astro must include T082 Operator Decision Workflow banner");
  }
  if (indexSrc && !indexSrc.includes("getRegulationReviewQueueSummary")) {
    errors.push("src/pages/index.astro must use regulation-review-queue summary for T082 counts");
  }

  const trackerSrc = readText("src/pages/tracker/index.astro");
  if (trackerSrc && !trackerSrc.includes("Operator review pipeline (T082)")) {
    errors.push("src/pages/tracker/index.astro must include T082 operator review pipeline section");
  }
  if (
    trackerSrc &&
    trackerSrc.indexOf("Operator review pipeline (T082)") >
      trackerSrc.indexOf("Coverage dashboard (T080)")
  ) {
    errors.push("src/pages/tracker/index.astro must place T082 section before T080 coverage");
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
    if (indexHtml && !indexHtml.includes("T082 Operator Decision Workflow")) {
      errors.push("dist/index.html missing T082 Operator Decision Workflow banner");
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

    if (mapHtml && expectedMarkers > 0) {
      const markerCards = (mapHtml.match(/country-status-list__item/g) ?? []).length;
      if (markerCards > 0 && markerCards < expectedMarkers) {
        errors.push(`map page lists ${markerCards} jurisdictions, expected ${expectedMarkers}`);
      }
    }
  } else {
    console.log("  (dist/ not present — skipping built HTML checks; run after npm run build)");
  }

  console.log("Public route consistency (T080A)");
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
