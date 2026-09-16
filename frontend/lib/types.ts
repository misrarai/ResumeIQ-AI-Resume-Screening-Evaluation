export interface Criterion {
  name: string;
  weight: number;
  description: string;
}

export interface CriterionScore {
  criterion: string;
  score: number;
  evidence: string;
}

export interface CandidateScore {
  candidate_id: string;
  scores: CriterionScore[];
  flags: string[];
}

export interface ShortlistEntry extends CandidateScore {
  total: number;
  evidence_count: number;
  rank: number;
}

export interface CreateRunResponse {
  run_id: string;
  candidate_ids: string[];
}

export interface RunResult {
  status: "pending" | "running" | "done" | "error";
  rubric: Criterion[];
  candidate_scores: CandidateScore[];
  redaction_log: string[];
  unscreened: string[];
  shortlist: ShortlistEntry[];
  report: string;
  message?: string;
}

export type RunEventType =
  | "rubric_built"
  | "pii_redacted"
  | "candidate_scored"
  | "candidate_failed"
  | "shortlist_ready"
  | "report_ready"
  | "done"
  | "error";

export interface RunEvent {
  type: RunEventType;
  data: unknown;
}
