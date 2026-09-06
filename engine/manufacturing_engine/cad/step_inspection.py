"""Isolated OCCT STEP inspection. Face samples are estimates, never release approval."""
from datetime import datetime, timezone
import hashlib
import importlib.metadata
import json
import math
from pathlib import Path

DIRECTIONS={"+X":(1,0,0),"-X":(-1,0,0),"+Y":(0,1,0),"-Y":(0,-1,0),"+Z":(0,0,1),"-Z":(0,0,-1)}

def inspect_step(path, material="PP", direction="+Z"):
    from build123d import import_step, Vector
    from OCP.BRepCheck import BRepCheck_Analyzer
    from OCP.IntCurvesFace import IntCurvesFace_ShapeIntersector
    from OCP.gp import gp_Lin, gp_Pnt, gp_Dir
    shape=import_step(path)
    if not BRepCheck_Analyzer(shape.wrapped).IsValid():
        raise ValueError("OCCT rejected the B-Rep. Repair the source geometry before analysis.")
    solids=shape.solids()
    if len(solids)!=1:
        raise ValueError("M2 currently requires exactly one solid. Export a single closed product part.")
    if len(shape.faces())!=len(solids[0].faces()):
        raise ValueError("Loose surfaces alongside the solid are unsupported.")
    shape=solids[0]
    faces=list(shape.faces())
    if len(faces)>2000: raise ValueError("This prototype supports at most 2000 faces per part.")
    bbox=shape.bounding_box(); dims=[float(v) for v in bbox.size]
    if shape.volume<=0: raise ValueError("The imported solid has no positive volume.")
    span=max(dims); eps=max(1e-5,span*1e-7)
    intersector=IntCurvesFace_ShapeIntersector(); intersector.Load(shape.wrapped,eps/10)
    def ray(point,vector):
        intersector.Perform(gp_Lin(gp_Pnt(*point),gp_Dir(*vector)),eps/10,span*4)
        if not intersector.IsDone(): raise ValueError("Intersection did not converge")
        values=[intersector.WParameter(i) for i in range(1,intersector.NbPnt()+1) if intersector.WParameter(i)>eps/10]
        return min(values) if values else None
    pull=Vector(*DIRECTIONS[direction]); result=[]; triangles=0
    for index,face in enumerate(faces):
        vertices,indices=face.tessellate(0.1,0.15);triangles+=len(indices)
        if triangles>250000: raise ValueError("Display mesh exceeds the 250000 triangle prototype limit.")
        draft=thickness=blocked=None
        try:
            point=face.position_at(.5,.5)
            if face.is_inside(point):
                normal=face.normal_at(point)
                draft=math.degrees(math.asin(max(-1,min(1,normal.dot(pull)))))
                inward=point-normal*eps
                if shape.is_inside(inward):
                    distance=ray(tuple(inward),tuple(-normal))
                    if distance is not None: thickness=distance+eps
                outside=point+normal*eps
                if not shape.is_inside(outside):
                    blocked=ray(tuple(outside),tuple(pull)) is not None and ray(tuple(outside),tuple(-pull)) is not None
        except Exception:
            # Unsupported sample geometry must not be replaced by a guessed value.
            draft=thickness=blocked=None
        result.append(dict(id=index+1,area=face.area,positions=[float(c) for v in vertices for c in v],indices=[int(c) for t in indices for c in t],draft=draft,thickness=thickness,blocked=blocked))
    return dict(revision=hashlib.sha256(Path(path).read_bytes()).hexdigest(),dimensions=dims,volume=shape.volume,area=shape.area,edges=len(shape.edges()),solids=1,faces=result,
        provenance=dict(geometry="CALCULATED",analysis="ESTIMATED",createdAt=datetime.now(timezone.utc).isoformat(),algorithm="occt-face-uv-midpoint-rays-v1",build123d=importlib.metadata.version("build123d"),units="mm",material=material,materialUse="Context only; no grade-specific rules applied",direction=direction,tessellationToleranceMm=.1,samplesPerFace=1,successfulThicknessSamples=sum(f['thickness'] is not None for f in result),faceIds="Stable within this import revision only"),
        limitations=["One UV-midpoint sample per face; trimmed-out midpoints are unavailable. No complete thickness map.","Thickness is the first inward normal-ray intersection, not minimum local thickness.","Signed draft is relative to the selected pull direction. Negative normals alone are not undercuts.","Undercut candidates use two opposite pull rays at a face sample. No parting assignment, swept-volume test, or mold-release proof.","Color thresholds (1.5 degrees; 1–4 mm) are display guides, not material acceptance rules."])

if __name__=="__main__":
    import sys
    try: output={"data":inspect_step(sys.argv[1],sys.argv[3],sys.argv[4])}
    except ImportError: output={"error":"OCCT dependencies are unavailable. Install engine[cad]."}
    except Exception as exc: output={"error":str(exc) or "OCCT could not inspect this STEP file."}
    Path(sys.argv[2]).write_text(json.dumps(output,allow_nan=False),encoding="utf-8")
