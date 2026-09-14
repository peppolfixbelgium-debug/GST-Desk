import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getQuota, listConversions, type ConversionRow, type Quota } from "@/lib/gst/conversions";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

const QUOTA_RETRIES = 3;
async function fetchQuotaWithRetry(): Promise<Quota> {
  let lastError: unknown;
  for (let attempt = 0; attempt < QUOTA_RETRIES; attempt += 1) {
    try { return await getQuota(); }
    catch (error) {
      lastError = error;
      if (attempt < QUOTA_RETRIES - 1) await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Quota is temporarily unavailable.");
}

function DashboardPage() {
  const { user, isPending } = useCurrentUserState();
  const [rows, setRows] = useState<ConversionRow[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setQuotaError(null);
      const [r, q] = await Promise.all([listConversions(), fetchQuotaWithRetry()]);
      setRows(r); setQuota(q);
    } catch (error) {
      setQuota(null);
      setQuotaError(error instanceof Error ? error.message : "Could not load account data.");
    }
  };

  useEffect(() => { if (user) void loadData(); }, [user]);

  if (isPending) return <Shell><div className="mx-auto max-w-5xl px-4 py-16"><div className="h-40 animate-pulse rounded-lg bg-surface" /></div></Shell>;
  if (!user) return <RedirectToSignIn to="/login" />;

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl">History</h1>
        <p className="mt-2 text-sm text-muted">{quota ? `${quota.used} of ${quota.limit} invoices this month. Remaining ${quota.remaining}. Resets on the 1st.` : quotaError ? "Account data unavailable" : "Loading quota…"}</p>
        {quotaError ? <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-danger bg-surface px-4 py-3 text-sm"><span>Could not load account data.</span><Button variant="outline" size="sm" onClick={() => void loadData()}>Retry</Button></div> : null}
        <div className="mt-8 overflow-x-auto rounded-lg border border-line bg-surface"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line text-muted"><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">When</th></tr></thead><tbody>{rows.length === 0 ? <tr><td className="px-4 py-8 text-muted" colSpan={5}>No conversions yet.</td></tr> : rows.map((r) => <tr key={r.id} className="border-t border-line"><td className="px-4 py-3 font-mono text-xs">{r.invoiceId}</td><td className="px-4 py-3">{r.supplier || "—"}</td><td className="px-4 py-3">{r.customer || "—"}</td><td className="px-4 py-3">{r.total} {r.currency}</td><td className="px-4 py-3 text-muted">{r.createdAt.slice(0, 10)}</td></tr>)}</tbody></table></div>
      </div>
    </Shell>
  );
}
