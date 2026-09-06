# Geometry, Meshing, Manufacturing, Parsers & Validation Intake

## Subsystem Overviews

### `/references/open_source/geometry/`
- **Reference Repositories:** CGAL, Shapely, Trimesh, Clipper2
- **Role:** 2D profile offsets, cross-sectional polygon clipping, exact geometric moments, Ray casting.
- **Rule:** Do not recreate computational geometry algorithms; leverage tested C/Python libraries behind internal validation adapters.

### `/references/open_source/meshing/`
- **Reference Repositories:** Gmsh, Netgen, Elmer FEM mesher
- **Role:** High-quality tetrahedral and surface boundary element generation for simulation Gate 7 and 8.

### `/references/open_source/manufacturing/`
- **Reference Repositories:** OpenCAM, LinuxCNC kinematics, Curated Injection Molding DFM tables (SPI/SPE standards)
- **Role:** Authoritative machine limits, toolpaths, draft angle thresholds, shrink tables for PP, ABS, PC, POM.

### `/references/open_source/parsers/`
- **Reference Repositories:** Lark (EBNF parser in Python), Tree-sitter
- **Role:** Lexing, parsing, and AST generation for our proprietary Manufacturing DSL.
- **Rule:** Use Lark LALR(1) parser; do not write hand-crafted regex tokenizers for AST processing.

### `/references/open_source/validation/`
- **Reference Repositories:** OCCT `BRepCheck_Analyzer`, OpenCascade ShapeHealing, STEPcode
- **Role:** Deterministic validation gates (manifold checks, self-intersections, water-tightness, dimensional envelope verification).
