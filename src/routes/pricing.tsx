import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, useLang } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/lib/gst/pricing";
import { annualPriceInr, monthlyEquivalentInr, type PlanId } from "@/lib/gst/plans";
import { t, planText, type Lang } from "@/lib/gst/i18n";

export const Route = createFileRoute("/pricing")({ component: PricingPage });

const featureText = (lang: Lang, feature: string) => {
  const map: Record<string, Record<Lang, string>> = {
    "5 invoices / calendar month": { en: "5 invoices / calendar month", hi: "5 इनवॉइस / कैलेंडर माह", kn: "5 ಇನ್‌ವಾಯ್ಸ್ / ಕ್ಯಾಲೆಂಡರ್ ತಿಂಗಳು" },
    "Supported IRP error mapping": { en: "Supported IRP error mapping", hi: "समर्थित IRP त्रुटि मैपिंग", kn: "ಬೆಂಬಲಿತ IRP ದೋಷ ಮ್ಯಾಪಿಂಗ್" },
    "Safe format + arithmetic auto-fix": { en: "Safe format + arithmetic auto-fix", hi: "सुरक्षित फ़ॉर्मेट + गणना ऑटो-फिक्स", kn: "ಸುರಕ್ಷಿತ ಫಾರ್ಮ್ಯಾಟ್ + ಗಣಿತ ಸ್ವಯಂ-ತಿದ್ದುಪಡಿ" },
    "EN / हिन्दी": { en: "EN / हिन्दी / ಕನ್ನಡ", hi: "EN / हिन्दी / ಕನ್ನಡ", kn: "EN / हिन्दी / ಕನ್ನಡ" },
    "100 invoices / month": { en: "100 invoices / month", hi: "100 इनवॉइस / माह", kn: "100 ಇನ್‌ವಾಯ್ಸ್ / ತಿಂಗಳು" },
    "Bulk ZIP": { en: "Bulk ZIP", hi: "बल्क ZIP", kn: "ಬಲ್ಕ್ ZIP" },
    "History": { en: "History", hi: "इतिहास", kn: "ಇತಿಹಾಸ" },
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
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl">{t(lang, "pricingTitle")}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{t(lang, "pricingBody")}</p>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full border border-line bg-surface p-1 text-xs">
            <button type="button" onClick={() => setCycle("monthly")} className={`rounded-full px-4 py-2 ${cycle === "monthly" ? "bg-accent text-accent-fg" : "text-muted"}`}>Monthly</button>
            <button type="button" onClick={() => setCycle("annual")} className={`rounded-full px-4 py-2 ${cycle === "annual" ? "bg-accent text-accent-fg" : "text-muted"}`}>Annual · Save 16.7%</button>
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PRICING.map((p) => {
            const planId = p.id as PlanId;
            const price = cycle === "annual" ? annualPriceInr(planId) : p.price;
            const monthlyEquivalent = cycle === "annual" ? monthlyEquivalentInr(planId) : p.price;
            return (
              <article key={p.id} className={`flex flex-col rounded-lg border bg-surface p-6 ${p.id === "firm" ? "border-accent" : "border-line"}`}>
                {p.id === "firm" ? <p className="text-[11px] uppercase tracking-wide text-accent">{t(lang, "mostChosen")}</p> : null}
                <h2 className="mt-2 text-xl">{planText(lang, p.id, "name")}</h2>
                <p className="mt-3 font-display text-4xl">₹{price.toLocaleString("en-IN")}<span className="text-sm font-sans text-muted"> {cycle === "annual" ? "/ year" : t(lang, "perMonth")}</span></p>
                {cycle === "annual" && p.price > 0 ? <p className="mt-1 text-xs text-accent">₹{monthlyEquivalent.toLocaleString("en-IN", { maximumFractionDigits: 0 })} effective / month</p> : null}
                <p className="mt-2 text-sm text-muted">{p.invoices} {t(lang, "invoices")}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-muted">{p.features.map((f) => <li key={f}>{featureText(lang, f)}</li>)}</ul>
                <Link to="/login" className="mt-6"><Button className="w-full" variant={p.id === "firm" ? "primary" : "outline"}>{planText(lang, p.id, "cta")}</Button></Link>
              </article>
            );
          })}
        </div>
        <p className="mt-8 text-center text-xs text-muted">Annual pricing is currently presented as 10 months of the monthly price; payment activation remains behind the account/billing integration.</p>
      </div>
    </Shell>
  );
}
