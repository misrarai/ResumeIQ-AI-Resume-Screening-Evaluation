"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
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

const columnHelper = createColumnHelper<ShortlistEntry>();

interface ResultsTableProps {
  shortlist: ShortlistEntry[];
  onSelect: (candidate: ShortlistEntry) => void;
}

export function ResultsTable({ shortlist, onSelect }: ResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "rank", desc: false }]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("rank", {
        header: "Rank",
        cell: (c) => {
          const rank = c.getValue();
          const medal =
            rank === 1
              ? "bg-amber-400 text-amber-950"
              : rank === 2
                ? "bg-slate-300 text-slate-900"
                : rank === 3
                  ? "bg-orange-300 text-orange-950"
                  : "bg-secondary text-muted-foreground";
          return (
            <span className={`inline-flex h-6 w-9 items-center justify-center rounded-full text-xs font-bold ${medal}`}>
              #{rank}
            </span>
          );
        },
      }),
      columnHelper.accessor("candidate_id", {
        header: "Candidate",
        cell: (c) => <span className="font-semibold text-foreground">{c.getValue()}</span>,
      }),
      columnHelper.accessor("total", {
        header: "Weighted total",
        cell: (c) => <span className="font-bold text-primary">{c.getValue()}</span>,
      }),
      columnHelper.accessor("evidence_count", { header: "Criteria with evidence" }),
      columnHelper.accessor("flags", {
        header: "Flags",
        cell: (c) => (
          <div className="flex flex-wrap gap-1">
            {c.getValue().length === 0 ? (
              <span className="text-xs text-muted-foreground">—</span>
            ) : (
              c.getValue().map((f) => <FlagBadge key={f} flag={f} />)
            )}
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: shortlist,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-card shadow-lg shadow-black/20">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="border-white/10 bg-secondary/40 hover:bg-secondary/40">
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  <button
                    type="button"
                    className="flex items-center gap-1 font-semibold text-foreground"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && <ArrowUpDown className="h-3 w-3 text-muted-foreground" />}
                  </button>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer border-white/5 hover:bg-accent/40"
              onClick={() => onSelect(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {shortlist.length === 0 && (
        <div className="p-6 text-center text-sm text-muted-foreground">No candidates in the shortlist.</div>
      )}
    </div>
  );
}
