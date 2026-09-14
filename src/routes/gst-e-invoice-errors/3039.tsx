import { createFileRoute } from "@tanstack/react-router";
import { GstErrorGuide } from "@/components/seo/error-guide";

// The checked-in route tree is generated during the app build; this source file
// is valid at runtime even when standalone tsc sees the pre-generation type map.
// @ts-expect-error generated FileRoutesByPath can lag behind source route files.
export const Route = createFileRoute("/gst-e-invoice-errors/3039")({
  head: () => ({
    meta: [
      { title: "GST e-invoice error 3039 — PIN/state mismatch | GST Desk" },
      { name: "description", content: "Understand GST e-invoice error 3039 and diagnose PIN/state mapping issues in rejected JSON before resubmission." },
    ],
  }),
  component: () => <GstErrorGuide
    code="3039"
    title="PIN code does not belong to the state"
    meaning="Error 3039 is used for a PIN/state mapping mismatch. A rejected payload can therefore contain a PIN code that the IRP master does not map to the state supplied in the relevant address data."
    checks={[
      "Check the PIN code in the address object named by the rejection.",
      "Check that the state code supplied for that address matches the current PIN-to-state mapping.",
      "Use the current IRP master rather than relying on a locally cached or stale mapping.",
    ]}
    supportedFix="GST Desk can flag the PIN/state mismatch and apply a supported correction where the mapping is unambiguous. The edited payload is revalidated by GST Desk before download; final IRP acceptance remains outside GST Desk."
    source="IRIS IRP Troubleshooting Common Errors and published master guidance"
  />,
});
