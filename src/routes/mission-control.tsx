import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock3, GitCommit, RefreshCw, ShieldAlert } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isAdminEmail } from "@/lib/auth/roles";

export const Route = createFileRoute("/mission-control")({ component: MissionControlPage });

const REPO = "peppolfixbelgium-debug/GST-Desk";
const API = `https://api.github.com/repos/${REPO}`;
const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

type Issue = { number: number; title: string; body?: string | null; html_url: string; updated_at: string; state: "open" | "closed"; labels: { name: string }[] };
type Commit = { sha: string; html_url: string; commit: { message: string; author?: { date?: string } } };
type Run = { id: number; name: string; status: string; conclusion: string | null; html_url: string };
type Team = { name: string; keys: string[]; owner: string };

const TEAMS: Team[] = [
  { name: "CEO / PMO", keys: ["pmo", "ceo", "release", "governance"], owner: "Release control" },
  { name: "TECH / QA", keys: ["tech", "qa", "security", "ci", "quota", "resource", "e2e"], owner: "Engineering + quality" },
  { name: "GST / R&D", keys: ["gst", "r&d", "rd", "hsn", "irn", "rule", "validation"], owner: "Rules + product intelligence" },
  { name: "LEGAL / COMPANY", keys: ["legal", "privacy", "terms", "company", "tax", "gdpr", "retention"], owner: "Launch compliance" },
  { name: "PRICING", keys: ["pricing", "billing", "payment", "stripe", "commercial"], owner: "Commercial model" },
  { name: "ACQUISITION", keys: ["acquisition", "customer", "growth", "marketing", "seo", "prospect", "design partner"], owner: "Demand + activation" },
];

function teamFor(issue: Issue): Team {
  const text = `${issue.title} ${issue.labels.map((l) => l.name).join(" ")} ${issue.body ?? ""}`.toLowerCase();
  return TEAMS.find((team) => team.keys.some((key) => text.includes(key))) ?? TEAMS[0];
}
function isBlocked(issue: Issue) {
  const text = `${issue.title} ${issue.labels.map((l) => l.name).join(" ")} ${issue.body ?? ""}`.toLowerCase();
  return /blocked|founder|approval|approve|decision|external gate|waiting on|dependency/.test(text);
}
function isMoving(issue: Issue, now: number) { return issue.state === "open" && now - new Date(issue.updated_at).getTime() <= FORTY_EIGHT_HOURS; }
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
  const [now, setNow] = useState(Date.now());

  const refresh = async () => {
    setLoading(true); setError(null);
    try {
      const [nextIssues, nextCommits, workflow] = await Promise.all([
        github<Issue[]>("/issues?state=all&per_page=100"),
        github<Commit[]>("/commits?per_page=24"),
        github<{ workflow_runs: Run[] }>("/actions/runs?per_page=12"),
      ]);
      setIssues(nextIssues.filter((issue) => !("pull_request" in issue)));
      setCommits(nextCommits); setRuns(workflow.workflow_runs); setUpdatedAt(new Date().toISOString()); setNow(Date.now());
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load GitHub state."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!user || !isAdminEmail(user.primaryEmail)) return;
    void refresh();
    const timer = window.setInterval(() => { setNow(Date.now()); void refresh(); }, 60_000);
    return () => window.clearInterval(timer);
  }, [user]);

  const openIssues = useMemo(() => issues.filter((i) => i.state === "open"), [issues]);
  const moving = useMemo(() => openIssues.filter((i) => isMoving(i, now)), [openIssues, now]);
  const blocked = useMemo(() => openIssues.filter(isBlocked), [openIssues]);
  const done = useMemo(() => issues.filter((i) => i.state === "closed"), [issues]);
  const latestRun = runs[0];

  if (isPending) return <Shell><div className="mx-auto max-w-7xl px-4 py-16"><div className="h-64 animate-pulse rounded-xl bg-surface" /></div></Shell>;
  if (!user) return <RedirectToSignIn to="/login" />;
  if (!isAdminEmail(user.primaryEmail)) return <Shell><div className="mx-auto max-w-xl px-4 py-20 text-center"><ShieldAlert className="mx-auto size-10 text-danger" /><h1 className="mt-4 text-3xl">Admin access required</h1><p className="mt-2 text-sm text-muted">CEO Command Center is restricted to the GST Desk founder admin account.</p></div></Shell>;

  return <Shell>
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-accent">Live execution board · Admin only</p><h1 className="mt-2 text-4xl">CEO Command Center</h1><p className="mt-2 max-w-3xl text-sm text-muted">GitHub is the execution engine. This board turns issues, commits and CI into a live view of what is moving, blocked or complete.</p></div><Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button></div>
      {error ? <div className="mt-5 flex items-center gap-3 rounded-xl border border-danger bg-surface p-4 text-sm text-danger"><AlertTriangle className="size-4" />{error}</div> : null}

      <div className="mt-7 grid gap-3 grid-cols-2 lg:grid-cols-4">{[{ label: "Moving", value: moving.length, note: "updated ≤48h" }, { label: "Blocked / gated", value: blocked.length, note: "needs unblock / decision" }, { label: "Done", value: done.length, note: "closed GitHub issues" }, { label: "Open issues", value: openIssues.length, note: "current execution load" }].map((stat) => <div key={stat.label} className="rounded-xl border border-line bg-surface p-5"><p className="text-xs uppercase tracking-wide text-muted">{stat.label}</p><p className="mt-2 text-3xl">{stat.value}</p><p className="mt-1 text-xs text-muted">{stat.note}</p></div>)}</div>

      {blocked[0] ? <section className="mt-5 rounded-xl border border-danger bg-surface p-5"><p className="text-xs uppercase tracking-[0.18em] text-danger">Current bottleneck</p><h2 className="mt-1 text-xl">{blocked[0].title}</h2><p className="mt-1 text-xs text-muted">#{blocked[0].number} · {teamFor(blocked[0]).name} · updated {new Date(blocked[0].updated_at).toLocaleString()}</p><a href={blocked[0].html_url} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-md border border-danger px-3 py-2 text-xs font-semibold text-danger">Fix / inspect</a></section> : null}

      <section className="mt-8"><div className="flex items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-muted">Team activity</p><h2 className="mt-1 text-2xl">Who is moving what</h2></div><p className="text-xs text-muted">Auto-refresh: 60s · {updatedAt ? `refreshed ${new Date(updatedAt).toLocaleTimeString()}` : "waiting"}</p></div><div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{TEAMS.map((team) => { const teamIssues = issues.filter((issue) => teamFor(issue).name === team.name); const teamOpen = teamIssues.filter((issue) => issue.state === "open"); const teamMoving = teamOpen.filter((issue) => isMoving(issue, now)); const teamBlocked = teamOpen.filter(isBlocked); const teamDone = teamIssues.filter((issue) => issue.state === "closed"); const state = teamBlocked.length ? "BLOCKED" : teamMoving.length ? "MOVING" : teamOpen.length ? "OPEN" : "DONE / QUIET"; return <article key={team.name} className="rounded-xl border border-line bg-surface p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-muted">{team.owner}</p><h3 className="mt-1 text-xl">{team.name}</h3></div><span className="rounded-full border border-line px-2 py-1 text-[10px] font-semibold tracking-wide">{state}</span></div><div className="mt-5 grid grid-cols-4 gap-2 text-center"><div className="rounded-md border border-line p-2"><p className="text-[10px] text-muted">Open</p><p className="mt-1 text-lg">{teamOpen.length}</p></div><div className="rounded-md border border-line p-2"><p className="text-[10px] text-muted">Moving</p><p className="mt-1 text-lg">{teamMoving.length}</p></div><div className="rounded-md border border-line p-2"><p className="text-[10px] text-muted">Gated</p><p className="mt-1 text-lg">{teamBlocked.length}</p></div><div className="rounded-md border border-line p-2"><p className="text-[10px] text-muted">Done</p><p className="mt-1 text-lg">{teamDone.length}</p></div></div><div className="mt-4 space-y-2">{teamOpen.slice(0, 3).map((issue) => <a key={issue.number} href={issue.html_url} target="_blank" rel="noreferrer" className="block rounded-md border border-line p-3 hover:border-accent"><div className="flex items-center justify-between gap-2"><span className="font-mono text-[11px] text-muted">#{issue.number}</span><span className="text-[10px] font-semibold">{isBlocked(issue) ? "BLOCKED" : isMoving(issue, now) ? "MOVING" : "OPEN"}</span></div><p className="mt-1 text-sm">{issue.title}</p></a>)}{teamOpen.length === 0 ? <p className="text-sm text-muted">No open work.</p> : null}</div></article>; })}</div></section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2"><div className="rounded-xl border border-line bg-surface p-5"><div className="flex items-center gap-2"><GitCommit className="size-4 text-accent" /><h2 className="text-lg">Recent commits</h2></div><div className="mt-4 space-y-3">{commits.slice(0, 10).map((commit) => <a key={commit.sha} href={commit.html_url} target="_blank" rel="noreferrer" className="block border-l-2 border-line pl-3 hover:border-accent"><p className="text-sm">{commit.commit.message.split("\n")[0]}</p><p className="mt-1 text-xs text-muted">{commit.sha.slice(0, 7)} · {commit.commit.author?.date ? new Date(commit.commit.author.date).toLocaleString() : "—"}</p></a>)}</div></div><div className="rounded-xl border border-line bg-surface p-5"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Activity className="size-4 text-accent" /><h2 className="text-lg">CI / release pulse</h2></div><span className="rounded-full border border-line px-2 py-1 text-[10px] font-semibold">{latestRun?.conclusion ?? latestRun?.status ?? "unknown"}</span></div><div className="mt-4 space-y-2">{runs.slice(0, 8).map((run) => <a key={run.id} href={run.html_url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-md border border-line p-3 hover:border-accent"><span className="text-sm">{run.name}</span><span className="text-xs text-muted">{run.conclusion ?? run.status}</span></a>)}</div></div></section>
      <p className="mt-7 text-xs text-muted">Evidence policy: GitHub is the source of truth. “Moving” means an issue was updated in the last 48 hours; “blocked/gated” is inferred only from explicit blocker/approval/decision language.</p>
    </div>
  </Shell>;
}
