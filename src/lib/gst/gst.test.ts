import assert from "node:assert/strict";
import test from "node:test";
import { autoFix } from "./fix.ts";
import { gstinState } from "./gstin.ts";
import { BROKEN_SAMPLE } from "./sample.ts";
import { validateGst } from "./validate.ts";

test("auto-fix clears arithmetic/format blockers without changing protected business data", () => {
  const input = structuredClone(BROKEN_SAMPLE);
  const { invoice, applied } = autoFix(input);
  assert.ok(applied.length > 0);
  const blockers = validateGst(invoice).filter((i) => i.severity === "error");
  const protectedCodes = new Set(["3039", "3047", "3048"]);
  assert.ok(blockers.length > 0, "protected business-master mismatches must remain visible");
  assert.ok(blockers.every((b) => protectedCodes.has(b.code)), blockers.map((b) => `${b.code} ${b.path}`).join("; "));
  assert.equal(invoice.SellerDtls.Pin, BROKEN_SAMPLE.SellerDtls.Pin, "auto-fix must not replace address PIN");
  assert.equal(invoice.ItemList[0]?.IsServc, BROKEN_SAMPLE.ItemList[0]?.IsServc, "auto-fix must not rewrite service classification");
  assert.equal(invoice.ItemList[1]?.IsServc, BROKEN_SAMPLE.ItemList[1]?.IsServc, "auto-fix must not rewrite service classification");
});

test("auto-fix never infers place of supply from buyer GSTIN", () => {
  const input = structuredClone(BROKEN_SAMPLE);
  delete input.BuyerDtls.Pos;
  const { invoice, applied } = autoFix(input);

  assert.equal(gstinState(input.BuyerDtls.Gstin), input.BuyerDtls.Stcd);
  assert.equal(invoice.BuyerDtls.Pos, undefined, "missing POS is a business/legal fact and must remain unresolved");
  assert.ok(!applied.some((entry) => entry.includes("Buyer Pos set")), "auto-fix must not claim a POS correction");

  const issues = validateGst(invoice);
  const posIssue = issues.find((issue) => issue.path === "BuyerDtls.Pos");
  assert.ok(posIssue === undefined || posIssue.code === "2243", "POS must remain unresolved or explicitly flagged; it must never be fabricated");
});
