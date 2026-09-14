import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("./conversions.ts", import.meta.url), "utf8");
const saveHandler = source.slice(source.indexOf("export const saveConversion"));

test("conversion writes use the database atomic quota primitive", () => {
  const consumeIndex = saveHandler.indexOf("public.consume_conversion");
  assert.ok(consumeIndex >= 0, "saveConversion must consume quota through the database primitive");
  const beforeConsume = saveHandler.slice(0, consumeIndex);
  assert.doesNotMatch(beforeConsume, /select count\(\*\)/i, "quota must not be checked with a separate count before the atomic write");
});

test("conversion reads remain explicitly scoped to the authenticated user", () => {
  const userScopedQueries = (source.match(/where user_id = \$\{context\.userId\}/g) ?? []).length;
  assert.ok(userScopedQueries >= 2, `expected quota/history queries to scope by context.userId; found ${userScopedQueries}`);
});
