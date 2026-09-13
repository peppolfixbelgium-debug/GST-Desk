import assert from "node:assert/strict";
import { test } from "node:test";
import { makeGstin } from "./gstin.ts";
import { validateGst } from "./validate.ts";
import { autoFix } from "./fix.ts";
import type { GstInvoice } from "./types.ts";

const seller = makeGstin("29", "AABCU9603R", "1");
const buyer = makeGstin("27", "AAACR5055K", "1");
function baseInvoice(overrides: Partial<GstInvoice> = {}): GstInvoice {
  return {
    Version: "1.1", TranDtls: { TaxSch: "GST", SupTyp: "B2B", RegRev: "N", IgstOnIntra: "N" },
    DocDtls: { Typ: "INV", No: "INV/26-27/0001", Dt: "13/09/2026" },
    SellerDtls: { Gstin: seller, LglNm: "Seller Pvt Ltd", Addr1: "1 Industrial Area", Loc: "Bengaluru", Pin: 560001, Stcd: "29" },
    BuyerDtls: { Gstin: buyer, LglNm: "Buyer LLP", Addr1: "1 Business Road", Loc: "Mumbai", Pin: 400001, Stcd: "27", Pos: "27" },
    ItemList: [{ SlNo: "1", PrdDesc: "IT design and development", IsServc: "Y", HsnCd: "998314", Qty: 1, Unit: "NOS", UnitPrice: 1000, TotAmt: 1000, Discount: 0, AssAmt: 1000, GstRt: 18, IgstAmt: 180, CgstAmt: 0, SgstAmt: 0, CesRt: 0, CesAmt: 0, OthChrg: 0, TotItemVal: 1180 }],
    ValDtls: { AssVal: 1000, CgstVal: 0, SgstVal: 0, IgstVal: 180, CesVal: 0, StCesVal: 0, Discount: 0, OthChrg: 0, RndOffAmt: 0, TotInvVal: 1180 }, ...overrides,
  };
}

test("positive: inter-state invoice reconciles", () => assert.equal(validateGst(baseInvoice()).filter(x => x.severity === "error").length, 0));
test("negative: GSTIN/state mismatch is blocking", () => assert.ok(validateGst(baseInvoice({ SellerDtls: { ...baseInvoice().SellerDtls, Stcd: "27" } })).some(x => x.code === "3039" && x.path === "SellerDtls.Stcd")));
test("negative: inter-state invoice carrying CGST/SGST is blocking", () => assert.ok(validateGst(baseInvoice({ ItemList: [{ ...baseInvoice().ItemList[0], IgstAmt: 0, CgstAmt: 90, SgstAmt: 90, TotItemVal: 1180 }] })).some(x => x.code === "2174")));
test("negative: invalid HSN shape is blocking", () => assert.ok(validateGst(baseInvoice({ ItemList: [{ ...baseInvoice().ItemList[0], HsnCd: "12A4" }] })).some(x => x.path.endsWith(".HsnCd") && x.severity === "error")));
test("positive: valid-format unknown HSN is warning, not false-invalid", () => {
  const issues = validateGst(baseInvoice({ ItemList: [{ ...baseInvoice().ItemList[0], HsnCd: "999999" }] }));
  assert.ok(issues.some(x => x.code === "HSN-UNVERIFIED" && x.severity === "warning"));
  assert.ok(!issues.some(x => x.path.endsWith(".HsnCd") && x.severity === "error"));
});
test("positive: unknown local PIN mapping is warning, not mismatch", () => {
  const issues = validateGst(baseInvoice({ SellerDtls: { ...baseInvoice().SellerDtls, Pin: 860001 } }));
  assert.ok(issues.some(x => x.code === "PIN-UNVERIFIED" && x.severity === "warning"));
  assert.ok(!issues.some(x => x.path === "SellerDtls.Pin" && x.code === "3039"));
});
test("negative: known PIN/state mismatch remains blocking", () => assert.ok(validateGst(baseInvoice({ SellerDtls: { ...baseInvoice().SellerDtls, Pin: 400001 } })).some(x => x.path === "SellerDtls.Pin" && x.code === "3039")));
test("negative: future invoice date is blocking", () => assert.ok(validateGst(baseInvoice({ DocDtls: { ...baseInvoice().DocDtls, Dt: "14/09/2099" } })).some(x => x.path === "DocDtls.Dt" && x.severity === "error")));
test("negative: total mismatch is blocking", () => assert.ok(validateGst(baseInvoice({ ValDtls: { ...baseInvoice().ValDtls, TotInvVal: 999 } })).some(x => x.path === "ValDtls.TotInvVal")));
test("safety: auto-fix never overwrites PIN or HSN/rate from local fixture", () => {
  const input = baseInvoice({ SellerDtls: { ...baseInvoice().SellerDtls, Pin: 400001 }, ItemList: [{ ...baseInvoice().ItemList[0], HsnCd: "999999", GstRt: 40 }] });
  const result = autoFix(input);
  assert.equal(result.invoice.SellerDtls.Pin, 400001);
  assert.equal(result.invoice.ItemList[0].HsnCd, "999999");
  assert.equal(result.invoice.ItemList[0].GstRt, 40);
});
