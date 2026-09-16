"""Render the markdown hiring report as a styled PDF."""
from __future__ import annotations

import io
import re

import markdown as md
from xhtml2pdf import pisa

STYLE = """
<style>
  @page { size: A4; margin: 2.2cm 1.8cm 2.4cm 1.8cm; }
  body { font-family: Helvetica, Arial, sans-serif; font-size: 10.5pt; color: #1f2430; line-height: 1.5; }
  h1 { font-size: 19pt; color: #4c1d95; margin: 0 0 4px 0; }
  h2 { font-size: 12pt; color: #6d28d9; text-transform: uppercase; letter-spacing: 0.4px;
       margin: 20px 0 8px 0; border-bottom: 1px solid #ddd6fe; padding-bottom: 4px; }
  p { margin: 0 0 10px 0; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 14px 0; table-layout: fixed; }
  th, td {
    border: 1px solid #e5e7eb; padding: 7px 8px; text-align: left; font-size: 9pt; vertical-align: top;
    /* Force long unbreakable words (e.g. "Docker/Kubernetes") to wrap inside
       their own cell instead of overflowing into the next column. xhtml2pdf
       needs its own -pdf-word-wrap extension for this; the others are kept
       as a no-op fallback for any other renderer. */
    -pdf-word-wrap: break-word;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  th { background-color: #f5f3ff; color: #4c1d95; font-weight: bold; }
  tr:nth-child(even) td { background-color: #fafafa; }
  .disclaimer { font-size: 9pt; color: #6b7280; font-style: italic; }
</style>
"""


# Rank, Candidate, Weighted Total, Top Strengths, Gap, Flags — matches the
# exact column order build_shortlist_table() in agent.py always emits.
SHORTLIST_COLUMN_WIDTHS = ["8%", "13%", "10%", "38%", "19%", "12%"]


def _force_wrap_long_tokens(text: str, hard_break_at: int = 20, chunk: int = 14) -> str:
    """Guarantee a piece of text can wrap inside a narrow PDF table cell.

    xhtml2pdf's word-wrap CSS hints are not reliably honored for long
    unbreakable strings (verified: a 60-character token still overflowed
    straight through neighboring columns with -pdf-word-wrap set). reportlab's
    underlying paragraph wrapper only ever breaks on real whitespace, so the
    only guaranteed fix is to insert real break points into the text itself:
    a space after '/' and '_' (common in tech terms like "Docker/Kubernetes"
    and file-derived candidate IDs), plus a hard break for any remaining
    unbroken run longer than `hard_break_at` characters.
    """
    text = text.replace("/", "/ ").replace("_", "_ ")

    def break_run(match: re.Match) -> str:
        run = match.group(0)
        return " ".join(run[i : i + chunk] for i in range(0, len(run), chunk))

    return re.sub(r"\S{%d,}" % hard_break_at, break_run, text)


def _wrap_table_cells(html_body: str) -> str:
    return re.sub(
        r"(<td[^>]*>)(.*?)(</td>)",
        lambda m: m.group(1) + _force_wrap_long_tokens(m.group(2)) + m.group(3),
        html_body,
        flags=re.S,
    )


def _apply_column_widths(html_body: str) -> str:
    # xhtml2pdf ignores <colgroup>/table-layout, but does honor an inline
    # width style set directly on each header cell.
    widths = iter(SHORTLIST_COLUMN_WIDTHS)

    def repl(_match: re.Match) -> str:
        width = next(widths, None)
        return f'<th style="width:{width}">' if width else "<th>"

    return re.sub(r"<th>", repl, html_body, count=len(SHORTLIST_COLUMN_WIDTHS))


def markdown_to_pdf(report_markdown: str) -> bytes:
    html_body = md.markdown(report_markdown, extensions=["tables"])
    html_body = _apply_column_widths(html_body)
    html_body = _wrap_table_cells(html_body)
    html_body = html_body.replace(
        "<h2>Note</h2>", '<h2>Note</h2><div class="disclaimer">', 1
    )
    if "disclaimer" in html_body:
        html_body += "</div>"
    html = f"<html><head>{STYLE}</head><body>{html_body}</body></html>"
    buffer = io.BytesIO()
    result = pisa.CreatePDF(io.StringIO(html), dest=buffer)
    if result.err:
        raise RuntimeError("Failed to render PDF report")
    return buffer.getvalue()
