import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  GitCommitHorizontal,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/mission-control")({ component: MissionControlPage });

const ADMIN_EMAIL = "peppolfixbelgium@gmail.com";
const API = "https://api.github.com/repos/peppolfixbelgium-debug/GST-Desk";
const TEAM_ORDER = ["Engineering", "QA / DQM", "R&D", "Growth", "Stripe", "Legal / GDPR", "Company / Tax", "Pricing"] as const;
type TeamName = (typeof TEAM_ORDER)[number];

type Issue = {
  number: number;
  title: string;
  state: "open" | "closed";
  updated_at: string;
  html_url: string;
  labels?: { name: string }[];
};
type Run = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  head_sha?: string;
  created_at?: string;
};
type Commit = {
  sha: string;
  html_url: string;
  commit: { message: string; author?: { date?: string } };
};

type TeamConfig = {
  description: string;
  match: (issue: Issue) => boolean;
  blockedWhenOpen?: (issue: Issue) => boolean;
};

function isAdmin(email: string | null | undefined) {
  return email?.trim().toLowerCase() === ADMIN_EMAIL;
}

async function api<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);
  return response.json() as Promise<T>;
}

const TEAM_CONFIG: Record<TeamName, TeamConfig> = {
  Engineering: {
    description: "Master development and production QA tracker",
    match: (i) => /^(TECH|ENGINEERING|DEV|AUTH|SECURITY)/i.test(i.title) || [1, 3, 17, 22].includes(i.number),
  },
  "QA / DQM": {
    description: "Production evidence, regression and independent quality gates",
    match: (i) => /^(QA|DQM|PMO|AGILE|CEO)/i.test(i.title) || [10, 18].includes(i.number),
    blockedWhenOpen: (i) => /P0|quality|gate|production/i.test(i.title),
  },
  "R&D": {
    description: "GST / IRP rules and validation intelligence",
    match: (i) => /^(R&D|RD)/i.test(i.title) || i.number === 14,
    blockedWhenOpen: (i) => /P0|hardening|validation/i.test(i.title),
  },
  Growth: {
    description: "Customer acquisition, readiness and launch evidence",
    match: (i) => /^(ACQUISITION|GROWTH|SEO|CUSTOMER)/i.test(i.title) || i.number === 12,
  },
  Stripe: {
    description: "Payments, checkout and entitlement architecture",
    match: (i) => /^(STRIPE|BILLING|PAYMENTS)/i.test(i.title) || i.number === 19,
    blockedWhenOpen: (i) => /P0|billing|checkout/i.test(i.title),
  },
  "Legal / GDPR": {
    description: "Professional review, privacy, retention and rights gates",
    match: (i) => /^(LEGAL|GDPR|PRIVACY)/i.test(i.title) || i.number === 13,
    blockedWhenOpen: (i) => /P0|launch|compliance/i.test(i.title),
  },
  "Company / Tax": {
    description: "Company, tax, ownership and operating readiness",
    match: (i) => /^(COMPANY|TAX)/i.test(i.title) || i.number === 21,
    blockedWhenOpen: (i) => /P0|operational/i.test(i.title),
  },
  Pricing: {
    description: "Commercial strategy, pricing and launch billing readiness",
    match: (i) => /^(PRICING)/i.test(i.title) || [19, 20].includes(i.number),
    blockedWhenOpen: (i) => /P0|pricing|billing/i.test(i.title),
  },
};

function formatAge(date: string | undefined) {
  if (!date) return "—";
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function MissionControlPage() {
  const { user, isPending } = useCurrentUserState();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextIssues, workflow, nextCommits] = await Promise.all([
        api<Issue[]>("/issues?state=all&per_page=100"),
        api<{ workflow_runs: Run[] }>("/actions/runs?per_page=12"),
        api<Commit[]>("/commits?per_page=8"),
      ]);
      setIssues(nextIssues.filter((issue) => !("pull_request" in issue)));
      setRuns(workflow.workflow_runs);
      setCommits(nextCommits);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load GitHub state.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin(user.primaryEmail)) void refresh();
  }, [user]);

  const open = useMemo(() => issues.filter((i) => i.state === "open"), [issues]);
  const done = useMemo(() => issues.filter((i) => i.state === "closed"), [issues]);
  const moving = useMemo(
    () => open.filter((i) => Date.now() - new Date(i.updated_at).getTime() <= 48 * 60 * 60 * 1000),
    [open],
  );
  const latest = runs[0];
  const blocked = open.filter((issue) => /P0|BLOCKED|GATE|EXTERNAL/i.test(issue.title)).length;
  const gatedDone = done.filter((issue) => /P0|GATE|READY|RELEASE/i.test(issue.title)).length;
  const bottleneck = latest?.conclusion === "failure"
    ? `Repository CI failure · ${latest.name}`
    : blocked > 0
      ? `${blocked} launch blocker${blocked === 1 ? "" : "s"} require attention`
      : "No active release bottleneck detected";

  if (isPending) {
    return <Shell><div className="mx-auto max-w-7xl px-4 py-16"><div className="h-48 animate-pulse rounded-xl bg-surface" /></div></Shell>;
  }
  if (!user) return <RedirectToSignIn to="/login" />;
  if (!isAdmin(user.primaryEmail)) {
    return <Shell><div className="mx-auto max-w-xl px-4 py-20 text-center"><ShieldAlert className="mx-auto size-10 text-danger" /><h1 className="mt-4 text-3xl">Admin access required</h1><p className="mt-2 text-sm text-muted">CEO Command Center is restricted to the founder admin account.</p></div></Shell>;
  }

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent"><Activity className="size-3.5" />Live execution board · Admin only</div>
            <h1 className="mt-2 text-4xl">CEO Command Center</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted">GitHub is the execution engine. This cockpit turns issues, CI, commits and gates into one live view of what is moving, blocked and ready.</p>
          </div>
          <Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
        </div>

        {error ? <p className="mt-5 rounded-lg border border-danger p-4 text-sm text-danger">{error}</p> : null}

        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Moving", moving.length, Activity],
            ["Blocked / gated", blocked, AlertCircle],
            ["Done / gated", gatedDone, CheckCircle2],
            ["Open issues", open.length, Clock3],
          ].map(([label, value, Icon]) => {
            const MetricIcon = Icon as typeof Activity;
            return <div key={String(label)} className="rounded-xl border border-line bg-surface p-5"><div className="flex items-center justify-between"><p className="text-xs uppercase tracking-wide text-muted">{String(label)}</p><MetricIcon className="size-4 text-muted" /></div><p className="mt-2 text-2xl">{String(value)}</p></div>;
          })}
        </div>

        <section className="mt-6 rounded-xl border border-line bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs uppercase tracking-[0.18em] text-muted">Current bottleneck</p><h2 className="mt-1 text-xl">{bottleneck}</h2><p className="mt-1 text-sm text-muted">The board stays execution-focused: failed CI and explicit P0 gates surface before feature work.</p></div>
            {latest?.conclusion === "failure" ? <a href={latest.html_url} target="_blank" rel="noreferrer" className="rounded-md border border-danger px-3 py-2 text-xs uppercase tracking-wide text-danger">Fix now <ArrowUpRight className="ml-1 inline size-3" /></a> : null}
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-end justify-between"><div><p className="text-xs uppercase tracking-[0.18em] text-muted">Team activity</p><h2 className="mt-1 text-xl">Execution by workstream</h2></div><span className="text-xs text-muted">Auto-refresh on demand · refreshed {formatAge(new Date().toISOString())}</span></div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {TEAM_ORDER.map((team) => {
              const config = TEAM_CONFIG[team];
              const teamIssues = issues.filter(config.match);
              const teamOpen = teamIssues.filter((i) => i.state === "open");
              const teamDone = teamIssues.filter((i) => i.state === "closed");
              const teamBlocked = teamOpen.filter((i) => config.blockedWhenOpen?.(i) ?? /P0|BLOCKED|GATE/i.test(i.title));
              const status = teamBlocked.length ? "BLOCKED / GATED" : teamOpen.length ? "MOVING" : teamDone.length ? "DONE / GATED" : "NO OPEN WORK";
              const statusClass = teamBlocked.length ? "text-danger" : teamOpen.length ? "text-accent" : "text-muted";
              return <div key={team} className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-medium">{team}</h3><span className={`text-[10px] uppercase tracking-wide ${statusClass}`}>{status}</span></div><p className="mt-2 min-h-10 text-xs leading-5 text-muted">{config.description}</p><div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted">{teamOpen.slice(0, 3).map((issue) => <a key={issue.number} href={issue.html_url} target="_blank" rel="noreferrer" className="rounded border border-line px-2 py-1 hover:border-accent">#{issue.number}</a>)}{!teamOpen.length && teamDone.length ? <span>{teamDone.length} gated item{teamDone.length === 1 ? "" : "s"} closed</span> : null}</div></div>;
            })}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <section className="rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.18em] text-muted">Open work</p><h2 className="mt-1 text-xl">Launch queue</h2></div><span className="text-xs text-muted">{open.length} open</span></div>
            <div className="mt-4 space-y-2">{open.slice(0, 12).map((issue) => <a key={issue.number} href={issue.html_url} target="_blank" rel="noreferrer" className="block rounded-md border border-line p-3 hover:border-accent"><div className="flex items-center justify-between gap-3"><span className="font-mono text-xs text-muted">#{issue.number}</span><span className="text-[10px] uppercase tracking-wide text-muted">updated {formatAge(issue.updated_at)}</span></div><p className="mt-1 text-sm">{issue.title}</p></a>)}</div>
          </section>

          <section className="rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.18em] text-muted">CI / release pulse</p><h2 className="mt-1 text-xl">Delivery signal</h2></div><span className={`text-xs uppercase ${latest?.conclusion === "failure" ? "text-danger" : "text-accent"}`}>{latest?.conclusion ?? latest?.status ?? "—"}</span></div>
            <div className="mt-4 space-y-2">{runs.slice(0, 6).map((run) => <a key={run.id} href={run.html_url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-md border border-line p-3"><span className="min-w-0 truncate text-sm">{run.name}</span><span className={`shrink-0 text-[10px] uppercase ${run.conclusion === "failure" ? "text-danger" : run.conclusion === "success" ? "text-accent" : "text-muted"}`}>{run.conclusion ?? run.status}</span></a>)}</div>
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.18em] text-muted">Recent commits</p><h2 className="mt-1 text-xl">Repository activity</h2></div><GitCommitHorizontal className="size-5 text-muted" /></div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">{commits.map((commit) => <a key={commit.sha} href={commit.html_url} target="_blank" rel="noreferrer" className="rounded-md border border-line p-3 hover:border-accent"><div className="flex items-center justify-between gap-3"><span className="font-mono text-[10px] text-muted">{commit.sha.slice(0, 7)}</span><span className="text-[10px] text-muted">{formatAge(commit.commit.author?.date)}</span></div><p className="mt-1 truncate text-sm">{commit.commit.message.split("\n")[0]}</p></a>)}</div>
        </section>
      </div>
    </Shell>
  );
}
