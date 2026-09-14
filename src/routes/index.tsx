import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { FileJson, ListChecks, Wrench } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/lib/gst/pricing";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { getAcquisitionContext, trackAcquisition } from "@/lib/analytics/acquisition";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  useEffect(() => {
    trackAcquisition({ event: "landing_view", ...getAcquisitionContext() });
  }, []);

  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">India · GST e-invoice · JSON diagnosis</p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-[1.1] text-fg md:text-6xl">Fix rejected GST e-invoice JSON faster.</h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
          Paste the rejected JSON, see what the validation error means, apply supported fixes, revalidate, and download
          the corrected JSON for your normal IRP/GSP workflow.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <SignedOut>
            <Link to="/login" onClick={() => trackAcquisition({ event: "cta_fix_json", ...getAcquisitionContext() })}>
              <Button>Fix a JSON</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link to="/converter" onClick={() => trackAcquisition({ event: "cta_fix_json", ...getAcquisitionContext() })}>
              <Button>Fix a JSON</Button>
            </Link>
          </SignedIn>
          <Link to="/pricing" onClick={() => trackAcquisition({ event: "pricing_viewed", ...getAcquisitionContext() })}>
            <Button variant="outline">See pricing</Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted">
          Free: 5 invoices per calendar month after sign-in. GST Desk does not file IRNs or guarantee IRP acceptance.
        </p>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
          {[
            { icon: FileJson, title: "Paste the rejected payload", body: "Use GST e-invoice JSON from your accounting or ERP workflow." },
            { icon: ListChecks, title: "Understand the rejection", body: "See the validation code, field/path and actionable explanation instead of hunting through raw JSON." },
            { icon: Wrench, title: "Fix, revalidate, download", body: "Apply supported fixes, check the result again, then download JSON for your normal IRP/GSP submission flow." },
          ].map((s) => (
            <div key={s.title} className="rounded-lg border border-line bg-bg p-6">
              <s.icon className="size-5 text-accent" />
              <h2 className="mt-4 text-xl">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl">Common rejection guides</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">Start with the error code you received. These pages explain the rejection and point back to the fixer without implying guaranteed IRP acceptance.</p>
        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          <a className="rounded-md border border-line px-3 py-2 hover:border-accent" href="/gst-e-invoice-errors/2176">2176 — HSN invalid</a>
          <a className="rounded-md border border-line px-3 py-2 hover:border-accent" href="/gst-e-invoice-errors/3039">3039 — PIN/state mismatch</a>
          <a className="rounded-md border border-line px-3 py-2 hover:border-accent" href="/gst-e-invoice-errors/2189">2189 — total invoice value</a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-3xl">Plans</h2>
        <p className="mt-2 text-sm text-muted">Sign-in required. Quota is counted per user, per calendar month.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {PRICING.map((p) => (
            <div key={p.id} className={`rounded-lg border bg-surface p-5 ${p.id === "firm" ? "border-accent" : "border-line"}`}>
              <p className="text-xs uppercase tracking-wide text-muted">{p.name}</p>
              <p className="mt-2 font-display text-3xl">{p.price ? `₹${p.price.toLocaleString("en-IN")}` : "₹0"}<span className="text-sm font-sans text-muted"> / mo</span></p>
              <p className="mt-2 text-sm text-muted">{p.invoices} invoices</p>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
