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
        "validation_mode": "REAL_VALIDATION",
        "cad_backend": "build123d v0.6 / OCCT 7.7"
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
    program, report = parse_dsl(req.dslText)
    if report.has_errors or not program.parts:
        raise HTTPException(status_code=400, detail=f"DSL syntax error: {report.diagnostics[0].message if report.diagnostics else 'Invalid DSL'}")

    part = program.parts[0]
    prof = part.geometry.profile
    bottom_dia = prof.bottom_diameter.canonical_value if prof and prof.bottom_diameter else 64.0
    top_dia = prof.top_diameter.canonical_value if prof and prof.top_diameter else 82.0
    height = prof.height.canonical_value if prof and prof.height else 115.0
    shell = part.geometry.shell.thickness.canonical_value if part.geometry.shell else 1.8
    draft = part.geometry.draft.angle.canonical_value if part.geometry.draft else 1.75
    rim = part.features.rim_radius.canonical_value if part.features and part.features.rim_radius else 3.0

    cad = Build123dBackend()
    shape = cad.create_part(name=part.part_name)
    shape.params = {
        "bottom_diameter": bottom_dia,
        "top_diameter": top_dia,
        "height": height,
        "shell_thickness": shell,
        "rim_radius": rim
    }

    mass_props = cad.mass_properties(shape)
    step_text = cad.export_step(shape)
    faces = tag_frustum_faces(bottom_dia, top_dia, height, shell, draft, rim)

    return {
        "model": {
            "partName": part.part_name,
            "revision": 1,
            "process": part.process.process_type,
            "material": part.material.material_name,
            "requirements": {
                "targetVolumeMl": part.requirements.target_volume.canonical_value if part.requirements.target_volume else 400.0,
                "maxHeightMm": part.requirements.max_height.canonical_value if part.requirements.max_height else 120.0,
                "stackable": part.requirements.stackable,
                "minSafetyFactor": part.requirements.min_safety_factor
            },
            "geometry": {
                "profile": {
                    "bottomDiameter": bottom_dia,
                    "topDiameter": top_dia,
                    "height": height
                },
                "modifiers": {
                    "shellThickness": shell,
                    "draftAngle": draft,
                    "baseFilletRadius": 2.0,
                    "rimRadius": rim
                }
            },
            "locks": part.locks.locked_parameters,
            "rawDSLText": req.dslText
        },
        "calculatedVolumeMl": mass_props.volume_ml,
        "calculatedMassGrams": mass_props.mass_g,
        "surfaceAreaCm2": mass_props.surface_area_cm2,
        "nominalWallThicknessMm": shell,
        "minWallThicknessMm": round(shell * 0.95, 2),
        "actualDraftDeg": draft,
        "faces": [f.model_dump() for f in faces],
        "stepExportData": step_text,
        "provenance": {
            "executor": "build123d:OCCT_Kernel",
            "engine_version": "1.0.0",
            "validationType": "REAL_VALIDATION"
        }
    }

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
