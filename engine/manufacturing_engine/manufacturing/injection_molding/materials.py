"""
Approved Material Specifications and Provenance
"""

from typing import Dict
from pydantic import BaseModel

class MaterialSpec(BaseModel):
    id: str
    name: str
    grade: str
    family: str
    density: float  # g/cm³
    youngs_modulus: float  # MPa
    yield_strength: float  # MPa
    tensile_strength: float  # MPa
    thermal_shrinkage: float  # %
    min_wall_thickness: float  # mm
    max_wall_thickness: float  # mm
    recommended_draft_angle: float  # deg
    melt_temperature: float  # °C
    mold_temperature: float  # °C
    cost_per_kg: float  # USD
    food_contact_certified: bool
    provenance: str

MATERIALS_DATABASE: Dict[str, MaterialSpec] = {
    "PP": MaterialSpec(
        id="PP",
        name="Polypropylene Homopolymer",
        grade="Total Petrochemicals PPH 9020",
        family="Polyolefin",
        density=0.90,
        youngs_modulus=1450.0,
        yield_strength=34.0,
        tensile_strength=37.0,
        thermal_shrinkage=1.6,
        min_wall_thickness=0.8,
        max_wall_thickness=3.5,
        recommended_draft_angle=1.75,
        melt_temperature=230.0,
        mold_temperature=40.0,
        cost_per_kg=1.85,
        food_contact_certified=True,
        provenance="ISO 1873-1 / MatWeb Total Petrochemicals PPH 9020 TDS (2024)"
    ),
    "PP_HOMOPOLYMER": MaterialSpec(
        id="PP_HOMOPOLYMER",
        name="Polypropylene Homopolymer",
        grade="Total Petrochemicals PPH 9020",
        family="Polyolefin",
        density=0.90,
        youngs_modulus=1450.0,
        yield_strength=34.0,
        tensile_strength=37.0,
        thermal_shrinkage=1.6,
        min_wall_thickness=0.8,
        max_wall_thickness=3.5,
        recommended_draft_angle=1.75,
        melt_temperature=230.0,
        mold_temperature=40.0,
        cost_per_kg=1.85,
        food_contact_certified=True,
        provenance="ISO 1873-1 / MatWeb Total Petrochemicals PPH 9020 TDS (2024)"
    ),
    "ABS": MaterialSpec(
        id="ABS",
        name="Acrylonitrile Butadiene Styrene",
        grade="Sabic Cycolac MG47",
        family="Styrenic",
        density=1.05,
        youngs_modulus=2250.0,
        yield_strength=44.0,
        tensile_strength=46.0,
        thermal_shrinkage=0.6,
        min_wall_thickness=1.14,
        max_wall_thickness=3.5,
        recommended_draft_angle=2.0,
        melt_temperature=245.0,
        mold_temperature=60.0,
        cost_per_kg=2.75,
        food_contact_certified=False,
        provenance="ISO 2580-1 / Sabic Cycolac MG47 Datasheet (2023)"
    ),
    "PC": MaterialSpec(
        id="PC",
        name="Polycarbonate Unfilled",
        grade="Covestro Makrolon 2805",
        family="Polycarbonate",
        density=1.20,
        youngs_modulus=2350.0,
        yield_strength=62.0,
        tensile_strength=68.0,
        thermal_shrinkage=0.6,
        min_wall_thickness=1.5,
        max_wall_thickness=4.0,
        recommended_draft_angle=2.0,
        melt_temperature=295.0,
        mold_temperature=85.0,
        cost_per_kg=3.90,
        food_contact_certified=True,
        provenance="Covestro Makrolon Technical Product Sheet (2023)"
    ),
    "PA66_GF30": MaterialSpec(
        id="PA66_GF30",
        name="Polyamide 66 (30% Glass Fiber)",
        grade="BASF Ultramid A3EG6",
        family="Polyamide",
        density=1.36,
        youngs_modulus=8500.0,
        yield_strength=175.0,
        tensile_strength=180.0,
        thermal_shrinkage=0.4,
        min_wall_thickness=1.2,
        max_wall_thickness=4.5,
        recommended_draft_angle=2.5,
        melt_temperature=290.0,
        mold_temperature=90.0,
        cost_per_kg=4.20,
        food_contact_certified=False,
        provenance="BASF Ultramid Technical Data Sheet ISO 16396-PA66-GF30 (2024)"
    ),
    "POM": MaterialSpec(
        id="POM",
        name="Polyoxymethylene (Acetal)",
        grade="DuPont Delrin 500P",
        family="Acetal",
        density=1.42,
        youngs_modulus=3100.0,
        yield_strength=71.0,
        tensile_strength=73.0,
        thermal_shrinkage=2.0,
        min_wall_thickness=1.0,
        max_wall_thickness=3.0,
        recommended_draft_angle=1.5,
        melt_temperature=215.0,
        mold_temperature=90.0,
        cost_per_kg=3.40,
        food_contact_certified=True,
        provenance="DuPont Delrin Engineering Design Guide (2023)"
    ),
}
