# GST Desk — Launch pricing decision pack

**Status:** proposed / not founder-approved / live billing disabled
**Review date:** 2026-09-15

## Positioning
GST Desk is a narrow rejection-diagnosis/fixing tool, not a full accounting/GST filing suite. ClearTax markets a broader e-invoicing/GST compliance stack starting at ₹7,777/month, while TallyPrime includes e-invoicing, GST and broader accounting functionality in plans starting at ₹750/month rental. These are adjacent benchmarks, not direct substitutes. ClearTax describes itself as an ASP/GSP player; Tally describes IRP generation through its GSP connection. GST Desk must not imply those capabilities. 

## Evidence-backed recommendation
The launch offer should stay intentionally below full-suite economics and monetize recurring rejection volume/workflow value rather than filing capability.

| Plan | Monthly price | Included conversions | Intended user | Launch status |
|---|---:|---:|---|---|
| Free | ₹0 | 5 | trial / occasional user | recommended |
| CA Solo | ₹699 | 100 | solo CA / practitioner | recommended |
| Firm | ₹1,999 | 500 | small accounting firm | recommended |
| Practice | ₹3,999 | 2,000 | higher-volume practice | recommended |

Annual billing should be introduced only after monthly usage and retention data exists. Do not promise annual discounts until refund, tax and cancellation mechanics are implemented.

## Why this packaging
- The product's current wedge is rejected JSON diagnosis/fixing, not complete GST compliance.
- Free usage demonstrates the core workflow without requiring payment before trust is established.
- The first paid tier maps to repeated practitioner use rather than artificial feature locks.
- Higher tiers should be triggered by volume, bulk workflow, history/team requirements and support needs.
- Competitor suite pricing is materially broader, so GST Desk should not price as if it replaces a full accounting/GST platform. TallyPrime currently lists ₹750/month for Silver and ₹2,250/month for Gold rental; ClearTax's full-stack e-invoicing/GST compliance page currently states starting at ₹7,777/month. citeturn0search0turn0search3

## Unit economics model — assumptions, not verified costs
Until real production invoices are available, use a conservative planning model rather than inventing infrastructure cost facts.

Assume monthly gross-margin target >= 80% after payment fees and direct variable support/compute. Record actual Vercel/Supabase/payment/support costs from provider invoices before approving final pricing.

Key metrics:
- corrected JSON downloads per active user;
- monthly conversions/user;
- free-to-paid conversion;
- paid retention at 30/60/90 days;
- revenue per conversion;
- support contacts per 100 conversions;
- abuse/rejected requests per active user.

## Upgrade triggers
1. Free quota exhausted.
2. Bulk workflow required.
3. Higher monthly conversion volume.
4. History/team workflow becomes important.
5. Support requirement increases.

Do not block basic diagnosis solely to force an upgrade.

## 30/60/90-day experiment
**Days 0–30:** Free + CA Solo only; recruit design partners; measure activation and willingness to pay.

**Days 31–60:** validate Firm packaging with firms using bulk/history; compare ₹699 vs a higher/lower Solo price only if data supports it.

**Days 61–90:** introduce Practice/annual billing only if retention, support cost and payment mechanics are verified.

## Billing safety gates
Live payments remain OFF until:
- one canonical plan/quota source is enforced server-side;
- atomic quota is verified under concurrency;
- checkout/webhook signature/idempotency/reconciliation are tested;
- cancellation/refund/tax treatment is documented;
- Legal/Company review is complete;
- Founder approves the financial activation.

## Founder decisions
- approve final launch prices;
- approve whether annual billing launches in phase 1;
- approve refund/cancellation/renewal/tax treatment;
- approve live payment activation after all technical/legal gates pass.
