# GST Desk

India-focused SaaS for diagnosing and safely fixing GST e-invoice JSON validation errors.

## Current program

GST Desk is being hardened from a Grok-built prototype into a production SaaS with:

- GitHub as source of truth
- Vercel for application hosting
- Supabase Postgres/Auth/Row Level Security as the production data platform
- India-first GST/e-invoice validation and conservative auto-fix logic

## Core product

1. Validate GST e-invoice JSON.
2. Explain actionable validation/NIC-style errors.
3. Apply only high-confidence automatic fixes.
4. Revalidate before download.
5. Support bulk workflows.
6. Maintain user-scoped conversion history and usage quotas.

## Production principles

- Never claim guaranteed IRN acceptance unless independently verified.
- Never trust client-supplied user IDs for authorization.
- Enforce tenant isolation at both application and database layers.
- Keep invoice data collection and retention minimal.
- Quota enforcement must be atomic under concurrency.
- GST rules and rate/HSN data must be versioned and evidence-backed.
- Production secrets remain server-side.

## Launch gates

- [ ] Grok source imported and audited
- [ ] Supabase schema/auth/RLS production-ready
- [ ] Independent production authentication
- [ ] GST rule baseline verified against authoritative sources
- [ ] Test suite, typecheck, lint and build green
- [ ] Vercel deployment reproducible
- [ ] Desktop + mobile browser smoke tests green
- [ ] Security P0/P1 issues closed
- [ ] Pricing, legal and acquisition launch package approved

See GitHub issues for the active workstreams.
