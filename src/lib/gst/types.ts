export const FREE_MONTHLY_LIMIT = 5;

export type NicIssue = {
  code: string;
  path: string;
  nic: string;
  hint: string;
  severity: "error" | "warning";
  fix?: "hsn-rate" | "pin-state" | "stcd-gstin" | "round-off" | "intra-tax" | "inter-tax" | "totals" | "isservc" | "date";
};

export type GstItem = {
  SlNo: string;
  PrdDesc: string;
  IsServc: "Y" | "N";
  HsnCd: string;
  Qty: number;
  Unit: string;
  UnitPrice: number;
  TotAmt: number;
  Discount: number;
  AssAmt: number;
  GstRt: number;
  IgstAmt: number;
  CgstAmt: number;
  SgstAmt: number;
  CesRt: number;
  CesAmt: number;
  OthChrg: number;
  TotItemVal: number;
};

export type GstParty = {
  Gstin: string;
  LglNm: string;
  TrdNm?: string;
  Addr1: string;
  Loc: string;
  Pin: number;
  Stcd: string;
  Pos?: string;
  Ph?: string;
  Em?: string;
};

export type GstInvoice = {
  Version: string;
  TranDtls: {
    TaxSch: string;
    SupTyp: string;
    RegRev: string;
    IgstOnIntra: string;
    EcmGstin?: string | null;
  };
  DocDtls: { Typ: string; No: string; Dt: string };
  SellerDtls: GstParty;
  BuyerDtls: GstParty;
  ItemList: GstItem[];
  ValDtls: {
    AssVal: number;
    CgstVal: number;
    SgstVal: number;
    IgstVal: number;
    CesVal: number;
    StCesVal: number;
    Discount: number;
    OthChrg: number;
    RndOffAmt: number;
    TotInvVal: number;
  };
};

export function money(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
