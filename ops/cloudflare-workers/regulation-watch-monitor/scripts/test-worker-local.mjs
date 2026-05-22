#!/usr/bin/env node
/** Local worker validation — TypeScript compile check (routes tested post-deploy). */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const r = spawnSync("npm", ["run", "typecheck"], {
  cwd: ROOT,
  encoding: "utf8",
  stdio: "inherit",
});
process.exit(r.status ?? 1);
