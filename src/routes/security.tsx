import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/security")({ component: Page });

function Page() {
  return (
    <Shell>
      <article className="mx-auto max-w-2xl px-4 py-16 text-sm leading-relaxed text-muted">
        <h1 className="text-3xl text-fg">Security</h1>
        <p className="mt-6">
          Validation and auto-fix run in the browser. Sessions use Better Auth. History rows are scoped to the
          signed-in user id on the server.
        </p>
        <p className="mt-4">
          We do not hold NIC IRP credentials and we do not file IRNs. Treat downloaded JSON as you would any invoice
          file. Plug your GSP when you are ready to generate the IRN live.
        </p>
      </article>
    </Shell>
  );
}
