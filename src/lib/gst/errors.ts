/** NIC / IRP error catalogue — human fix, not the cryptic portal line. */
export const NIC: Record<
  string,
  { nic: string; hint: string }
> = {
  "2150": {
    nic: "Duplicate IRN",
    hint: "This document number already has an IRN. Fetch the existing IRN instead of generating again.",
  },
  "2163": {
    nic: "Future document date",
    hint: "DocDtls.Dt cannot be after today. Use DD/MM/YYYY of the actual invoice.",
  },
  "2172": {
    nic: "IGST used for intra-state supply",
    hint: "Seller state and place of supply are the same. Split GST into CGST + SGST; set IGST to 0.",
  },
  "2174": {
    nic: "CGST/SGST used for inter-state supply",
    hint: "Seller state and POS differ. Charge IGST only; zero CGST and SGST.",
  },
  "2176": {
    nic: "HSN code is invalid",
    hint: "HSN/SAC is missing from the IRP master or has the wrong number of digits (4/6/8).",
  },
  "2177": {
    nic: "Invalid UQC",
    hint: "Unit must be an IRP UQC such as NOS, KGS, MTR, BOX — not a free-text unit.",
  },
  "2182": {
    nic: "Taxable-value total mismatch",
    hint: "Sum of ItemList AssAmt must equal ValDtls.AssVal.",
  },
  "2183": {
    nic: "SGST total mismatch",
    hint: "Sum of line SgstAmt must equal ValDtls.SgstVal.",
  },
  "2184": {
    nic: "CGST total mismatch",
    hint: "Sum of line CgstAmt must equal ValDtls.CgstVal.",
  },
  "2185": {
    nic: "IGST total mismatch",
    hint: "Sum of line IgstAmt must equal ValDtls.IgstVal.",
  },
  "2189": {
    nic: "Total invoice value is not matching with calculated value",
    hint: "TotInvVal must equal AssVal + taxes + cess + other − discount + RndOffAmt (2 decimal places).",
  },
  "2234": {
    nic: "Tax amount does not match taxable value and rate",
    hint: "Line tax is not AssAmt × GstRt (split 50/50 for intra-state). Recalculate and round to 2 decimals.",
  },
  "2243": {
    nic: "POS code is invalid",
    hint: "BuyerDtls.Pos must be a 2-digit GST state code.",
  },
  "3038": {
    nic: "PIN code does not exist",
    hint: "PIN must be a 6-digit Indian postal code.",
  },
  "3039": {
    nic: "PIN code does not belong to state",
    hint: "First digits of the PIN must map to Seller/Buyer Stcd. Fix PIN or Stcd — Stcd should match GSTIN.",
  },
  "3047": {
    nic: "HSN does not belong to goods",
    hint: "IsServc is N but the code is a SAC (starts with 99). Set IsServc to Y or pick a goods HSN.",
  },
  "3048": {
    nic: "HSN does not belong to services",
    hint: "IsServc is Y but the code is goods HSN. Set IsServc to N or pick a SAC starting with 99.",
  },
};
