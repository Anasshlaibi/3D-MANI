"""
Injection Molding DFM Rules Registry with Explicit Provenance
Rule 12: Every rule contains rule_id, process, material applicability, condition, severity, value/range, unit, source, source_revision/date, confidence, hard/soft classification.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ManufacturingRule(BaseModel):
    rule_id: str
    process: str = "INJECTION_MOLDING"
    material_applicability: List[str]
    condition: str
    severity: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    target_range_min: float
    target_range_max: float
    unit: str
    source: str
    source_revision_date: str
    confidence: float = 1.0
    classification: str  # "HARD", "SOFT"
    description: str

INJECTION_MOLDING_RULES: Dict[str, ManufacturingRule] = {
    "IM_RULE_MIN_WALL_PP": ManufacturingRule(
        rule_id="IM_RULE_MIN_WALL_PP",
        process="INJECTION_MOLDING",
        material_applicability=["PP", "PP_HOMOPOLYMER"],
        condition="wall_thickness >= min_allowable",
        severity="CRITICAL",
        target_range_min=0.8,
        target_range_max=3.5,
        unit="mm",
        source="DuPont Design Guide for Thermoplastics / Plastics Engineering Handbook 5th Ed",
        source_revision_date="2023-05-12",
        confidence=0.98,
        classification="HARD",
        description="Minimum nominal wall thickness for Polypropylene (PP) thin-wall flow length."
    ),
    "IM_RULE_MIN_WALL_ABS": ManufacturingRule(
        rule_id="IM_RULE_MIN_WALL_ABS",
        process="INJECTION_MOLDING",
        material_applicability=["ABS"],
        condition="wall_thickness >= min_allowable",
        severity="CRITICAL",
        target_range_min=1.14,
        target_range_max=3.5,
        unit="mm",
        source="Covestro (Bayer MaterialScience) ABS Injection Molding Guide",
        source_revision_date="2022-11-01",
        confidence=0.96,
        classification="HARD",
        description="Minimum nominal wall thickness for ABS structural enclosures."
    ),
    "IM_RULE_DRAFT_ANGLE": ManufacturingRule(
        rule_id="IM_RULE_DRAFT_ANGLE",
        process="INJECTION_MOLDING",
        material_applicability=["ALL"],
        condition="draft_angle >= min_draft",
        severity="HIGH",
        target_range_min=1.0,
        target_range_max=5.0,
        unit="deg",
        source="SPI Mold Design Standard & ASME Y14.5M",
        source_revision_date="2021-08-15",
        confidence=0.95,
        classification="HARD",
        description="Minimum parting line ejection draft angle per inch of cavity depth."
    ),
    "IM_RULE_SINK_MARK_RIB": ManufacturingRule(
        rule_id="IM_RULE_SINK_MARK_RIB",
        process="INJECTION_MOLDING",
        material_applicability=["ALL"],
        condition="rib_thickness <= 0.6 * nominal_wall",
        severity="MEDIUM",
        target_range_min=0.4,
        target_range_max=0.6,
        unit="ratio",
        source="BASF Plastic Design Mechanics Handbook",
        source_revision_date="2024-01-10",
        confidence=0.92,
        classification="SOFT",
        description="Rib base thickness ratio to prevent cosmetic sink marks on Class A exterior faces."
    ),
}
