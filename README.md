# AI Manufacturing Design Engine

Deterministic manufacturing design engine with Lark DSL parser, typed AST, parametric CAD backend, and validation ladder.

## Current Status (M2 Honesty Remediation)

| Capability | Status | Notes |
|---|---|---|
| Manufacturing DSL (Lark parser) | ✅ IMPLEMENTED_AND_TESTED | LALR(1) grammar, typed AST, semantic validation |
| Canonical Unit System | ✅ IMPLEMENTED_AND_TESTED | mm, deg, ml, g — all conversions |
| Parameter Validation | ✅ IMPLEMENTED_AND_TESTED | Physical domain checks, lock enforcement |
| DFM Rule Engine | ✅ IMPLEMENTED_AND_TESTED | Sourced provenance, material-specific rules |
| Injection Molding Materials | ✅ IMPLEMENTED_AND_TESTED | PP, ABS, PC, PA66_GF30, POM |
| Validation Ladder (Gates 0-2) | ✅ IMPLEMENTED_AND_TESTED | Schema, DSL, parameter gates — always real |
| FastAPI Backend | ✅ IMPLEMENTED_AND_TESTED | REST API for DSL, validation, registries |
| React + Three.js Frontend | ✅ PRESERVED | V0 product interface |
| build123d CAD Backend | ⚠️ ARCHITECTURE_READY | Real OCCT code written, requires `pip install -e ".[cad]"` |
| OCCT B-Rep Validation | ⚠️ ARCHITECTURE_READY | BRepCheck_Analyzer code present, requires OCP |
| Real STEP Export | ⚠️ ARCHITECTURE_READY | OCCT STEPControl_Writer code present, requires OCP |
| Validation Ladder (Gates 3-5) | ⚠️ SIMULATED_GEOMETRY | Reports `SIMULATED_ESTIMATE` without build123d |
| Gate 6 DFM with B-Rep | ⚠️ REAL_RULES_SIMULATED_GEOMETRY | DFM rules are real, geometry inputs from DSL params |
| Experience Memory (IM-100) | 📋 PLANNED | Dataset status: PLANNED |

## Architecture

```
Frontend (React + Three.js + Vite)
    │
    ▼
server.ts (Express — proxies to Python engine)
    │
    ▼
engine/ (Python FastAPI)
    ├── dsl/          ← Lark parser, typed AST, semantic validator
    ├── parameters/   ← Unit system, parameter models, validators
    ├── cad/          ← CADBackend protocol, SimulatedBackend | RealBuild123dBackend
    ├── validation/   ← Gates 00–06, orchestrator with provenance
    ├── manufacturing/ ← DFM rules, materials, wall thickness, draft, undercuts
    └── tests/        ← Tier 1 (always) + Tier 2 (real_cad, optional)
```

## Installation

```bash
# Core (DSL, validation, DFM — no CAD kernel)
pip install -e "./engine"

# With real CAD (requires OCP/build123d — may need conda)
pip install -e "./engine[cad]"

# Full development
pip install -e "./engine[all]"
```

## Testing

```bash
# Tier 1: Core tests (always works, no build123d needed)
pytest engine/manufacturing_engine/tests -v -m "not real_cad"

# Tier 2: Real CAD tests (requires build123d)
pytest engine/manufacturing_engine/tests -v -m "real_cad"

# All tests
pytest engine/manufacturing_engine/tests -v
```

## Honesty Policy

This project follows an explicit honesty policy:
- **`REAL_VALIDATION`**: Result computed by actual OCCT kernel execution
- **`SIMULATED_ESTIMATE`**: Result computed by parametric formula, not B-Rep
- **`REAL_RULES_SIMULATED_GEOMETRY`**: DFM rules are real (sourced), geometry inputs are from DSL parameters
- Every API response includes `validationType` and `cadExecutionMode` fields
- The system never claims REAL_VALIDATION when OCCT is not running
