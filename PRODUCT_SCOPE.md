# 3D-MANI — protected product scope

Approved direction: AI-assisted injection-mold engineering workspace.

Give 3D-MANI a plastic product. It helps determine whether it can be molded, explains manufacturing problems, develops tooling architecture, validates what it can actually calculate, and produces the engineering package needed to manufacture the mold.

The plastic product is normally injection molded. CNC machining manufactures the mold components. Generic prompt-to-CAD and direct CNC machining of the finished product are not priorities for this vertical.

## Workspace hierarchy

Product → Moldability → Mold Design → Tooling → Validation → Manufacturing Package

## M2 — REAL STEP → MOLDABILITY VERTICAL SLICE

This is the next implementation milestone, not a claim about current functionality.

1. Upload an actual STEP part and import it with OCCT.
2. Verify the imported B-Rep and report invalid or unsupported geometry explicitly.
3. Extract dimensions, volume, surface area, faces, edges, and topology from that geometry.
4. Let the user select a material and retain its source and relevant assumptions.
5. Let the user select a pull direction, or review a proposed direction.
6. Perform initial geometry-based wall-thickness and draft analyses, and identify undercut candidates.
7. Display findings on the corresponding geometry in the 3D workspace, with explanations and analysis limitations.

### Acceptance criteria

- The displayed model and all geometry measurements originate from the uploaded STEP file; no silent substitution with a sample shape or parametric estimate.
- Invalid files, invalid B-Reps, unsupported geometry, and unavailable analysis dependencies produce explicit, reviewable results.
- Measurements include units. Analysis results record the input revision, algorithm/tool version, settings, material assumptions where relevant, and result provenance.
- Draft analysis uses the recorded pull direction. Changing direction invalidates or recomputes affected results.
- Wall-thickness results disclose sampling, coverage, and limitations. Undercut candidates are not presented as proven mold-release feasibility.
- Findings identify the affected faces or regions on the displayed model.
- A meaningful regression library of real plastic parts exercises valid and invalid imports, known dimensions and mass properties, thin sections, draft direction changes, and undercut candidates. Fixture sources and usage permissions are recorded.
- Reference values, tolerances, expected findings, and observed failures are documented. M2 completion requires evidence from this library, not only a successful demonstration on one cup.

### Explicit exclusions

Do not implement cavity/core separation, runners, cooling, ejectors, mold bases, or CAM during M2. Do not expand sideways into generic AI CAD features. Later stages consume M2's trustworthy geometry-analysis foundation.

## Result provenance

Every result must expose the applicable status or statuses:

| Status | Meaning |
| --- | --- |
| CALCULATED | Computed from actual inputs by an identified algorithm; accuracy and limitations still apply. |
| RULE-BASED | Evaluated against an identified, versioned rule and its assumptions. |
| ESTIMATED | Approximate result with disclosed assumptions and limitations. |
| SIMULATED | Result of an identified simulation with its model, solver, and conditions disclosed. |
| AI-PROPOSED | AI suggestion requiring validation; not an engineering calculation or approval. |
| HUMAN-APPROVED | Recorded human review, including reviewer, revision, and scope of approval. |
| UNAVAILABLE | Not implemented, unsupported, missing dependencies, or unable to produce a result. |

Method provenance and human approval are separate facts: approval must not erase whether a result was estimated or AI-proposed. Synthetic demo geometry is explicitly a demo, not evidence of an executed engineering simulation. Never relabel legacy simulated fallback results as actual solver output.

## Sequenced roadmap

- **M3 — Parting & Core/Cavity:** pull-direction optimization, shrinkage compensation, parting-line candidates, parting surfaces, cavity/core separation.
- **M4 — Mold Architecture:** mold base, inserts, sliders/lifters, ejection, gates/runners, cooling.
- **M5 — Mold Validation:** interference, clearances, cooling/thermal, filling/flow integrations, tooling manufacturability.
- **M6 — Manufacturing Package:** individual validated STEP components, BOM, supported material/heat-treatment information, tolerances, setup/manufacturing metadata, and eventually a real CAM adapter.

Do not claim CNC G-code generation until a real CAM system is integrated and validated. Do not describe exported geometry as CNC-ready without the relevant geometry and manufacturability checks.

## Existing implementation

Existing UI prototypes, DSL examples, status badges, and historical documentation are not proof that M2 is complete. Reuse established CAD and analysis libraries behind adapters, respecting the repository's reuse policies. Preserve this injection-mold vertical unless the user explicitly changes scope.
