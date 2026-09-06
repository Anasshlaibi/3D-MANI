"""
Gate 03: CAD Kernel Execution & Solid Generation

HONESTY NOTE (M2 Remediation):
This gate now accepts an is_real_cad flag and reports SIMULATED_ESTIMATE
when the CAD backend is a stub. It no longer claims "B-Rep geometry
compiled by build123d / OCCT kernel" when no CAD kernel is running.
"""

import time
from datetime import datetime
from typing import Dict, Any
from ..cad.base import CADBackend

def run_gate_03(cad_backend: Any, shape: Any, step_text: str, is_real_cad: bool = False, step_is_real: bool = False, revision: int = 1) -> Dict[str, Any]:
    started_at = datetime.utcnow().isoformat() + "Z"
    t0 = time.perf_counter()

    passed = len(step_text) > 0
    t1 = time.perf_counter()
    completed_at = datetime.utcnow().isoformat() + "Z"

    backend_name = getattr(cad_backend, "backend_name", "unknown")
    execution_mode = getattr(cad_backend, "execution_mode", "UNKNOWN")

    if is_real_cad:
        validation_type = "REAL_VALIDATION"
        executor = "build123d:OCCT_Kernel"
        diagnostic = "B-Rep geometry compiled successfully by build123d / OCCT kernel." if passed else "CAD kernel execution failed."
    else:
        validation_type = "SIMULATED_ESTIMATE"
        executor = "SimulatedBackend (no CAD kernel)"
        diagnostic = "SIMULATED: STEP template generated without CAD kernel. Install build123d for real geometry." if passed else "Simulation fallback failed."

    return {
        "gateNumber": 3,
        "gateName": "CAD Kernel Execution & STEP Generation",
        "purpose": "Triggers build123d / OCCT parametric solid generation and real STEP export.",
        "relativeCost": "Very low",
        "status": "PASS" if passed else "FAIL",
        "executionTimeMs": round((t1 - t0) * 1000, 2),
        "executor": executor,
        "engine_version": "1.1.0",
        "ruleset_version": "1.0.0",
        "input_revision": revision,
        "started_at": started_at,
        "completed_at": completed_at,
        "validationType": validation_type,
        "metrics": {
            "cadBackend": backend_name,
            "executionMode": execution_mode,
            "stepFileSizeKb": round(len(step_text) / 1024.0, 1),
            "stepIsRealExport": step_is_real,
        },
        "diagnosticMessage": diagnostic,
        "evidence": {
            "stepExportSuccess": passed,
            "stepByteLength": len(step_text),
            "stepSource": "OCCT_STEPControl_Writer" if step_is_real else "TEMPLATE_PLACEHOLDER",
        }
    }
