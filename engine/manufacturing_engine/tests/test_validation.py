"""
Automated Unit Tests for Validation Ladder & Provenance

HONESTY NOTE (M2 Remediation):
When build123d is not installed, gates 3-5 report SIMULATED_ESTIMATE
and gate 6 reports REAL_RULES_SIMULATED_GEOMETRY. Tests now assert
the CORRECT validation types based on actual CAD availability.
"""

from manufacturing_engine.cad.build123d_backend import HAS_BUILD123D
from manufacturing_engine.validation.orchestrator import run_full_validation_ladder

PASS_DSL = """
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
  }

  LOCK {
    VOLUME
  }
}
"""

FAIL_WALL_DSL = """
PART Cup_Thin {
  PROCESS INJECTION_MOLDING
  MATERIAL PP

  GEOMETRY {
    PROFILE {
      BOTTOM_DIAMETER 64.0mm
      TOP_DIAMETER 82.0mm
      HEIGHT 115.0mm
    }
    SHELL 0.4mm
    DRAFT 1.75deg
  }
}
"""

def test_validation_ladder_pass_fixture():
    res = run_full_validation_ladder(PASS_DSL, revision=1)
    assert res["overallPassed"]
    assert len(res["gates"]) == 7

    for g in res["gates"]:
        assert g["status"] == "PASS"
        assert "executor" in g
        assert "started_at" in g
        # Verify validation types are honest based on CAD availability
        gate_num = g["gateNumber"]
        if gate_num <= 2:
            # Gates 0-2 are always real (no CAD needed)
            assert g["validationType"] == "REAL_VALIDATION", \
                f"Gate {gate_num} should always be REAL_VALIDATION"
        elif gate_num <= 5:
            if HAS_BUILD123D:
                assert g["validationType"] == "REAL_VALIDATION"
            else:
                assert g["validationType"] == "SIMULATED_ESTIMATE", \
                    f"Gate {gate_num} should be SIMULATED_ESTIMATE without build123d"
        elif gate_num == 6:
            if HAS_BUILD123D:
                assert g["validationType"] == "REAL_VALIDATION"
            else:
                assert g["validationType"] == "REAL_RULES_SIMULATED_GEOMETRY", \
                    f"Gate 6 should be REAL_RULES_SIMULATED_GEOMETRY without build123d"

    # Overall validation type should reflect lowest confidence tier
    if not HAS_BUILD123D:
        assert res["validationType"] == "SIMULATED_ESTIMATE", \
            "Overall validationType must not claim REAL_VALIDATION without build123d"
        assert res["cadExecutionMode"] == "SIMULATED_GEOMETRY"


def test_validation_ladder_fail_fixture():
    res = run_full_validation_ladder(FAIL_WALL_DSL, revision=1)
    assert not res["overallPassed"]
    gate6 = next(g for g in res["gates"] if g["gateNumber"] == 6)
    assert gate6["status"] == "FAIL"
    assert res["deltaPayload"] is not None
    assert res["deltaPayload"]["failedGate"] == 6


def test_validation_ladder_reports_cad_backend():
    """Verify the response includes CAD backend metadata."""
    res = run_full_validation_ladder(PASS_DSL, revision=1)
    assert "cadBackend" in res
    assert "cadExecutionMode" in res
    if not HAS_BUILD123D:
        assert "Simulated" in res["cadBackend"] or "NOT available" in res["cadBackend"]
