# Open Source Repository Intake & Reuse Directory

This directory contains categorized, audited evaluations and architectural adapters for upstream open-source projects.
In accordance with our **Core Reuse Directive**:

> **Do not rebuild solved engineering infrastructure unnecessarily.**
> External projects must remain logically separated from production code. Do not blindly copy entire repositories into our application source tree.

## Structure

- `cad/` — Parametric CAD abstractions (build123d, CadQuery, FreeCAD Code Workbench)
- `occt/` — OpenCascade low-level B-Rep geometry and wrappers (OCCT, pythonocc-core, pythonocc-demos)
- `geometry/` — Computational geometry, manifold analysis, polygon clipping, and tessellation
- `meshing/` — Surface and volumetric finite element mesh generators (gmsh, netgen, trimesh)
- `ml/` — Tabular manufacturing ML, process telemetry, and Bayesian optimization (scikit-learn, XGBoost, Optuna)
- `deep_learning/` — B-Rep topological neural networks, surrogate physics, and graph embeddings (BRepNet, UV-Net, PyTorch Geometric)
- `datasets/` — Curated CAD benchmarks and geometry datasets (CADGenBench, Fusion 360 Gallery Dataset review)
- `manufacturing/` — DFM rules, machine limits, toolpaths, and injection molding kinematics
- `parsers/` — Grammar, AST, STEP/IGES tokenizers, and DSL compilers (Lark, ANTLR4)
- `validation/` — Automated geometric verification, B-Rep checking, and dimensional tolerance validation

Refer to `/OPEN_SOURCE_REGISTRY.md` for individual binding decisions.
