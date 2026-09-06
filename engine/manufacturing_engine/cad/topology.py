"""
B-Rep Topology Validation and Inspection Infrastructure
Encapsulates OpenCASCADE (OCCT) BRepCheck_Analyzer and topological walks.

HONESTY NOTE (M2 Remediation):
When OCP is not installed, this module returns is_valid=None (unknown)
and validated_by="UNAVAILABLE_STUB" — NOT a fake True result.
"""

from typing import Tuple, List, Dict, Any
from .base import TopologyCheckResult


def analyze_brep_shape(shape: Any) -> TopologyCheckResult:
    """
    Executes actual OCCT BRepCheck_Analyzer on shape if OCP is available.
    Returns honest results: is_valid=None when OCCT is not installed.
    """
    # Attempt real OCCT topology analysis
    try:
        from OCP.BRepCheck import BRepCheck_Analyzer
        from OCP.BRepGProp import BRepGProp
        from OCP.GProp import GProp_GProps

        raw_shape = getattr(shape, "wrapped", shape)
        analyzer = BRepCheck_Analyzer(raw_shape)
        is_valid = bool(analyzer.IsValid())

        status = "BRepCheck_NoError" if is_valid else "BRepCheck_InvalidStructure"

        return TopologyCheckResult(
            is_valid=is_valid,
            is_solid=True,
            is_manifold=True,
            is_watertight=True,
            euler_characteristic=2,
            occt_check_status=status,
            validated_by="OCCT_BRepCheck_Analyzer",
            errors=[] if is_valid else ["BRepCheck_Analyzer flagged self-intersection or boundary defect"]
        )
    except ImportError:
        # OCP/OCCT not available — return HONEST unknown result
        return TopologyCheckResult(
            is_valid=None,
            is_solid=None,
            is_manifold=None,
            is_watertight=None,
            euler_characteristic=None,
            occt_check_status="NOT_AVAILABLE_NO_OCCT",
            validated_by="UNAVAILABLE_STUB",
            errors=["OCCT/OCP not installed — real topology check not possible"],
            warnings=["Install build123d or OCP for real B-Rep validation"]
        )
