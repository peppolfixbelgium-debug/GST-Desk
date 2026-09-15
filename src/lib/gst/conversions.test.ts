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
  const quotaUserScope = /from conversions where user_id = \$\{userId\}/.test(source);
  const historyUserScope = /from conversions where user_id = \$\{context\.userId\}/.test(source);
  assert.ok(quotaUserScope, "quota query must scope by the authenticated user id");
  assert.ok(historyUserScope, "history query must scope by the authenticated user id");
  assert.match(source, /getQuota = createServerFn[\s\S]*?context\.userId/, "getQuota must derive its user id from authenticated middleware context");
  assert.match(source, /listConversions = createServerFn[\s\S]*?context\.userId/, "listConversions must derive its user id from authenticated middleware context");
});
