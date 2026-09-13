import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onEmail = async () => {
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({ email, password, name: name || email.split("@")[0] });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.message);
      }
      window.location.href = "/converter";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <div className="mx-auto grid min-h-[70dvh] max-w-md place-items-center px-4 py-16">
        <div className="w-full rounded-lg border border-line bg-surface p-6">
          <h1 className="text-2xl">Sign in</h1>
          <p className="mt-2 text-sm text-muted">
            Fixing invoices requires an account. Free: 5 GST invoices per calendar month, reset automatically.
          </p>
          {authEnabled ? (
            <div className="mt-6 space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/converter" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Sign-in is disabled.</p>
          )}
          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted">
            <span className="h-px flex-1 bg-line" />
            Email
            <span className="h-px flex-1 bg-line" />
          </div>
          {mode === "up" ? (
            <label className="mb-3 block text-xs text-muted">
              Name
              <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
          ) : null}
          <label className="mb-3 block text-xs text-muted">
            Email
            <Input
              className="mt-1"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="mb-4 block text-xs text-muted">
            Password
            <Input
              className="mt-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "up" ? "new-password" : "current-password"}
            />
          </label>
          {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
          <Button className="w-full" disabled={busy || !email || !password} onClick={onEmail}>
            {mode === "up" ? "Create account" : "Continue with email"}
          </Button>
          <button
            type="button"
            className="mt-4 text-sm text-accent underline"
            onClick={() => setMode(mode === "up" ? "in" : "up")}
          >
            {mode === "up" ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
          <p className="mt-6 text-center text-xs text-muted">
            <Link to="/">Back home</Link>
          </p>
        </div>
      </div>
    </Shell>
  );
}
