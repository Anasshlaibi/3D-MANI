"""
FastAPI Request and Response Models
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ParseDSLRequest(BaseModel):
    dslText: str

class CompileDSLRequest(BaseModel):
    dslText: str

class RunValidationRequest(BaseModel):
    dslText: str
    revision: Optional[int] = 1
