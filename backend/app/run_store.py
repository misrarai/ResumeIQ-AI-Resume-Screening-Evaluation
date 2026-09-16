"""In-memory run state store.

v1 scope: single process, no persistence, no auth. A backend restart loses
all runs, and this only works correctly with a single uvicorn worker
(`--workers 1`), since each worker would otherwise have its own dict.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Any, Literal

RunStatus = Literal["pending", "running", "done", "error"]


@dataclass
class RunState:
    run_id: str
    status: RunStatus = "pending"
    result: dict[str, Any] = field(default_factory=dict)
    error: str | None = None


RUNS: dict[str, RunState] = {}


def create_run() -> RunState:
    run_id = uuid.uuid4().hex
    run = RunState(run_id=run_id)
    RUNS[run_id] = run
    return run


def get_run(run_id: str) -> RunState | None:
    return RUNS.get(run_id)
