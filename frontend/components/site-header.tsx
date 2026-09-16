import Link from "next/link";
import { ScanSearch, Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="glow-ring flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ScanSearch className="h-4.5 w-4.5" />
          </span>
          <span className="text-base font-bold tracking-tight text-foreground">
            Resume<span className="text-primary">IQ</span>
          </span>
        </Link>
        <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground sm:flex">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-Powered Screening
        </span>
      </div>
    </header>
  );
}
