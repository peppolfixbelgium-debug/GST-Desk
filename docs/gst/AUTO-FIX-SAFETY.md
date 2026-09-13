# GST Desk Auto-Fix Safety Boundary

## Safe automatic changes
- Normalize ISO date text to the IRP DD/MM/YYYY representation when the source is unambiguous.
- Normalize GSTIN formatting (trim/uppercase) without changing its semantic value.
- Derive Stcd from a syntactically valid GSTIN when the GSTIN itself is authoritative for that field.
- Recalculate arithmetic totals/tax splits from user-supplied taxable value and GST rate, subject to the current versioned rule set.

## Never silently change
- Seller/buyer PIN.
- HSN/SAC code.
- GST rate because a local fixture happens to contain a different rate.
- Service/goods classification based solely on a non-authoritative local HSN fixture.
- Place of supply based solely on an inferred address.
- Customer identity, address, quantity, unit price, discount or commercial terms.

## Product behavior
When authoritative master evidence is unavailable, GST Desk should surface a warning such as “not locally verified” and preserve the user's value. A suggested correction may be shown separately, but must not be silently applied.

## IRP boundary
Auto-fix produces a locally corrected candidate payload. It does not constitute IRP validation, IRN generation, filing, or acceptance.
