import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/terms")({ component: Page });

function Page() {
  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-4 py-16 text-sm leading-relaxed text-muted">
        <h1 className="text-3xl text-fg">Terms of Service</h1>
        <p className="mt-2">Pre-launch version - last reviewed 14 September 2026.</p>
        <p className="mt-6">GST Desk provides software for validating GST e-invoice JSON and suggesting or applying supported corrections. The final contracting entity, address, governing law, jurisdiction, payment terms and dispute process must be confirmed before paid public launch.</p>
        <h2 className="mt-8 text-xl text-fg">GST and IRN boundary</h2>
        <p className="mt-3">GST Desk is not a GST Suvidha Provider (GSP), does not act as an Invoice Registration Portal (IRP), and does not submit invoices to an IRP or obtain an IRN on your behalf. “IRN-ready” means only that a file passed GST Desk local validation checks; it does not mean an IRP has accepted, registered or issued an IRN.</p>
        <h2 className="mt-8 text-xl text-fg">Your responsibility</h2>
        <p className="mt-3">GST Desk provides software validation and suggested corrections. It is not tax, accounting or legal advice. You remain responsible for reviewing the source invoice, corrections, applicable GST law and rules, and the final document before filing, reporting or commercial use.</p>
        <h2 className="mt-8 text-xl text-fg">Acceptable use</h2>
        <p className="mt-3">You must use the service lawfully and only with information you are authorised to process. Do not attempt to bypass usage limits, access another user’s data, interfere with the service, or use the service for unlawful activity.</p>
        <h2 className="mt-8 text-xl text-fg">Availability and changes</h2>
        <p className="mt-3">The service and its validation rules may change as GST, e-invoice schemas, masters and software dependencies change. We do not promise that a generated file will be accepted by an IRP or that the service will be continuously available.</p>
        <h2 className="mt-8 text-xl text-fg">Payments and cancellation</h2>
        <p className="mt-3">Paid-plan pricing is displayed separately. Subscription renewal, cancellation, refunds, taxes, upgrades, downgrades and unused quota treatment will be stated in the commercial terms before paid checkout is enabled.</p>
        <h2 className="mt-8 text-xl text-fg">Data</h2>
        <p className="mt-3">Our Privacy Notice describes the information we process and the intended data lifecycle. Do not upload information you are not authorised to process.</p>
        <h2 className="mt-8 text-xl text-fg">Legal terms</h2>
        <p className="mt-3">The final public Terms will identify the contracting entity, contact details, governing law, jurisdiction, liability allocation, termination rights, intellectual-property terms, notices and amendment process. Those provisions require founder approval and qualified Indian legal review.</p>
      </article>
    </Shell>
  );
}
