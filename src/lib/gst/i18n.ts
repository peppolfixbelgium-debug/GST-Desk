export const LANGS = ["en", "hi", "kn"] as const;
export type Lang = (typeof LANGS)[number];

const dict = {
  en: {
    product: "GST Desk", tagline: "Fix rejected GST e-invoice JSON faster.", convert: "Fix", validator: "Validator", bulk: "Bulk", pricing: "Pricing", dashboard: "History", signIn: "Sign in",
    honest: "GST Desk validates and suggests supported corrections. It does not file an IRN or guarantee IRP acceptance.",
    needSignIn: "Sign in to fix invoices. Free accounts get 5 per calendar month.", quotaFull: "Monthly free quota used. It resets automatically on the 1st.",
    homeEyebrow: "India · GST e-invoice · JSON diagnosis", homeTitle: "Fix rejected GST e-invoice JSON faster.", homeBody: "Paste the rejected JSON, understand the validation error, apply supported fixes, revalidate, and download the corrected JSON for your normal IRP/GSP workflow.",
    fixJson: "Fix a JSON", seePricing: "See pricing", freeNote: "Free: 5 invoices per calendar month after sign-in.",
    pasteTitle: "Paste the rejected payload", pasteBody: "Use GST e-invoice JSON from your accounting or ERP workflow.", understandTitle: "Understand the rejection", understandBody: "See the validation code, field/path and actionable explanation instead of hunting through raw JSON.", fixTitle: "Fix, revalidate, download", fixBody: "Apply supported fixes, check the result again, then download JSON for your normal IRP/GSP submission flow.",
    guidesTitle: "Common rejection guides", guidesBody: "Start with the error code you received. These pages explain the rejection and point back to the fixer.", plans: "Plans", plansBody: "Sign-in required. Quota is counted per user, per calendar month.",
    pricingTitle: "Pricing", pricingBody: "Sign-in is required. Free usage is counted on the server and resets on the 1st of each month.", mostChosen: "Most chosen", perMonth: "/ mo", invoices: "invoices", choose: "Choose",
    backHome: "Back home", terms: "Terms", privacy: "Privacy", security: "Security", footerNote: "GST Desk validates JSON; it does not file the IRN.",
    free: "Free", starter: "CA Starter", firm: "Firm", practice: "Practice", startFree: "Start free", chooseStarter: "Choose Starter", chooseFirm: "Choose Firm", choosePractice: "Choose Practice",
  },
  hi: {
    product: "GST Desk", tagline: "अस्वीकृत GST ई-इनवॉइस JSON जल्दी ठीक करें।", convert: "ठीक करें", validator: "सत्यापन", bulk: "बल्क", pricing: "मूल्य", dashboard: "इतिहास", signIn: "साइन इन",
    honest: "GST Desk सत्यापन करता है और समर्थित सुधार सुझाता है। यह IRN दाखिल नहीं करता और IRP स्वीकृति की गारंटी नहीं देता।", needSignIn: "इनवॉइस ठीक करने के लिए साइन इन करें। मुफ्त खाते में हर कैलेंडर माह 5 इनवॉइस मिलते हैं।", quotaFull: "मासिक मुफ्त कोटा पूरा हो गया। यह हर महीने की 1 तारीख को रीसेट होता है।",
    homeEyebrow: "भारत · GST ई-इनवॉइस · JSON निदान", homeTitle: "अस्वीकृत GST ई-इनवॉइस JSON जल्दी ठीक करें।", homeBody: "अस्वीकृत JSON पेस्ट करें, सत्यापन त्रुटि समझें, समर्थित सुधार लागू करें, दोबारा सत्यापित करें और अपने सामान्य IRP/GSP वर्कफ़्लो के लिए सुधरा JSON डाउनलोड करें।", fixJson: "JSON ठीक करें", seePricing: "मूल्य देखें", freeNote: "साइन इन के बाद हर कैलेंडर माह 5 इनवॉइस मुफ्त।",
    pasteTitle: "अस्वीकृत JSON पेस्ट करें", pasteBody: "अपने अकाउंटिंग या ERP वर्कफ़्लो का GST ई-इनवॉइस JSON इस्तेमाल करें।", understandTitle: "अस्वीकृति समझें", understandBody: "कच्चे JSON में खोजने के बजाय सत्यापन कोड, फ़ील्ड/पाथ और स्पष्ट समाधान देखें।", fixTitle: "ठीक करें, फिर सत्यापित करें, डाउनलोड करें", fixBody: "समर्थित सुधार लागू करें, परिणाम दोबारा जाँचें और अपने सामान्य IRP/GSP सबमिशन वर्कफ़्लो के लिए JSON डाउनलोड करें।",
    guidesTitle: "सामान्य अस्वीकृति गाइड", guidesBody: "प्राप्त त्रुटि कोड से शुरू करें। ये पेज अस्वीकृति समझाते हैं और फिक्सर तक ले जाते हैं।", plans: "प्लान", plansBody: "साइन इन आवश्यक है। कोटा प्रति उपयोगकर्ता, प्रति कैलेंडर माह गिना जाता है।", pricingTitle: "मूल्य", pricingBody: "साइन इन आवश्यक है। मुफ्त उपयोग सर्वर पर गिना जाता है और हर महीने की 1 तारीख को रीसेट होता है।", mostChosen: "सबसे लोकप्रिय", perMonth: "/ माह", invoices: "इनवॉइस", choose: "चुनें",
    backHome: "होम पर वापस", terms: "शर्तें", privacy: "गोपनीयता", security: "सुरक्षा", footerNote: "GST Desk JSON का सत्यापन करता है; IRN दाखिल नहीं करता।", free: "फ्री", starter: "CA स्टार्टर", firm: "फर्म", practice: "प्रैक्टिस", startFree: "मुफ्त शुरू करें", chooseStarter: "स्टार्टर चुनें", chooseFirm: "फर्म चुनें", choosePractice: "प्रैक्टिस चुनें",
  },
  kn: {
    product: "GST Desk", tagline: "ತಿರಸ್ಕರಿಸಿದ GST ಇ-ಇನ್‌ವಾಯ್ಸ್ JSON ಅನ್ನು ವೇಗವಾಗಿ ಸರಿಪಡಿಸಿ.", convert: "ಸರಿಪಡಿಸಿ", validator: "ಪರಿಶೀಲನೆ", bulk: "ಬಲ್ಕ್", pricing: "ಬೆಲೆ", dashboard: "ಇತಿಹಾಸ", signIn: "ಸೈನ್ ಇನ್",
    honest: "GST Desk ಪರಿಶೀಲನೆ ಮಾಡುತ್ತದೆ ಮತ್ತು ಬೆಂಬಲಿತ ತಿದ್ದುಪಡಿಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಇದು IRN ಸಲ್ಲಿಸುವುದಿಲ್ಲ ಮತ್ತು IRP ಸ್ವೀಕಾರದ ಖಾತರಿ ನೀಡುವುದಿಲ್ಲ.", needSignIn: "ಇನ್‌ವಾಯ್ಸ್ ಸರಿಪಡಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ. ಉಚಿತ ಖಾತೆಗೆ ಪ್ರತಿ ಕ್ಯಾಲೆಂಡರ್ ತಿಂಗಳಿಗೆ 5 ಇನ್‌ವಾಯ್ಸ್‌ಗಳು ಸಿಗುತ್ತವೆ.", quotaFull: "ತಿಂಗಳ ಉಚಿತ ಕೋಟಾ ಮುಗಿದಿದೆ. ಇದು ಪ್ರತಿ ತಿಂಗಳ 1ರಂದು ಮರುಹೊಂದಿಸಲಾಗುತ್ತದೆ.",
    homeEyebrow: "ಭಾರತ · GST ಇ-ಇನ್‌ವಾಯ್ಸ್ · JSON ಪರಿಶೀಲನೆ", homeTitle: "ತಿರಸ್ಕರಿಸಿದ GST ಇ-ಇನ್‌ವಾಯ್ಸ್ JSON ಅನ್ನು ವೇಗವಾಗಿ ಸರಿಪಡಿಸಿ.", homeBody: "ತಿರಸ್ಕರಿಸಿದ JSON ಅನ್ನು ಪೇಸ್ಟ್ ಮಾಡಿ, ಪರಿಶೀಲನಾ ದೋಷವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ, ಬೆಂಬಲಿತ ತಿದ್ದುಪಡಿಗಳನ್ನು ಅನ್ವಯಿಸಿ, ಮರುಪರಿಶೀಲಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಸಾಮಾನ್ಯ IRP/GSP ಕಾರ್ಯಪ್ರವಾಹಕ್ಕಾಗಿ ಸರಿಪಡಿಸಿದ JSON ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.", fixJson: "JSON ಸರಿಪಡಿಸಿ", seePricing: "ಬೆಲೆ ನೋಡಿ", freeNote: "ಸೈನ್ ಇನ್ ಮಾಡಿದ ನಂತರ ಪ್ರತಿ ಕ್ಯಾಲೆಂಡರ್ ತಿಂಗಳಿಗೆ 5 ಇನ್‌ವಾಯ್ಸ್‌ಗಳು ಉಚಿತ.",
    pasteTitle: "ತಿರಸ್ಕರಿಸಿದ JSON ಪೇಸ್ಟ್ ಮಾಡಿ", pasteBody: "ನಿಮ್ಮ ಅಕೌಂಟಿಂಗ್ ಅಥವಾ ERP ಕಾರ್ಯಪ್ರವಾಹದ GST ಇ-ಇನ್‌ವಾಯ್ಸ್ JSON ಬಳಸಿ.", understandTitle: "ತಿರಸ್ಕಾರವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ", understandBody: "ಕಚ್ಚಾ JSON ನಲ್ಲಿ ಹುಡುಕುವ ಬದಲು ಪರಿಶೀಲನಾ ಕೋಡ್, ಫೀಲ್ಡ್/ಪಾತ್ ಮತ್ತು ಸ್ಪಷ್ಟ ವಿವರಣೆಯನ್ನು ನೋಡಿ.", fixTitle: "ಸರಿಪಡಿಸಿ, ಮರುಪರಿಶೀಲಿಸಿ, ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ", fixBody: "ಬೆಂಬಲಿತ ತಿದ್ದುಪಡಿಗಳನ್ನು ಅನ್ವಯಿಸಿ, ಫಲಿತಾಂಶವನ್ನು ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಸಾಮಾನ್ಯ IRP/GSP ಸಲ್ಲಿಕೆ ಕಾರ್ಯಪ್ರವಾಹಕ್ಕಾಗಿ JSON ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
    guidesTitle: "ಸಾಮಾನ್ಯ ತಿರಸ್ಕಾರ ಮಾರ್ಗದರ್ಶಿಗಳು", guidesBody: "ನಿಮಗೆ ಬಂದ ದೋಷ ಕೋಡ್‌ನಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಈ ಪುಟಗಳು ತಿರಸ್ಕಾರವನ್ನು ವಿವರಿಸಿ ಫಿಕ್ಸರ್‌ಗೆ ಕರೆದೊಯ್ಯುತ್ತವೆ.", plans: "ಪ್ಲಾನ್‌ಗಳು", plansBody: "ಸೈನ್ ಇನ್ ಅಗತ್ಯ. ಕೋಟಾವನ್ನು ಪ್ರತಿ ಬಳಕೆದಾರರಿಗೆ, ಪ್ರತಿ ಕ್ಯಾಲೆಂಡರ್ ತಿಂಗಳಿಗೆ ಲೆಕ್ಕಿಸಲಾಗುತ್ತದೆ.", pricingTitle: "ಬೆಲೆ", pricingBody: "ಸೈನ್ ಇನ್ ಅಗತ್ಯ. ಉಚಿತ ಬಳಕೆಯನ್ನು ಸರ್ವರ್‌ನಲ್ಲಿ ಲೆಕ್ಕಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಪ್ರತಿ ತಿಂಗಳ 1ರಂದು ಮರುಹೊಂದಿಸಲಾಗುತ್ತದೆ.", mostChosen: "ಹೆಚ್ಚು ಆಯ್ಕೆ", perMonth: "/ ತಿಂಗಳು", invoices: "ಇನ್‌ವಾಯ್ಸ್‌ಗಳು", choose: "ಆಯ್ಕೆ",
    backHome: "ಮುಖಪುಟಕ್ಕೆ", terms: "ನಿಯಮಗಳು", privacy: "ಗೌಪ್ಯತೆ", security: "ಭದ್ರತೆ", footerNote: "GST Desk JSON ಅನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ; IRN ಸಲ್ಲಿಸುವುದಿಲ್ಲ.", free: "ಉಚಿತ", starter: "CA ಸ್ಟಾರ್ಟರ್", firm: "ಫರ್ಮ್", practice: "ಪ್ರಾಕ್ಟಿಸ್", startFree: "ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ", chooseStarter: "ಸ್ಟಾರ್ಟರ್ ಆಯ್ಕೆ", chooseFirm: "ಫರ್ಮ್ ಆಯ್ಕೆ", choosePractice: "ಪ್ರಾಕ್ಟಿಸ್ ಆಯ್ಕೆ",
  },
} as const;

export type MsgKey = keyof (typeof dict)["en"];
export function t(lang: Lang, key: MsgKey): string { return dict[lang][key]; }

const planKeys: Record<string, { name: MsgKey; cta: MsgKey }> = {
  free: { name: "free", cta: "startFree" }, starter: { name: "starter", cta: "chooseStarter" }, firm: { name: "firm", cta: "chooseFirm" }, practice: { name: "practice", cta: "choosePractice" },
};
export function planText(lang: Lang, id: string, field: "name" | "cta"): string {
  const keys = planKeys[id];
  return keys ? t(lang, keys[field]) : id;
}
