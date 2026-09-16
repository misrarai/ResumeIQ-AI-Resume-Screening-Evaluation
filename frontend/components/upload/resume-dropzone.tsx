"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ResumeDropzoneProps {
  files: File[];
  onChange: (files: File[]) => void;
}

export function ResumeDropzone({ files, onChange }: ResumeDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      const existing = new Set(files.map((f) => f.name + f.size));
      const merged = [...files, ...accepted.filter((f) => !existing.has(f.name + f.size))];
      onChange(merged);
    },
    [files, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt"], "application/pdf": [".pdf"] },
    multiple: true,
  });

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer",
          isDragActive
            ? "border-ring bg-accent"
            : "border-input bg-background hover:border-ring/60 hover:bg-accent/40"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-semibold text-foreground">
          {isDragActive ? "Drop resumes here" : "Drag & drop resumes here, or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground">Accepts .pdf and .txt files &middot; multiple files supported</p>
      </div>

      {files.length > 0 && (
        <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-background">
          {files.map((file, i) => (
            <li key={file.name + file.size} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate text-foreground">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => removeFile(i)}
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
