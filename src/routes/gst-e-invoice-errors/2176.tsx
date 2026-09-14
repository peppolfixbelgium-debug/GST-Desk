import { createFileRoute } from "@tanstack/react-router";
import { GstErrorGuide } from "@/components/seo/error-guide";

// The checked-in route tree is generated during the app build; this source file
// is valid at runtime even when standalone tsc sees the pre-generation type map.
// @ts-expect-error generated FileRoutesByPath can lag behind source route files.
export const Route = createFileRoute("/gst-e-invoice-errors/2176")({
  head: () => ({
    meta: [
      { title: "GST e-invoice error 2176 — HSN code invalid | GST Desk" },
      { name: "description", content: "Understand GST e-invoice error 2176, check the HSN code, and use GST Desk to diagnose supported JSON validation issues before resubmission." },
    ],
  }),
  component: () => <GstErrorGuide
    code="2176"
    title="HSN code is invalid"
    meaning="The IRP validation guidance describes 2176 as an invalid HSN code being passed in the invoice payload. The published guidance recommends checking the HSN against the e-invoice portal master and contacting the system helpdesk if a code believed to be valid is rejected."
    checks={[
      "Check the HSN value at the item-level field identified by the rejection.",
      "Cross-check the code against the current e-invoice portal HSN master.",
      "Do not assume an HSN is valid only because it was accepted by another system or an older dataset.",
    ]}
    supportedFix="GST Desk can diagnose the HSN-related validation issue and apply a supported correction when its rule set has enough evidence to do so. It revalidates the edited JSON before download; it does not claim that the resulting JSON will be accepted by an IRP."
    source="IRIS IRP Validation Rules and Troubleshooting Common Errors"
  />,
});
