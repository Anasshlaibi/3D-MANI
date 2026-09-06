"""
Parameter Validation Logic
"""

from typing import Tuple, List
from .units import Quantity

def validate_positive_length(q: Quantity) -> Tuple[bool, str]:
    if q.dimension != "length":
        return False, f"Expected length dimension, got {q.dimension}"
    if q.canonical_value <= 0:
        return False, f"Length must be strictly positive (> 0 mm), got {q.canonical_value} mm"
    return True, "Valid length"

def validate_draft_angle(q: Quantity) -> Tuple[bool, str]:
    if q.dimension != "angle":
        return False, f"Expected angle dimension, got {q.dimension}"
    if q.canonical_value < 0 or q.canonical_value > 45:
        return False, f"Draft angle must be between 0 and 45 degrees, got {q.canonical_value} deg"
    return True, "Valid draft angle"

def validate_volume(q: Quantity) -> Tuple[bool, str]:
    if q.dimension != "volume":
        return False, f"Expected volume dimension, got {q.dimension}"
    if q.canonical_value <= 0:
        return False, f"Volume must be positive (> 0 ml), got {q.canonical_value} ml"
    return True, "Valid volume"
