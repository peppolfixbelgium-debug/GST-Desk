import { createFileRoute } from "@tanstack/react-router";
import { GstErrorGuide } from "@/components/seo/error-guide";

export const Route = createFileRoute("/gst-e-invoice-errors/2189" as never)({
  head: () => ({
    meta: [
      { title: "GST e-invoice error 2189 — invalid total invoice value | GST Desk" },
      { name: "description", content: "Understand GST e-invoice error 2189 and diagnose invoice-total calculation mismatches in rejected JSON." },
    ],
  }),
  component: () => <GstErrorGuide
    code="2189"
    title="Invalid total invoice value"
    meaning="The published IRP guidance describes 2189 as an invoice-level total that has not been calculated consistently with the values passed in the payload."
    checks={[
      "Recalculate the invoice total from the line and invoice-level values in the payload.",
      "Check taxable value and applicable tax amounts before checking the final invoice total.",
      "Check rounding and round-off fields and make sure the final value is represented to the supported precision.",
    ]}
    supportedFix="GST Desk can identify supported total-value and round-off inconsistencies and apply only corrections covered by its validation rules. The result is checked again before download. This is a pre-check, not a guarantee of IRP acceptance."
    source="IRIS IRP Account Manager Guide and Validation Rules"
  />,
});
