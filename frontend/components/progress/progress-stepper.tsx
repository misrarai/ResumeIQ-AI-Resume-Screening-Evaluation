import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RunPhase } from "@/hooks/useRunStream";

const STEPS: { phase: RunPhase; label: string }[] = [
  { phase: "building_rubric", label: "Building rubric" },
  { phase: "redacting", label: "Redacting PII" },
  { phase: "scoring", label: "Scoring candidates" },
  { phase: "writing_report", label: "Ranking & writing report" },
];

const ORDER: RunPhase[] = [
  "connecting",
  "building_rubric",
  "redacting",
  "scoring",
  "writing_report",
  "done",
];

export function ProgressStepper({ phase }: { phase: RunPhase }) {
  const currentIndex = ORDER.indexOf(phase === "error" ? "done" : phase);

  return (
    <div className="rounded-2xl border border-white/10 bg-card p-5 shadow-lg shadow-black/20">
      <ol className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-0">
        {STEPS.map((step, i) => {
          const stepIndex = ORDER.indexOf(step.phase);
          const isDone = currentIndex > stepIndex || phase === "done";
          const isActive = currentIndex === stepIndex && phase !== "done";
          return (
            <li key={step.phase} className="flex flex-1 items-center gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                    (isDone || isActive) && "glow-ring bg-primary text-primary-foreground",
                    !isDone && !isActive && "bg-secondary text-muted-foreground"
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold whitespace-nowrap",
                    (isDone || isActive) && "text-foreground",
                    !isDone && !isActive && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={cn("hidden h-0.5 flex-1 rounded-full sm:block", isDone ? "bg-primary" : "bg-white/10")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
