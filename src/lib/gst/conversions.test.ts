import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("./conversions.ts", import.meta.url), "utf8");

test("conversion writes use the database atomic quota primitive", () => {
  assert.match(source, /public\.consume_conversion/);
  assert.doesNotMatch(source, /const countRows = await sql<\{ n: number \}>`\s*select count\(\*\)/);
});

test("conversion reads remain explicitly scoped to the authenticated user", () => {
  const userScopedQueries = (source.match(/where user_id = \$\{context\.userId\}/g) ?? []).length;
  assert.ok(userScopedQueries >= 2, `expected quota/history queries to scope by context.userId; found ${userScopedQueries}`);
});
