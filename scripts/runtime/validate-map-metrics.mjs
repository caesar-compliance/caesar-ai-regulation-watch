#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const EXPORT = path.join(ROOT, "public/data/regulation-map-metrics.json");
const SCHEMA = path.join(ROOT, "schemas/regulation-map-metrics.schema.json");

function main() {
  if (!fs.existsSync(EXPORT)) {
    console.error("validate-map-metrics: missing export");
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(EXPORT, "utf8"));
  const schema = JSON.parse(fs.readFileSync(SCHEMA, "utf8"));
  delete schema.$schema;
  const ajv = new Ajv({ allErrors: true, strict: false });
  if (!ajv.compile(schema)(data)) {
    console.error("validate-map-metrics: schema failed");
    process.exit(1);
  }
  if (data.map_version !== "T080") {
    console.error(`validate-map-metrics: expected map_version T080, got ${data.map_version}`);
    process.exit(1);
  }
  console.log(`PASS: validate-map-metrics (${data.markers?.length ?? 0} markers)`);
}

main();
