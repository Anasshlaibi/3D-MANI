# Open Source Registry

This document records the formal evaluation, classification, and binding decision for every external open-source repository audited for the **AI Manufacturing Design Engine**.

## Architectural Binding Decision Framework

Before writing any geometry or ML subsystem, all engineering follows the decision hierarchy:
1. **Existing Stable Library** $\rightarrow$ Wrap behind internal interface.
2. **Existing Implementation Requiring Adaptation** $\rightarrow$ Adapt if architecture and license permit.
3. **Existing Research Implementation** $\rightarrow$ Study architecture.
4. **Nothing Appropriate Exists** $\rightarrow$ Implement internally.

Strictly forbidden justification: *"We can write it ourselves."*

---

## Tier 1 — Core CAD

### Repository: build123d
- **Category:** CAD Kernel Abstraction
- **Decision:** **USE AS PRIMARY DEPENDENCY**
- **Capabilities:**
  - Parametric B-Rep solid modeling via context managers (`BuildPart`, `BuildSketch`, `BuildLine`)
  - 2D sketch constraints and direct 3D extrusions, revolves, sweeps, lofts
  - Boolean operations (fuse, cut, common)
  - Fillets, chamfers, shell operations, draft angles
  - Robust topological selectors and algebraic face/edge queries
  - Direct STEP and glTF / GLB export
  - Inherent OCCT error trapping
- **Do We Reimplement?** **NO**
- **Wrapper Required?** **YES (`CADBackendAdapter` in `/cad/build123d/`)**
- **License:** Apache-2.0
- **Risk:** Upstream API changes; Python OCP binding version pinning
- **Internal Interface:** `CADBackend`
- **Phase:** Production V1 / MVP

---

### Repository: CadQuery
- **Category:** Secondary CAD Architecture / Reference Implementation
- **Decision:** **STUDY AS REFERENCE / SECONDARY ADAPTER**
- **Capabilities:**
  - Workplane fluent method chaining
  - Assembly hierarchies and joint definitions
  - Mature STEP import/export workflows
  - Extensive regression test suite covering OCCT edge cases
- **Do We Reimplement?** **NO**
- **Wrapper Required?** **YES (`CADBackendAdapter` in `/cad/cadquery/`)**
- **License:** Apache-2.0
- **Risk:** Dual competing abstractions if not strictly encapsulated behind adapter
- **Internal Interface:** `CADBackend`
- **Phase:** Reference & Secondary Adapter

---

## Tier 2 — OCCT / Low-Level Geometry

### Repository: Open CASCADE Technology (OCCT)
- **Category:** Core B-Rep Geometry Kernel
- **Decision:** **USE AS FOUNDATIONAL DEPENDENCY (VIA OCP)**
- **Capabilities:**
  - Boundary-representation (B-Rep) topological model (`TopoDS_Shape`, `TopoDS_Face`, etc.)
  - Analytic and NURBS curves/surfaces
  - Boolean algorithms (`BRepAlgoAPI`)
  - Topology validation (`BRepCheck_Analyzer`)
  - Shape healing (`ShapeFix_Shape`)
  - STEP / IGES standard translation engines
- **Do We Reimplement?** **NO (Decades of solved numerical geometry)**
- **Wrapper Required?** **YES (Encapsulated by build123d and internal adapters)**
- **License:** LGPL-2.1 with Open CASCADE Exception (Permissive linking)
- **Risk:** Low-level C++ segmentation faults on degenerate topology; must isolate in separate worker processes
- **Internal Interface:** `CADBackend` / `ValidationGate_2`
- **Phase:** Production V1

---

### Repository: pythonocc-core
- **Category:** Low-Level OCCT Python Bindings
- **Decision:** **USE ONLY BEHIND INTERNAL ADAPTER AS FALLBACK**
- **Capabilities:**
  - Direct 1:1 exposure of OpenCascade C++ API in Python
  - Advanced B-Rep topological walks
  - Detailed STEP AP214/AP242 metadata extraction
  - Exact moment of inertia and mass properties calculation
- **Do We Reimplement?** **NO**
- **Wrapper Required?** **YES**
- **License:** LGPL-3.0
- **Risk:** Complex installation wheels, API verbosity, rest of system must never touch pythonocc APIs
- **Internal Interface:** `OCCTLowLevelService`
- **Phase:** Production V1 (Diagnostic & Repair only)

---

### Repository: pythonocc-demos
- **Category:** Engineering Reference Implementation
- **Decision:** **STUDY ONLY / ENGINEERING EXAMPLES**
- **Capabilities:**
  - Validated examples for surface reconstruction, STEP metadata extraction, shape healing
- **Do We Reimplement?** **NO**
- **Wrapper Required?** **NO (Reference material only)**
- **License:** GPL-3.0 / LGPL-3.0 (inspect per demo)
- **Risk:** Copying GPL code into proprietary modules (Strictly forbidden: reference logic only)
- **Internal Interface:** N/A (Documentation & test cases)
- **Phase:** Research / Design reference

---

## Tier 3 — CAD Deep Learning

### Repository: BRepNet
- **Category:** B-Rep Deep Learning / Topological GNN
- **Decision:** **RESEARCH / ADAPT CONCEPTS**
- **Capabilities:**
  - Neural network operating directly on B-Rep face, edge, and coedge adjacency graphs
  - Feature segmentation on industrial STEP CAD models
- **Do We Reimplement?** **Not initially**
- **Wrapper Required?** **YES (When adopted)**
- **License:** Apache-2.0
- **Risk:** Complex training pipeline; research codebase; inference latency
- **Internal Interface:** `BRepGraphEncoder`
- **Phase:** R&D / V2+ (Do NOT make a required dependency for deterministic MVP)

---

### Repository: UV-Net
- **Category:** Boundary Representation Learning
- **Decision:** **RESEARCH / BENCHMARK CONCEPTS**
- **Capabilities:**
  - STEP preprocessing into 2D UV-grids combined with face graph message passing
  - B-Rep topological embeddings for similarity search
- **Do We Reimplement?** **Not initially**
- **Wrapper Required?** **YES (When adopted)**
- **License:** Apache-2.0
- **Risk:** High computational cost on complex freeform NURBS
- **Internal Interface:** `GeometricSimilarityEngine`
- **Phase:** R&D / V2+

---

### Repository: PyTorch Geometric (PyG)
- **Category:** Graph Neural Network Framework
- **Decision:** **USE AS CORE DEPENDENCY FOR GRAPH ML**
- **Capabilities:**
  - High-performance sparse graph convolutions, message passing, batching
  - Part Graphs, Face Graphs, Feature Graphs, Assembly Dependency Graphs
- **Do We Reimplement?** **NO (Strictly prohibited from writing proprietary graph framework)**
- **Wrapper Required?** **YES (Within `/intelligence/deep_learning/`)**
- **License:** MIT
- **Risk:** CUDA / PyTorch dependency version management
- **Internal Interface:** `GraphNeuralCore`
- **Phase:** Phase 2 / ML Expansion

---

## Additional Verified References

### Repository: AI CAD
- **Repository:** https://github.com/aarohkandy/ai-cad
- **Category:** Natural Language to CAD Semantic Planner
- **Decision:** **STUDY AS REFERENCE / PROTOTYPE VERIFICATION**
- **Capabilities:**
  - Natural language $\rightarrow$ semantic plan $\rightarrow$ deterministic CadQuery pipeline
- **Do We Reimplement?** **Adapt architecture into our Manufacturing DSL compiler**
- **Wrapper Required?** **N/A (Reference only)**
- **License:** MIT
- **Risk:** Early prototype; verify stability before reuse
- **Internal Interface:** `SmartModePlanner`
- **Phase:** Phase 0

---

### Repository: FreeCAD & FreeCAD Code Workbench
- **Repository:** https://github.com/FreeCAD/FreeCAD & https://github.com/jokroese/freecad-code-workbench
- **Category:** Engineering Workstation Integration
- **Decision:** **REUSE FOR PILOT / DESKTOP CAD WORKSTATION**
- **Capabilities:**
  - Viewing native parametric build123d / CadQuery objects
  - STEP export inspection and direct tooling validation
- **Do We Reimplement?** **NO (Do not rebuild desktop CAD GUI)**
- **Wrapper Required?** **YES (Workbench integration plugin)**
- **License:** LGPL-2.1+ / MIT
- **Risk:** Heavy desktop dependencies; keep isolated from cloud backend
- **Internal Interface:** `DesktopExportService`
- **Phase:** MVP Pilot

---

### Repository: CADGenBench
- **Repository:** https://github.com/huggingface/cadgenbench
- **Category:** AI CAD Benchmark
- **Decision:** **REUSE AS BENCHMARK EVALUATION BASE**
- **Capabilities:**
  - Standard evaluation fixtures for AI-generated STEP/B-Rep models
  - Dimensional and topological correctness metrics
- **Do We Reimplement?** **NO**
- **Wrapper Required?** **YES (Benchmark runner harness in `/benchmarks/`)**
- **License:** Apache-2.0
- **Risk:** Benchmark dataset drift; combine with internal manufacturing fixtures
- **Internal Interface:** `BenchmarkRunner`
- **Phase:** Production V1

---

### Repository: Elmer FEM
- **Repository:** https://github.com/ElmerCSC/elmerfem
- **Category:** Multiphysics Finite Element Solver
- **Decision:** **INTEGRATE AS SIMULATION SOLVER (GATE 8)**
- **Capabilities:**
  - Open-source multiphysics: structural elasticity, transient heat transfer, fluid flow
- **Do We Reimplement?** **NO (Never write a proprietary FEA solver)**
- **Wrapper Required?** **YES (`SimulationAdapter` in `/simulation/`)**
- **License:** GPL-2.0+ (Executes as isolated external CLI subprocess; clean API boundary)
- **Risk:** Meshing convergence, runtime latency; only invoke when Gate 5.5/6 justifies
- **Internal Interface:** `SimulationSolver`
- **Phase:** Gate 8 Simulation
