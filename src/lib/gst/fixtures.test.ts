import assert from "node:assert/strict";
import { test } from "node:test";
import { makeGstin } from "./gstin.ts";
import { validateGst } from "./validate.ts";
import type { GstInvoice } from "./types.ts";

const seller = makeGstin("29", "AABCU9603R", "1");
const buyer = makeGstin("27", "AAACR5055K", "1");

function baseInvoice(overrides: Partial<GstInvoice> = {}): GstInvoice {
  return {
    Version: "1.1",
    TranDtls: { TaxSch: "GST", SupTyp: "B2B", RegRev: "N", IgstOnIntra: "N" },
    DocDtls: { Typ: "INV", No: "INV/26-27/0001", Dt: "13/09/2026" },
    SellerDtls: { Gstin: seller, LglNm: "Seller Pvt Ltd", Addr1: "1 Industrial Area", Loc: "Bengaluru", Pin: 560001, Stcd: "29" },
    BuyerDtls: { Gstin: buyer, LglNm: "Buyer LLP", Addr1: "1 Business Road", Loc: "Mumbai", Pin: 400001, Stcd: "27", Pos: "27" },
    ItemList: [{ SlNo: "1", PrdDesc: "IT design and development", IsServc: "Y", HsnCd: "998314", Qty: 1, Unit: "NOS", UnitPrice: 1000, TotAmt: 1000, Discount: 0, AssAmt: 1000, GstRt: 18, IgstAmt: 180, CgstAmt: 0, SgstAmt: 0, CesRt: 0, CesAmt: 0, OthChrg: 0, TotItemVal: 1180 }],
    ValDtls: { AssVal: 1000, CgstVal: 0, SgstVal: 0, IgstVal: 180, CesVal: 0, StCesVal: 0, Discount: 0, OthChrg: 0, RndOffAmt: 0, TotInvVal: 1180 },
    ...overrides,
  };
}

test("positive: inter-state invoice reconciles", () => {
  const errors = validateGst(baseInvoice()).filter((x) => x.severity === "error");
  assert.equal(errors.length, 0, errors.map((x) => `${x.code}:${x.path}`).join(","));
});

test("negative: GSTIN/state mismatch is blocking", () => {
  const inv = baseInvoice({ SellerDtls: { ...baseInvoice().SellerDtls, Stcd: "27" } });
  assert.ok(validateGst(inv).some((x) => x.code === "3039" && x.path === "SellerDtls.Stcd"));
});

test("negative: inter-state invoice carrying CGST/SGST is blocking", () => {
  const inv = baseInvoice({ ItemList: [{ ...baseInvoice().ItemList[0], IgstAmt: 0, CgstAmt: 90, SgstAmt: 90, TotItemVal: 1180 }] });
  assert.ok(validateGst(inv).some((x) => x.code === "2174"));
});

test("negative: invalid HSN shape is blocking", () => {
  const inv = baseInvoice({ ItemList: [{ ...baseInvoice().ItemList[0], HsnCd: "12A4" }] });
  assert.ok(validateGst(inv).some((x) => x.path.endsWith(".HsnCd") && x.severity === "error"));
});

test("regression evidence: locally unknown valid-format HSN is currently blocking", () => {
  const inv = baseInvoice({ ItemList: [{ ...baseInvoice().ItemList[0], HsnCd: "999999" }] });
  const issues = validateGst(inv);
  assert.ok(issues.some((x) => x.path.endsWith(".HsnCd") && x.severity === "error"));
});

test("negative: future invoice date is blocking", () => {
  const inv = baseInvoice({ DocDtls: { ...baseInvoice().DocDtls, Dt: "14/09/2099" } });
  assert.ok(validateGst(inv).some((x) => x.path === "DocDtls.Dt" && x.severity === "error"));
});

test("negative: total mismatch is blocking", () => {
  const inv = baseInvoice({ ValDtls: { ...baseInvoice().ValDtls, TotInvVal: 999 } });
  assert.ok(validateGst(inv).some((x) => x.path === "ValDtls.TotInvVal"));
});
