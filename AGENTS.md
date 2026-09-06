# Project direction

Read `PRODUCT_SCOPE.md` before planning or implementing changes. It records the user-approved scope and milestone sequence for 3D-MANI.

- Product identity: AI-assisted injection-mold engineering workspace.
- Current implementation target: M2, real STEP import through geometry inspection and initial moldability analysis, with findings on the imported model.
- Protect the hierarchy: Product → Moldability → Mold Design → Tooling → Validation → Manufacturing Package.
- Do not implement M3–M6 tooling construction or CAM as part of M2, and do not expand into generic AI CAD or direct product CNC machining without a user scope change.
- Label result provenance as specified in `PRODUCT_SCOPE.md`; never substitute demo geometry or estimates for verified imported geometry, executed simulations, or engineering approval.
- Treat historical README status claims as unverified until supported by implementation and regression evidence.
- Preserve unrelated local edits. Use established libraries behind adapters and follow the existing reuse registries.
