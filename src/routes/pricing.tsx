import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, useLang } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/lib/gst/pricing";
import { annualPriceInr, type PlanId } from "@/lib/gst/plans";
import { t, planText, type Lang } from "@/lib/gst/i18n";

export const Route = createFileRoute("/pricing")({ component: PricingPage });

const featureText = (lang: Lang, feature: string) => {
  const map: Record<string, Record<Lang, string>> = {
    "5 invoices / calendar month": { en: "5 invoices / calendar month", hi: "5 इनवॉइस / कैलेंडर माह", kn: "5 ಇನ್‌ವಾಯ್ಸ್ / ಕ್ಯಾಲೆಂಡರ್ ತಿಂಗಳು" },
    "Supported IRP error mapping": { en: "Supported IRP error mapping", hi: "समर्थित IRP त्रुटि मैपिंग", kn: "ಬೆಂಬಲಿತ IRP ದೋಷ ಮ್ಯಾಪಿಂಗ್" },
    "Safe format + arithmetic auto-fix": { en: "Safe format + arithmetic auto-fix", hi: "सुरक्षित फ़ॉर्मेट + गणना ऑटो-फिक्स", kn: "ಸುರಕ್ಷಿತ ಫಾರ್ಮ್ಯಾಟ್ + ಗಣಿತ ಸ್ವಯಂ-ತಿದ್ದುಪಡಿ" },
    "100 invoices / month": { en: "100 invoices / month", hi: "100 इनवॉइस / माह", kn: "100 ಇನ್‌ವಾಯ್ಸ್ / ತಿಂಗಳು" },
    "Bulk ZIP": { en: "Bulk ZIP", hi: "बल्क ZIP", kn: "ಬಲ್ಕ್ ZIP" },
    History: { en: "History", hi: "इतिहास", kn: "ಇತಿಹಾಸ" },
    "Email support": { en: "Email support", hi: "ईमेल सहायता", kn: "ಇಮೇಲ್ ಸಹಾಯ" },
    "400 invoices / month": { en: "400 invoices / month", hi: "400 इनवॉइस / माह", kn: "400 ಇನ್‌ವಾಯ್ಸ್ / ತಿಂಗಳು" },
    "Priority support": { en: "Priority support", hi: "प्राथमिकता सहायता", kn: "ಆದ್ಯತೆಯ ಸಹಾಯ" },
    "Team history": { en: "Team history", hi: "टीम इतिहास", kn: "ತಂಡದ ಇತಿಹಾಸ" },
    "1,500 invoices / month": { en: "1,500 invoices / month", hi: "1,500 इनवॉइस / माह", kn: "1,500 ಇನ್‌ವಾಯ್ಸ್ / ತಿಂಗಳು" },
    "Named contact": { en: "Named contact", hi: "नामित संपर्क", kn: "ನಿಗದಿತ ಸಂಪರ್ಕ" },
    "SLA on request": { en: "SLA on request", hi: "अनुरोध पर SLA", kn: "ವಿನಂತಿಯ ಮೇರೆಗೆ SLA" },
  };
  return map[feature]?.[lang] ?? feature;
};

function PricingPage() {
  const [lang] = useLang();
  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">GST Desk plans</p>
          <h1 className="mt-2 text-4xl tracking-tight">Simple pricing. Pick the billing rhythm that fits.</h1>
          <p className="mt-3 text-sm leading-6 text-muted">Monthly and annual pricing are shown together so the saving is visible before you choose. Annual billing gives 12 months of service for the price of 10.</p>
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-surface p-4 sm:flex sm:items-center sm:justify-between">
          <div><p className="font-medium">Annual plan value</p><p className="mt-1 text-xs text-muted">Pay 10 months · use 12 months · save 16.7% on paid plans</p></div>
          <span className="mt-3 inline-flex rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg sm:mt-0">2 months free</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PRICING.map((p) => {
            const planId = p.id as PlanId;
            const annual = annualPriceInr(planId);
            const paid = p.price > 0;
            return (
              <article key={p.id} className={`relative flex flex-col rounded-2xl border bg-surface p-5 ${p.id === "firm" ? "border-accent shadow-sm" : "border-line"}`}>
                {p.id === "firm" ? <span className="absolute right-4 top-4 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-fg">Most chosen</span> : null}
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{planText(lang, p.id, "name")}</p>
                <div className="mt-5 rounded-xl border border-line p-4">
                  <p className="text-[10px] uppercase tracking-wide text-muted">Monthly</p>
                  <p className="mt-1 font-display text-3xl">₹{p.price.toLocaleString("en-IN")}<span className="text-sm font-sans text-muted"> / mo</span></p>
                </div>
                <div className={`mt-2 rounded-xl border p-4 ${paid ? "border-accent/50 bg-accent/5" : "border-line"}`}>
                  <div className="flex items-center justify-between gap-2"><p className="text-[10px] uppercase tracking-wide text-muted">Annual</p>{paid ? <span className="text-[10px] font-semibold text-accent">SAVE 16.7%</span> : null}</div>
                  <p className="mt-1 font-display text-3xl">₹{annual.toLocaleString("en-IN")}<span className="text-sm font-sans text-muted"> / year</span></p>
                  {paid ? <p className="mt-1 text-xs font-medium text-accent">₹{Math.round(annual / 12).toLocaleString("en-IN")} effective / month · 2 months free</p> : <p className="mt-1 text-xs text-muted">No charge</p>}
                </div>
                <p className="mt-4 text-sm text-muted">{p.invoices} {t(lang, "invoices")}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-muted">{p.features.map((f) => <li key={f}>✓ {featureText(lang, f)}</li>)}</ul>
                <Link to="/login" className="mt-6"><Button className="w-full" variant={p.id === "firm" ? "primary" : "outline"}>{planText(lang, p.id, "cta")}</Button></Link>
              </article>
            );
          })}
        </div>
        <p className="mt-7 text-center text-xs text-muted">Payment activation remains behind the account/billing integration. Pricing display does not grant paid entitlements.</p>
      </div>
    </Shell>
  );
}
