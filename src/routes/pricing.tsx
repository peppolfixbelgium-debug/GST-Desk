import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/lib/gst/pricing";

export const Route = createFileRoute("/pricing")({ component: PricingPage });

function PricingPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl">Pricing</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Sign-in is required. Free is 5 invoices each calendar month, counted on the server and reset on the 1st.
          CA Starter is ₹999 / 100 invoices.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {PRICING.map((p) => (
            <article
              key={p.id}
              className={`flex flex-col rounded-lg border bg-surface p-6 ${"popular" in p && p.popular ? "border-accent" : "border-line"}`}
            >
              {"popular" in p && p.popular ? (
                <p className="text-[11px] uppercase tracking-wide text-accent">Most chosen</p>
              ) : null}
              <h2 className="mt-2 text-xl">{p.name}</h2>
              <p className="mt-3 font-display text-4xl">
                ₹{p.price.toLocaleString("en-IN")}
                <span className="text-sm font-sans text-muted"> / mo</span>
              </p>
              <p className="mt-2 text-sm text-muted">{p.blurb}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-muted">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link to="/login" className="mt-6">
                <Button className="w-full" variant={p.id === "firm" ? "primary" : "outline"}>
                  {p.cta}
                </Button>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </Shell>
  );
}
