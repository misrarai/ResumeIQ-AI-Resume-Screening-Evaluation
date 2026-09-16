from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, Response, StreamingResponse

from ..extract_text import extract_text
from ..graph_service import stream_run
from ..report_pdf import markdown_to_pdf
from ..run_store import create_run, get_run

router = APIRouter(prefix="/api/runs", tags=["runs"])

MAX_RESUMES = 200


@router.post("")
async def create_screening_run(
    jd_text: str = Form(...),
    top_n: int = Form(default=5),
    resumes: list[UploadFile] = File(...),
):
    job_description = jd_text.strip()
    if not job_description:
        raise HTTPException(422, "Job description text is required.")

    if not resumes:
        raise HTTPException(422, "At least one resume is required.")
    if len(resumes) > MAX_RESUMES:
        raise HTTPException(422, f"Too many resumes (max {MAX_RESUMES}).")

    parsed_resumes = []
    for i, f in enumerate(resumes):
        text = extract_text(f.filename or f"resume_{i}.txt", await f.read())
        candidate_id = _candidate_id(f.filename, i)
        parsed_resumes.append({"id": candidate_id, "text": text})

    run = create_run()
    initial_state = {
        "job_description": job_description,
        "resumes": parsed_resumes,
        "shortlist_size": top_n,
        "redaction_log": [],
        "candidate_scores": [],
        "unscreened": [],
    }
    run.result["_initial_state"] = initial_state
    candidate_ids = [r["id"] for r in parsed_resumes]
    return {"run_id": run.run_id, "candidate_ids": candidate_ids}


def _candidate_id(filename: str | None, index: int) -> str:
    if not filename:
        return f"candidate_{index + 1}"
    stem = filename.rsplit(".", 1)[0]
    return stem or f"candidate_{index + 1}"


@router.get("/{run_id}/stream")
async def stream_screening_run(run_id: str):
    run = get_run(run_id)
    if run is None:
        raise HTTPException(404, "Run not found.")
    initial_state = run.result.pop("_initial_state", None)
    if initial_state is None:
        raise HTTPException(409, "Run already started or has no pending state.")
    return StreamingResponse(stream_run(run, initial_state), media_type="text/event-stream")


@router.get("/{run_id}")
async def get_run_result(run_id: str):
    run = get_run(run_id)
    if run is None:
        raise HTTPException(404, "Run not found.")
    if run.status == "error":
        return JSONResponse({"status": "error", "message": run.error}, status_code=500)
    if run.status != "done":
        return JSONResponse({"status": run.status}, status_code=202)
    return {"status": "done", **run.result}


@router.get("/{run_id}/report.md")
async def download_report_md(run_id: str):
    run = get_run(run_id)
    if run is None or run.status != "done":
        raise HTTPException(404, "Report not available.")
    return Response(
        content=run.result.get("report", ""),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="shortlist_report_{run_id[:8]}.md"'},
    )


@router.get("/{run_id}/report.pdf")
async def download_report_pdf(run_id: str):
    run = get_run(run_id)
    if run is None or run.status != "done":
        raise HTTPException(404, "Report not available.")
    pdf_bytes = markdown_to_pdf(run.result.get("report", ""))
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="shortlist_report_{run_id[:8]}.pdf"'},
    )
