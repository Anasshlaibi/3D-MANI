# 3D-MANI — Injection-Mold Engineering Workspace

Product → Moldability → Mold Design → Tooling → Validation → Manufacturing Package.

The protected direction and acceptance criteria are in [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md). The active milestone is **M2: real STEP → moldability**. M2 is **in progress**, not complete.

## Run locally (Windows PowerShell)

```powershell
npm ci
python -m venv .venv
./.venv/Scripts/python.exe -m pip install -e "./engine[cad]"
./.venv/Scripts/python.exe -m uvicorn manufacturing_engine.api.routes:app --host 127.0.0.1 --port 8000
```

In another terminal, run `npm run dev` and open http://localhost:3000.

## Current implementation

- Upload one STEP solid (20 MB limit). OCCT runs in an isolated subprocess with a 120-second timeout.
- Validate B-Rep, reject unsupported multi-solid inputs, and measure bounding dimensions, volume, area, faces and edges.
- Display a tessellation of the imported faces; orbit, zoom, select a face and inspect its data.
- Choose polymer family and one of six axis-aligned pull directions. Changing setup marks previous analysis stale.
- Initial draft, inward-normal thickness, and two-direction obstruction samples use one UV midpoint per face. These are **ESTIMATED**, not full moldability validation. Trimmed-out or failed samples remain unavailable.
- Download a JSON inspection report including input hash, settings and provenance. This is not a mold-component export or CAM package.

Material selection currently records study context. No material grade rules, shrinkage, approval, simulation, mold construction or CAM is executed. Display color thresholds are generic visualization guides, not pass/fail criteria. Face IDs refer only to the current imported revision.

## Validation

```powershell
npm run build
npm run lint
./.venv/Scripts/python.exe -m pytest engine/manufacturing_engine/tests/test_step_inspection.py -v
```

The initial tests round-trip analytically defined solids through real STEP: plate measurements/thickness, direction reversal, three cup wall sizes, multi-solid rejection and invalid input. They are synthetic regression fixtures, **not** the meaningful industrial plastic-part library required to complete M2.

Remaining M2 work includes broader surface sampling and coverage, reference plastic-part library, stronger undercut analysis, geometry repair diagnostics and validated material rules. Later workspaces visibly remain unavailable.

The previous DSL/demo components are retained as legacy source but are no longer the application entry point. Their historical claims and exports are not evidence of M2 capability.

## Interface references

The workspace follows conventional geometry-tree, viewport and results-pane organization, informed by [Autodesk Moldflow UI documentation](https://help.autodesk.com/cloudhelp/2019/ENU/MoldflowInsight-NewUser/files/GUID-645CE8B5-BCD2-44D6-B153-F88546CB5B00.htm) and the [FreeCAD DFM workbench overview](https://blog.freecad.org/2026/04/21/new-wip-design-for-manufacture-workbench/). No code was copied from either product.
