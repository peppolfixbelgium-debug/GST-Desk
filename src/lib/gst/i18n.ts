export const LANGS = ["en", "hi"] as const;
export type Lang = (typeof LANGS)[number];

const dict = {
  en: {
    product: "GST Desk",
    tagline: "Fix NIC e-invoice errors. JSON ready for IRN.",
    convert: "Fix",
    validator: "Validator",
    bulk: "Bulk",
    pricing: "Pricing",
    dashboard: "History",
    signIn: "Sign in",
    honest:
      "We validate GSTN schema, HSN, PIN and round-off, then hand you IRN-ready JSON. We are not a GSP and we do not file the IRN — you submit through NIC or ClearTax / HostBooks.",
    needSignIn: "Sign in to fix invoices. Free accounts get 5 per calendar month.",
    quotaFull: "Monthly free quota used. It resets automatically on the 1st.",
  },
  hi: {
    product: "GST Desk",
    tagline: "NIC ई-इनवॉइस त्रुटियाँ ठीक करें। IRN के लिए JSON तैयार।",
    convert: "ठीक करें",
    validator: "सत्यापन",
    bulk: "बल्क",
    pricing: "मूल्य",
    dashboard: "इतिहास",
    signIn: "साइन इन",
    honest:
      "हम GSTN स्कीमा, HSN, पिन और राउंड-ऑफ जाँचते हैं। हम GSP नहीं हैं और IRN दाखिल नहीं करते — आप NIC या अपने GSP से भेजें।",
    needSignIn: "इनवॉइस ठीक करने के लिए साइन इन करें। हर कैलेंडर माह 5 मुफ्त।",
    quotaFull: "मासिक कोटा पूरा। हर महीने की 1 तारीख को रीसेट।",
  },
} as const;

export type MsgKey = keyof (typeof dict)["en"];

export function t(lang: Lang, key: MsgKey): string {
  return dict[lang][key];
}
