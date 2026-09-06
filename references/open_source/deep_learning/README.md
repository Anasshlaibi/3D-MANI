# Deep Learning & Graph Neural Networks Intake (`/references/open_source/deep_learning`)

## Priority Repositories Audited

### 1. BRepNet
- **Repository:** https://github.com/AutodeskAILab/BRepNet
- **License:** Apache-2.0
- **Classification:** Research Reference / Concept Adaptation
- **Phase:** R&D / V2+
- **Role:** Deep neural architecture operating directly on boundary representation graphs (faces, edges, coedges, adjacency cycles).
- **Subsystems Studied:**
  - B-Rep topological walk matrices
  - Coedge incidence formulation
  - Feature segmentation on STEP models
  - Preprocessing pipeline from STEP to graph structures
- **Production Decision:** Do NOT include as a mandatory dependency for deterministic MVP. Study graph representation for future feature-recognition modules.

### 2. UV-Net
- **Repository:** https://github.com/AutodeskAILab/UV-Net
- **License:** Apache-2.0
- **Classification:** Research Reference
- **Role:** Boundary representation embedding network leveraging UV surface parameterizations combined with face graph message passing.
- **Evaluation:** Compare UV-Net's 2D grid surface representation with BRepNet's topological coedge walk before designing proprietary embedding models.

### 3. PyTorch Geometric (PyG)
- **Repository:** https://github.com/pyg-team/pytorch_geometric
- **License:** MIT
- **Classification:** Core Graph ML Infrastructure Dependency
- **Role:** Standard framework for learning over Part Graphs, Face Graphs, Feature Graphs, and Assembly Dependency Graphs.
- **Policy:** Strictly forbid implementing proprietary generic graph neural frameworks; use PyTorch Geometric directly for all graph-based deep learning.
