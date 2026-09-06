"""
Semantic Face Tagging Infrastructure
Assigns standard manufacturing tags (@base_floor_ext, @sidewall_ext, etc.) to CAD faces.
"""

from typing import List, Dict, Any
from pydantic import BaseModel

class FaceTagData(BaseModel):
    id: str
    semantic_tag: str
    face_type: str
    normal: List[float]
    area_mm2: float
    min_thickness_mm: float
    draft_angle_deg: float
    is_undercut: bool

def tag_frustum_faces(
    bottom_dia: float,
    top_dia: float,
    height: float,
    shell: float,
    draft_deg: float,
    rim_radius: float
) -> List[FaceTagData]:
    import math
    r1_outer = bottom_dia / 2
    r2_outer = top_dia / 2
    r1_inner = max(1.0, r1_outer - shell)
    
    slant = math.sqrt((r2_outer - r1_outer)**2 + height**2)
    lat_area = math.pi * (r1_outer + r2_outer) * slant
    base_area = math.pi * r1_outer * r1_outer
    inner_base_area = math.pi * r1_inner * r1_inner
    
    return [
        FaceTagData(
            id="F_01",
            semantic_tag="@base_floor_ext",
            face_type="planar",
            normal=[0.0, -1.0, 0.0],
            area_mm2=round(base_area, 1),
            min_thickness_mm=shell,
            draft_angle_deg=90.0,
            is_undercut=False
        ),
        FaceTagData(
            id="F_02",
            semantic_tag="@sidewall_ext",
            face_type="conical",
            normal=[0.98, 0.17, 0.0],
            area_mm2=round(lat_area, 1),
            min_thickness_mm=shell,
            draft_angle_deg=draft_deg,
            is_undercut=draft_deg < 0.5
        ),
        FaceTagData(
            id="F_03",
            semantic_tag="@lip_rim",
            face_type="toroidal",
            normal=[0.0, 1.0, 0.0],
            area_mm2=round(2 * math.pi * r2_outer * rim_radius, 1),
            min_thickness_mm=shell * 1.5,
            draft_angle_deg=5.0,
            is_undercut=False
        ),
        FaceTagData(
            id="F_04",
            semantic_tag="@sidewall_int",
            face_type="conical",
            normal=[-0.98, 0.17, 0.0],
            area_mm2=round(lat_area * 0.92, 1),
            min_thickness_mm=shell,
            draft_angle_deg=draft_deg,
            is_undercut=False
        ),
        FaceTagData(
            id="F_05",
            semantic_tag="@base_floor_int",
            face_type="planar",
            normal=[0.0, 1.0, 0.0],
            area_mm2=round(inner_base_area, 1),
            min_thickness_mm=shell,
            draft_angle_deg=90.0,
            is_undercut=False
        ),
    ]
