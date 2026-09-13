import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/security")({ component: Page });

function Page() {
  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-4 py-16 text-sm leading-relaxed text-muted">
        <h1 className="text-3xl text-fg">Security</h1>
        <p className="mt-2">Pre-launch version - last reviewed 14 September 2026.</p>
        <p className="mt-6">GST Desk is being prepared for production deployment. This page intentionally avoids security guarantees that have not yet been verified in production.</p>
        <h2 className="mt-8 text-xl text-fg">Invoice processing</h2>
        <p className="mt-3">Validation and supported auto-fixes are designed to run in the browser. Production verification must confirm this for every relevant workflow, including bulk processing, APIs, diagnostics and error handling.</p>
        <h2 className="mt-8 text-xl text-fg">Accounts and access</h2>
        <p className="mt-3">GST Desk uses authenticated accounts. Production authentication, server-side authorization and database tenant isolation must be independently verified before stronger security guarantees are published.</p>
        <h2 className="mt-8 text-xl text-fg">IRP and IRN boundary</h2>
        <p className="mt-3">GST Desk is not a GST Suvidha Provider (GSP), does not act as an Invoice Registration Portal (IRP), and does not submit invoices to an IRP or obtain an IRN on your behalf.</p>
        <h2 className="mt-8 text-xl text-fg">Customer responsibility</h2>
        <p className="mt-3">Do not upload information you are not authorised to process. Treat downloaded invoice JSON as confidential business data and review it before filing or commercial use.</p>
        <h2 className="mt-8 text-xl text-fg">Security reporting</h2>
        <p className="mt-3">A dedicated security contact and incident-reporting process will be published before production launch.</p>
      </article>
    </Shell>
  );
}
