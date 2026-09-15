import { createFileRoute, Link } from "@tanstack/react-router";
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
  throw lastError instanceof Error ? lastError : new Error("Account usage is temporarily unavailable.");
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

  if (isPending) return <Shell><div className="mx-auto max-w-6xl px-4 py-16"><div className="h-40 animate-pulse rounded-lg bg-surface" /></div></Shell>;
  if (!user) return <RedirectToSignIn to="/login" />;

  const usagePercent = quota ? Math.min(100, Math.round((quota.used / quota.limit) * 100)) : 0;

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.18em] text-accent">Account dashboard</p><h1 className="mt-2 text-3xl">Welcome back, {user.displayName ?? "GST Desk user"}.</h1><p className="mt-2 text-sm text-muted">Your profile, plan, usage and document activity in one place.</p></div>
          <div className="flex gap-2"><Link to="/converter"><Button variant="outline">Fix invoice</Button></Link><Link to="/bulk"><Button>Bulk tools</Button></Link></div>
        </div>

        <section className="mt-7 grid gap-4 lg:grid-cols-3">
          <article className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wide text-muted">Profile</p><h2 className="mt-1 text-xl">Identity & access</h2></div><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase ${quota?.role === "admin" ? "border-accent text-accent" : "border-line text-muted"}`}>{quota?.role ?? "user"}</span></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 text-sm"><div><p className="text-xs text-muted">Name</p><p className="mt-1">{user.displayName ?? "—"}</p></div><div><p className="text-xs text-muted">Email</p><p className="mt-1 break-all">{user.primaryEmail ?? "—"}</p></div><div><p className="text-xs text-muted">Access level</p><p className="mt-1">{quota?.role === "admin" ? "Admin — complete product access" : "Standard user"}</p></div><div><p className="text-xs text-muted">Authentication</p><p className="mt-1">Verified session</p></div></div>
          </article>
          <article className="rounded-xl border border-line bg-surface p-5">
            <p className="text-xs uppercase tracking-wide text-muted">Subscription</p>
            <h2 className="mt-1 text-xl">{quota?.planName ?? "Loading…"}</h2>
            <p className="mt-2 text-sm text-muted">{quota?.billingCycle === "annual" ? "Annual billing" : "Monthly billing"} · {quota?.status ?? "—"}</p>
            <Link to="/pricing" className="mt-5 block"><Button variant="outline" className="w-full">Compare plans</Button></Link>
          </article>
        </section>

        <section className="mt-4 rounded-xl border border-line bg-surface p-5">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-muted">Usage</p><h2 className="mt-1 text-xl">Monthly document allowance</h2></div>{quota ? <p className="text-sm text-muted">Resets on the 1st · {quota.used.toLocaleString()} / {quota.limit.toLocaleString()} used</p> : null}</div>
          {quotaError ? <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-danger bg-surface px-4 py-3 text-sm"><span>Could not load account usage.</span><Button variant="outline" size="sm" onClick={() => void loadData()}>Retry</Button></div> : null}
          {quota ? <><div className="mt-4 h-3 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-accent" style={{ width: `${usagePercent}%` }} /></div><div className="mt-2 flex justify-between text-xs text-muted"><span>{quota.remaining.toLocaleString()} remaining</span><span>{usagePercent}% consumed</span></div><p className="mt-3 text-xs text-muted">One successful corrected-document download consumes one document unit. The server applies the entitlement for your active plan, so quota checks remain enforced even if multiple requests arrive at once.</p></> : <p className="mt-4 text-sm text-muted">Loading usage…</p>}
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-4">
          {[{ href: "/converter", title: "Fix invoice", body: "Diagnose, correct and download GST e-invoice JSON." }, { href: "/validate", title: "Validate", body: "Run GST validation without changing the payload." }, { href: "/bulk", title: "Bulk", body: "Work through multiple invoice files." }, { href: "/pricing", title: "Plans", body: "Review monthly and annual entitlements." }].map((item) => <Link key={item.href} to={item.href as "/converter"} className="rounded-xl border border-line bg-surface p-5 hover:border-accent"><h3 className="font-medium">{item.title}</h3><p className="mt-2 text-xs leading-relaxed text-muted">{item.body}</p></Link>)}
        </section>

        <div className="mt-8 flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-muted">Conversion history</p><h2 className="mt-1 text-2xl">Recent activity</h2></div><Button variant="outline" size="sm" onClick={() => void loadData()}>Refresh</Button></div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line text-muted"><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">When</th></tr></thead><tbody>{rows.length === 0 ? <tr><td className="px-4 py-8 text-muted" colSpan={5}>No conversions yet.</td></tr> : rows.map((r) => <tr key={r.id} className="border-t border-line"><td className="px-4 py-3 font-mono text-xs">{r.invoiceId}</td><td className="px-4 py-3">{r.supplier || "—"}</td><td className="px-4 py-3">{r.customer || "—"}</td><td className="px-4 py-3">{r.total} {r.currency}</td><td className="px-4 py-3 text-muted">{r.createdAt.slice(0, 10)}</td></tr>)}</tbody></table></div>
      </div>
    </Shell>
  );
}
