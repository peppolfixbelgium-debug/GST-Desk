import assert from "node:assert/strict";
import { test } from "node:test";
import { autoFix } from "./fix.ts";
import { gstinCheckDigit, gstinOk, makeGstin } from "./gstin.ts";
import { BROKEN_SAMPLE } from "./sample.ts";
import { validateGst } from "./validate.ts";

test("GSTIN checksum round-trip", () => {
  const g = makeGstin("29", "AABCU9603R", "1");
  assert.equal(g.length, 15);
  assert.equal(g.slice(0, 2), "29");
  assert.equal(gstinCheckDigit(g.slice(0, 14)), g[14]);
  assert.equal(gstinOk(g), true);
  assert.equal(gstinOk(g.slice(0, 14) + "0"), false);
});

test("broken sample surfaces NIC-style codes", () => {
  const issues = validateGst(BROKEN_SAMPLE);
  const codes = new Set(issues.map((i) => i.code));
  assert.ok(codes.has("2176") || codes.has("2172") || codes.has("2174") || codes.has("2189") || codes.has("3039"));
});

test("auto-fix clears blocking errors on the sample", () => {
  const { invoice, applied } = autoFix(BROKEN_SAMPLE);
  assert.ok(applied.length > 0);
  const blockers = validateGst(invoice).filter((i) => i.severity === "error");
  assert.equal(blockers.length, 0, blockers.map((b) => `${b.code} ${b.path}`).join("; "));
});
