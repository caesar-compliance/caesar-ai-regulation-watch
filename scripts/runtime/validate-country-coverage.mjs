#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const EXPORT = path.join(ROOT, "public/data/regulation-country-coverage.json");
const SCHEMA = path.join(ROOT, "schemas/regulation-country-coverage.schema.json");

function main() {
  if (!fs.existsSync(EXPORT)) {
    console.error("validate-country-coverage: missing export");
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(EXPORT, "utf8"));
  const schema = JSON.parse(fs.readFileSync(SCHEMA, "utf8"));
  delete schema.$schema;
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  if (!ajv.compile(schema)(data)) {
    console.error("validate-country-coverage: schema failed");
    process.exit(1);
  }
  console.log(
    `PASS: validate-country-coverage (${data.jurisdictions?.length ?? 0} jurisdictions)`,
  );
}

main();
