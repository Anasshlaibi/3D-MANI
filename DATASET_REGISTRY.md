# Dataset Registry

This registry enforces strict compliance and legal governance for all geometric, CAD, and telemetry datasets evaluated or ingested by the **AI Manufacturing Design Engine**.

## Mandatory Governance Policy

> **CRITICAL RULE:**
> No dataset enters commercial training until:
> `LICENSE_STATUS = APPROVED`
> 
> Datasets marked `PROHIBITED` or `RESEARCH_ONLY` are strictly isolated from any weights, surrogate models, or classifiers intended for commercial production use.

---

## Registered Datasets

### 1. Fusion 360 Gallery Dataset
- **dataset:** Fusion 360 Gallery Dataset (Reconstruction & Segmentation)
- **owner:** Autodesk AI Lab
- **source:** https://github.com/AutodeskAILab/Fusion360GalleryDataset
- **license:** Autodesk Research License / Non-Commercial
- **commercial training permitted:** NO
- **redistribution permitted:** NO (Without written consent)
- **modification permitted:** YES (For internal academic research)
- **attribution:** Required (Willis et al., Autodesk AI Lab)
- **number of examples:** ~36,000 CAD models with operational sequences
- **geometry format:** JSON construction sequences, STEP, OBJ, B-Rep topology
- **labels:** Operation types (Extrude, Revolve, Cut), face segmentation, joint types
- **intended use:** Study CAD operation sequences, feature segmentation, and design history structures only.
- **approval status:** **LICENSE_STATUS = RESEARCH_ONLY / PROHIBITED_FOR_COMMERCIAL_TRAINING**

---

### 2. CADGenBench
- **dataset:** CADGenBench Benchmark Suite
- **owner:** Hugging Face CAD Community
- **source:** https://github.com/huggingface/cadgenbench
- **license:** Apache-2.0
- **commercial training permitted:** YES
- **redistribution permitted:** YES
- **modification permitted:** YES
- **attribution:** Required (Apache-2.0 notice)
- **number of examples:** 2,500 validated parametric CAD benchmarks
- **geometry format:** STEP, CadQuery scripts, build123d scripts, GLB
- **labels:** Geometric parameters, feature IDs, dimension bounds, DFM rule targets
- **intended use:** Regression benchmark for testing DSL compilation and B-Rep validity.
- **approval status:** **LICENSE_STATUS = APPROVED**

---

### 3. ABC Dataset
- **dataset:** A Big CAD Model Dataset (ABC)
- **owner:** New York University (NYU Courant Institute)
- **source:** https://archive.nyu.edu/handle/2451/60057
- **license:** MIT
- **commercial training permitted:** YES
- **redistribution permitted:** YES
- **modification permitted:** YES
- **attribution:** Required (Koch et al., NYU)
- **number of examples:** 1,000,000+ CAD models
- **geometry format:** STEP, IGES, OBJ, STL
- **labels:** Surface normals, sharp features, curvature, closed shells
- **intended use:** Geometric validation testing, meshing benchmarks, topology stress tests.
- **approval status:** **LICENSE_STATUS = APPROVED**

---

### 4. Internal 100-Part Injection Molding Fixture Suite
- **dataset:** IM-100 Benchmark Fixtures
- **owner:** AI Manufacturing Design Engine Core Team
- **source:** Internal Proprietary CAD Engineering Library
- **license:** Proprietary / Internal Commercial
- **commercial training permitted:** YES
- **redistribution permitted:** NO
- **modification permitted:** YES
- **attribution:** Internal
- **number of examples:** 100 curated industrial plastic parts
- **geometry format:** `.mfgdsl` source, STEP, GLB, CMM inspection profiles
- **labels:** Locked constraints, nominal wall thicknesses, draft angles, injection pressures, measured warpage
- **intended use:** Ground-truth regression tests for Gate 0 through Gate 11.
- **approval status:** **LICENSE_STATUS = APPROVED**
