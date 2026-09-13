# GST Desk — CEO Project State

## Status
AMBER — project initiated; source audit completed from Grok ZIP; production implementation is awaiting source import into the Git repository and connected Supabase/Vercel tooling.

## Verified baseline
- GitHub repo: `peppolfixbelgium-debug/GST-Desk`
- GitHub access: admin/maintain/push verified
- Grok ZIP audited: 315 archive entries
- GST core tests: 3/3 passed
- Full test suite: 182/195 passed
- Typecheck/build: currently blocked by extracted dependency state
- Supabase target: India/Mumbai
- Vercel target: Mumbai (`bom1`)

## P0 work
1. Import source into GitHub as reproducible source of truth.
2. Remove production coupling to Grok preview/auth infrastructure.
3. Migrate Neon/PGLite persistence to Supabase PostgreSQL.
4. Implement production auth and Supabase RLS/tenant isolation.
5. Fix atomic monthly quota enforcement.
6. Harden GST rules and expand authoritative fixtures.
7. Establish npm ci, typecheck, lint, build and CI gates.
8. Deploy to Vercel and execute browser/end-to-end smoke tests.

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
Source reproducible -> architecture/security green -> Supabase green -> core GST tests green -> Vercel deployment green -> browser/security QA green -> legal/product copy green -> launch readiness green.

## Founder dependencies
- Connect/provide access to the newly created Vercel and Supabase projects through supported integrations.
- No secrets should be pasted into chat.
- Founder approval only for irreversible legal, ownership, financial/payment or company-formation decisions.
