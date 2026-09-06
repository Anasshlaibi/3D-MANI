"""
Parameter Models and State Definition
"""

from enum import Enum
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field
from .units import Quantity

class ParameterStatus(str, Enum):
    LOCKED = "LOCKED"
    VERIFIED = "VERIFIED"
    CALCULATED = "CALCULATED"
    INFERRED = "INFERRED"
    OPTIMIZED = "OPTIMIZED"
    UNKNOWN = "UNKNOWN"
    CONFLICT = "CONFLICT"
    FAILED = "FAILED"

class ProvenanceRecord(BaseModel):
    timestamp: str
    actor: str
    action: str
    previous_value: Optional[Any] = None
    rule_reference: Optional[str] = None

class CanonicalParameter(BaseModel):
    id: str
    name: str
    label: str
    quantity: Quantity
    status: ParameterStatus
    source: str
    ruleset_version: Optional[str] = "1.0.0"
    confidence: float = 1.0
    allowed_min: Optional[float] = None
    allowed_max: Optional[float] = None
    description: Optional[str] = None
    provenance: List[ProvenanceRecord] = Field(default_factory=list)
