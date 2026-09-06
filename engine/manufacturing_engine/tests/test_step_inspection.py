"""Real STEP round trips with analytic reference values; not an industrial library."""
import math
import pytest
b=pytest.importorskip("build123d")
from manufacturing_engine.cad.step_inspection import inspect_step
pytestmark=pytest.mark.real_cad

def imported(tmp_path,shape,**settings):
    path=tmp_path/"reference.step";b.export_step(shape,path)
    return inspect_step(path,**settings)

def test_plate_measurements_and_thickness(tmp_path):
    result=imported(tmp_path,b.Box(40,30,2))
    assert result['volume']==pytest.approx(2400,abs=1e-5)
    assert result['area']==pytest.approx(2680,abs=1e-5)
    assert result['dimensions']==pytest.approx([40,30,2],abs=1e-5)
    assert len(result['faces'])==6 and result['edges']==12
    assert min(f['thickness'] for f in result['faces'])==pytest.approx(2,abs=1e-5)
    assert all(f['blocked'] is False for f in result['faces'])

def test_pull_reversal(tmp_path):
    path=tmp_path/'plate.step';b.export_step(b.Box(40,30,2),path)
    plus=inspect_step(path,direction='+Z');minus=inspect_step(path,direction='-Z')
    assert plus['revision']==minus['revision']
    for a,c in zip(plus['faces'],minus['faces']):assert a['draft']==pytest.approx(-c['draft'])

@pytest.mark.parametrize('wall',[.6,2.0,4.0])
def test_open_cup_volume(tmp_path,wall):
    outer=b.Cylinder(20,40,align=(b.Align.CENTER,b.Align.CENTER,b.Align.MIN))
    inner=b.Pos(0,0,wall)*b.Cylinder(20-wall,40,align=(b.Align.CENTER,b.Align.CENTER,b.Align.MIN))
    result=imported(tmp_path,outer-inner)
    expected=math.pi*(20**2*40-(20-wall)**2*(40-wall))
    assert result['volume']==pytest.approx(expected,rel=1e-7)
    assert all(len(f['positions'])%3==0 for f in result['faces'])
    assert result['provenance']['analysis']=='ESTIMATED'

def test_multi_solid_rejected(tmp_path):
    with pytest.raises(ValueError,match='exactly one solid'):
        imported(tmp_path,b.Compound(children=[b.Box(2,2,2),b.Pos(10,0,0)*b.Box(2,2,2)]))

def test_invalid_step_rejected(tmp_path):
    path=tmp_path/'invalid.step';path.write_text('not a STEP file')
    with pytest.raises(Exception):inspect_step(path)
