# GST Desk — CEO Project State

## Status
AMBER — source audit/import is established; production implementation and independent operational/legal/security verification remain open.

## Verified baseline
- GitHub repo: `peppolfixbelgium-debug/GST-Desk`
- GitHub access: admin/maintain/push verified
- Grok ZIP audited: 315 archive entries
- GST core tests: 3/3 passed at baseline audit
- Full test suite: 182/195 passed at baseline audit
- Typecheck/build: blocked at baseline by extracted dependency state
- Supabase target: India/Mumbai
- Vercel target: Mumbai (`bom1`)
- Company operational checklist: Issue #11
- Operations runbook: `docs/OPERATIONS-RUNBOOK.md` (commit `6198a4569723982346a24ffd67a1ab3c6b78ee0c`)

## P0 work
1. Import source into GitHub as reproducible source of truth.
2. Remove production coupling to Grok preview/auth infrastructure.
3. Migrate Neon/PGLite persistence to Supabase PostgreSQL.
4. Implement production auth and Supabase RLS/tenant isolation.
5. Fix atomic monthly quota enforcement.
6. Harden GST rules and expand authoritative fixtures.
7. Establish npm ci, typecheck, lint, build and CI gates.
8. Deploy to Vercel and execute browser/end-to-end smoke tests.
9. Complete Company operational readiness controls in Issue #11 and operations runbook.

## Company / operations readiness
- Operational runbook and controlled launch checklist drafted and committed.
- Support/contact, domain/brand, incident/continuity, customer lifecycle, monitoring, vendor register and launch controls remain UNVERIFIED until concrete production evidence is attached.
- Founder-only decisions remain gated: company/entity, ownership/IP, tax/VAT/GST, material commercial policy and live payments.

## Parallel workstreams
- TECH/DEV/QA
- SECURITY
- R&D/GST
- PRICING
- CUSTOMER ACQUISITION
- LEGAL
- COMPANY
- CEO/release management

## Release gates
Source reproducible -> architecture/security green -> Supabase green -> core GST tests green -> Vercel deployment green -> browser/security QA green -> legal/product copy green -> operational readiness green -> launch readiness green.

## Founder dependencies
- Connect/provide access to the newly created Vercel and Supabase projects through supported integrations.
- No secrets should be pasted into chat.
- Founder approval only for irreversible legal, ownership, financial/payment or company-formation decisions.
