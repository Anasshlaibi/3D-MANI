# CAD Kernel Abstraction Intake (`/references/open_source/cad`)

## Priority Repositories Audited

### 1. build123d
- **Repository:** https://github.com/gumyr/build123d
- **License:** Apache-2.0
- **Classification:** Primary CAD Backend Dependency (Wrapped)
- **Role:** Primary reference and direct dependency for deterministic parametric CAD generation on OpenCascade / OCP.
- **Studied Subsystems:**
  - `BuildPart`, `BuildSketch`, `BuildLine` context managers
  - Topological selectors (`faces().filter_by(...)`, algebraic indexing)
  - Solid operations: Extrude, Revolve, Sweep, Loft, Shell, Draft, Fillet, Chamfer
  - Direct STEP, SVG, DXF, and glTF / GLB export pipelines
  - Shape validation & exception handling (`BRepCheck_Analyzer` encapsulation)
- **Architectural Boundary:**
  - High-level AI layers **never** import or call `build123d` directly.
  - All calls transit through internal `CADBackendAdapter` (`/cad/base.py` / `/cad/build123d/`).

### 2. CadQuery
- **Repository:** https://github.com/CadQuery/cadquery
- **License:** Apache-2.0
- **Classification:** Secondary Architecture Reference & Fallback Adapter
- **Role:** Reference implementation for Workplane architecture, mature STEP workflows, and assembly management.
- **Studied Subsystems:**
  - Workplane fluent chaining patterns
  - OCCT wrapper utilities and FreeCAD interoperability
  - Selector query parsing engine

### 3. FreeCAD & FreeCAD Code Workbench
- **Repositories:**
  - https://github.com/FreeCAD/FreeCAD (LGPL-2.1+)
  - https://github.com/jokroese/freecad-code-workbench (MIT)
- **Role:** Engineering workstation integration for pilot inspection, avoiding rebuilding a full desktop CAD GUI from scratch.
