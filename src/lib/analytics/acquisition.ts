export type AcquisitionEvent =
  | "landing_view"
  | "cta_fix_json"
  | "pricing_viewed"
  | "converter_opened"
  | "json_parse_success"
  | "json_parse_error"
  | "validation_completed"
  | "fix_run"
  | "revalidation_completed"
  | "corrected_json_downloaded"
  | "quota_warning"
  | "quota_exhausted"
  | "sign_in_started"
  | "sign_in_completed"
  | "upgrade_started"
  | "upgrade_completed";

type EventPayload = {
  event: AcquisitionEvent;
  source?: string;
  medium?: string;
  campaign?: string;
  landingPath?: string;
  errorCode?: string;
  fixCategory?: string;
  plan?: string;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const ALLOWED_KEYS = new Set([
  "event",
  "source",
  "medium",
  "campaign",
  "landingPath",
  "errorCode",
  "fixCategory",
  "plan",
]);

/** Privacy-safe telemetry: never send invoice JSON, GSTIN, names, numbers, totals, or raw form values. */
export function trackAcquisition(input: EventPayload) {
  if (typeof window === "undefined") return;

  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (ALLOWED_KEYS.has(key) && typeof value === "string" && value.length <= 120) {
      payload[key] = value;
    }
  }

  window.dataLayer ??= [];
  window.dataLayer.push({ ...payload, gstDeskEventVersion: 1 });
}

export function getAcquisitionContext() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") ?? undefined,
    medium: params.get("utm_medium") ?? undefined,
    campaign: params.get("utm_campaign") ?? undefined,
    landingPath: window.location.pathname,
  };
}
