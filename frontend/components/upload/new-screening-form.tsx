"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, ScanSearch, Sliders, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JdInput } from "./jd-input";
import { ResumeDropzone } from "./resume-dropzone";
import { createRun } from "@/lib/api";

export function NewScreeningForm() {
  const router = useRouter();
  const [jdText, setJdText] = useState("");
  const [resumes, setResumes] = useState<File[]>([]);
  const [topN, setTopN] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const topNTouched = useRef(false);

  // Keep the shortlist size in sync with the number of uploaded resumes by
  // default, so it doesn't stay stuck at an unrelated fixed number — but
  // stop auto-adjusting once the user has manually edited it themselves.
  useEffect(() => {
    if (topNTouched.current || resumes.length === 0) return;
    setTopN(Math.min(resumes.length, 50));
  }, [resumes.length]);

  const canSubmit = jdText.trim().length > 0 && resumes.length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { run_id, candidate_ids } = await createRun({ jdText, topN, resumes });
      try {
        sessionStorage.setItem(`run:${run_id}:candidates`, JSON.stringify(candidate_ids));
      } catch {
        /* sessionStorage unavailable, progress grid will fall back gracefully */
      }
      router.push(`/runs/${run_id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't start the screening. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormSection
        step={1}
        icon={FileText}
        title="Job description"
        description="Paste or write the description for the role you're hiring for."
      >
        <JdInput jdText={jdText} onTextChange={setJdText} />
      </FormSection>

      <FormSection
        step={2}
        icon={Users}
        title="Resumes"
        description="Drag and drop the resumes you'd like to screen."
      >
        <ResumeDropzone files={resumes} onChange={setResumes} />
      </FormSection>

      <FormSection
        step={3}
        icon={Sliders}
        title="Shortlist size"
        description="How many top candidates to include in your final report. This defaults to the number of resumes you upload, but you can change it anytime."
      >
        <div className="flex items-center gap-3">
          <Label htmlFor="top-n" className="sr-only">
            Shortlist size
          </Label>
          <Input
            id="top-n"
            type="number"
            min={1}
            max={50}
            value={topN}
            onChange={(e) => {
              topNTouched.current = true;
              setTopN(Number(e.target.value) || 1);
            }}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">
            candidates{resumes.length > 0 && ` (from ${resumes.length} uploaded)`}
          </span>
        </div>
      </FormSection>

      <Button
        type="submit"
        size="lg"
        disabled={!canSubmit}
        className="glow-ring w-full transition-transform hover:scale-[1.01] disabled:hover:scale-100 sm:w-auto"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Starting Screening…
          </>
        ) : (
          <>
            <ScanSearch className="h-4 w-4" /> Start Screening
          </>
        )}
      </Button>
    </form>
  );
}

function FormSection({
  step,
  icon: Icon,
  title,
  description,
  children,
}: {
  step: number;
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-5 shadow-lg shadow-black/20 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {step}
            </span>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
