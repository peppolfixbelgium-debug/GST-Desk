import { NIC } from "./errors.ts";
import { gstinOk, gstinState, normalizeGstin } from "./gstin.ts";
import { hsnFormatOk, lookupHsn, UQC } from "./hsn.ts";
import { checkPinState, pinOk } from "./pin.ts";
import { STATES } from "./states.ts";
import { money, type GstInvoice, type NicIssue } from "./types.ts";

function issue(code: string, path: string, extra: Partial<NicIssue> = {}): NicIssue {
  const cat = NIC[code];
  return { code, path, nic: cat?.nic ?? "Validation error", hint: cat?.hint ?? extra.hint ?? "", severity: extra.severity ?? "error", fix: extra.fix };
}
function parseDate(dt: string): Date | null {
  const m = dt.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function validateGst(inv: GstInvoice): NicIssue[] {
  const out: NicIssue[] = [];
  if (inv.Version !== "1.1") out.push({ code: "2000", path: "Version", nic: "Schema version invalid", hint: "IRP currently expects Version 1.1.", severity: "error" });
  if (inv.TranDtls?.TaxSch !== "GST") out.push({ code: "2001", path: "TranDtls.TaxSch", nic: "Tax scheme invalid", hint: "TaxSch must be GST.", severity: "error" });

  const dt = parseDate(inv.DocDtls?.Dt ?? "");
  if (!dt) out.push({ code: "2000", path: "DocDtls.Dt", nic: "Invalid document date", hint: "Date must be DD/MM/YYYY.", severity: "error", fix: "date" });
  else {
    const today = new Date(); today.setHours(23, 59, 59, 999);
    if (dt > today) out.push(issue("2163", "DocDtls.Dt"));
  }
  if (!inv.DocDtls?.No?.trim()) out.push({ code: "2002", path: "DocDtls.No", nic: "Document number missing", hint: "Invoice number is mandatory.", severity: "error" });
  else if (!/^[A-Za-z0-9\/-]+$/.test(inv.DocDtls.No.trim())) out.push({ code: "2002", path: "DocDtls.No", nic: "Document number contains unsupported characters", hint: "Use the permitted invoice-number characters for the current e-invoice schema; uniqueness is checked separately by the taxpayer/system.", severity: "error" });

  const seller = inv.SellerDtls, buyer = inv.BuyerDtls;
  if (!gstinOk(seller?.Gstin ?? "")) out.push({ code: "2190", path: "SellerDtls.Gstin", nic: "Invalid GSTIN", hint: "Seller GSTIN failed the 15-character checksum.", severity: "error" });
  else if (gstinState(seller.Gstin) !== seller.Stcd) out.push({ code: "3039", path: "SellerDtls.Stcd", nic: "State code does not match GSTIN", hint: `Stcd should be ${gstinState(seller.Gstin)} (from GSTIN), not ${seller.Stcd}.`, severity: "error", fix: "stcd-gstin" });
  if (!gstinOk(buyer?.Gstin ?? "")) out.push({ code: "2275", path: "BuyerDtls.Gstin", nic: "Invalid buyer GSTIN", hint: "Buyer GSTIN failed checksum. For exports use URP only when allowed.", severity: "error" });

  for (const [party, data] of [["Seller", seller], ["Buyer", buyer]] as const) {
    if (!pinOk(data?.Pin)) out.push(issue("3038", `${party}Dtls.Pin`));
    else if (data.Stcd) {
      const status = checkPinState(data.Pin, data.Stcd);
      if (status === "mismatch") out.push({ ...issue("3039", `${party}Dtls.Pin`), fix: undefined });
      else if (status === "unknown") out.push({ code: "PIN-UNVERIFIED", path: `${party}Dtls.Pin`, nic: "PIN/state relationship not locally verified", hint: "Local PIN mapping is incomplete. Confirm the address PIN or validate against the current IRP/NIC master.", severity: "warning" });
    }
  }

  const pos = buyer?.Pos || buyer?.Stcd;
  if (!pos || !STATES[pos]) out.push(issue("2243", "BuyerDtls.Pos"));
  const intra = gstinState(seller?.Gstin ?? "") === pos;
  const items = inv.ItemList ?? [];
  if (!items.length) out.push({ code: "2003", path: "ItemList", nic: "No line items", hint: "At least one ItemList row is required.", severity: "error" });

  let ass = 0, cgst = 0, sgst = 0, igst = 0, ces = 0;
  items.forEach((it, i) => {
    const path = `ItemList[${i}]`;
    if (!hsnFormatOk(it.HsnCd ?? "")) out.push({ ...issue("2176", `${path}.HsnCd`) });
    else {
      const row = lookupHsn(it.HsnCd);
      if (row) {
        if (row.service && it.IsServc !== "Y") out.push({ ...issue("3048", `${path}.IsServc`), fix: undefined });
        if (!row.service && it.IsServc === "Y") out.push({ ...issue("3047", `${path}.IsServc`), fix: undefined });
        if (row.rate !== it.GstRt) out.push({ code: "2176", path: `${path}.GstRt`, nic: "HSN code/rate differs from local fixture", hint: `Local fixture rate for ${row.code} is ${row.rate}%. Confirm the current authoritative rate before changing the payload.`, severity: "warning", fix: undefined });
      } else out.push({ code: "HSN-UNVERIFIED", path: `${path}.HsnCd`, nic: "HSN/SAC not locally verified", hint: "Code has valid shape but is absent from the local non-authoritative fixture. Confirm against the current IRP/NIC master.", severity: "warning" });
    }
    if (!UQC.includes(it.Unit as (typeof UQC)[number])) out.push(issue("2177", `${path}.Unit`));
    const expectedTax = money(it.AssAmt * (it.GstRt / 100));
    if (intra) {
      const half = money(expectedTax / 2);
      if (it.IgstAmt > 0) out.push({ ...issue("2172", `${path}.IgstAmt`), fix: "intra-tax" });
      if (Math.abs(it.CgstAmt - half) > 0.05 || Math.abs(it.SgstAmt - half) > 0.05) out.push({ ...issue("2234", `${path}.CgstAmt`), fix: "intra-tax" });
    } else {
      if (it.CgstAmt > 0 || it.SgstAmt > 0) out.push({ ...issue("2174", `${path}.CgstAmt`), fix: "inter-tax" });
      if (Math.abs(it.IgstAmt - expectedTax) > 0.05) out.push({ ...issue("2234", `${path}.IgstAmt`), fix: "inter-tax" });
    }
    const lineTot = money(it.AssAmt + it.IgstAmt + it.CgstAmt + it.SgstAmt + it.CesAmt + (it.OthChrg || 0));
    if (Math.abs(lineTot - it.TotItemVal) > 0.05) out.push({ code: "2234", path: `${path}.TotItemVal`, nic: "Item total mismatch", hint: `TotItemVal should be ${lineTot.toFixed(2)}.`, severity: "error", fix: "totals" });
    ass += it.AssAmt; cgst += it.CgstAmt; sgst += it.SgstAmt; igst += it.IgstAmt; ces += it.CesAmt || 0;
  });

  const v = inv.ValDtls;
  if (v) {
    if (Math.abs(money(ass) - v.AssVal) > 0.05) out.push({ ...issue("2182", "ValDtls.AssVal"), fix: "totals" });
    if (Math.abs(money(cgst) - v.CgstVal) > 0.05) out.push({ ...issue("2184", "ValDtls.CgstVal"), fix: "totals" });
    if (Math.abs(money(sgst) - v.SgstVal) > 0.05) out.push({ ...issue("2183", "ValDtls.SgstVal"), fix: "totals" });
    if (Math.abs(money(igst) - v.IgstVal) > 0.05) out.push({ ...issue("2185", "ValDtls.IgstVal"), fix: "totals" });
    const calc = money(v.AssVal + v.CgstVal + v.SgstVal + v.IgstVal + v.CesVal + v.StCesVal + v.OthChrg - v.Discount + v.RndOffAmt);
    if (Math.abs(calc - v.TotInvVal) > 0.05) out.push({ ...issue("2189", "ValDtls.TotInvVal"), fix: "round-off" });
    if (Math.abs(v.RndOffAmt) > 99.99) out.push({ code: "2189", path: "ValDtls.RndOffAmt", nic: "Round off out of range", hint: "RndOffAmt must be between -99.99 and 99.99.", severity: "error", fix: "round-off" });
  }
  const value = v?.TotInvVal ?? 0;
  if (value >= 50000) out.push({ code: "EWB", path: "EwbDtls", nic: "E-way bill threshold reached", hint: "Invoice value is ₹50,000 or more; e-way bill applicability depends on the transaction and current e-way bill rules. Do not treat this warning as proof that an e-way bill is required.", severity: "warning" });
  return out;
}

export function parseInvoice(text: string): { invoice?: GstInvoice; error?: string } {
  try { const json = JSON.parse(text) as GstInvoice; if (!json || typeof json !== "object") return { error: "JSON must be an object." }; return { invoice: json }; }
  catch (e) { return { error: e instanceof Error ? e.message : "Invalid JSON" }; }
}
