import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isAdminEmail } from "@/lib/auth/roles";

export const Route = createFileRoute("/mission-control")({ component: MissionControlPage });
const API = "https://api.github.com/repos/peppolfixbelgium-debug/GST-Desk";

type Issue = { number: number; title: string; state: "open" | "closed"; updated_at: string; html_url: string };
type Run = { id: number; name: string; status: string; conclusion: string | null; html_url: string };

async function api<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);
  return response.json() as Promise<T>;
}

function MissionControlPage() {
  const { user, isPending } = useCurrentUserState();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true); setError(null);
    try {
      const [nextIssues, workflow] = await Promise.all([api<Issue[]>("/issues?state=all&per_page=100"), api<{ workflow_runs: Run[] }>("/actions/runs?per_page=10")]);
      setIssues(nextIssues); setRuns(workflow.workflow_runs);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load GitHub state."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user && isAdminEmail(user.primaryEmail)) void refresh(); }, [user]);

  if (isPending) return <Shell><div className="mx-auto max-w-5xl px-4 py-16"><div className="h-48 animate-pulse rounded-xl bg-surface" /></div></Shell>;
  if (!user) return <RedirectToSignIn to="/login" />;
  if (!isAdminEmail(user.primaryEmail)) return <Shell><div className="mx-auto max-w-xl px-4 py-20 text-center"><ShieldAlert className="mx-auto size-10 text-danger" /><h1 className="mt-4 text-3xl">Admin access required</h1><p className="mt-2 text-sm text-muted">CEO Command Center is restricted to the founder admin account.</p></div></Shell>;

  const open = issues.filter((i) => i.state === "open");
  const done = issues.filter((i) => i.state === "closed");
  const moving = open.filter((i) => Date.now() - new Date(i.updated_at).getTime() <= 48 * 60 * 60 * 1000);
  const latest = runs[0];

  return <Shell><div className="mx-auto max-w-7xl px-4 py-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-accent">Live execution board · Admin only</p><h1 className="mt-2 text-4xl">CEO Command Center</h1><p className="mt-2 max-w-3xl text-sm text-muted">GitHub-backed execution view for the founder admin account.</p></div><Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button></div>{error ? <p className="mt-5 rounded-lg border border-danger p-4 text-sm text-danger">{error}</p> : null}<div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">{[{label:"Moving",value:moving.length},{label:"Open",value:open.length},{label:"Done",value:done.length},{label:"Latest CI",value:latest?.conclusion ?? latest?.status ?? "—"}].map((s) => <div key={s.label} className="rounded-xl border border-line bg-surface p-5"><p className="text-xs uppercase tracking-wide text-muted">{s.label}</p><p className="mt-2 text-2xl">{s.value}</p></div>)}</div><section className="mt-6 rounded-xl border border-line bg-surface p-5"><h2 className="text-xl">Open work</h2><div className="mt-4 space-y-2">{open.slice(0,20).map((issue) => <a key={issue.number} href={issue.html_url} target="_blank" rel="noreferrer" className="block rounded-md border border-line p-3 hover:border-accent"><span className="font-mono text-xs text-muted">#{issue.number}</span><p className="mt-1 text-sm">{issue.title}</p></a>)}</div></section><section className="mt-6 rounded-xl border border-line bg-surface p-5"><h2 className="text-xl">CI / release pulse</h2><div className="mt-4 space-y-2">{runs.map((run) => <a key={run.id} href={run.html_url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border border-line p-3"><span>{run.name}</span><span className="text-xs text-muted">{run.conclusion ?? run.status}</span></a>)}</div></section></div></Shell>;
}
