#!/usr/bin/env node
/**
 * Postgres client via pg (devDependency). Never logs connection strings.
 */
export async function withPgClient(dbUrl, fn) {
  let pgMod;
  try {
    pgMod = await import("pg");
  } catch {
    throw new Error(
      "pg package not installed. Run npm ci, or use psql for schema apply.",
    );
  }
  const pg = pgMod.default ?? pgMod;
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes("supabase.co") ? { rejectUnauthorized: false } : undefined,
  });
  try {
    await client.connect();
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}
