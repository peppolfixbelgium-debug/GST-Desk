import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("./conversions.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../../../migrations/0007_conversion_rate_limit.sql", import.meta.url), "utf8");
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

test("conversion writes validate bounded fields before reaching the database", () => {
  assert.match(source, /MAX_CONVERSION_FIELD_LENGTHS = \{/);
  assert.match(source, /invoiceId: 100/);
  assert.match(source, /supplier: 50/);
  assert.match(source, /customer: 50/);
  assert.match(source, /total: 50/);
  assert.match(source, /currency: 3/);
  assert.match(source, /status: 16/);
  assert.match(source, /validator\(validateConversionInput\)/);
  assert.match(source, /\["ok", "issues"\]\.includes\(status\)/);
});

test("conversion database boundary has an atomic burst-rate limit", () => {
  assert.match(migration, /pg_advisory_xact_lock\(hashtextextended\('conversion:' \|\| p_user_id, 0\)\)/);
  assert.match(migration, /created_at >= v_window_start/);
  assert.match(migration, /if v_recent >= 60 then/);
  assert.match(migration, /Conversion rate limit reached/);
  assert.match(migration, /revoke all on function public\.consume_conversion/);
});
