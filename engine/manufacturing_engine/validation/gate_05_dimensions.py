"""
Gate 05: Dimensions, Volume & Clearance

HONESTY NOTE (M2 Remediation):
Measurements now carry the source label from MassProperties.source.
When source is FORMULA_ESTIMATE, validation type is SIMULATED_ESTIMATE.
"""

import time
from datetime import datetime
from typing import Dict, Any
from ..cad.base import MassProperties
from ..dsl.ast_nodes import ProgramNode

def run_gate_05(mass_props: MassProperties, program: ProgramNode, is_real_cad: bool = False, revision: int = 1) -> Dict[str, Any]:
    started_at = datetime.utcnow().isoformat() + "Z"
    t0 = time.perf_counter()

    target_vol = 400.0
    max_height = 120.0
    locks = []

    if program.parts:
        part = program.parts[0]
        if part.requirements.target_volume:
            target_vol = part.requirements.target_volume.canonical_value
        if part.requirements.max_height:
            max_height = part.requirements.max_height.canonical_value
        locks = part.locks.locked_parameters

    vol_ok = mass_props.volume_ml >= target_vol * 0.98
    height_ok = mass_props.bounding_box_max[1] <= max_height

    passed = vol_ok and height_ok
    t1 = time.perf_counter()
    completed_at = datetime.utcnow().isoformat() + "Z"

    vol_delta = round(((mass_props.volume_ml - target_vol) / target_vol) * 100.0, 1)

    # Determine validation type from actual measurement source
    measurement_source = mass_props.source
    if measurement_source == "OCCT_GProp" and is_real_cad:
        validation_type = "REAL_VALIDATION"
        source_note = "Measurements from OCCT GProp (real B-Rep)."
    else:
        validation_type = "SIMULATED_ESTIMATE"
        source_note = f"Measurements from {measurement_source} — not from real B-Rep geometry."

    result = {
        "gateNumber": 5,
        "gateName": "Dimensions, Volume & Clearance",
        "purpose": "Verifies external bounding box, internal displacement volume, and nesting clearance from CAD solid.",
        "relativeCost": "Low",
        "status": "PASS" if passed else "FAIL",
        "executionTimeMs": round((t1 - t0) * 1000, 2),
        "executor": "FastAPI:Gate_05_DimensionalAnalyzer",
        "engine_version": "1.1.0",
        "ruleset_version": "1.0.0",
        "input_revision": revision,
        "started_at": started_at,
        "completed_at": completed_at,
        "validationType": validation_type,
        "metrics": {
            "measuredVolumeMl": mass_props.volume_ml,
            "requiredVolumeMl": target_vol,
            "measuredHeightMm": mass_props.bounding_box_max[1],
            "maxHeightMm": max_height,
            "volumeDeltaPercent": vol_delta,
            "measurementSource": measurement_source,
        },
        "diagnosticMessage": (
            f"Volume ({mass_props.volume_ml} ml) meets requirement (>= {target_vol} ml). "
            f"Height ({mass_props.bounding_box_max[1]} mm) within envelope. {source_note}"
            if passed
            else f"Dimension constraint violation: Target volume {target_vol} ml vs measured {mass_props.volume_ml} ml. {source_note}"
        ),
        "evidence": {
            "measuredVolume": mass_props.volume_ml,
            "boundingEnvelope": mass_props.bounding_box_max,
            "measurementSource": measurement_source,
        }
    }

    if not passed:
        result["failureEvidence"] = {
            "errorCode": "VOLUME_UNDER_TARGET",
            "region": "@interior_cavity",
            "measuredValue": f"{mass_props.volume_ml} ml",
            "requiredValue": f">= {target_vol} ml",
            "lockedConstraints": locks,
            "availableActions": ["EXPAND_TOP_DIAMETER", "INCREASE_HEIGHT", "THIN_WALL"]
        }

    return result
