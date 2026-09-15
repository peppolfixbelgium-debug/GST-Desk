import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock3, GitCommit, RefreshCw, ShieldAlert } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/mission-control")({ component: MissionControlPage });

const REPO = "peppolfixbelgium-debug/GST-Desk";
const API = `https://api.github.com/repos/${REPO}`;

type Issue = { number: number; title: string; html_url: string; updated_at: string; labels: { name: string }[] };
type Commit = { sha: string; html_url: string; commit: { message: string; author?: { date?: string } } };
type Run = { id: number; name: string; status: string; conclusion: string | null; html_url: string; created_at: string };

type Team = { name: string; keys: string[]; color: string; owner: string };
const TEAMS: Team[] = [
  { name: "CEO / PMO", keys: ["pmo", "ceo", "release"], color: "accent", owner: "Release control" },
  { name: "TECH / QA", keys: ["tech", "qa", "ci", "security"], color: "info", owner: "Engineering + quality" },
  { name: "GST / R&D", keys: ["gst", "r&d", "rd", "hsn", "irn"], color: "purple", owner: "Rules + validation" },
  { name: "LEGAL", keys: ["legal", "privacy", "terms", "company"], color: "warning", owner: "Launch compliance" },
  { name: "PRICING", keys: ["pricing", "billing"], color: "success", owner: "Commercial model" },
  { name: "ACQUISITION", keys: ["acquisition", "customer", "growth", "marketing"], color: "danger", owner: "Demand + activation" },
];

function classify(issue: Issue, team: Team) {
  const text = `${issue.title} ${issue.labels.map((l) => l.name).join(" ")}`.toLowerCase();
  return team.keys.some((key) => text.includes(key));
}

function statusFor(issues: Issue[], commits: Commit[]) {
  if (issues.some((i) => /blocked|founder|required|decision/i.test(i.title))) return { label: "BLOCKED", icon: ShieldAlert, className: "border-danger text-danger" };
  if (issues.length > 0 && commits.length > 0) return { label: "WORKING", icon: Activity, className: "border-accent text-accent" };
  if (issues.length > 0) return { label: "OPEN", icon: Clock3, className: "border-warning text-warning" };
  if (commits.length > 0) return { label: "RECENT", icon: CheckCircle2, className: "border-success text-success" };
  return { label: "IDLE", icon: Clock3, className: "border-line text-muted" };
}

async function github<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);
  return response.json() as Promise<T>;
}

function MissionControlPage() {
  const { user, isPending } = useCurrentUserState();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextIssues, nextCommits, workflow] = await Promise.all([
        github<Issue[]>("/issues?state=open&per_page=100"),
        github<Commit[]>("/commits?per_page=20"),
        github<{ workflow_runs: Run[] }>("/actions/runs?per_page=12"),
      ]);
      setIssues(nextIssues.filter((issue) => !("pull_request" in issue)));
      setCommits(nextCommits);
      setRuns(workflow.workflow_runs);
      setUpdatedAt(new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load GitHub state.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(timer);
  }, [user]);

  if (isPending) return <Shell><div className="mx-auto max-w-6xl px-4 py-16"><div className="h-48 animate-pulse rounded-lg bg-surface" /></div></Shell>;
  if (!user) return <RedirectToSignIn to="/login" />;

  const latestRun = runs[0];
  const failedRun = runs.find((run) => run.conclusion === "failure");

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">GST Desk · internal</p>
            <h1 className="mt-2 text-4xl">Mission Control</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">Live operational view built from GitHub issues, commits and CI. No manual team status is used here.</p>
          </div>
          <Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
        </div>

        {error ? <div className="mt-6 flex items-center gap-3 rounded-lg border border-danger bg-surface p-4 text-sm text-danger"><AlertTriangle className="size-4" />{error}</div> : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-line bg-surface p-5"><p className="text-xs uppercase tracking-wide text-muted">Open work</p><p className="mt-2 text-3xl">{issues.length}</p><p className="mt-1 text-xs text-muted">GitHub issues currently open</p></div>
          <div className="rounded-lg border border-line bg-surface p-5"><p className="text-xs uppercase tracking-wide text-muted">Latest CI</p><p className={`mt-2 text-xl ${latestRun?.conclusion === "success" ? "text-success" : latestRun?.conclusion === "failure" ? "text-danger" : "text-warning"}`}>{latestRun?.conclusion ?? latestRun?.status ?? "—"}</p>{latestRun ? <a className="mt-1 block text-xs text-muted hover:text-fg" href={latestRun.html_url} target="_blank" rel="noreferrer">{latestRun.name} · {new Date(latestRun.created_at).toLocaleString()}</a> : null}</div>
          <div className="rounded-lg border border-line bg-surface p-5"><p className="text-xs uppercase tracking-wide text-muted">Last refresh</p><p className="mt-2 text-xl">{updatedAt ? new Date(updatedAt).toLocaleTimeString() : "—"}</p><p className="mt-1 text-xs text-muted">Auto-refresh every 60 seconds</p></div>
        </div>

        {failedRun ? <div className="mt-5 rounded-lg border border-danger bg-surface p-4"><div className="flex items-center gap-2 text-sm text-danger"><AlertTriangle className="size-4" /><strong>CI failure detected</strong></div><a className="mt-1 block text-xs text-muted hover:text-fg" href={failedRun.html_url} target="_blank" rel="noreferrer">Open failed workflow run</a></div> : null}

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TEAMS.map((team) => {
            const teamIssues = issues.filter((issue) => classify(issue, team));
            const teamCommits = commits.filter((commit) => {
              const message = commit.commit.message.toLowerCase();
              return team.keys.some((key) => message.includes(key));
            });
            const state = statusFor(teamIssues, teamCommits);
            const Icon = state.icon;
            return <article key={team.name} className="rounded-xl border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-muted">{team.owner}</p><h2 className="mt-1 text-xl">{team.name}</h2></div><span className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold tracking-wide ${state.className}`}><Icon className="size-3" />{state.label}</span></div>
              <div className="mt-5 grid grid-cols-2 gap-2 text-sm"><div className="rounded-md border border-line p-3"><p className="text-xs text-muted">Open</p><p className="mt-1 text-lg">{teamIssues.length}</p></div><div className="rounded-md border border-line p-3"><p className="text-xs text-muted">Recent commits</p><p className="mt-1 text-lg">{teamCommits.length}</p></div></div>
              <div className="mt-4 space-y-2">{teamIssues.slice(0, 3).map((issue) => <a key={issue.number} href={issue.html_url} target="_blank" rel="noreferrer" className="block rounded-md border border-line p-3 text-sm hover:border-accent"><span className="font-mono text-xs text-muted">#{issue.number}</span> {issue.title}</a>)}{teamIssues.length === 0 ? <p className="text-sm text-muted">No matching open issue.</p> : null}</div>
            </article>;
          })}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface p-5"><div className="flex items-center gap-2"><GitCommit className="size-4 text-accent" /><h2 className="text-lg">Recent activity</h2></div><div className="mt-4 space-y-3">{commits.slice(0, 8).map((commit) => <a key={commit.sha} href={commit.html_url} target="_blank" rel="noreferrer" className="block border-l-2 border-line pl-3 hover:border-accent"><p className="text-sm">{commit.commit.message.split("\n")[0]}</p><p className="mt-1 text-xs text-muted">{commit.sha.slice(0, 7)} · {commit.commit.author?.date ? new Date(commit.commit.author.date).toLocaleString() : "—"}</p></a>)}</div></div>
          <div className="rounded-xl border border-line bg-surface p-5"><div className="flex items-center gap-2"><Activity className="size-4 text-accent" /><h2 className="text-lg">CI / release signal</h2></div><div className="mt-4 space-y-3">{runs.slice(0, 8).map((run) => <a key={run.id} href={run.html_url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-md border border-line p-3 hover:border-accent"><span className="text-sm">{run.name}</span><span className={`text-xs font-semibold ${run.conclusion === "success" ? "text-success" : run.conclusion === "failure" ? "text-danger" : "text-warning"}`}>{run.conclusion ?? run.status}</span></a>)}</div></div>
        </section>

        <p className="mt-8 text-xs text-muted">Signal rules are intentionally conservative: this page reports repository evidence, not invented autonomous-agent activity. Founder-only decisions remain blockers until evidenced in GitHub.</p>
      </div>
    </Shell>
  );
}
