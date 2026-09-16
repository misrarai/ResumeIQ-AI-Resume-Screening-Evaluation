import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CandidateScore } from "@/lib/types";

interface CandidateProgressGridProps {
  candidateIds: string[];
  scored: Record<string, CandidateScore>;
}

/** Visualizes the parallel fan-out: every candidate starts "queued" and
 * flips to "scored" independently, out of order, as SSE events arrive. */
export function CandidateProgressGrid({ candidateIds, scored }: CandidateProgressGridProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-5 shadow-lg shadow-black/20">
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Scoring candidates in parallel &middot;{" "}
        <span className="text-primary">
          {Object.keys(scored).length}/{candidateIds.length} done
        </span>
      </h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {candidateIds.map((id) => {
          const done = Boolean(scored[id]);
          return (
            <li
              key={id}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                done
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-white/10 bg-secondary/50 text-muted-foreground"
              )}
            >
              {done ? (
                <Check className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              )}
              <span className="truncate">{id}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
