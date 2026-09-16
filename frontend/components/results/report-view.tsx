import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ReportView({ report }: { report: string }) {
  return (
    <div className="space-y-3">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-foreground">{children}</h1>,
          h2: ({ children }) => (
            <h2 className="mt-5 text-sm font-bold tracking-wide text-primary uppercase">{children}</h2>
          ),
          h3: ({ children }) => <h3 className="mt-4 text-sm font-semibold text-foreground">{children}</h3>,
          p: ({ children }) => <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">{children}</ol>,
          hr: () => <hr className="my-4 border-white/10" />,
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-secondary/40">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-white/10 px-3 py-2 text-left text-xs font-bold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-white/5 px-3 py-2 align-top text-sm text-muted-foreground">{children}</td>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
        }}
      >
        {report}
      </Markdown>
    </div>
  );
}
