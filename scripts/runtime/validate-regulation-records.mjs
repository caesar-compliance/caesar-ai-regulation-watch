#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const EXPORT = path.join(ROOT, "public/data/regulation-records.json");
const SCHEMA = path.join(ROOT, "schemas/regulation-records.schema.json");

function main() {
  if (!fs.existsSync(EXPORT)) {
    console.error("validate-regulation-records: missing export");
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(EXPORT, "utf8"));
  const schema = JSON.parse(fs.readFileSync(SCHEMA, "utf8"));
  delete schema.$schema;
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  if (!ajv.compile(schema)(data)) {
    console.error("validate-regulation-records: schema failed");
    process.exit(1);
  }
  const ids = new Set();
  for (const r of data.records ?? []) {
    if (ids.has(r.regulation_id)) {
      console.error(`duplicate regulation_id: ${r.regulation_id}`);
      process.exit(1);
    }
    ids.add(r.regulation_id);
    if (r.gates?.legal_change_claimed === true) {
      console.error(`legal_change_claimed true: ${r.regulation_id}`);
      process.exit(1);
    }
  }
  console.log(
    `PASS: validate-regulation-records (${data.record_count ?? data.records?.length ?? 0} records)`,
  );
}

main();
