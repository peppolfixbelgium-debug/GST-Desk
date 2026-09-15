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
import { trackAcquisition } from "@/lib/analytics/acquisition";
import { assertJsonTextWithinLimit, MAX_SINGLE_JSON_BYTES } from "@/lib/security/resource-limits";

export const Route = createFileRoute("/converter")({ component: FixerPage });

function pretty(inv: GstInvoice) { return JSON.stringify(inv, null, 2); }

const QUOTA_RETRIES = 3;

async function fetchQuotaWithRetry(): Promise<Quota> {
  let lastError: unknown;
  for (let attempt = 0; attempt < QUOTA_RETRIES; attempt += 1) {
    try {
      return await getQuota();
    } catch (error) {
      lastError = error;
      if (attempt < QUOTA_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Quota is temporarily unavailable.");
}

function FixerPage() {
  const { user, isPending } = useCurrentUserState();
  const [raw, setRaw] = useState("");
  const [invoice, setInvoice] = useState<GstInvoice | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [applied, setApplied] = useState<string[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const issues = useMemo(() => (invoice ? validateGst(invoice) : []), [invoice]);
  const blockers = issues.filter((i) => i.severity === "error");

  const loadQuota = async () => {
    try {
      setQuotaError(null);
      setQuota(await fetchQuotaWithRetry());
    } catch (error) {
      setQuota(null);
      setQuotaError(error instanceof Error ? error.message : "Quota is temporarily unavailable.");
    }
  };

  useEffect(() => {
    if (!user) return;
    trackAcquisition({ event: "converter_opened" });
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "completed") {
      trackAcquisition({ event: "sign_in_completed" });
      window.history.replaceState({}, document.title, "/converter");
    }
    void loadQuota();
  }, [user]);
  useEffect(() => { if (invoice) trackAcquisition({ event: "validation_completed", errorCode: blockers[0]?.code }); }, [invoice, blockers]);
  useEffect(() => { if (quota?.remaining === 0) trackAcquisition({ event: "quota_exhausted" }); else if (quota && quota.remaining <= Math.max(1, Math.ceil(quota.limit * 0.2))) trackAcquisition({ event: "quota_warning" }); }, [quota]);

  const loadJson = (text: string) => {
    setRaw(text);
    try {
      assertJsonTextWithinLimit(text, MAX_SINGLE_JSON_BYTES);
    } catch (error) {
      trackAcquisition({ event: "json_parse_error" });
      setParseError(error instanceof Error ? error.message : "JSON input is too large.");
      setInvoice(null); setApplied([]); return;
    }
    const parsed = parseInvoice(text);
    if (parsed.error) {
      trackAcquisition({ event: "json_parse_error" });
      setParseError(parsed.error); setInvoice(null); setApplied([]); return;
    }
    trackAcquisition({ event: "json_parse_success" });
    setParseError(null); setInvoice(parsed.invoice ?? null); setApplied([]);
