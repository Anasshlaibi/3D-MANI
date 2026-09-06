"""
Mold Pull Draft Angle Evaluator
"""

import math
from typing import Tuple, Dict, Any
from .materials import MaterialSpec

def evaluate_draft_angle(
    bottom_dia: float,
    top_dia: float,
    height: float,
    explicit_draft_deg: float,
    mat: MaterialSpec
) -> Tuple[bool, str, Dict[str, Any]]:
    # Calculate geometric draft angle from profile frustum: atan((r2 - r1)/h)
    calc_rad = math.atan(((top_dia / 2) - (bottom_dia / 2)) / height)
    geom_draft_deg = round(math.degrees(calc_rad), 2)
    
    actual_draft = max(explicit_draft_deg, geom_draft_deg)
    min_required = 1.0
    
    passed = actual_draft >= min_required
    if passed:
        msg = f"Draft angle {actual_draft}° satisfies mold pull requirement (>= {min_required}°)."
    else:
        msg = f"Insufficient draft angle {actual_draft}° (minimum required is {min_required}° for clean ejection)."
        
    return passed, msg, {
        "measuredDraftDeg": actual_draft,
        "explicitDraftDeg": explicit_draft_deg,
        "geometricDraftDeg": geom_draft_deg,
        "recommendedDraftDeg": mat.recommended_draft_angle,
        "minAllowableDraftDeg": min_required
    }
