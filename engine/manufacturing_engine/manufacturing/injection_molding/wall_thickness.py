"""
Wall Thickness and Sink Mark Evaluator
"""

from typing import Tuple, Dict, Any
from .materials import MaterialSpec

def evaluate_wall_thickness(
    shell_thickness_mm: float,
    mat: MaterialSpec
) -> Tuple[bool, str, Dict[str, Any]]:
    min_ok = shell_thickness_mm >= mat.min_wall_thickness
    max_ok = shell_thickness_mm <= mat.max_wall_thickness
    
    status = min_ok and max_ok
    if not min_ok:
        msg = f"Wall thickness {shell_thickness_mm} mm is below {mat.name} minimum allowable threshold ({mat.min_wall_thickness} mm). High risk of short shot."
    elif not max_ok:
        msg = f"Wall thickness {shell_thickness_mm} mm exceeds maximum threshold ({mat.max_wall_thickness} mm). High sink mark & long cooling risk."
    else:
        msg = f"Wall thickness {shell_thickness_mm} mm is optimal for {mat.name} [{mat.min_wall_thickness}, {mat.max_wall_thickness}] mm."
        
    return status, msg, {
        "nominalWallMm": shell_thickness_mm,
        "minAllowableMm": mat.min_wall_thickness,
        "maxAllowableMm": mat.max_wall_thickness,
        "sinkMarkRisk": "LOW" if shell_thickness_mm <= mat.max_wall_thickness * 0.8 else "MEDIUM"
    }
