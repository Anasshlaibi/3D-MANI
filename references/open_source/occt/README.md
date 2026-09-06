# OCCT & Low-Level Geometry Intake (`/references/open_source/occt`)

## Priority Repositories Audited

### 1. Open CASCADE Technology (OCCT)
- **Repository:** https://github.com/Open-Cascade-SAS/OCCT
- **License:** LGPL-2.1 with Open CASCADE Exception (permissive linking)
- **Classification:** Upstream Core Geometry Kernel (C++)
- **Role:** Industry standard boundary-representation (B-Rep) kernel, topological data structure (TopoDS), geometric curves/surfaces, STEP (ISO 10303), and IGES exchange.
- **Exposure Boundary:** Wrapped strictly via `build123d` and OpenCASCADE Python bindings (`OCP`). Direct C++ calls are encapsulated behind CAD backend workers.

### 2. pythonocc-core
- **Repository:** https://github.com/tpaviot/pythonocc-core
- **License:** LGPL-3.0
- **Classification:** Specialized Low-Level Diagnostic Integration (Behind Adapter)
- **Role:** Fallback Python bindings for deep topological interrogation, advanced B-Rep repairs, shape healing (`ShapeFix_Shape`), and exact mass/surface curvature calculation when build123d high-level abstractions do not expose the required OCCT method.

### 3. pythonocc-demos
- **Repository:** https://github.com/tpaviot/pythonocc-demos
- **Role:** Working engineering reference catalog. Engineers must check validated OCCT demos before writing custom low-level geometry procedures.
