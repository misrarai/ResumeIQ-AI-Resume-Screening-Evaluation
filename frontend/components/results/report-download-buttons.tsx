import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportMarkdownUrl, reportPdfUrl } from "@/lib/api";

export function ReportDownloadButtons({ runId }: { runId: string }) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" nativeButton={false} render={<a href={reportMarkdownUrl(runId)} download />}>
        <FileDown className="h-4 w-4" /> Markdown
      </Button>
      <Button className="glow-ring" nativeButton={false} render={<a href={reportPdfUrl(runId)} download />}>
        <FileDown className="h-4 w-4" /> PDF report
      </Button>
    </div>
  );
}
