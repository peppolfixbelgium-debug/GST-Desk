import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/privacy")({ component: Page });

function Page() {
  return (
    <Shell>
      <article className="mx-auto max-w-2xl px-4 py-16 text-sm leading-relaxed text-muted">
        <h1 className="text-3xl text-fg">Privacy</h1>
        <p className="mt-6">
          JSON is parsed in your browser. We store invoice metadata (document number, GSTINs, totals, timestamp) on
          your account so quota and history work.
        </p>
        <p className="mt-4">We do not sell invoice contents. Account data is used to sign you in and count monthly invoices.</p>
      </article>
    </Shell>
  );
}
