"""
Canonical Unit Conversion and Quantity Typing System
Converts user/DSL inputs into canonical standard SI quantities.
Canonical units inside CAD/Engine:
- Length: mm
- Angle: deg (converted from rad if needed)
- Volume: ml (cm³)
- Mass: g
- Pressure/Stress: MPa
- Density: g/cm³
"""

from typing import Union, Dict
from pydantic import BaseModel, Field

class Quantity(BaseModel):
    value: float
    unit: str
    canonical_value: float
    canonical_unit: str
    dimension: str

    def __str__(self) -> str:
        return f"{self.canonical_value} {self.canonical_unit}"

# Conversion multipliers to canonical units
LENGTH_CONVERSIONS = {
    "mm": 1.0,
    "cm": 10.0,
    "m": 1000.0,
    "in": 25.4,
    "ft": 304.8,
}

ANGLE_CONVERSIONS = {
    "deg": 1.0,
    "rad": 57.29577951308232,
}

VOLUME_CONVERSIONS = {
    "ml": 1.0,
    "cm3": 1.0,
    "cc": 1.0,
    "l": 1000.0,
    "liter": 1000.0,
    "mm3": 0.001,
}

MASS_CONVERSIONS = {
    "g": 1.0,
    "kg": 1000.0,
    "lb": 453.59237,
}

PRESSURE_CONVERSIONS = {
    "mpa": 1.0,
    "pa": 1e-6,
    "kpa": 1e-3,
    "bar": 0.1,
    "psi": 0.00689476,
}

def parse_quantity(val_str: str, default_dimension: str = "length") -> Quantity:
    """
    Parses strings like '2mm', '0.25in', '400ml', '1.75deg' into typed Quantity objects.
    """
    s = val_str.strip()
    import re
    match = re.match(r"^(-?[0-9.]+)\s*([A-Za-z0-9³]+)?$", s)
    if not match:
        try:
            val = float(s)
            unit = "mm" if default_dimension == "length" else "deg"
            return create_quantity(val, unit)
        except ValueError:
            raise ValueError(f"Cannot parse quantity from string: '{val_str}'")
    
    val = float(match.group(1))
    unit = match.group(2) if match.group(2) else ("mm" if default_dimension == "length" else "deg")
    return create_quantity(val, unit)

def create_quantity(value: float, unit: str) -> Quantity:
    u = unit.lower().strip()
    if u in LENGTH_CONVERSIONS:
        canonical_val = value * LENGTH_CONVERSIONS[u]
        return Quantity(
            value=value,
            unit=unit,
            canonical_value=canonical_val,
            canonical_unit="mm",
            dimension="length"
        )
    elif u in ANGLE_CONVERSIONS:
        canonical_val = value * ANGLE_CONVERSIONS[u]
        return Quantity(
            value=value,
            unit=unit,
            canonical_value=canonical_val,
            canonical_unit="deg",
            dimension="angle"
        )
    elif u in VOLUME_CONVERSIONS:
        canonical_val = value * VOLUME_CONVERSIONS[u]
        return Quantity(
            value=value,
            unit=unit,
            canonical_value=canonical_val,
            canonical_unit="ml",
            dimension="volume"
        )
    elif u in MASS_CONVERSIONS:
        canonical_val = value * MASS_CONVERSIONS[u]
        return Quantity(
            value=value,
            unit=unit,
            canonical_value=canonical_val,
            canonical_unit="g",
            dimension="mass"
        )
    elif u in PRESSURE_CONVERSIONS:
        canonical_val = value * PRESSURE_CONVERSIONS[u]
        return Quantity(
            value=value,
            unit=unit,
            canonical_value=canonical_val,
            canonical_unit="MPa",
            dimension="pressure"
        )
    elif u == "boolean" or u == "bool" or isinstance(value, bool):
        return Quantity(
            value=value,
            unit="boolean",
            canonical_value=value,
            canonical_unit="boolean",
            dimension="boolean"
        )
    else:
        # Fallback / dimensionless
        return Quantity(
            value=value,
            unit=unit,
            canonical_value=value,
            canonical_unit=unit,
            dimension="custom"
        )
