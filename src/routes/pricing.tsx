import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, useLang } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/lib/gst/pricing";
import { t, planText } from "@/lib/gst/i18n";

export const Route = createFileRoute("/pricing")({ component: PricingPage });

function PricingPage() {
  const [lang] = useLang();
  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl">{t(lang, "pricingTitle")}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{t(lang, "pricingBody")}</p>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {PRICING.map((p) => <article key={p.id} className={`flex flex-col rounded-lg border bg-surface p-6 ${p.id === "firm" ? "border-accent" : "border-line"}`}>
            {p.id === "firm" ? <p className="text-[11px] uppercase tracking-wide text-accent">{t(lang, "mostChosen")}</p> : null}
            <h2 className="mt-2 text-xl">{planText(lang, p.id, "name")}</h2>
            <p className="mt-3 font-display text-4xl">₹{p.price.toLocaleString("en-IN")}<span className="text-sm font-sans text-muted"> {t(lang, "perMonth")}</span></p>
            <p className="mt-2 text-sm text-muted">{p.invoices} {t(lang, "invoices")}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-muted">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
            <Link to="/login" className="mt-6"><Button className="w-full" variant={p.id === "firm" ? "primary" : "outline"}>{planText(lang, p.id, "cta")}</Button></Link>
          </article>)}
        </div>
      </div>
    </Shell>
  );
}
