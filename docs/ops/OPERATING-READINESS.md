# GST Desk — Operating Readiness Evidence Pack

**Purpose:** version-controlled operating baseline for controlled launch. Unknown facts remain explicitly `UNKNOWN/PENDING` until evidence exists.

## 1. Support
- Primary support channel: `PENDING — founder/company decision`
- Support owner: `PENDING — company assignment`
- Target response SLA: `PENDING — commercial decision`
- Support evidence: product should capture actionable technical context without invoice/customer content.

## 2. Incident management
Severity:
- **SEV-1:** security/privacy incident, cross-tenant exposure, destructive production failure, or widespread inability to use the core fixer.
- **SEV-2:** material degradation of diagnosis/fix/revalidation/download affecting multiple users.
- **SEV-3:** isolated defect, UX issue, or non-critical degradation.

Response: stop unsafe automation first; preserve evidence; assess scope; escalate security/privacy/legal issues immediately; document root cause and corrective action.

## 3. Data and account lifecycle
- Collection must be limited to data required for authentication, operation, quota/history and explicitly enabled product workflows.
- Analytics must not contain raw invoice JSON, GSTINs, names, invoice numbers, totals, or other invoice content.
- Account deletion/retention workflow: `PENDING — production implementation and legal-approved policy evidence`.
- Backup deletion propagation: `PENDING — provider-specific evidence`.

## 4. Backup, rollback and recovery
- Backup owner: `PENDING`.
- Restore drill evidence: `PENDING`.
- Application rollback procedure: redeploy a previously verified commit after confirming database compatibility.
- Database migrations must be backward-compatible with the deployed application during rollout where practical; destructive migration requires explicit review.
- Recovery time/objectives: `PENDING — company decision based on production needs`.

## 5. Production access
- Repository access should follow least privilege.
- Production secrets must never be committed or placed in client bundles.
- Credentials/configuration that only the Founder can provide are founder blockers; never request or record secret values in GitHub issues.
- Production access audit evidence: `PENDING`.

## 6. Vendor inventory
Maintain a current inventory of hosting, database, authentication, analytics and other processors/subprocessors. For each vendor record: purpose, data handled, region where relevant, contract/DPA status, retention/deletion behavior, and owner.

Current platform evidence to reconcile before launch:
- GitHub: source/control plane.
- Vercel: application hosting/deployment; commercial plan suitability remains a founder/company decision.
- Supabase: production database/platform target.
- Better Auth: application authentication layer.

Vendor legal/privacy review: `PENDING — Legal/company verification`.

## 7. Release checklist
Before controlled launch, PMO must verify:
- CI typecheck/lint/test/build green.
- Production database schema/migrations verified.
- Auth/session verified with production configuration.
- RLS/tenant isolation verified.
- Atomic quota and abuse/resource controls verified.
- GST rule/fixture suite accepted.
- Desktop/mobile smoke tests passed.
- Legal/product claims reviewed and qualified counsel engaged where required.
- Pricing/billing operational readiness verified; no live payment activation without approval.
- Acquisition funnel and privacy-safe instrumentation verified.
- Backup/restore/rollback/incident evidence recorded.

## 8. Founder-only decisions
Do not silently decide or execute:
- legal/company identity or ownership changes;
- irreversible production/data deletion;
- financial/payment commitments;
- final public legal claims requiring counsel;
- credentials or configuration only the Founder can supply.

Routine engineering, research, documentation, QA and product work should continue without waiting for these decisions.

## 9. Evidence rule
A claim is not complete because it is written here. Attach objective evidence (commit, CI run, deployment/runtime evidence, provider evidence, test result, or documented founder/counsel decision) and have PMO verify it before marking the corresponding release gate GREEN.
