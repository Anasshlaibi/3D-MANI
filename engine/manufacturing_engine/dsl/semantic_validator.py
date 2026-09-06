"""
Semantic Validator for Manufacturing DSL AST Nodes
Checks material validity, dimensional domains, lock consistency, and required geometry.
"""

from typing import Tuple
from .ast_nodes import ProgramNode, PartNode, SourceSpan
from .diagnostics import DiagnosticReport

APPROVED_MATERIALS = ["PP", "ABS", "PC", "PA66_GF30", "POM", "PP_HOMOPOLYMER"]
APPROVED_PROCESSES = ["INJECTION_MOLDING", "CNC_MACHINING", "SHEET_METAL", "ADDITIVE"]

def validate_ast(program: ProgramNode) -> DiagnosticReport:
    report = DiagnosticReport()
    
    for part in program.parts:
        # Validate Process
        if part.process.process_type not in APPROVED_PROCESSES:
            report.add_error(
                code="E_UNKNOWN_PROCESS",
                message=f"Unsupported process '{part.process.process_type}'. Approved: {APPROVED_PROCESSES}",
                span=part.process.source_span,
                fix="Use INJECTION_MOLDING"
            )
            
        # Validate Material
        if part.material.material_name not in APPROVED_MATERIALS:
            report.add_error(
                code="E_UNKNOWN_MATERIAL",
                message=f"Material '{part.material.material_name}' is not in approved materials list.",
                span=part.material.source_span,
                fix=f"Choose from {APPROVED_MATERIALS}"
            )
            
        # Validate Geometry Profile
        profile = part.geometry.profile
        if profile is None:
            report.add_error(
                code="E_MISSING_PROFILE",
                message="Part geometry requires a PROFILE block.",
                span=part.geometry.source_span,
                fix="Add PROFILE { BOTTOM_DIAMETER 64.0mm TOP_DIAMETER 82.0mm HEIGHT 115.0mm }"
            )
        else:
            if profile.bottom_diameter and profile.bottom_diameter.canonical_value <= 0:
                report.add_error(
                    code="E_INVALID_DIMENSION",
                    message="PROFILE bottom_diameter must be > 0",
                    span=profile.source_span
                )
            if profile.top_diameter and profile.top_diameter.canonical_value <= 0:
                report.add_error(
                    code="E_INVALID_DIMENSION",
                    message="PROFILE top_diameter must be > 0",
                    span=profile.source_span
                )
            if profile.height and profile.height.canonical_value <= 0:
                report.add_error(
                    code="E_INVALID_DIMENSION",
                    message="PROFILE height must be > 0",
                    span=profile.source_span
                )

        # Validate Shell
        if part.geometry.shell and part.geometry.shell.thickness.canonical_value <= 0:
            report.add_error(
                code="E_INVALID_SHELL",
                message="SHELL thickness must be > 0",
                span=part.geometry.shell.source_span
            )

        # Validate Draft
        if part.geometry.draft and part.geometry.draft.angle.canonical_value < 0:
            report.add_error(
                code="E_INVALID_DRAFT",
                message="DRAFT angle cannot be negative",
                span=part.geometry.draft.source_span
            )

        # Validate Locks
        locks = part.locks.locked_parameters
        if len(locks) != len(set(locks)):
            report.add_error(
                code="E_DUPLICATE_LOCK",
                message="Duplicate parameter in LOCK block detected",
                span=part.locks.source_span
            )

    return report
