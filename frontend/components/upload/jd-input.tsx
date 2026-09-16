"use client";

interface JdInputProps {
  jdText: string;
  onTextChange: (text: string) => void;
}

export function JdInput({ jdText, onTextChange }: JdInputProps) {
  return (
    <textarea
      value={jdText}
      onChange={(e) => onTextChange(e.target.value)}
      placeholder="Paste the job description here..."
      rows={10}
      className="w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
    />
  );
}
