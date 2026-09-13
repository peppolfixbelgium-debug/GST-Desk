# GST Desk — Operations Runbook

**Owner:** Company / Operations  
**Status:** Drafted for verification; not a claim that the controls are implemented.  
**Last reviewed:** 2026-09-14

## 1. Purpose

This runbook defines the minimum operating procedure for a controlled GST Desk launch. It deliberately separates verified controls from assumptions and founder-only decisions.

## 2. Status vocabulary

- **VERIFIED:** objective evidence exists in GitHub, production tooling, test output, or an approved external record.
- **MISSING:** no evidence has been found.
- **RECOMMENDED:** sensible control not yet required/approved.
- **FOUNDER DECISION:** cannot be safely chosen by Operations without company/legal/financial authority.

No status is GREEN merely because a procedure is written.

## 3. Customer support & contact

### Required before public launch
- Publish one monitored support/contact channel.
- Define support ownership and backup owner.
- Record acknowledgement target and escalation rules.
- Route billing, technical, privacy/data, security and abuse reports separately where practical.

### Intake procedure
1. Capture customer identifier/account, time, affected workflow and safe reproduction details.
2. Do not request invoice contents unless strictly necessary.
3. Never request passwords, API keys, payment card data or secrets.
4. Classify: support / billing / privacy / security / abuse / outage.
5. Assign severity and owner.
6. Record resolution and evidence.
7. Close only after customer-impacting issue is resolved or explicitly accepted.

### Contact status
**MISSING:** production support address/channel and named operational owner have not been independently verified.

## 4. Incident response

### Severity
- **P0:** security breach, cross-tenant exposure, major data loss, widespread production outage, or unsafe financial/data behavior.
- **P1:** material customer-impacting outage, widespread failed conversion, authentication failure, or serious degradation.
- **P2:** limited customer impact with workaround.
- **P3:** cosmetic, documentation or low-impact issue.

### Procedure
**Detect → record → triage → contain → preserve evidence → remediate → verify → communicate → postmortem.**

For suspected security/privacy incidents: restrict access first, preserve logs/evidence, avoid destructive investigation, and escalate to Legal/CEO according to the approved incident plan.

Do not disclose sensitive incident details in public issue trackers.

### Incident record minimum
- Incident ID
- start/detection time
- severity
- affected service/tenants if known
- symptoms
- owner
- containment action
- recovery action
- customer communication decision
- verification evidence
- root cause / contributing factors
- corrective actions

**MISSING:** tested incident channel/contact tree and production incident-log location.

## 5. Continuity, backup & recovery

### Required controls
- Verify database backup mechanism and retention.
- Perform a controlled restore test before launch.
- Record RPO/RTO targets.
- Document Vercel rollback and database recovery boundaries.
- Maintain vendor-outage fallback procedures.

### Recovery rule
Never perform destructive database recovery against production without an approved change/recovery decision and a preserved recovery point.

**MISSING:** verified production backup/restore evidence and approved RPO/RTO.

## 6. Customer account/data lifecycle

### Deletion request
1. Authenticate/verify requester.
2. Identify account/workspace and applicable data.
3. Check for legal/contractual retention requirement.
4. Execute approved deletion path.
5. Handle backups according to the approved retention policy.
6. Record completion without retaining unnecessary invoice content.

### Account deletion
Account deletion must revoke access and remove/anonymize associated application data according to the approved retention policy. Billing records may have separate retention obligations.

**MISSING:** verified production deletion implementation, retention schedule and backup treatment.

## 7. Billing operations

Live billing remains OFF until company, tax, pricing and legal gates are approved. When activated:

- Backend/admin operations only for refunds.
- Every refund is auditable.
- Subscription state is driven by verified billing events, not browser redirects.
- Cancellation/refund handling must match approved customer-facing policy.
- Failed payments follow an approved recovery/grace process; do not destructively delete customer data immediately.

**FOUNDER DECISION:** company/entity, tax treatment, final pricing, refund/cancellation policy and live payment activation.

## 8. Production access control

Minimum controls:
- named accounts only;
- least privilege;
- MFA where supported;
- no shared credentials;
- secrets only in approved secret storage;
- periodic access review;
- joiner/mover/leaver procedure;
- auditable emergency access.

**MISSING:** verified production access review and evidence for all controls.

## 9. Domain & brand

Before public launch verify:
- canonical domain and DNS ownership;
- HTTPS/certificate;
- redirect/canonical behavior;
- transactional/support contact addresses;
- brand/trademark clearance with Legal;
- consistency between domain, product name, billing identity and legal entity.

**MISSING:** canonical production domain/ownership and brand clearance evidence.

## 10. Customer onboarding

Minimum onboarding should explain:
- what GST Desk validates;
- supported input boundaries;
- that automatic fixes are conservative/high-confidence only;
- that users should review corrected output;
- that validation/explanation is not a guarantee of government/IRP acceptance unless separately verified;
- how to download corrected JSON;
- where to obtain support.

## 11. Monitoring

Required production signals:
- availability/HTTP failures;
- application/runtime errors;
- authentication failures/abuse;
- quota anomalies;
- billing anomalies once live;
- database/storage capacity;
- alert ownership and escalation.

**MISSING:** verified monitoring configuration, alert routing and operational KPI dashboard.

## 12. Vendor/subprocessor register

Do not infer vendors from architecture diagrams. Build the register from actual production configuration and contracts. For each vendor record: service, purpose, data handled, region, owner, DPA/contract status, security evidence, outage dependency and exit path.

Known target architecture from project documentation includes GitHub, Vercel and Supabase; actual production activation must be independently verified.

## 13. Launch go/no-go checklist

### Company
- [ ] Legal entity/ownership verified
- [ ] IP/product ownership verified
- [ ] Tax/VAT/GST business identity verified
- [ ] Settlement/bank identity verified

### Product operations
- [ ] Canonical domain verified
- [ ] Support channel live and monitored
- [ ] Customer onboarding verified
- [ ] Account/data deletion verified
- [ ] Retention policy implemented

### Reliability/security
- [ ] Production auth verified
- [ ] Tenant isolation/RLS verified
- [ ] Upload/resource limits verified
- [ ] Atomic quota behavior verified
- [ ] Monitoring/alerts verified
- [ ] Backup restore test passed
- [ ] Rollback procedure tested
- [ ] Incident procedure tested/tabletop completed

### Commercial
- [ ] Pricing approved
- [ ] Refund/cancellation policy approved
- [ ] Billing lifecycle tested
- [ ] Live payment activation explicitly approved

### Legal/compliance
- [ ] Terms approved
- [ ] Privacy approved
- [ ] Security claims approved
- [ ] Data processor/subprocessor disclosures verified
- [ ] Product/GST/IRP claims approved

### Release
- [ ] PMO independent verification complete
- [ ] No unresolved P0/P1 launch blocker
- [ ] CEO go-live decision recorded

## 14. Founder-only gates

Operations must stop and escalate rather than decide:
- company/entity formation or ownership;
- IP assignment/ownership disputes;
- tax/VAT/GST registration/treatment;
- material vendor spend/contract commitments;
- final refund/cancellation commercial policy where it creates material liability;
- live payment activation;
- material legal-risk acceptance.

## 15. Evidence discipline

Every completed control must record what was checked, when, by whom/workstream, and the concrete evidence reference. Stale evidence must not be reused as proof of current production state.
