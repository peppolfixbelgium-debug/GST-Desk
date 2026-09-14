# GST Desk — Legal Launch Control

**Status:** HOLD — controlled launch only until P0 items are independently verified.
**Owner:** Legal / Compliance workstream
**Last audited:** 2026-09-14

This document is an operational control register, not legal or tax advice. Qualified Indian legal/tax counsel must review the final public legal documents and regulated GST claims before public launch.

## P0 release gates

- [ ] Final Terms approved by qualified Indian counsel and published.
- [ ] Final Privacy Notice reconciled to the deployed data flows and published.
- [ ] Account deletion is implemented and verified for account, sessions and user history.
- [ ] Conversion retention period is defined, implemented and verified.
- [ ] Backup/provider deletion behavior is documented and consistent with the notice.
- [ ] Production authentication, authorization and tenant isolation are verified in the actual deployed Supabase/Vercel architecture.
- [ ] Security page contains only controls supported by production evidence.
- [ ] Payment/cancellation/refund/tax terms are approved before paid checkout is enabled.

## Executed controls — 24-hour sprint

| Control | Evidence | Result |
|---|---|---|
| Remove unsupported NIC/GSP/IRN marketing wording from homepage | Commit `d3d85df217bd424cb5d6df8d2b85023bd7fb892a` — `src/routes/index.tsx` | Applied; needs PMO/production verification |
| Remove “GSP-adjacent volume” pricing language | Commit `a1dbf536f25703cf62211377c03586be27ed6bb6` — `src/lib/gst/pricing.ts` | Applied; needs PMO/production verification |
| Harden Terms boundaries | Commit `33cb26a1082515dba3af37df574cbebd2ca0f9da` — `src/routes/terms.tsx` | Applied; counsel approval pending |
| Harden Privacy claims | Commit `a05d28285f6d1c50eea3dc941af8c09b9f599608` — `src/routes/privacy.tsx` | Applied; architecture reconciliation pending |
| Reduce unverified Security claims | Commit `8192372bd8d2f9142e31c32f24c4058b43043476` — `src/routes/security.tsx` | Applied; production verification pending |
| Correct root metadata IRN wording | Commit `9aae9df223f0dd5d1435f8faa2b2f9412ae78d74` — `src/routes/__root.tsx` | Applied; needs PMO/production verification |

## Mandatory public-claim boundaries

### IRN-ready

Use:

> “IRN-ready means the file passed GST Desk’s local validation checks. It does not mean that an IRP has accepted, registered or issued an IRN for the invoice. An IRP may still reject the file.”

Do not use “IRN-ready” as a synonym for IRP acceptance, IRN issuance, filing, or guaranteed compliance.

### GSP / IRP / filing

Use:

> “GST Desk is not a GST Suvidha Provider (GSP), does not act as an Invoice Registration Portal (IRP), and does not submit invoices to an IRP or obtain an IRN on your behalf.”

Do not imply a GSP relationship, IRP relationship, NIC endorsement, or filing capability unless that capability and relationship actually exist and have been legally reviewed.

### Accuracy / professional responsibility

Use:

> “GST Desk provides software validation and suggested corrections. It is not tax, accounting or legal advice. You remain responsible for reviewing the source invoice, any suggested corrections, applicable GST law and rules, and the final document before filing, reporting or commercial use.”

### NIC attribution

Do not use “NIC said…” or similar attribution unless the exact source is current, authoritative and retained as evidence. Avoid language that could imply NIC endorsement or partnership.

### Marketing

Do not use “GSP-adjacent volume” or similar language that could blur GST Desk’s regulatory role.

## Data claims

The public product must not state or imply that invoice data is never transmitted, never stored, permanently deleted, encrypted, or otherwise protected unless the claim is verified against the complete deployed architecture, including APIs, logs, authentication, database, backups and subprocessors.

The current source documents indicate a transition from Neon/PGLite/Grok preview infrastructure toward Supabase/Vercel production. Public privacy/security claims must follow the deployed architecture, not the target architecture.

## Founder / counsel decisions required

1. Legal entity/provider name, address and privacy/contact details.
2. Governing law, jurisdiction and dispute mechanism.
3. Refund, cancellation, renewal and tax treatment.
4. Exact retention periods and deletion SLA.
5. Backup deletion approach.
6. Whether EU customers are intentionally targeted.
7. Final approved meaning and placement of “IRN-ready”.
8. Final approved NIC/IRP/GSP references.

## Evidence baseline

- `src/routes/terms.tsx`
- `src/routes/privacy.tsx`
- `src/routes/security.tsx`
- `src/routes/index.tsx`
- `src/routes/pricing.tsx`
- `src/routes/__root.tsx`
- `src/lib/gst/pricing.ts`
- `migrations/0001_auth.sql`
- `migrations/0002_conversions.sql`
- `PROJECT-STATE.md`
- GitHub issue #13

## Verification rule

A legal item is not considered complete merely because wording has been drafted. PMO/Quality must independently verify the deployed behavior and evidence, and counsel must approve legal/regulatory wording where identified above.
