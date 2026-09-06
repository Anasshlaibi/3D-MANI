"""
Automated Unit Tests for DSL Parser & Grammar
"""

import pytest
from manufacturing_engine.dsl.parser import parse_dsl

VALID_DSL = """
PART Cup_001 {
  PROCESS INJECTION_MOLDING
  MATERIAL PP

  REQUIRE {
    VOLUME >= 400ml
    HEIGHT <= 120mm
    STACKABLE true
    MIN_SAFETY_FACTOR 2.0
  }

  GEOMETRY {
    PROFILE {
      BOTTOM_DIAMETER 64.0mm
      TOP_DIAMETER 82.0mm
      HEIGHT 115.0mm
    }
    SHELL 1.8mm
    DRAFT 1.75deg
    FILLET base 2.0mm
  }

  FEATURES {
    RIM radius=3.0mm
  }

  LOCK {
    VOLUME
    HEIGHT
  }

  OPTIMIZE {
    MINIMIZE mass
  }
}
"""

def test_valid_dsl_parse():
    program, report = parse_dsl(VALID_DSL)
    assert not report.has_errors
    assert len(program.parts) == 1
    part = program.parts[0]
    assert part.part_name == "Cup_001"
    assert part.process.process_type == "INJECTION_MOLDING"
    assert part.material.material_name == "PP"
    assert part.geometry.profile.bottom_diameter.canonical_value == 64.0

def test_invalid_syntax():
    invalid_dsl = "PART Cup { PROCESS INJECTION_MOLDING INVALID SYNTAX }}}"
    program, report = parse_dsl(invalid_dsl)
    assert report.has_errors

def test_unknown_material():
    unknown_mat_dsl = "PART Cup { PROCESS INJECTION_MOLDING MATERIAL UNKNOWN_RESIN_99 GEOMETRY { PROFILE { BOTTOM_DIAMETER 64mm TOP_DIAMETER 82mm HEIGHT 115mm } } }"
    program, report = parse_dsl(unknown_mat_dsl)
    assert report.has_errors
    assert any(d.code == "E_UNKNOWN_MATERIAL" for d in report.diagnostics)

def test_missing_profile_block():
    missing_prof_dsl = "PART Cup { PROCESS INJECTION_MOLDING MATERIAL PP GEOMETRY { SHELL 1.8mm } }"
    program, report = parse_dsl(missing_prof_dsl)
    assert report.has_errors
    assert any(d.code == "E_MISSING_PROFILE" for d in report.diagnostics)

def test_duplicate_lock():
    dup_lock_dsl = "PART Cup { PROCESS INJECTION_MOLDING MATERIAL PP GEOMETRY { PROFILE { BOTTOM_DIAMETER 64mm TOP_DIAMETER 82mm HEIGHT 115mm } } LOCK { VOLUME VOLUME } }"
    program, report = parse_dsl(dup_lock_dsl)
    assert report.has_errors
    assert any(d.code == "E_DUPLICATE_LOCK" for d in report.diagnostics)

def test_impossible_values():
    neg_dim_dsl = "PART Cup { PROCESS INJECTION_MOLDING MATERIAL PP GEOMETRY { PROFILE { BOTTOM_DIAMETER -50.0mm TOP_DIAMETER 82mm HEIGHT 115mm } } }"
    program, report = parse_dsl(neg_dim_dsl)
    assert report.has_errors
    assert any(d.code == "E_INVALID_DIMENSION" for d in report.diagnostics)
