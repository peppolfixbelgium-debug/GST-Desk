import { Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";

type Props = {
  code: string;
  title: string;
  meaning: string;
  checks: string[];
  supportedFix: string;
  source: string;
};

export function GstErrorGuide({ code, title, meaning, checks, supportedFix, source }: Props) {
  return (
    <Shell>
      <article className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">GST e-invoice error guide</p>
        <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{code}: {title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">{meaning}</p>

        <section className="mt-10 rounded-lg border border-line bg-surface p-6">
          <h2 className="text-xl">What to check</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed">
            {checks.map((check) => <li key={check}>{check}</li>)}
          </ul>
        </section>

        <section className="mt-6 rounded-lg border border-line bg-surface p-6">
          <h2 className="text-xl">What GST Desk can do</h2>
          <p className="mt-3 text-sm leading-relaxed">{supportedFix}</p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/converter"><Button>Fix a JSON</Button></Link>
          <Link to="/"><Button variant="outline">Back to GST Desk</Button></Link>
        </div>

        <p className="mt-10 border-t border-line pt-5 text-xs leading-relaxed text-muted">
          Source: {source}. Reviewed for this launch against the published IRP guidance. GST Desk validation is a pre-check;
          it does not file an IRN and cannot guarantee acceptance by an IRP.
        </p>
      </article>
    </Shell>
  );
}
