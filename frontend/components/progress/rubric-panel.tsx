import { Skeleton } from "@/components/ui/skeleton";
import type { Criterion } from "@/lib/types";

export function RubricPanel({ rubric }: { rubric: Criterion[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-5 shadow-lg shadow-black/20">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Scoring rubric</h3>
      {rubric.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {rubric.map((c) => (
            <li key={c.name}>
              <span
                title={c.description}
                className="inline-flex items-center rounded-full border border-white/10 bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
              >
                {c.name} <span className="ml-1 text-primary">w{c.weight}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
