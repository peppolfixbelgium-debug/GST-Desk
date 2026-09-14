import { createFileRoute, Link } from "@tanstack/react-router";
import JSZip from "jszip";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getQuota, saveConversion, type Quota } from "@/lib/gst/conversions";
import { autoFix } from "@/lib/gst/fix";
import { parseInvoice, validateGst } from "@/lib/gst/validate";

export const Route = createFileRoute("/bulk")({ component: BulkPage });

type Row = { name: string; invoiceId: string; status: string };
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

function BulkPage() {
  const { user, isPending } = useCurrentUserState();
  const [quota, setQuota] = useState<Quota | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadQuota = async () => {
    try { setQuotaError(null); setQuota(await fetchQuotaWithRetry()); }
    catch (error) { setQuota(null); setQuotaError(error instanceof Error ? error.message : "Quota is temporarily unavailable."); }
  };

  useEffect(() => { if (user) void loadQuota(); }, [user]);

  if (isPending) return <Shell><div className="mx-auto max-w-3xl px-4 py-16"><div className="h-32 animate-pulse rounded-lg bg-surface" /></div></Shell>;
  if (!user) return <RedirectToSignIn to="/login" />;

  const remaining = quota?.remaining ?? 0;

  const onFiles = async (files: FileList) => {
    if (!quota) { setNotice("Quota is unavailable. Please retry before uploading files."); return; }
    if (remaining <= 0) { setNotice("Monthly free quota used. It resets on the 1st."); return; }
    setBusy(true); setNotice(null);
    const zip = new JSZip();
    const next: Row[] = [];
    const list = [...files].slice(0, remaining);
    for (const file of list) {
      try {
        const text = await file.text();
        const parsed = parseInvoice(text);
        if (!parsed.invoice) throw new Error(parsed.error || "Invalid JSON");
        const { invoice } = autoFix(parsed.invoice);
        const blockers = validateGst(invoice).filter((i) => i.severity === "error");
        // Persist first. Only include files after the atomic quota operation
        // succeeds, so a failed save can never become an unmetered download.
        await saveConversion({ data: { invoiceId: invoice.DocDtls.No, supplier: invoice.SellerDtls.Gstin, customer: invoice.BuyerDtls.Gstin, total: String(invoice.ValDtls.TotInvVal), currency: "INR", status: blockers.length ? "issues" : "ok" } });
        zip.file(`${invoice.DocDtls.No.replaceAll("/", "-")}.json`, JSON.stringify(invoice, null, 2));
        next.push({ name: file.name, invoiceId: invoice.DocDtls.No, status: blockers.length ? `${blockers.length} left` : "ok" });
      } catch (e) { next.push({ name: file.name, invoiceId: "", status: e instanceof Error ? e.message : "failed" }); }
    }
    setRows(next);
    if (next.some((row) => row.invoiceId)) {
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "gst-irn-json.zip"; a.click(); URL.revokeObjectURL(url);
    }
    await loadQuota(); setBusy(false);
  };

  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl">Bulk fix</h1>
        <p className="mt-2 text-sm text-muted">Each JSON counts against this month's quota ({quota ? `${quota.used}/${quota.limit}` : quotaError ? "unavailable" : "loading…"}).</p>
        {quotaError ? <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-danger bg-surface px-4 py-3 text-sm"><span>Could not load your monthly quota.</span><Button variant="outline" size="sm" onClick={() => void loadQuota()}>Retry</Button></div> : null}
        {remaining <= 0 && quota ? <p className="mt-4 text-sm">Quota used. <Link to="/pricing" className="text-accent underline">See plans</Link></p> : null}
        {remaining > 0 && quota ? <label className="mt-6 flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface text-sm text-muted">Drop several e-invoice JSON files<input type="file" accept="application/json,.json" multiple className="hidden" disabled={busy} onChange={(e) => { if (e.target.files?.length) void onFiles(e.target.files); }} /></label> : null}
        {busy ? <p className="mt-3 text-sm text-muted">Working…</p> : null}
        {notice ? <p className="mt-3 text-sm text-danger">{notice}</p> : null}
        {rows.length ? <table className="mt-6 w-full text-left text-sm"><thead><tr className="text-muted"><th className="py-2">File</th><th>Invoice</th><th>Status</th></tr></thead><tbody>{rows.map((r) => <tr key={r.name} className="border-t border-line"><td className="py-2">{r.name}</td><td>{r.invoiceId || "—"}</td><td>{r.status}</td></tr>)}</tbody></table> : null}
      </div>
    </Shell>
  );
}
