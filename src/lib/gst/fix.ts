import { gstinState, normalizeGstin } from "./gstin.ts";
import { lookupHsn } from "./hsn.ts";
import { money, type GstInvoice } from "./types.ts";

function clone<T>(v: T): T {
  return structuredClone(v);
}

/**
 * Conservative, deterministic formatting/arithmetic fixes only.
 * Business-master values such as PIN, HSN classification and tax rate are
 * never invented or overwritten from the incomplete local fixture.
 */
export function autoFix(input: GstInvoice): { invoice: GstInvoice; applied: string[] } {
  const inv = clone(input);
  const applied: string[] = [];

  if (inv.DocDtls?.Dt && /^\d{4}-\d{2}-\d{2}$/.test(inv.DocDtls.Dt)) {
    const [y, m, d] = inv.DocDtls.Dt.split("-");
    inv.DocDtls.Dt = `${d}/${m}/${y}`;
    applied.push("Normalised document date to DD/MM/YYYY");
  }

  if (inv.SellerDtls?.Gstin) {
    const normalized = normalizeGstin(inv.SellerDtls.Gstin);
    if (normalized !== inv.SellerDtls.Gstin) {
      inv.SellerDtls.Gstin = normalized;
      applied.push("Normalised seller GSTIN formatting");
    }
  }
  if (inv.BuyerDtls?.Gstin) {
    const normalized = normalizeGstin(inv.BuyerDtls.Gstin);
    if (normalized !== inv.BuyerDtls.Gstin) {
      inv.BuyerDtls.Gstin = normalized;
      applied.push("Normalised buyer GSTIN formatting");
    }
  }

  // GSTIN-derived state is deterministic and safe to normalise.
  if (inv.SellerDtls?.Gstin) {
    const st = gstinState(inv.SellerDtls.Gstin);
    if (st && inv.SellerDtls.Stcd !== st) {
      inv.SellerDtls.Stcd = st;
      applied.push(`Seller Stcd set to ${st} from GSTIN`);
    }
  }
  if (inv.BuyerDtls?.Gstin) {
    const st = gstinState(inv.BuyerDtls.Gstin);
    if (st && inv.BuyerDtls.Stcd !== st) {
      inv.BuyerDtls.Stcd = st;
      applied.push(`Buyer Stcd set to ${st} from buyer GSTIN state`);
    }
    if (!inv.BuyerDtls.Pos && st) {
      inv.BuyerDtls.Pos = st;
      applied.push(`Buyer Pos set to ${st} from buyer GSTIN state`);
    }
  }

  // Never replace an address PIN: a representative PIN can corrupt customer data.
  // Never alter HSN rate/service: the local fixture is incomplete/non-authoritative.
  const pos = inv.BuyerDtls?.Pos || inv.BuyerDtls?.Stcd;
  const intraState = gstinState(inv.SellerDtls?.Gstin ?? "") === pos;
  for (const it of inv.ItemList ?? []) {
    // Exact lookup is intentionally informational only; no business data is changed.
    void lookupHsn(it.HsnCd);
    it.TotAmt = money(it.Qty * it.UnitPrice);
    it.AssAmt = money(it.TotAmt - (it.Discount || 0));

    const tax = money(it.AssAmt * (it.GstRt / 100));
    if (intraState) {
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
  } else if (Math.abs(diff) > 0.001) {
    inv.ValDtls.RndOffAmt = 0;
    inv.ValDtls.TotInvVal = beforeRound;
    applied.push(`TotInvVal recalculated to ${beforeRound.toFixed(2)}`);
  }

  if (intraState) applied.push("Intra-state: IGST cleared, CGST/SGST split");
  else applied.push("Inter-state: CGST/SGST cleared, IGST applied");

  return { invoice: inv, applied };
}
