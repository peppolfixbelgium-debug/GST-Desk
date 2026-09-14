import assert from "node:assert/strict";
import test from "node:test";
import {
  assertJsonTextWithinLimit,
  MAX_BULK_FILES,
  MAX_BULK_JSON_BYTES,
  MAX_BULK_TOTAL_BYTES,
  MAX_SINGLE_JSON_BYTES,
  validateBulkFiles,
} from "./resource-limits.ts";

test("accepts JSON at the single-file limit", () => {
  const value = "x".repeat(MAX_SINGLE_JSON_BYTES);
  assert.doesNotThrow(() => assertJsonTextWithinLimit(value));
});

test("rejects JSON over the single-file limit", () => {
  const value = "x".repeat(MAX_SINGLE_JSON_BYTES + 1);
  assert.throws(() => assertJsonTextWithinLimit(value), /2 MiB/);
});

test("rejects too many bulk files", () => {
  const files = Array.from({ length: MAX_BULK_FILES + 1 }, () => ({ size: 1 }));
  assert.match(validateBulkFiles(files) ?? "", /20 JSON files/);
});

test("rejects an oversized bulk member", () => {
  assert.match(validateBulkFiles([{ size: MAX_BULK_JSON_BYTES + 1 }]) ?? "", /2 MiB or smaller/);
});

test("rejects oversized aggregate bulk input", () => {
  assert.match(
    validateBulkFiles([
      { size: MAX_BULK_TOTAL_BYTES / 2 + 1 },
      { size: MAX_BULK_TOTAL_BYTES / 2 + 1 },
    ]) ?? "",
    /20 MiB total/,
  );
});
