import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NIC } from "@/lib/gst/errors";
import { parseInvoice, validateGst } from "@/lib/gst/validate";

export const Route = createFileRoute("/validate")({ component: ValidatePage });

function ValidatePage() {
  const [text, setText] = useState("");
  const [ran, setRan] = useState(false);

  const nicLookup = useMemo(() => {
    const m = text.trim().match(/\b(2\d{3}|3\d{3}|5\d{3})\b/);
    if (!m) return null;
    const row = NIC[m[1]];
    return row ? { code: m[1], ...row } : null;
  }, [text]);

  const jsonResult = useMemo(() => {
    if (!ran) return null;
    const parsed = parseInvoice(text);
    if (parsed.error) return { error: parsed.error, issues: [] };
    return { error: null as string | null, issues: validateGst(parsed.invoice!) };
  }, [ran, text]);

  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl">NIC error decoder</h1>
        <p className="mt-2 text-sm text-muted">
          Paste a portal error line (e.g. 2176) or full e-invoice JSON. No sign-in for lookup; JSON checks stay on-device.
        </p>
        <Textarea
          className="mt-6"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setRan(false);
          }}
          placeholder="2176 HSN code invalid as per GST rate — or paste JSON"
        />
        <Button className="mt-4" onClick={() => setRan(true)} disabled={!text.trim()}>
          Decode
        </Button>
        {nicLookup ? (
          <div className="mt-6 rounded-lg border border-line bg-surface p-4">
            <Badge>{nicLookup.code}</Badge>
            <p className="mt-2 font-medium">{nicLookup.nic}</p>
            <p className="mt-2 text-sm text-muted">{nicLookup.hint}</p>
          </div>
        ) : null}
        {jsonResult?.error ? <p className="mt-4 text-sm text-danger">{jsonResult.error}</p> : null}
        {jsonResult && !jsonResult.error ? (
          <ul className="mt-6 space-y-3">
            {jsonResult.issues.length === 0 ? (
              <li className="text-accent">No blocking issues</li>
            ) : (
              jsonResult.issues.map((i) => (
                <li key={i.code + i.path} className="rounded-md border border-line p-3 text-sm">
                  <Badge>{i.code}</Badge> {i.nic}
                  <p className="mt-1 text-xs text-muted">{i.path} — {i.hint}</p>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
    </Shell>
  );
}
