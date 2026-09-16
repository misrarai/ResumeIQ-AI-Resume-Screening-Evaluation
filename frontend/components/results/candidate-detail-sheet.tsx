import { ShieldCheck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FlagBadge } from "./flag-badge";
import type { ShortlistEntry } from "@/lib/types";

interface CandidateDetailSheetProps {
  candidate: ShortlistEntry | null;
  onOpenChange: (open: boolean) => void;
}

export function CandidateDetailSheet({ candidate, onOpenChange }: CandidateDetailSheetProps) {
  return (
    <Sheet open={candidate !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {candidate && (
          <>
            <SheetHeader className="border-b border-white/10 bg-secondary/40">
              <SheetTitle className="text-foreground">{candidate.candidate_id}</SheetTitle>
              <SheetDescription>
                Rank #{candidate.rank} &middot; weighted total{" "}
                <span className="font-bold text-primary">{candidate.total}</span>
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 px-4 pb-4">
              <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Name, contact info, age, and other protected attributes were redacted before this
                resume was ever seen by the AI.
              </div>

              {candidate.flags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {candidate.flags.map((f) => (
                    <FlagBadge key={f} flag={f} />
                  ))}
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 bg-secondary/40 hover:bg-secondary/40">
                    <TableHead>Criterion</TableHead>
                    <TableHead className="w-14 text-center">Score</TableHead>
                    <TableHead>Evidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidate.scores.map((s) => (
                    <TableRow key={s.criterion} className="border-white/5">
                      <TableCell className="font-medium text-foreground">{s.criterion}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            s.score === 0
                              ? "bg-secondary text-muted-foreground"
                              : s.score <= 2
                                ? "bg-rose-500/15 text-rose-400"
                                : s.score <= 4
                                  ? "bg-amber-500/15 text-amber-400"
                                  : "bg-emerald-500/15 text-emerald-400"
                          }`}
                        >
                          {s.score}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.evidence === "none" ? (
                          <span className="italic">no evidence</span>
                        ) : (
                          `"${s.evidence}"`
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
