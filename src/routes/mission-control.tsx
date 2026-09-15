import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, Clock3, GitCommit, RefreshCw, ShieldAlert } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/mission-control")({ component: MissionControlPage });

const REPO = "peppolfixbelgium-debug/GST-Desk";
const API = `https://api.github.com/repos/${REPO}`;
const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

type Issue = { number: number; title: string; body?: string | null; html_url: string; updated_at: string; created_at: string; closed_at?: string | null; state: "open" | "closed"; labels: { name: string }[] };
type Commit = { sha: string; html_url: string; commit: { message: string; author?: { date?: string } } };
type Run = { id: number; name: string; status: string; conclusion: string | null; html_url: string; created_at: string };
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

function isVerification(issue: Issue) {
  const text = `${issue.title} ${issue.body ?? ""}`.toLowerCase();
  return /verify|verification|evidence|audit|acceptance|test|qa|review|reproducible/.test(text);
}

function isMoving(issue: Issue, now: number) {
  return issue.state === "open" && now - new Date(issue.updated_at).getTime() <= FORTY_EIGHT_HOURS;
}

function stageFor(issue: Issue, now: number) {
  if (issue.state === "closed") return { label: "DONE", className: "border-success text-success", Icon: CheckCircle2 };
  if (isBlocked(issue)) return { label: "BLOCKED / GATED", className: "border-danger text-danger", Icon: ShieldAlert };
  if (isVerification(issue)) return { label: "VERIFY", className: "border-warning text-warning", Icon: Clock3 };
  if (isMoving(issue, now)) return { label: "MOVING", className: "border-accent text-accent", Icon: Activity };
  return { label: "OPEN", className: "border-line text-muted", Icon: Clock3 };
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
  const [now, setNow] = useState(Date.now());

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextIssues, nextCommits, workflow] = await Promise.all([
        github<Issue[]>("/issues?state=all&per_page=100"),
        github<Commit[]>("/commits?per_page=24"),
        github<{ workflow_runs: Run[] }>("/actions/runs?per_page=12"),
      ]);
      setIssues(nextIssues.filter((issue) => !("pull_request" in issue)));
      setCommits(nextCommits);
      setRuns(workflow.workflow_runs);
      setUpdatedAt(new Date().toISOString());
      setNow(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load GitHub state.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    void refresh();
    const timer = window.setInterval(() => { setNow(Date.now()); void refresh(); }, 60_000);
    return () => window.clearInterval(timer);
  }, [user]);

  const openIssues = useMemo(() => issues.filter((i) => i.state === "open"), [issues]);
  const moving = useMemo(() => openIssues.filter((i) => isMoving(i, now)), [openIssues, now]);
  const blocked = useMemo(() => openIssues.filter(isBlocked), [openIssues]);
  const done = useMemo(() => issues.filter((i) => i.state === "closed"), [issues]);
  const bottleneck = blocked.slice().sort((a, b) => a.title.localeCompare(b.title))[0];
  const latestRun = runs[0];

  const handoffs = useMemo(() => {
    const byNumber = new Map(issues.map((i) => [i.number, i]));
    const seen = new Set<string>();
    return openIssues.flatMap((issue) => {
      const source = teamFor(issue);
      const refs = (issue.body ?? "").match(/#(\d+)/g) ?? [];
      return refs.flatMap((ref) => {
        const target = byNumber.get(Number(ref.slice(1)));
        if (!target || target.number === issue.number) return [];
        const destination = teamFor(target);
        if (source.name === destination.name) return [];
        const key = `${issue.number}-${target.number}`;
        if (seen.has(key)) return [];
        seen.add(key);
        return [{ source, destination, issue, target }];
      });
    }).slice(0, 8);
  }, [issues, openIssues]);

  if (isPending) return <Shell><div className="mx-auto max-w-7xl px-4 py-16"><div className="h-64 animate-pulse rounded-xl bg-surface" /></div></Shell>;
  if (!user) return <RedirectToSignIn to="/login" />;

  return <Shell>
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.2em] text-accent">Live execution board</p><h1 className="mt-2 text-4xl">CEO Command Center</h1><p className="mt-2 max-w-3xl text-sm text-muted">See work moving across GST Desk teams from GitHub evidence: issues, cross-team references, commits and CI. No manual team status is used.</p></div>
        <Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>

      {error ? <div className="mt-5 flex items-center gap-3 rounded-xl border border-danger bg-surface p-4 text-sm text-danger"><AlertTriangle className="size-4" />{error}</div> : null}

      <div className="mt-7 grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[{ label: "Moving", value: moving.length, note: "updated ≤48h" }, { label: "Blocked / gated", value: blocked.length, note: "needs unblock / decision" }, { label: "Done", value: done.length, note: "closed GitHub issues" }, { label: "Open issues", value: openIssues.length, note: "current execution load" }].map((stat) => <div key={stat.label} className="rounded-xl border border-line bg-surface p-5"><p className="text-xs uppercase tracking-wide text-muted">{stat.label}</p><p className="mt-2 text-3xl">{stat.value}</p><p className="mt-1 text-xs text-muted">{stat.note}</p></div>)}
      </div>

      {bottleneck ? <section className="mt-5 rounded-xl border border-danger bg-surface p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-danger">Current bottleneck</p><h2 className="mt-1 text-xl">{bottleneck.title}</h2><p className="mt-1 text-xs text-muted">#{bottleneck.number} · {teamFor(bottleneck).name} · updated {new Date(bottleneck.updated_at).toLocaleString()}</p></div><a href={bottleneck.html_url} target="_blank" rel="noreferrer" className="rounded-md border border-danger px-3 py-2 text-xs font-semibold text-danger">Fix / inspect</a></div></section> : <section className="mt-5 rounded-xl border border-success bg-surface p-5 text-sm text-success">No currently detected blocked/gated issue in the repository evidence.</section>}

      <section className="mt-8"><div className="flex items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-muted">Team activity</p><h2 className="mt-1 text-2xl">Who is moving what</h2></div><p className="text-xs text-muted">Auto-refresh: 60s · {updatedAt ? `refreshed ${new Date(updatedAt).toLocaleTimeString()}` : "waiting"}</p></div><div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TEAMS.map((team) => {
          const teamIssues = issues.filter((issue) => teamFor(issue).name === team.name);
          const teamOpen = teamIssues.filter((issue) => issue.state === "open");
          const teamMoving = teamOpen.filter((issue) => isMoving(issue, now));
          const teamBlocked = teamOpen.filter(isBlocked);
          const teamDone = teamIssues.filter((issue) => issue.state === "closed");
          const state = teamBlocked.length ? { label: "BLOCKED", cls: "border-danger text-danger" } : teamMoving.length ? { label: "MOVING", cls: "border-accent text-accent" } : teamOpen.length ? { label: "OPEN", cls: "border-warning text-warning" } : { label: "DONE / QUIET", cls: "border-success text-success" };
          return <article key={team.name} className="rounded-xl border border-line bg-surface p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-muted">{team.owner}</p><h3 className="mt-1 text-xl">{team.name}</h3></div><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold tracking-wide ${state.cls}`}>{state.label}</span></div><div className="mt-5 grid grid-cols-4 gap-2 text-center"><div className="rounded-md border border-line p-2"><p className="text-[10px] text-muted">Open</p><p className="mt-1 text-lg">{teamOpen.length}</p></div><div className="rounded-md border border-line p-2"><p className="text-[10px] text-muted">Moving</p><p className="mt-1 text-lg">{teamMoving.length}</p></div><div className="rounded-md border border-line p-2"><p className="text-[10px] text-muted">Gated</p><p className="mt-1 text-lg">{teamBlocked.length}</p></div><div className="rounded-md border border-line p-2"><p className="text-[10px] text-muted">Done</p><p className="mt-1 text-lg">{teamDone.length}</p></div></div><div className="mt-4 space-y-2">{teamOpen.slice(0, 3).map((issue) => { const stage = stageFor(issue, now); const Icon = stage.Icon; return <a key={issue.number} href={issue.html_url} target="_blank" rel="noreferrer" className="block rounded-md border border-line p-3 hover:border-accent"><div className="flex items-center justify-between gap-2"><span className="font-mono text-[11px] text-muted">#{issue.number}</span><span className={`flex items-center gap-1 text-[10px] font-semibold ${stage.className.replace("border-", "").split(" ").pop()}`}><Icon className="size-3" />{stage.label}</span></div><p className="mt-1 text-sm">{issue.title}</p></a>; })}{teamOpen.length === 0 ? <p className="text-sm text-muted">No open work.</p> : null}</div></article>;
        })}
      </div></section>

      <section className="mt-8 rounded-xl border border-line bg-surface p-5"><div className="flex items-center gap-2"><ArrowRight className="size-4 text-accent" /><div><p className="text-xs uppercase tracking-[0.18em] text-muted">Cross-team movement</p><h2 className="mt-1 text-xl">Handoffs and dependencies</h2></div></div><p className="mt-2 text-xs text-muted">Derived from explicit issue references such as “#17” inside issue bodies. This is evidence of a handoff signal, not an invented workflow state.</p><div className="mt-4 space-y-2">{handoffs.map((handoff) => <a key={`${handoff.issue.number}-${handoff.target.number}`} href={handoff.issue.html_url} target="_blank" rel="noreferrer" className="flex flex-wrap items-center gap-2 rounded-md border border-line p-3 text-sm hover:border-accent"><span className="font-semibold">{handoff.source.name}</span><ArrowRight className="size-4 text-muted" /><span className="font-semibold">{handoff.destination.name}</span><span className="text-muted">· #{handoff.issue.number} → #{handoff.target.number}</span><span className="ml-auto text-xs text-muted">open handoff</span></a>)}{handoffs.length === 0 ? <p className="text-sm text-muted">No cross-team references detected in current open issues.</p> : null}</div></section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2"><div className="rounded-xl border border-line bg-surface p-5"><div className="flex items-center gap-2"><GitCommit className="size-4 text-accent" /><h2 className="text-lg">Recent commits</h2></div><div className="mt-4 space-y-3">{commits.slice(0, 10).map((commit) => <a key={commit.sha} href={commit.html_url} target="_blank" rel="noreferrer" className="block border-l-2 border-line pl-3 hover:border-accent"><p className="text-sm">{commit.commit.message.split("\n")[0]}</p><p className="mt-1 text-xs text-muted">{commit.sha.slice(0, 7)} · {commit.commit.author?.date ? new Date(commit.commit.author.date).toLocaleString() : "—"}</p></a>)}</div></div><div className="rounded-xl border border-line bg-surface p-5"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Activity className="size-4 text-accent" /><h2 className="text-lg">CI / release pulse</h2></div><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${latestRun?.conclusion === "success" ? "border-success text-success" : latestRun?.conclusion === "failure" ? "border-danger text-danger" : "border-warning text-warning"}`}>{latestRun?.conclusion ?? latestRun?.status ?? "unknown"}</span></div><div className="mt-4 space-y-2">{runs.slice(0, 8).map((run) => <a key={run.id} href={run.html_url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-md border border-line p-3 hover:border-accent"><span className="text-sm">{run.name}</span><span className="text-xs text-muted">{run.conclusion ?? run.status}</span></a>)}</div></div></section>
      <p className="mt-7 text-xs text-muted">Evidence policy: GitHub is the source of truth. “Moving” means an issue was updated in the last 48 hours; “blocked/gated” is inferred only from explicit blocker/approval/decision language. Team ownership is derived from labels/title/body keywords.</p>
    </div>
  </Shell>;
}
