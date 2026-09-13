import { makeGstin } from "./gstin.ts";
import type { GstInvoice } from "./types.ts";

const sellerGstin = makeGstin("29", "AABCU9603R", "1");
const buyerGstin = makeGstin("27", "AAACR5055K", "1");

/** Intentionally broken: wrong rate, PIN/state, IGST on mixed POS, round-off. */
export const BROKEN_SAMPLE: GstInvoice = {
  Version: "1.1",
  TranDtls: { TaxSch: "GST", SupTyp: "B2B", RegRev: "N", IgstOnIntra: "N" },
  DocDtls: { Typ: "INV", No: "INV/26-27/0412", Dt: "2026-04-12" },
  SellerDtls: {
    Gstin: sellerGstin,
    LglNm: "Malnad Components Pvt Ltd",
    Addr1: "12 Peenya Industrial Area",
    Loc: "Bengaluru",
    Pin: 400001,
    Stcd: "27",
  },
  BuyerDtls: {
    Gstin: buyerGstin,
    LglNm: "Thane Traders LLP",
    Addr1: "5 Gokhale Road",
    Loc: "Thane",
    Pin: 400601,
    Stcd: "27",
    Pos: "27",
  },
  ItemList: [
    {
      SlNo: "1",
      PrdDesc: "IT design and development",
      IsServc: "N",
      HsnCd: "998314",
      Qty: 1,
      Unit: "NOS",
      UnitPrice: 50000,
      TotAmt: 50000,
      Discount: 0,
      AssAmt: 50000,
      GstRt: 12,
      IgstAmt: 0,
      CgstAmt: 3000,
      SgstAmt: 3000,
      CesRt: 0,
      CesAmt: 0,
      OthChrg: 0,
      TotItemVal: 56000,
    },
    {
      SlNo: "2",
      PrdDesc: "Cat-6 indoor cable",
      IsServc: "Y",
      HsnCd: "8544",
      Qty: 10,
      Unit: "MTR",
      UnitPrice: 80,
      TotAmt: 800,
      Discount: 0,
      AssAmt: 800,
      GstRt: 5,
      IgstAmt: 40,
      CgstAmt: 0,
      SgstAmt: 0,
      CesRt: 0,
      CesAmt: 0,
      OthChrg: 0,
      TotItemVal: 840,
    },
  ],
  ValDtls: {
    AssVal: 50800,
    CgstVal: 3000,
    SgstVal: 3000,
    IgstVal: 0,
    CesVal: 0,
    StCesVal: 0,
    Discount: 0,
    OthChrg: 0,
    RndOffAmt: 0,
    TotInvVal: 59999,
  },
};

export const CLEAN_HINT = "Broken Tally dump: wrong HSN rates, PIN vs GSTIN state, intra/inter tax mix, round-off.";
