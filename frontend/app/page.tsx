import { ClipboardList, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";
import { NewScreeningForm } from "@/components/upload/new-screening-form";

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Weighted rubric",
    description: "Auto-derived from the job description, every criterion scored 0-5 with evidence.",
  },
  {
    icon: ShieldCheck,
    title: "PII redacted first",
    description: "Names, contact info, age, and other protected attributes never reach the model.",
  },
  {
    icon: ScanSearch,
    title: "Parallel screening",
    description: "Every resume is scored concurrently, then ranked into an auditable shortlist.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Bias-aware AI screening
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Screen every resume <span className="text-primary">fairly &amp; fast</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Write a job description and drop in your candidates. ResumeIQ builds a weighted rubric,
            redacts personal information before any resume is scored, and hands back a ranked,
            evidence-backed shortlist.
          </p>
        </div>

        <dl className="mt-12 grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-card p-5 shadow-lg shadow-black/20 transition-transform hover:-translate-y-1"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <dt className="mt-4 text-sm font-semibold text-foreground">{f.title}</dt>
              <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground">
          Start a new <span className="text-primary">screening</span>
        </h2>
        <NewScreeningForm />
      </div>
    </main>
  );
}
