import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getQuota, saveConversion, type Quota } from "@/lib/gst/conversions";
import { autoFix } from "@/lib/gst/fix";
import { BROKEN_SAMPLE, CLEAN_HINT } from "@/lib/gst/sample";
import type { GstInvoice } from "@/lib/gst/types";
import { parseInvoice, validateGst } from "@/lib/gst/validate";
import { downloadBlob } from "@/lib/utils";

export const Route = createFileRoute("/converter")({ component: FixerPage });

function pretty(inv: GstInvoice) {
  return JSON.stringify(inv, null, 2);
}

function FixerPage() {
  const { user, isPending } = useCurrentUserState();
  const [raw, setRaw] = useState("");
  const [invoice, setInvoice] = useState<GstInvoice | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [applied, setApplied] = useState<string[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const issues = useMemo(() => (invoice ? validateGst(invoice) : []), [invoice]);
  const blockers = issues.filter((i) => i.severity === "error");

  const loadQuota = async () => {
    try {
      setQuota(await getQuota());
    } catch {
      setQuota(null);
    }
  };

  useEffect(() => {
    if (user) void loadQuota();
  }, [user]);

  const loadJson = (text: string) => {
    setRaw(text);
    const parsed = parseInvoice(text);
    if (parsed.error) {
      setParseError(parsed.error);
      setInvoice(null);
      setApplied([]);
      return;
    }
    setParseError(null);
    setInvoice(parsed.invoice ?? null);
    setApplied([]);
  };

  const onFix = () => {
    if (!invoice) return;
    const result = autoFix(invoice);
    setInvoice(result.invoice);
    setRaw(pretty(result.invoice));
    setApplied(result.applied);
  };

  const onDownload = async () => {
    if (!invoice || !quota || quota.remaining <= 0) {
      setNotice("Monthly free quota used. It resets automatically on the 1st.");
      return;
    }
    try {
      await saveConversion({
        data: {
          invoiceId: invoice.DocDtls.No,
          supplier: invoice.SellerDtls.Gstin,
          customer: invoice.BuyerDtls.Gstin,
          total: String(invoice.ValDtls.TotInvVal),
          currency: "INR",
          status: blockers.length ? "issues" : "ok",
        },
      });
      downloadBlob(`${invoice.DocDtls.No.replaceAll("/", "-")}.json`, pretty(invoice), "application/json");
      await loadQuota();
      setNotice("JSON downloaded. Submit it through NIC IRP or your GSP. We do not file the IRN.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not save.");
    }
  };

  if (isPending) {
    return (
      <Shell>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="h-40 animate-pulse rounded-lg bg-surface" />
        </div>
      </Shell>
    );
  }
  if (!user) return <RedirectToSignIn to="/login" />;

  const remaining = quota?.remaining ?? 0;

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl">IRN fixer</h1>
            <p className="mt-1 text-sm text-muted">Validate → NIC error → auto-fix → JSON ready for IRN.</p>
          </div>
          <div className="text-sm text-muted">
            {quota ? `${quota.used}/${quota.limit} used this month · ${remaining} left` : "Loading quota…"}
          </div>
        </div>
        {remaining <= 0 ? (
          <div className="mt-4 rounded-md border border-line bg-surface px-4 py-3 text-sm">
            Free monthly quota used. It resets automatically on the 1st.{" "}
            <Link to="/pricing" className="text-accent underline">
              See plans
            </Link>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <section className="rounded-lg border border-line bg-surface p-4">
            <h2 className="text-sm font-medium">Rejected JSON</h2>
            <p className="mt-1 text-xs text-muted">{CLEAN_HINT}</p>
            <Textarea
              className="mt-3 h-[28rem]"
              value={raw}
              onChange={(e) => loadJson(e.target.value)}
              placeholder="Paste GST e-invoice JSON…"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadJson(pretty(BROKEN_SAMPLE))}
              >
                Load broken sample
              </Button>
            </div>
            {parseError ? <p className="mt-2 text-xs text-danger">{parseError}</p> : null}
          </section>

          <section className="rounded-lg border border-line bg-surface p-4">
            <h2 className="text-sm font-medium">NIC errors</h2>
            <ul className="mt-3 max-h-[22rem] space-y-3 overflow-auto text-sm">
              {!invoice ? (
                <li className="text-muted">Paste JSON to see IRP-style issues.</li>
              ) : issues.length === 0 ? (
                <li className="text-accent">No blocking issues — ready for IRN.</li>
              ) : (
                issues.map((i) => (
                  <li key={i.code + i.path} className="rounded-md border border-line p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge>{i.code}</Badge>
                      <span className={i.severity === "error" ? "text-danger" : "text-muted"}>{i.severity}</span>
                    </div>
                    <p className="mt-1 font-medium">{i.nic}</p>
                    <p className="mt-1 text-xs text-muted">{i.path}</p>
                    <p className="mt-1 text-xs leading-relaxed">{i.hint}</p>
                  </li>
                ))
              )}
            </ul>
            <Button className="mt-4 w-full" disabled={!invoice} onClick={onFix}>
              Auto-fix HSN / PIN / round-off
            </Button>
            {applied.length ? (
              <ul className="mt-3 space-y-1 text-xs text-muted">
                {applied.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="rounded-lg border border-line bg-surface p-4">
            <h2 className="text-sm font-medium">IRN-ready JSON</h2>
            <Textarea readOnly className="mt-3 h-[28rem]" value={invoice ? pretty(invoice) : ""} />
            <Button
              className="mt-3 w-full"
              disabled={!invoice || remaining <= 0}
              onClick={() => void onDownload()}
            >
              Download JSON
            </Button>
            {notice ? <p className="mt-2 text-xs text-muted">{notice}</p> : null}
          </section>
        </div>
      </div>
    </Shell>
  );
}
