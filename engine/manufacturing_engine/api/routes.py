"""
FastAPI Routes for Deterministic Manufacturing Engine
Exposes /health, /dsl/parse, /dsl/compile, /validation/run, /registry/datasets, and /registry/opensource.
"""

import os
import yaml
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import ParseDSLRequest, CompileDSLRequest, RunValidationRequest
from ..dsl.parser import parse_dsl
from ..cad.build123d_backend import Build123dBackend
from ..cad.tagging import tag_frustum_faces
from ..validation.orchestrator import run_full_validation_ladder

app = FastAPI(
    title="AI Manufacturing Design Engine Python Core",
    version="1.0.0",
    description="Deterministic Manufacturing Core with Lark DSL parser, build123d/OCCT CADBackend, B-Rep checking, and DFM rules."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "engine": "AI Manufacturing Design Engine Python Core",
        "engine_version": "1.0.0",
        "validation_mode": "CAPABILITY_ONLY",
        "cad_backend": "OCCT available" if __import__("importlib").util.find_spec("OCP") else "UNAVAILABLE"
    }

@app.post("/api/dsl/parse")
def api_parse_dsl(req: ParseDSLRequest):
    program, report = parse_dsl(req.dslText)
    return {
        "program": program.model_dump(),
        "diagnostics": report.model_dump(),
        "isValid": not report.has_errors
    }

@app.post("/api/dsl/compile")
def api_compile_dsl(req: CompileDSLRequest):
    raise HTTPException(410, "Legacy demo compilation is retired. Use /api/m2/inspect with real STEP geometry.")

@app.post("/api/validation/run")
def api_run_validation(req: RunValidationRequest):
    return run_full_validation_ladder(req.dslText, revision=req.revision or 1)

@app.get("/api/registry/datasets")
def api_get_datasets():
    path = os.path.join(ROOT_DIR, "datasets.registry.yaml")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    return {"datasets": []}

@app.get("/api/registry/opensource")
def api_get_opensource():
    path = os.path.join(ROOT_DIR, "opensource.registry.yaml")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    return {"repositories": []}

from .m2 import router as m2_router
app.include_router(m2_router)
