# CAD Backend Interface Specification

## Document ID: `CAD_BACKEND_INTERFACE.md`

### 1. Selected Dependency & Rationale

We selected **build123d** (v0.6.0+) as our primary CAD generation dependency, with **CadQuery** maintained as a secondary architectural reference and fallback adapter.

#### Why build123d?
1. **Context Manager Paradigm:** `build123d` structures parametric geometry hierarchically via Python context managers (`with BuildPart(): with BuildSketch(): ...`). This maps directly to our hierarchical Manufacturing DSL Abstract Syntax Tree (AST).
2. **Persistent Handles:** Unlike CadQuery's fluent string selectors (e.g., `>Z[1]`), `build123d` allows storing persistent object handles to faces and edges, reducing topological detachment during parameter edits.
3. **Native Modern OCCT Binding:** Built directly upon `OCP` (OpenCASCADE Python), providing high-speed headless B-Rep construction without GUI or FreeCAD overhead.
4. **License Compatibility:** Permissive Apache-2.0 license.

---

### 2. What We Expose

The internal `CADBackendAdapter` exposes only deterministic parametric operations:
- **Primitives & Sketches:** 2D profiles (Circles, Rectangles, Polygons, Trapezia, Splines) and constraints.
- **3D Operations:** Extrude, Revolve, Sweep along path, Loft through sections.
- **Modifiers:** Shell (uniform inward/outward wall thickness), Draft angle (with specified pull direction), Fillet, Chamfer.
- **Booleans:** Fuse (Union), Cut (Difference), Intersect.
- **Topological Queries:** Semantic face filtering by orientation vector ($\vec{n} \cdot \vec{z} > 0$), area, and curvature.
- **Export Pipelines:** Exact STEP (ISO 10303-214/242) and tessellated GLB / glTF for browser inspection.

---

### 3. What We Hide

Higher layers (AI Planner, Manufacturing DSL, Validation Orchestrator, User Interface) must **never** touch:
- Raw OpenCascade C++ handles (`TopoDS_Shape`, `BRepAlgoAPI`, `TopExp_Explorer`).
- Upstream runtime exceptions and raw traceback dumps.
- Direct pointer manipulation or arbitrary script execution.
- Arbitrary CadQuery `Workplane` chains.

All upstream CAD kernel failures are intercepted and normalized into structured diagnostics:
```json
{
  "status": "FAILED",
  "gate": 1,
  "error_code": "TOPOLOGY_SHELL_DEGENERATE",
  "feature_id": "@sidewall",
  "message": "Shell operation failed with wall thickness 0.5mm: radius of curvature 0.4mm is smaller than wall thickness."
}
```

---

### 4. What We Add

Our architectural wrapper provides proprietary capabilities missing from vanilla upstream CAD libraries:
1. **Manufacturing DSL Compiler:** Translates constrained `.mfgdsl` code into validated builder calls.
2. **Semantic Face & Edge Tagging:** Solves the Topological Naming Problem by attaching stable IDs (`@base_face`, `@sidewall_ext`, `@lip_rim`) to geometry.
3. **Deterministic DFM Analysis:** Ray-casting wall thickness mapping, draft angle heatmaps, undercut detection, and parting line estimation directly on the resulting B-Rep.
4. **Parameter State Machine:** Enforces `[LOCKED | VERIFIED | CALCULATED | INFERRED | OPTIMIZED | CONFLICT | FAILED]` states.
5. **Delta-Based Patch Engine:** Computes localized geometric edits rather than re-executing full unconstrained rebuilds.

---

### 5. Guarantees Our Layer Provides

- **Manifold Invariance:** Every emitted STEP model is guaranteed to be a watertight, manifold solid passing OCCT `BRepCheck_Analyzer`.
- **Constraint Immutability:** A parameter marked `LOCKED` by a human engineer cannot be silently altered by any AI repair proposal.
- **Deterministic Replay:** The exact same DSL AST compiled with the same versioned ruleset produces byte-for-byte identical B-Rep geometry and mass properties.
- **Auditable Provenance:** Every vertex, face, and parameter stores its source, ruleset version, and revision timestamp.
