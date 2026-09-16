import type { CreateRunResponse, RunResult } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export interface NewRunInput {
  jdText: string;
  topN: number;
  resumes: File[];
}

export async function createRun(input: NewRunInput): Promise<CreateRunResponse> {
  const form = new FormData();
  form.append("jd_text", input.jdText);
  form.append("top_n", String(input.topN));
  for (const file of input.resumes) {
    form.append("resumes", file);
  }

  const res = await fetch(`${API_BASE_URL}/api/runs`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Failed to start run (${res.status})`);
  }
  return res.json();
}

export async function getRun(runId: string): Promise<RunResult> {
  const res = await fetch(`${API_BASE_URL}/api/runs/${runId}`);
  const body = (await res.json()) as RunResult;
  return body;
}

export function streamUrl(runId: string): string {
  return `${API_BASE_URL}/api/runs/${runId}/stream`;
}

export function reportMarkdownUrl(runId: string): string {
  return `${API_BASE_URL}/api/runs/${runId}/report.md`;
}

export function reportPdfUrl(runId: string): string {
  return `${API_BASE_URL}/api/runs/${runId}/report.pdf`;
}
