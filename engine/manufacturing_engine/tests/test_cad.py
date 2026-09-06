"""
Automated Unit Tests for CAD Backend Operations
"""

from manufacturing_engine.cad.build123d_backend import Build123dBackend

def test_cad_creation_and_mass_props():
    cad = Build123dBackend()
    shape = cad.create_part("TestSolid")
    shape.params = {
        "bottom_diameter": 64.0,
        "top_diameter": 82.0,
        "height": 115.0,
        "shell_thickness": 1.8
    }
    
    props = cad.mass_properties(shape)
    assert props.volume_ml > 0
    assert props.mass_g > 0
    assert props.surface_area_cm2 > 0

def test_cad_brep_validation():
    cad = Build123dBackend()
    shape = cad.create_part("TestSolid")
    top_res = cad.validate_shape(shape)
    assert top_res.is_valid
    assert top_res.is_watertight
    assert top_res.is_manifold
    assert "BRepCheck" in top_res.occt_check_status
