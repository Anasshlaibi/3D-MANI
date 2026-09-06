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
    """Tests for real STEP export & round-trip verification using OCCT / build123d."""

    @pytest.mark.real_cad
    def test_real_step_export_verified(self):
        import build123d as b3d
        shape = b3d.Cone(bottom_radius=32.0, top_radius=41.0, height=115.0)
        step_text, is_real = export_step_from_shape(shape, part_name="Cone_Cup_001")

        assert is_real is True
        assert "ISO-10303-21;" in step_text
        assert "END-ISO-10303-21;" in step_text
        assert "TEMPLATE_PLACEHOLDER" not in step_text
        assert "TEMPLATE PLACEHOLDER" not in step_text
        # Real B-Rep entities produced by OpenCASCADE STEPControl_Writer
        assert "MANIFOLD_SOLID_BREP" in step_text or "CLOSED_SHELL" in step_text or "ADVANCED_FACE" in step_text

    @pytest.mark.real_cad
    def test_real_step_roundtrip_import_and_occt_validation(self):
        """
        Full STEP round-trip verification:
        1. Create real 3D solid (frustum cone)
        2. Export solid to STEP
        3. Import STEP back via build123d / OCCT
        4. Validate B-Rep topology with BRepCheck_Analyzer
        5. Compare bounding boxes within tolerance
        6. Compare volumes within tolerance
        7. Confirm single valid solid
        """
        import os
        import tempfile
        import build123d as b3d
        from OCP.BRepCheck import BRepCheck_Analyzer

        # 1. Create real 3D manufacturing solid
        orig_shape = b3d.Cone(bottom_radius=32.0, top_radius=41.0, height=115.0)
        assert orig_shape.is_valid, "Original shape must be topologically valid"

        # 2. Export solid to temporary STEP file
        fd, step_path = tempfile.mkstemp(suffix=".step")
        os.close(fd)
        try:
            b3d.export_step(orig_shape, step_path)
            assert os.path.getsize(step_path) > 500, "STEP file must contain actual B-Rep geometry"

            # 3. Import STEP back via build123d / OCCT
            imported_shape = b3d.import_step(step_path)
            assert imported_shape is not None, "STEP import must succeed"

            # 4. Validate B-Rep topology using OCCT BRepCheck_Analyzer
            analyzer = BRepCheck_Analyzer(imported_shape.wrapped)
            assert analyzer.IsValid(), "Imported shape must pass OCCT BRepCheck_Analyzer"

            # 5. Compare bounding boxes within tight numeric tolerance (0.01mm)
            orig_bb = orig_shape.bounding_box()
            imp_bb = imported_shape.bounding_box()

            assert abs(orig_bb.min.X - imp_bb.min.X) < 1e-3
            assert abs(orig_bb.min.Y - imp_bb.min.Y) < 1e-3
            assert abs(orig_bb.min.Z - imp_bb.min.Z) < 1e-3
            assert abs(orig_bb.max.X - imp_bb.max.X) < 1e-3
            assert abs(orig_bb.max.Y - imp_bb.max.Y) < 1e-3
            assert abs(orig_bb.max.Z - imp_bb.max.Z) < 1e-3

            # 6. Compare volume within tolerance (< 0.001% relative error)
            vol_orig = orig_shape.volume
            vol_imp = imported_shape.volume
            rel_error = abs(vol_orig - vol_imp) / vol_orig
            assert rel_error < 1e-5, f"Volume mismatch: {vol_orig} vs {vol_imp} (rel error {rel_error})"

            # 7. Confirm single valid solid
            assert len(imported_shape.solids()) == 1, "Must contain exactly one solid"
            assert imported_shape.solids()[0].is_valid, "Imported solid must be valid"
        finally:
            if os.path.exists(step_path):
                os.remove(step_path)

