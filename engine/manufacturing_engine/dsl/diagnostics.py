"""
Diagnostics and Error Reporting for Manufacturing DSL
"""

from typing import Optional, List
from pydantic import BaseModel
from .ast_nodes import SourceSpan

class DiagnosticMessage(BaseModel):
    severity: str  # "ERROR", "WARNING", "INFO"
    code: str
    message: str
    source_span: SourceSpan
    suggested_fix: Optional[str] = None

class DiagnosticReport(BaseModel):
    has_errors: bool = False
    diagnostics: List[DiagnosticMessage] = []

    def add_error(self, code: str, message: str, span: SourceSpan, fix: Optional[str] = None):
        self.has_errors = True
        self.diagnostics.append(DiagnosticMessage(
            severity="ERROR",
            code=code,
            message=message,
            source_span=span,
            suggested_fix=fix
        ))

    def add_warning(self, code: str, message: str, span: SourceSpan, fix: Optional[str] = None):
        self.diagnostics.append(DiagnosticMessage(
            severity="WARNING",
            code=code,
            message=message,
            source_span=span,
            suggested_fix=fix
        ))
