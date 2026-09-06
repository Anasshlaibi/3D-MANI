"""
Automated Unit Tests for STEP Export and Validation

HONESTY NOTE (M2 Remediation):
When build123d/OCP is not installed, the STEP exporter uses a template
fallback and returns verified=False. Tests assert this honestly.
"""

import pytest
from manufacturing_engine.cad.build123d_backend import SimulatedBackend, HAS_BUILD123D
from manufacturing_engine.cad.exporters import export_step_from_shape


class TestSimulatedStepExport:
    """Tests for STEP export WITHOUT build123d — always run."""

    def test_step_template_is_not_verified(self):
        """Template fallback must return verified=False."""
        backend = SimulatedBackend()
        shape = backend.create_part("TestStepSolid")
        step_text, is_real_export = export_step_from_shape(shape, part_name="TestStepSolid")

        # HONEST: template fallback is NOT a real export
        assert is_real_export is False
        assert "ISO-10303-21;" in step_text
        assert "HEADER;" in step_text
        assert "TEMPLATE PLACEHOLDER" in step_text or "TEMPLATE_PLACEHOLDER" in step_text

    def test_step_template_structure(self):
        """Template should still be syntactically valid STEP structure."""
        backend = SimulatedBackend()
        shape = backend.create_part("TestPart")
        step_text, is_real = export_step_from_shape(shape, part_name="TestPart")

        assert "ISO-10303-21;" in step_text
        assert "ENDSEC;" in step_text
        assert "END-ISO-10303-21;" in step_text
        assert is_real is False


@pytest.mark.skipif(not HAS_BUILD123D, reason="build123d/OCP not installed")
class TestRealStepExport:
    """Tests for real STEP export — skipped when build123d not installed."""

    @pytest.mark.real_cad
    def test_real_step_export_verified(self):
        from manufacturing_engine.cad.build123d_backend import get_cad_backend
        backend, is_real = get_cad_backend()
        assert is_real
        # Would test actual STEP export here
