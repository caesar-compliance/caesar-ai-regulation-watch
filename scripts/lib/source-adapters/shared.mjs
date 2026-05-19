import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import yaml from "js-yaml";

export function sha256Hex(bufferOrString) {
  const buf =
    typeof bufferOrString === "string"
      ? Buffer.from(bufferOrString, "utf8")
      : bufferOrString;
  return `sha256:${crypto.createHash("sha256").update(buf).digest("hex")}`;
}

export function snapshotIdFor(sourceId, checkedAt, prefix = "snap") {
  const stamp = checkedAt.replace(/[:.]/g, "").replace("T", "t").slice(0, 20);
  return `${prefix}-${sourceId}-${stamp}`;
}

export function writeYaml(filePath, data, header = "") {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    header + yaml.dump(data, { lineWidth: 120, noRefs: true, sortKeys: false }),
    "utf8",
  );
}

export function normalizeEntryId(entry, identityFields) {
  for (const field of identityFields) {
    const v = entry[field];
    if (v) return String(v).trim().slice(0, 500);
  }
  const fallback = `${entry.link ?? ""}|${entry.title ?? ""}`.trim();
  return fallback ? sha256Hex(fallback) : sha256Hex(JSON.stringify(entry));
}

export function entryMetadataHash(entry) {
  const parts = [
    entry.entry_id ?? "",
    entry.title ?? "",
    entry.link ?? "",
    entry.published_at ?? "",
    entry.updated_at ?? "",
  ];
  return sha256Hex(parts.join("|"));
}
