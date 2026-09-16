import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, CreditCard, FileCheck2, History, ShieldCheck, UserRound } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getQuota, listConversions, type ConversionRow, type Quota } from "@/lib/gst/conversions";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const { user, isPending } = useCurrentUserState();
  const [rows, setRows] = useState<ConversionRow[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try { const [history, currentQuota] = await Promise.all([listConversions(), getQuota()]); setRows(history); setQuota(currentQuota); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load account data."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) void load(); }, [user]);

  if (isPending) return <Shell><div className="mx-auto max-w-6xl px-4 py-12"><div className="animate-pulse space-y-4"><div className="h-8 w-56 rounded bg-line"/><div className="h-32 rounded-2xl bg-surface"/><div className="h-64 rounded-2xl bg-surface"/></div></div></Shell>;
  if (!user) return <RedirectToSignIn to="/login" />;

  const pct = quota ? Math.min(100, Math.round((quota.used / Math.max(1, quota.limit)) * 100)) : 0;
  const initials = (user.displayName || user.primaryEmail || "G").split(/\s+/).map((x) => x[0]).join("").slice(0, 2).toUpperCase();

  return <Shell><div className="mx-auto max-w-6xl px-4 py-10">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-xs uppercase tracking-[0.2em] text-accent">Account</p><h1 className="mt-2 text-4xl tracking-tight">Welcome back, {user.displayName || "there"}.</h1><p className="mt-2 text-sm text-muted">Your GST Desk workspace, plan and document activity in one place.</p></div>
      <div className="flex gap-2"><Link to="/converter"><Button>Fix an invoice <ArrowRight className="ml-2 size-4"/></Button></Link><Button variant="outline" onClick={() => void load()} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</Button></div>
    </div>

    {error ? <div className="mt-5 rounded-xl border border-danger p-4 text-sm text-danger">{error} <button className="ml-2 underline" onClick={() => void load()}>Retry</button></div> : null}

    <div className="mt-8 grid gap-5 lg:grid-cols-[.9fr_1.5fr]">
      <aside className="rounded-2xl border border-line bg-surface p-5">
        <div className="flex items-center gap-4"><div className="grid size-14 place-items-center rounded-full bg-accent text-lg font-semibold text-accent-fg">{initials}</div><div className="min-w-0"><p className="truncate font-medium">{user.displayName || "GST Desk user"}</p><p className="truncate text-xs text-muted">{user.primaryEmail}</p></div></div>
        <div className="my-5 h-px bg-line"/>
        <div className="space-y-4 text-sm"><div className="flex items-center gap-3"><UserRound className="size-4 text-muted"/><span>Account profile</span><CheckCircle2 className="ml-auto size-4 text-accent"/></div><div className="flex items-center gap-3"><ShieldCheck className="size-4 text-muted"/><span>Authenticated session</span><CheckCircle2 className="ml-auto size-4 text-accent"/></div><div className="flex items-center gap-3"><CreditCard className="size-4 text-muted"/><span>{quota?.planName || "Plan"}</span><span className="ml-auto text-xs text-muted">{quota?.billingCycle || "—"}</span></div></div>
        {quota?.role === "admin" ? <div className="mt-6 rounded-xl border border-accent/40 bg-accent/5 p-4"><p className="text-xs uppercase tracking-wide text-accent">Founder access</p><p className="mt-1 text-sm">Complete product access is enabled for this admin account.</p><Link to="/mission-control" className="mt-3 inline-flex text-xs font-medium text-accent">Open Command Center <ArrowRight className="ml-1 size-3"/></Link></div> : null}
      </aside>

      <div className="space-y-5">
        <section className="rounded-2xl border border-line bg-surface p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.16em] text-muted">Current plan</p><h2 className="mt-1 text-2xl">{quota?.planName || "Loading…"}</h2><p className="mt-1 text-sm text-muted">{quota?.billingCycle === "annual" ? "Annual billing" : "Monthly billing"} · {quota?.status || "Active"}</p></div><Link to="/pricing"><Button variant="outline">View plans</Button></Link></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-line p-4"><p className="text-xs text-muted">Used</p><p className="mt-1 text-2xl">{quota?.used ?? "—"}</p></div><div className="rounded-xl border border-line p-4"><p className="text-xs text-muted">Remaining</p><p className="mt-1 text-2xl">{quota?.remaining ?? "—"}</p></div><div className="rounded-xl border border-line p-4"><p className="text-xs text-muted">Monthly limit</p><p className="mt-1 text-2xl">{quota?.limit ?? "—"}</p></div></div>{quota ? <><div className="mt-5 h-2.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-accent transition-[width]" style={{width:`${pct}%`}}/></div><div className="mt-2 flex justify-between text-xs text-muted"><span>{pct}% used</span><span>Resets on the 1st</span></div></> : null}</section>

        <section className="grid gap-3 sm:grid-cols-3"><Link to="/converter" className="rounded-2xl border border-line bg-surface p-5 hover:border-accent"><FileCheck2 className="size-5 text-accent"/><h3 className="mt-3 font-medium">Fix JSON</h3><p className="mt-1 text-xs leading-5 text-muted">Diagnose, safely fix, validate and download.</p></Link><Link to="/validate" className="rounded-2xl border border-line bg-surface p-5 hover:border-accent"><ShieldCheck className="size-5 text-accent"/><h3 className="mt-3 font-medium">Validate</h3><p className="mt-1 text-xs leading-5 text-muted">Check a payload without changing it.</p></Link><Link to="/bulk" className="rounded-2xl border border-line bg-surface p-5 hover:border-accent"><History className="size-5 text-accent"/><h3 className="mt-3 font-medium">Bulk tools</h3><p className="mt-1 text-xs leading-5 text-muted">Process multiple JSON files with the same safeguards.</p></Link></section>
      </div>
    </div>

    <section className="mt-6 rounded-2xl border border-line bg-surface"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5"><div><p className="text-xs uppercase tracking-[0.16em] text-muted">Document history</p><h2 className="mt-1 text-xl">Recent conversions</h2></div><span className="text-xs text-muted">{rows.length} recorded</span></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b border-line text-xs uppercase tracking-wide text-muted"><th className="px-5 py-3">Invoice</th><th className="px-5 py-3">Supplier</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Date</th></tr></thead><tbody>{rows.length === 0 ? <tr><td className="px-5 py-10 text-muted" colSpan={5}>No conversions yet. Your corrected-document history will appear here.</td></tr> : rows.map((r) => <tr key={r.id} className="border-b border-line last:border-0"><td className="px-5 py-3 font-mono text-xs">{r.invoiceId}</td><td className="px-5 py-3">{r.supplier || "—"}</td><td className="px-5 py-3">{r.customer || "—"}</td><td className="px-5 py-3">{r.total} {r.currency}</td><td className="px-5 py-3 text-muted">{r.createdAt.slice(0, 10)}</td></tr>)}</tbody></table></div></section>
  </div></Shell>;
}

import { useEffect, useState } from "react";
