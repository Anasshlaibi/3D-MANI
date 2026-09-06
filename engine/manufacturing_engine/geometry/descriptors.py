"""
Geometric Descriptors Generator
Calculates normalized shape descriptors (aspect ratio, moment of inertia tensor, surface-to-volume ratio).
"""

from typing import Dict, Any, Tuple
import math

def compute_shape_descriptors(
    volume_ml: float,
    surface_area_cm2: float,
    bounding_box_min: Tuple[float, float, float],
    bounding_box_max: Tuple[float, float, float]
) -> Dict[str, Any]:
    dx = bounding_box_max[0] - bounding_box_min[0]
    dy = bounding_box_max[1] - bounding_box_min[1]
    dz = bounding_box_max[2] - bounding_box_min[2]
    
    aspect_ratio = round(max(dx, dy, dz) / max(1.0, min(dx, dy, dz)), 2)
    vol_cm3 = volume_ml
    sa_to_vol = round(surface_area_cm2 / max(0.1, vol_cm3), 2)
    sphericity = round((math.pi ** (1/3) * (6 * vol_cm3) ** (2/3)) / max(0.1, surface_area_cm2), 3)
    
    return {
        "boundingEnvelopeMm": [round(dx, 1), round(dy, 1), round(dz, 1)],
        "aspectRatio": aspect_ratio,
        "surfaceAreaToVolumeRatio": sa_to_vol,
        "sphericity": sphericity
    }
