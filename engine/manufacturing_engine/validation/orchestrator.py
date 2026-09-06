"""
Validation Ladder Orchestrator
Executes Gate 00 through Gate 06 with complete provenance tracking.

HONESTY NOTE (M2 Remediation):
Uses get_cad_backend() factory to determine if real CAD is available.
Sets validationType per gate based on actual capability:
  - Gates 0-2 (schema, DSL, parameters): always REAL_VALIDATION
  - Gates 3-5 (CAD, B-Rep, dimensions): REAL_VALIDATION only if HAS_BUILD123D
  - Gate 6 (DFM): REAL_RULES_SIMULATED_GEOMETRY when no CAD kernel

The overall validationType reflects the LOWEST confidence tier present.
"""

from typing import List, Dict, Any, Tuple, Optional
from ..dsl.parser import parse_dsl
from ..cad.build123d_backend import get_cad_backend
from ..cad.exporters import export_step_from_shape
from .gate_00_schema import run_gate_00
from .gate_01_dsl import run_gate_01
from .gate_02_parameters import run_gate_02
from .gate_03_cad import run_gate_03
from .gate_04_brep import run_gate_04
from .gate_05_dimensions import run_gate_05
from .gate_06_dfm import run_gate_06

def run_full_validation_ladder(dsl_text: str, revision: int = 1) -> Dict[str, Any]:
    program, report = parse_dsl(dsl_text)

    # Get the appropriate CAD backend and whether it's real
    cad_backend, is_real_cad = get_cad_backend()

    shape = cad_backend.create_part(name=program.parts[0].part_name if program.parts else "Part_001")

    # Configure shape parameters from profile
    if program.parts and program.parts[0].geometry.profile:
        prof = program.parts[0].geometry.profile
        shape.params["bottom_diameter"] = prof.bottom_diameter.canonical_value if prof.bottom_diameter else 64.0
        shape.params["top_diameter"] = prof.top_diameter.canonical_value if prof.top_diameter else 82.0
        shape.params["height"] = prof.height.canonical_value if prof.height else 115.0
    if program.parts and program.parts[0].geometry.shell:
        shape.params["shell_thickness"] = program.parts[0].geometry.shell.thickness.canonical_value

    mass_props = cad_backend.mass_properties(shape)

    # Export STEP and track if it's a real export
    step_text, step_is_real = export_step_from_shape(shape, part_name=program.parts[0].part_name if program.parts else "Part_001")

    # Gates 0-2: Always REAL_VALIDATION (no CAD kernel needed)
    g0 = run_gate_00(program, revision=revision)
    g1 = run_gate_01(program, report, revision=revision)
    g2 = run_gate_02(program, revision=revision)

    # Gates 3-5: REAL_VALIDATION only if real CAD backend
    g3 = run_gate_03(cad_backend, shape, step_text, is_real_cad=is_real_cad, step_is_real=step_is_real, revision=revision)
    g4 = run_gate_04(shape, is_real_cad=is_real_cad, revision=revision)
    g5 = run_gate_05(mass_props, program, is_real_cad=is_real_cad, revision=revision)

    # Gate 6: DFM rule logic is real, but geometry measurements may be simulated
    g6 = run_gate_06(program, is_real_cad=is_real_cad, revision=revision)

    gates = [g0, g1, g2, g3, g4, g5, g6]
    overall_passed = all(g["status"] == "PASS" for g in gates)

    # Overall validationType = lowest confidence tier across all gates
    validation_types = set(g["validationType"] for g in gates)
    if "SIMULATED_ESTIMATE" in validation_types:
        overall_validation_type = "SIMULATED_ESTIMATE"
    elif "REAL_RULES_SIMULATED_GEOMETRY" in validation_types:
        overall_validation_type = "REAL_RULES_SIMULATED_GEOMETRY"
    else:
        overall_validation_type = "REAL_VALIDATION"

    delta_payload = None
    first_failed = next((g for g in gates if g["status"] == "FAIL"), None)
    if first_failed and "failureEvidence" in first_failed:
        ev = first_failed["failureEvidence"]
        delta_payload = {
            "jobId": "JOB_REAL_001",
            "revision": revision,
            "failedGate": first_failed["gateNumber"],
            "errorCode": ev["errorCode"],
            "cause": first_failed["diagnosticMessage"],
            "region": ev["region"],
            "currentValue": ev["measuredValue"],
            "requiredValue": ev["requiredValue"],
            "lockedConstraints": ev["lockedConstraints"],
            "availableActions": ev["availableActions"],
            "recommendedPatch": f"MODIFY {ev['region']} {{\n  SHELL: 1.8mm\n}}"
        }

    return {
        "gates": gates,
        "overallPassed": overall_passed,
        "deltaPayload": delta_payload,
        "engineVersion": "1.1.0",
        "validationType": overall_validation_type,
        "cadBackend": cad_backend.backend_name,
        "cadExecutionMode": cad_backend.execution_mode,
    }
