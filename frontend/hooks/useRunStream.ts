"use client";

import { useEffect, useRef, useState } from "react";
import { streamUrl } from "@/lib/api";
import type {
  CandidateScore,
  Criterion,
  ShortlistEntry,
} from "@/lib/types";

export type RunPhase =
  | "connecting"
  | "building_rubric"
  | "redacting"
  | "scoring"
  | "ranking"
  | "writing_report"
  | "done"
  | "error";

export interface RunStreamState {
  phase: RunPhase;
  rubric: Criterion[];
  redactionLog: string[];
  unscreened: string[];
  candidateScores: Record<string, CandidateScore>;
  shortlist: ShortlistEntry[];
  report: string;
  errorMessage: string | null;
}

const initialState: RunStreamState = {
  phase: "connecting",
  rubric: [],
  redactionLog: [],
  unscreened: [],
  candidateScores: {},
  shortlist: [],
  report: "",
  errorMessage: null,
};

/** Subscribes to the live SSE progress feed for a run. Push-based, so it
 * lives outside React Query's pull/cache model (see plan doc). */
export function useRunStream(runId: string | null) {
  const [state, setState] = useState<RunStreamState>(initialState);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!runId) return;
    // Reset stale state from a previous runId before opening the new stream.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(initialState);

    const source = new EventSource(streamUrl(runId));
    sourceRef.current = source;

    source.addEventListener("rubric_built", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState((s) => ({ ...s, phase: "redacting", rubric: data.rubric }));
    });

    source.addEventListener("pii_redacted", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState((s) => ({
        ...s,
        phase: "scoring",
        redactionLog: data.redaction_log ?? [],
        unscreened: [...s.unscreened, ...(data.unscreened ?? [])],
      }));
    });

    source.addEventListener("candidate_scored", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as CandidateScore;
      setState((s) => ({
        ...s,
        phase: "scoring",
        candidateScores: { ...s.candidateScores, [data.candidate_id]: data },
      }));
    });

    source.addEventListener("candidate_failed", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState((s) => ({
        ...s,
        unscreened: [...s.unscreened, ...(data.unscreened ?? [])],
      }));
    });

    source.addEventListener("shortlist_ready", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState((s) => ({ ...s, phase: "writing_report", shortlist: data.shortlist }));
    });

    source.addEventListener("report_ready", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState((s) => ({ ...s, report: data.report }));
    });

    source.addEventListener("done", () => {
      setState((s) => ({ ...s, phase: "done" }));
      source.close();
    });

    source.addEventListener("error", (e) => {
      let message = "We lost connection to the server. Please try again.";
      const raw = (e as MessageEvent).data;
      if (raw) {
        try {
          message = JSON.parse(raw).message ?? message;
        } catch {
          /* not a JSON payload, keep default */
        }
      }
      setState((s) => ({ ...s, phase: "error", errorMessage: message }));
      source.close();
    });

    return () => {
      source.close();
    };
  }, [runId]);

  return state;
}
