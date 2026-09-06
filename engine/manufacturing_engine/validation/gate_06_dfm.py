"""
Gate 06: Manufacturing Process Rules (DFM)

HONESTY NOTE (M2 Remediation):
DFM rule evaluation logic is REAL — it checks material-specific constraints
with sourced provenance. However, the geometry measurements (wall thickness,
draft angle) come from DSL parameters, NOT from ray-cast B-Rep analysis.
When is_real_cad=True, measurements would come from actual B-Rep analysis.
"""

import time
from datetime import datetime
from typing import Dict, Any
from ..dsl.ast_nodes import ProgramNode
from ..manufacturing.injection_molding.materials import MATERIALS_DATABASE, MaterialSpec
from ..manufacturing.injection_molding.wall_thickness import evaluate_wall_thickness
from ..manufacturing.injection_molding.draft import evaluate_draft_angle
from ..manufacturing.injection_molding.undercut import evaluate_undercuts
from ..manufacturing.injection_molding.rules import INJECTION_MOLDING_RULES

def run_gate_06(program: ProgramNode, is_real_cad: bool = False, revision: int = 1) -> Dict[str, Any]:
    started_at = datetime.utcnow().isoformat() + "Z"
    t0 = time.perf_counter()
    
    mat: MaterialSpec = MATERIALS_DATABASE["PP"]
    shell_mm = 1.8
    bottom_dia = 64.0
    top_dia = 82.0
    height = 115.0
    explicit_draft = 1.75
    locks = []

    if program.parts:
        part = program.parts[0]
        mat_id = part.material.material_name
        if mat_id in MATERIALS_DATABASE:
            mat = MATERIALS_DATABASE[mat_id]
        if part.geometry.shell:
            shell_mm = part.geometry.shell.thickness.canonical_value
        if part.geometry.draft:
            explicit_draft = part.geometry.draft.angle.canonical_value
        prof = part.geometry.profile
        if prof:
            if prof.bottom_diameter: bottom_dia = prof.bottom_diameter.canonical_value
            if prof.top_diameter: top_dia = prof.top_diameter.canonical_value
            if prof.height: height = prof.height.canonical_value
        locks = part.locks.locked_parameters

    wall_ok, wall_msg, wall_metrics = evaluate_wall_thickness(shell_mm, mat)
    draft_ok, draft_msg, draft_metrics = evaluate_draft_angle(bottom_dia, top_dia, height, explicit_draft, mat)
    undercut_ok, undercut_msg, undercut_metrics = evaluate_undercuts(draft_metrics["measuredDraftDeg"])

    passed = wall_ok and draft_ok and undercut_ok
    t1 = time.perf_counter()
    completed_at = datetime.utcnow().isoformat() + "Z"

    # DFM rule logic is always "real" (rules are sourced, provenance-tracked).
    # But geometry measurements come from DSL parameters, not ray-cast B-Rep,
    # unless is_real_cad is True.
    if is_real_cad:
        validation_type = "REAL_VALIDATION"
        measurement_note = "Geometry from OCCT B-Rep."
    else:
        # Rule logic is real, but geometry inputs are from DSL parameters
        validation_type = "REAL_RULES_SIMULATED_GEOMETRY"
        measurement_note = "DFM rules are real (sourced provenance). Geometry measurements from DSL parameters, not B-Rep ray-cast."

    diag_msg = (
        f"DFM Rules Satisfied: Wall thickness {shell_mm} mm is within "
        f"[{mat.min_wall_thickness}, {mat.max_wall_thickness}] mm for {mat.name}. "
        f"Draft angle is {draft_metrics['measuredDraftDeg']}°. {measurement_note}"
        if passed
        else f"{wall_msg if not wall_ok else draft_msg} {measurement_note}"
    )

    rule = INJECTION_MOLDING_RULES["IM_RULE_MIN_WALL_PP"]
    result = {
        "gateNumber": 6,
        "gateName": "Manufacturing Process Rules (DFM)",
        "purpose": "Evaluates minimum wall thickness, sink mark risk, mold pull draft angle, and undercut feasibility.",
        "relativeCost": "Low",
        "status": "PASS" if passed else "FAIL",
        "executionTimeMs": round((t1 - t0) * 1000, 2),
        "executor": "FastAPI:DFM_Rules_Engine",
        "engine_version": "1.1.0",
        "ruleset_version": "1.0.0",
        "input_revision": revision,
        "started_at": started_at,
        "completed_at": completed_at,
        "validationType": validation_type,
        "metrics": {
            "nominalWallMm": shell_mm,
            "minAllowableWallMm": mat.min_wall_thickness,
            "maxAllowableWallMm": mat.max_wall_thickness,
            "measuredDraftDeg": draft_metrics["measuredDraftDeg"],
            "recommendedDraftDeg": mat.recommended_draft_angle,
            "undercutsDetected": undercut_metrics["undercutsDetected"],
            "partingLineFeasible": undercut_metrics["partingLineFeasible"]
        },
        "diagnosticMessage": diag_msg,
        "evidence": {
            "appliedRuleId": rule.rule_id,
            "ruleSource": rule.source,
            "ruleSourceRevisionDate": rule.source_revision_date,
            "ruleClassification": rule.classification,
            "confidence": rule.confidence
        }
    }

    if not passed:
        result["failureEvidence"] = {
            "errorCode": "MIN_WALL_VIOLATION" if not wall_ok else "INSUFFICIENT_DRAFT_ANGLE",
            "region": "@sidewall_ext",
            "measuredValue": f"{shell_mm} mm" if not wall_ok else f"{draft_metrics['measuredDraftDeg']} deg",
            "requiredValue": f">= {mat.min_wall_thickness} mm" if not wall_ok else ">= 1.0 deg",
            "lockedConstraints": locks,
            "availableActions": ["THICKEN_LOCAL", "ADJUST_SHELL", "INCREASE_TAPER_DRAFT"]
        }

    return result
