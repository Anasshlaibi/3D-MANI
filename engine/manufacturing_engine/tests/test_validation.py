"""
Automated Unit Tests for Validation Ladder & Provenance
"""

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
        assert g["validationType"] == "REAL_VALIDATION"
        assert "executor" in g
        assert "started_at" in g

def test_validation_ladder_fail_fixture():
    res = run_full_validation_ladder(FAIL_WALL_DSL, revision=1)
    assert not res["overallPassed"]
    gate6 = next(g for g in res["gates"] if g["gateNumber"] == 6)
    assert gate6["status"] == "FAIL"
    assert res["deltaPayload"] is not None
    assert res["deltaPayload"]["failedGate"] == 6
