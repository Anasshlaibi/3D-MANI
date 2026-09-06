"""
Automated Unit Tests for CAD Backend Operations

HONESTY NOTE (M2 Remediation):
Tests explicitly check execution_mode and source fields.
When build123d is not installed, tests assert SIMULATED_GEOMETRY and FORMULA_ESTIMATE.
Real CAD tests are gated behind @pytest.mark.skipif.
"""

import pytest
from manufacturing_engine.cad.build123d_backend import (
    get_cad_backend, SimulatedBackend, HAS_BUILD123D
)


class TestSimulatedBackend:
    """Tests for the SimulatedBackend — always run, no build123d required."""

    def test_simulated_backend_execution_mode(self):
        backend = SimulatedBackend()
        assert backend.execution_mode == "SIMULATED_GEOMETRY"
        assert "NOT available" in backend.backend_name or "Simulated" in backend.backend_name

    def test_simulated_mass_props_source(self):
        backend = SimulatedBackend()
        shape = backend.create_part("TestSolid")
        shape.params = {
            "bottom_diameter": 64.0,
            "top_diameter": 82.0,
            "height": 115.0,
            "shell_thickness": 1.8
        }
        props = backend.mass_properties(shape)
        assert props.source == "FORMULA_ESTIMATE"
        assert props.volume_ml > 0
        assert props.mass_g > 0
        assert props.surface_area_cm2 > 0

    def test_simulated_validate_shape_unknown(self):
        backend = SimulatedBackend()
        shape = backend.create_part("TestSolid")
        top_res = backend.validate_shape(shape)
        # HONEST: should NOT claim is_valid=True
        assert top_res.is_valid is None
        assert top_res.validated_by == "UNAVAILABLE_STUB"
        assert top_res.occt_check_status == "NOT_AVAILABLE_NO_OCCT"

    def test_factory_returns_correct_backend(self):
        backend, is_real = get_cad_backend()
        if HAS_BUILD123D:
            assert is_real is True
            assert backend.execution_mode == "REAL_OCCT"
        else:
            assert is_real is False
            assert backend.execution_mode == "SIMULATED_GEOMETRY"


@pytest.mark.skipif(not HAS_BUILD123D, reason="build123d/OCP not installed")
class TestRealBuild123dBackend:
    """Tests that require real build123d — skipped when not installed."""

    @pytest.mark.real_cad
    def test_real_backend_execution_mode(self):
        backend, is_real = get_cad_backend()
        assert is_real is True
        assert backend.execution_mode == "REAL_OCCT"

    @pytest.mark.real_cad
    def test_real_mass_props_from_occt(self):
        backend, is_real = get_cad_backend()
        assert is_real
        # Would test actual OCCT geometry here
        # placeholder for when build123d is installed
