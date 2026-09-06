"""
Automated Unit Tests for STEP Export and Validation
"""

from manufacturing_engine.cad.build123d_backend import Build123dBackend
from manufacturing_engine.cad.exporters import export_step_from_shape

def test_step_export_structure():
    cad = Build123dBackend()
    shape = cad.create_part("TestStepSolid")
    step_text, verified = export_step_from_shape(shape, part_name="TestStepSolid")
    
    assert verified
    assert "ISO-10303-21;" in step_text
    assert "HEADER;" in step_text
    assert "ENDSEC;" in step_text
    assert "MANIFOLD_SOLID_BREP" in step_text or "PRODUCT" in step_text
