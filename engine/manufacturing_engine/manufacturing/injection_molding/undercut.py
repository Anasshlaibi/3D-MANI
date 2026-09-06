"""
Undercut Detection and Parting Line Feasibility
"""

from typing import Tuple, Dict, Any

def evaluate_undercuts(
    draft_deg: float
) -> Tuple[bool, str, Dict[str, Any]]:
    has_undercut = draft_deg < 0.0
    passed = not has_undercut
    
    msg = "No re-entrant undercuts detected on main pull axis." if passed else "Undercut detected: Requires side action core pull or lifter mechanism."
    return passed, msg, {
        "undercutsDetected": 1 if has_undercut else 0,
        "partingLineFeasible": passed,
        "sideActionRequired": has_undercut
    }
