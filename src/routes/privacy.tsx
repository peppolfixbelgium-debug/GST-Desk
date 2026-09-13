import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/privacy")({ component: Page });

function Page() {
  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-4 py-16 text-sm leading-relaxed text-muted">
        <h1 className="text-3xl text-fg">Privacy Notice</h1>
        <p className="mt-2">Pre-launch version - last reviewed 14 September 2026.</p>
        <p className="mt-6">GST Desk is an India-focused software service for validating and correcting GST e-invoice JSON. The final legal entity, contact details, production providers and retention schedule must be confirmed before public launch.</p>
        <h2 className="mt-8 text-xl text-fg">Information processed</h2>
        <p className="mt-3">Depending on features used, this can include name, email, authentication and session information, and conversion-history metadata such as invoice/document number, GSTINs, supplier/customer identifiers, totals, currency, status and timestamps.</p>
        <p className="mt-3">Validation and supported auto-fixes are designed to run in the browser. Do not assume invoice data is never transmitted or stored; production APIs, diagnostics, logs, backups and providers must be verified before launch.</p>
        <h2 className="mt-8 text-xl text-fg">Purposes</h2>
        <p className="mt-3">Information is processed to provide authentication, validation and correction, conversion history, usage limits, support, security, abuse prevention and service operation where permitted by law.</p>
        <h2 className="mt-8 text-xl text-fg">Providers</h2>
        <p className="mt-3">The service may use hosting, database, authentication, payment, email, monitoring and support providers. The final provider list, processing roles, locations and safeguards will be published after production verification.</p>
        <h2 className="mt-8 text-xl text-fg">Retention and deletion</h2>
        <p className="mt-3">We intend to retain only information needed for stated purposes, subject to legal and security requirements. Exact retention periods, account deletion and conversion deletion are release gates and will be stated after implementation and verification.</p>
        <h2 className="mt-8 text-xl text-fg">Cookies</h2>
        <p className="mt-3">Strictly necessary technologies may support authentication, security and core functionality. Optional analytics or marketing technologies will be inventoried and handled under applicable consent requirements before activation.</p>
        <h2 className="mt-8 text-xl text-fg">Rights and contact</h2>
        <p className="mt-3">The final notice will identify the responsible entity, privacy contact, applicable rights and complaint route. GDPR applicability will be assessed from actual targeting and activities, not geographic accessibility alone.</p>
        <h2 className="mt-8 text-xl text-fg">GST responsibility</h2>
        <p className="mt-3">GST Desk is software, not tax, accounting or legal advice. You remain responsible for reviewing source data, corrections, applicable GST law and the final document before filing, reporting or commercial use.</p>
      </article>
    </Shell>
  );
}
