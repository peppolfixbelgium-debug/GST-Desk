import { createFileRoute, Link } from "@tanstack/react-router";
import { FileJson, ListChecks, Wrench } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/lib/gst/pricing";
import { SignedIn, SignedOut } from "@/lib/auth/gates";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">India · GST e-invoice · IRP validation</p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-[1.1] text-fg md:text-6xl">
          Turn common GST e-invoice validation errors into clear fixes.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
          Paste the rejected e-invoice JSON. GST Desk maps supported IRP error codes to a human fix, corrects HSN,
          PIN-state and round-off issues, then gives you JSON that passed GST Desk validation checks. GST Desk is not a
          GSP or IRP and does not file invoices or obtain IRNs for you.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <SignedOut>
            <Link to="/login">
              <Button>Sign in to fix invoices</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link to="/converter">
              <Button>Open fixer</Button>
            </Link>
          </SignedIn>
          <Link to="/pricing">
            <Button variant="outline">See pricing</Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted">
          Free: 5 invoices per calendar month after sign-in. Resets on the 1st. CA Starter is ₹999 for 100.
        </p>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
          {[
            {
              icon: FileJson,
              title: "Paste the payload",
              body: "Tally / Busy / accounting JSON, or a broken sample with common e-invoice validation failures.",
            },
            {
              icon: ListChecks,
              title: "Read the IRP codes",
              body: "Supported codes such as 2176, 3039, 2189 and 2172 — with the field and a suggested fix.",
            },
            {
              icon: Wrench,
              title: "Correct and download",
              body: "HSN rate, PIN vs GSTIN state, CGST/IGST split and supported round-off corrections. Download the validated JSON.",
            },
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
        <h2 className="text-3xl">Plans</h2>
        <p className="mt-2 text-sm text-muted">Sign-in required. Quota is counted per user, per calendar month.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {PRICING.map((p) => (
            <div
              key={p.id}
              className={`rounded-lg border bg-surface p-5 ${p.id === "firm" ? "border-accent" : "border-line"}`}
            >
              <p className="text-xs uppercase tracking-wide text-muted">{p.name}</p>
              <p className="mt-2 font-display text-3xl">
                {p.price ? `₹${p.price.toLocaleString("en-IN")}` : "₹0"}
                <span className="text-sm font-sans text-muted"> / mo</span>
              </p>
              <p className="mt-2 text-sm text-muted">{p.invoices} invoices</p>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
