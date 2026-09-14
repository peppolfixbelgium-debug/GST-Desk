# GST Desk — Pricing Launch Gate

**Status: PENDING FOUNDER/CEO APPROVAL — NOT PRODUCTION PRICING**

## Proposed controlled-launch offer

| Plan | Monthly | Included invoices | Annual proposal |
|---|---:|---:|---:|
| Free | ₹0 | 10 / calendar month | — |
| CA Solo | ₹699 | 100 / month | ₹6,990 |
| Firm | ₹1,999 | 500 / month | ₹19,990 |
| Practice | ₹3,999 | 2,000 / month | ₹39,990 |

Annual proposal is 10 months' monthly price for 12 months of service.

## Commercial guardrails

- No public price/quota change until founder/CEO approval.
- No live payment activation until founder/CEO approval.
- Prefer monthly billing for initial launch; annual billing only after refund, cancellation and tax treatment are verified.
- No silent unlimited overage. Initial launch should use an explicit hard quota and a visible upgrade/top-up path.
- Any future overage/top-up must be explicitly accepted by the customer and enforced server-side.

## Quota semantics required before paid launch

- Count each successfully accepted invoice exactly once.
- Rejected/malformed input must not create a free-processing loophole.
- Bulk ZIP counts accepted invoices individually.
- Concurrent requests must not exceed the monthly allowance.
- Usage must be auditable by user/tenant and calendar month.
- Server enforcement must use one canonical plan/quota definition; UI must not be authoritative.
- Usage warnings: 70%, 90%, 100%.
- Define file/ZIP limits, request-rate limits, duplicate/retry behavior and manual admin adjustments.

## Billing readiness gate

Before enabling paid production traffic, verify atomic quota consumption, idempotent checkout/payment state, webhook signature verification, replay-safe webhook handling, payment-to-entitlement reconciliation, refund/cancellation/tax behavior, and replacement of planning cost assumptions with production telemetry.

## Unit-economics baseline

Planning assumptions, not observed production costs:

- Razorpay standard domestic pricing: 2% + applicable GST on the fee; 18% GST on the fee implies 2.36% effective processing cost before any conservative buffer.
- Variable compute/storage/network: ₹0.50–₹1.50 per processed invoice until telemetry is available.
- Support allocation: ₹75–₹200 per paid account/month depending on plan and usage.
- GST collected from customers is not treated as SaaS revenue.

## Founder/CEO decision required

Approve or reject the proposed launch prices, quotas, annual pricing and any future overage model. This document intentionally does not alter `src/lib/gst/pricing.ts`.

## Evidence

- Pricing source remains unchanged pending approval: `src/lib/gst/pricing.ts`.
- Pricing assessment and commercial rationale are recorded in GitHub Issue #5.
- Billing/quota acceptance criteria are tracked in GitHub Issue #19.
- Technical audit previously identified a non-atomic monthly quota check/insert race; this remains a production-readiness dependency.
