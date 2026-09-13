import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/terms")({ component: Page });

function Page() {
  return (
    <Shell>
      <article className="mx-auto max-w-2xl px-4 py-16 text-sm leading-relaxed text-muted">
        <h1 className="text-3xl text-fg">Terms</h1>
        <p className="mt-6">
          GST Desk validates GST e-invoice JSON against schema rules, HSN/PIN masters and round-off, then lets you
          download IRN-ready JSON. We do not transmit invoices to NIC IRP and we are not a GST Suvidha Provider.
        </p>
        <p className="mt-4">
          Free use is limited to 5 invoices per signed-in user per calendar month. You must review auto-fixes before
          filing. HSN classification remains your professional responsibility.
        </p>
      </article>
    </Shell>
  );
}
