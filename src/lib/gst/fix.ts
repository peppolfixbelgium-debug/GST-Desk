import { gstinState, normalizeGstin } from "./gstin.ts";
import { lookupHsn } from "./hsn.ts";
import { pinMatchesState, pinState, PIN_FOR_STATE } from "./pin.ts";
import { money, type GstInvoice } from "./types.ts";
import { validateGst } from "./validate.ts";

function clone<T>(v: T): T {
  return structuredClone(v);
}

export function autoFix(input: GstInvoice): { invoice: GstInvoice; applied: string[] } {
  const inv = clone(input);
  const applied: string[] = [];

  if (inv.DocDtls?.Dt && /^\d{4}-\d{2}-\d{2}$/.test(inv.DocDtls.Dt)) {
    const [y, m, d] = inv.DocDtls.Dt.split("-");
    inv.DocDtls.Dt = `${d}/${m}/${y}`;
    applied.push("Normalised document date to DD/MM/YYYY");
  }

  if (inv.SellerDtls?.Gstin) {
    inv.SellerDtls.Gstin = normalizeGstin(inv.SellerDtls.Gstin);
    const st = gstinState(inv.SellerDtls.Gstin);
    if (st && inv.SellerDtls.Stcd !== st) {
      inv.SellerDtls.Stcd = st;
      applied.push(`Seller Stcd set to ${st} from GSTIN`);
    }
  }
  if (inv.BuyerDtls?.Gstin) {
    inv.BuyerDtls.Gstin = normalizeGstin(inv.BuyerDtls.Gstin);
    const st = gstinState(inv.BuyerDtls.Gstin);
    if (st && inv.BuyerDtls.Stcd !== st) {
      inv.BuyerDtls.Stcd = st;
      applied.push(`Buyer Stcd set to ${st} from GSTIN`);
    }
    if (!inv.BuyerDtls.Pos) inv.BuyerDtls.Pos = inv.BuyerDtls.Stcd;
  }

  const sellerPinState = pinState(inv.SellerDtls?.Pin);
  if (inv.SellerDtls && !pinMatchesState(inv.SellerDtls.Pin, inv.SellerDtls.Stcd)) {
    const next = PIN_FOR_STATE[inv.SellerDtls.Stcd];
    if (next) {
      inv.SellerDtls.Pin = next;
      applied.push(
        `Seller PIN ${sellerPinState ? "was in another state" : "invalid"} — set to ${next} for state ${inv.SellerDtls.Stcd}. Confirm the real address PIN.`,
      );
    }
  }
  if (inv.BuyerDtls && inv.BuyerDtls.Stcd && !pinMatchesState(inv.BuyerDtls.Pin, inv.BuyerDtls.Stcd)) {
    const next = PIN_FOR_STATE[inv.BuyerDtls.Stcd];
    if (next) {
      inv.BuyerDtls.Pin = next;
      applied.push(`Buyer PIN set to ${next} for state ${inv.BuyerDtls.Stcd}. Confirm the real address PIN.`);
    }
  }

  const pos = inv.BuyerDtls?.Pos || inv.BuyerDtls?.Stcd;
  const intra = gstinState(inv.SellerDtls?.Gstin ?? "") === pos;

  for (const it of inv.ItemList ?? []) {
    const row = lookupHsn(it.HsnCd);
    if (row) {
      if (it.GstRt !== row.rate) {
        it.GstRt = row.rate;
        applied.push(`HSN ${it.HsnCd}: GST rate set to ${row.rate}%`);
      }
      const servc = row.service ? "Y" : "N";
      if (it.IsServc !== servc) {
        it.IsServc = servc;
        applied.push(`HSN ${it.HsnCd}: IsServc set to ${servc}`);
      }
    }
    it.TotAmt = money(it.Qty * it.UnitPrice);
    it.AssAmt = money(it.TotAmt - (it.Discount || 0));
    const tax = money(it.AssAmt * (it.GstRt / 100));
    if (intra) {
      it.CgstAmt = money(tax / 2);
      it.SgstAmt = money(tax / 2);
      it.IgstAmt = 0;
    } else {
      it.IgstAmt = tax;
      it.CgstAmt = 0;
      it.SgstAmt = 0;
    }
    it.TotItemVal = money(it.AssAmt + it.IgstAmt + it.CgstAmt + it.SgstAmt + (it.CesAmt || 0) + (it.OthChrg || 0));
  }

  const items = inv.ItemList ?? [];
  inv.ValDtls.AssVal = money(items.reduce((s, it) => s + it.AssAmt, 0));
  inv.ValDtls.CgstVal = money(items.reduce((s, it) => s + it.CgstAmt, 0));
  inv.ValDtls.SgstVal = money(items.reduce((s, it) => s + it.SgstAmt, 0));
  inv.ValDtls.IgstVal = money(items.reduce((s, it) => s + it.IgstAmt, 0));
  inv.ValDtls.CesVal = money(items.reduce((s, it) => s + (it.CesAmt || 0), 0));
  const beforeRound = money(
    inv.ValDtls.AssVal +
      inv.ValDtls.CgstVal +
      inv.ValDtls.SgstVal +
      inv.ValDtls.IgstVal +
      inv.ValDtls.CesVal +
      inv.ValDtls.StCesVal +
      inv.ValDtls.OthChrg -
      inv.ValDtls.Discount,
  );
  const target = inv.ValDtls.TotInvVal;
  const diff = money(target - beforeRound);
  if (Math.abs(diff) <= 99.99 && Math.abs(diff) > 0.001) {
    inv.ValDtls.RndOffAmt = diff;
    applied.push(`Round-off set to ${diff.toFixed(2)} so TotInvVal reconciles`);
  } else {
    inv.ValDtls.RndOffAmt = 0;
    inv.ValDtls.TotInvVal = beforeRound;
    applied.push(`TotInvVal recalculated to ${beforeRound.toFixed(2)}`);
  }

  if (intra) applied.push("Intra-state: IGST cleared, CGST/SGST split");
  else applied.push("Inter-state: CGST/SGST cleared, IGST applied");

  validateGst(inv);
  return { invoice: inv, applied };
}
