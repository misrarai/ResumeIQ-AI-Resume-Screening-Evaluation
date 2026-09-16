"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Award, ListChecks, Users } from "lucide-react";
import { getRun } from "@/lib/api";
import { useRunStream } from "@/hooks/useRunStream";
import { useCandidateIds } from "@/hooks/useCandidateIds";
import { ProgressStepper } from "@/components/progress/progress-stepper";
import { RubricPanel } from "@/components/progress/rubric-panel";
import { CandidateProgressGrid } from "@/components/progress/candidate-progress-grid";
import { ResultsTable } from "@/components/results/results-table";
import { CandidateDetailSheet } from "@/components/results/candidate-detail-sheet";
import { ReportDownloadButtons } from "@/components/results/report-download-buttons";
import { ReportView } from "@/components/results/report-view";
import type { ShortlistEntry } from "@/lib/types";

export default function RunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = use(params);
  const [selected, setSelected] = useState<ShortlistEntry | null>(null);

  const initialQuery = useQuery({
    queryKey: ["run", runId],
    queryFn: () => getRun(runId),
    retry: false,
  });

  const alreadyDone = initialQuery.data?.status === "done";
  const stream = useRunStream(alreadyDone ? null : runId);

  const candidateIds = useCandidateIds(runId);

  if (initialQuery.isLoading) {
    return <PageShell>Loading your results…</PageShell>;
  }

  if (initialQuery.data?.status === "error") {
    return (
      <PageShell>
        <ErrorCard message={initialQuery.data.message ?? "Something went wrong during this screening."} />
      </PageShell>
    );
  }

  const rubric = alreadyDone ? initialQuery.data!.rubric : stream.rubric;
  const shortlist = alreadyDone ? initialQuery.data!.shortlist : stream.shortlist;
  const report = alreadyDone ? initialQuery.data!.report : stream.report;
  const candidateScores = alreadyDone
    ? Object.fromEntries(initialQuery.data!.candidate_scores.map((c) => [c.candidate_id, c]))
    : stream.candidateScores;
  const isDone = alreadyDone || stream.phase === "done";
  const isError = !alreadyDone && stream.phase === "error";

  const knownCandidateIds = candidateIds.length > 0 ? candidateIds : Object.keys(candidateScores);

  return (
    <PageShell>
      {isError && <ErrorCard message={stream.errorMessage ?? "The run failed."} />}

      {!isDone && !isError && (
        <div className="space-y-6">
          <ProgressStepper phase={stream.phase} />
          <RubricPanel rubric={rubric} />
          {knownCandidateIds.length > 0 && (
            <CandidateProgressGrid candidateIds={knownCandidateIds} scored={candidateScores} />
          )}
        </div>
      )}

      {isDone && (
        <div className="space-y-6">
          <StatStrip shortlist={shortlist} totalScreened={Object.keys(candidateScores).length} />

          <RubricPanel rubric={rubric} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Ranked <span className="text-primary">Shortlist</span>
            </h2>
            <ReportDownloadButtons runId={runId} />
          </div>
          <ResultsTable shortlist={shortlist} onSelect={setSelected} />

          {report && (
            <div className="rounded-2xl border border-white/10 bg-card p-5 shadow-lg shadow-black/20 sm:p-6">
              <ReportView report={report} />
            </div>
          )}
        </div>
      )}

      <CandidateDetailSheet candidate={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </PageShell>
  );
}

function StatStrip({ shortlist, totalScreened }: { shortlist: ShortlistEntry[]; totalScreened: number }) {
  const top = shortlist[0];
  const avg =
    shortlist.length > 0
      ? Math.round(shortlist.reduce((sum, c) => sum + c.total, 0) / shortlist.length)
      : 0;

  const stats = [
    { icon: Users, label: "Candidates screened", value: String(totalScreened) },
    { icon: Award, label: "Top candidate", value: top ? `${top.candidate_id} (${top.total})` : "—" },
    { icon: ListChecks, label: "Average shortlist score", value: String(avg) },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card p-4 shadow-lg shadow-black/20"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <s.icon className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:opacity-80"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> New screening
        </Link>
        {children}
      </div>
    </main>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
      <h3 className="flex items-center gap-2 text-sm font-bold text-rose-400">
        <AlertCircle className="h-4 w-4" /> Screening failed
      </h3>
      <p className="mt-1 text-sm text-rose-300">{message}</p>
    </div>
  );
}
