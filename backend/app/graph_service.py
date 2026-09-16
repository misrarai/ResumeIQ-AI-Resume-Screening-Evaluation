"""Bridges the LangGraph agent (backend/agent.py) to the API layer."""
from __future__ import annotations

import json
import sys
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from agent import graph  # noqa: E402  (path must be patched first)

from .run_store import RunState


def sse(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


async def stream_run(run: RunState, initial_state: dict[str, Any]) -> AsyncIterator[str]:
    """Drive the graph and yield SSE-formatted strings, updating `run` as it goes."""
    run.status = "running"
    accumulated: dict[str, Any] = {
        "rubric": [],
        "candidate_scores": [],
        "redaction_log": [],
        "unscreened": [],
        "shortlist": [],
        "report": "",
    }
    try:
        async for update in graph.astream(initial_state, stream_mode="updates"):
            for node, payload in update.items():
                if node == "build_rubric" and payload.get("rubric"):
                    accumulated["rubric"] = payload["rubric"]
                    yield sse("rubric_built", {"rubric": payload["rubric"]})
                elif node == "redact":
                    accumulated["redaction_log"] = payload.get("redaction_log", [])
                    accumulated["unscreened"] += payload.get("unscreened", [])
                    yield sse(
                        "pii_redacted",
                        {
                            "redaction_log": payload.get("redaction_log", []),
                            "unscreened": payload.get("unscreened", []),
                        },
                    )
                elif node == "score_candidate":
                    scores = payload.get("candidate_scores")
                    if scores:
                        accumulated["candidate_scores"].append(scores[0])
                        yield sse("candidate_scored", scores[0])
                    unscreened = payload.get("unscreened")
                    if unscreened:
                        accumulated["unscreened"] += unscreened
                        yield sse("candidate_failed", {"unscreened": unscreened})
                elif node == "rank_and_reduce":
                    accumulated["shortlist"] = payload.get("shortlist", [])
                    yield sse("shortlist_ready", {"shortlist": payload.get("shortlist", [])})
                elif node == "write_report":
                    accumulated["report"] = payload.get("report", "")
                    yield sse("report_ready", {"report": payload.get("report", "")})

        run.result = accumulated
        run.status = "done"
        yield sse("done", {"run_id": run.run_id})
    except Exception as exc:  # noqa: BLE001 - surface any failure to the client
        run.status = "error"
        run.error = str(exc)
        yield sse("error", {"message": str(exc)})
