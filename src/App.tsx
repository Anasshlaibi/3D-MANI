import React, { useState, useMemo, useEffect } from "react";
import { Header } from "./components/Header";
import { SmartModeView } from "./components/SmartModeView";
import { EngineeringModeView } from "./components/EngineeringModeView";
import { CADViewer3D } from "./components/CADViewer3D";
import { DSLStudioView } from "./components/DSLStudioView";
import { ValidationLadderView } from "./components/ValidationLadderView";
import { ExperienceMemoryView } from "./components/ExperienceMemoryView";
import { OpenSourceHubView } from "./components/OpenSourceHubView";
import { DeltaRepairModal } from "./components/DeltaRepairModal";
import { MoldabilityV1View } from "./components/MoldabilityV1View";

import {
  parseManufacturingDSL,
  compileManufacturingDSL,
  SAMPLE_DSL_TEMPLATES,
  CompiledGeometryResult,
} from "./core/dslEngine";
import { runValidationLadder } from "./core/validationLadder";
import {
  INITIAL_CANONICAL_PARAMETERS,
  APPROVED_MATERIALS,
} from "./core/knowledgeBase";
import {
  CanonicalParameter,
  DeltaContextPayload,
  ValidationGateResult,
} from "./types";

export function App() {
  const [activeTab, setActiveTab] = useState<string>("smart-mode");
  const [dslCode, setDslCode] = useState<string>(
    SAMPLE_DSL_TEMPLATES.CUP_400ML.dsl,
  );
  const [revision, setRevision] = useState<number>(17);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("PP");
  const [parameters, setParameters] = useState<CanonicalParameter[]>(
    INITIAL_CANONICAL_PARAMETERS,
  );
  const [peReviewApproved, setPeReviewApproved] = useState<boolean>(false);

  const [isValidationRunning, setIsValidationRunning] =
    useState<boolean>(false);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [repairModalOpen, setRepairModalOpen] = useState<boolean>(false);
  const [repairProposal, setRepairProposal] = useState<{
    explanation: string;
    patchOperation: string;
    updatedDSL: string;
  } | null>(null);

  // Compile DSL into AST & Parametric 3D Solid Geometry
  const geometryResult: CompiledGeometryResult = useMemo(() => {
    try {
      const ast = parseManufacturingDSL(dslCode);
      return compileManufacturingDSL(ast);
    } catch (e) {
      console.error("Failed to parse or compile Manufacturing DSL:", e);
      const fallbackAst = parseManufacturingDSL(
        SAMPLE_DSL_TEMPLATES.CUP_400ML.dsl,
      );
      return compileManufacturingDSL(fallbackAst);
    }
  }, [dslCode]);

  // Run the 13-Gate Validation Ladder
  const validation = useMemo(() => {
    return runValidationLadder(geometryResult, peReviewApproved);
  }, [geometryResult, peReviewApproved]);

  // Keep parameters synchronized with geometry
  const handleUpdateParamValue = (
    paramId: string,
    newValue: number | string | boolean,
  ) => {
    setParameters((prev) =>
      prev.map((p) => {
        if (p.id === paramId) {
          return {
            ...p,
            value: newValue,
            provenance: [
              ...p.provenance,
              {
                timestamp: new Date().toISOString(),
                actor: "HUMAN_ENGINEER",
                action: `Updated value to ${newValue}`,
              },
            ],
          };
        }
        return p;
      }),
    );

    // Sync into DSL code if geometric parameter
    if (paramId === "wall_thickness" && typeof newValue === "number") {
      const updated = dslCode.replace(
        /SHELL\s+[0-9.]+mm/,
        `SHELL ${newValue.toFixed(1)}mm`,
      );
      setDslCode(updated);
      setRevision((r) => r + 1);
    } else if (paramId === "capacity" && typeof newValue === "number") {
      const updated = dslCode.replace(
        /VOLUME\s*>=?\s*[0-9.]+ml/,
        `VOLUME >= ${newValue}ml`,
      );
      setDslCode(updated);
      setRevision((r) => r + 1);
    } else if (paramId === "max_height" && typeof newValue === "number") {
      const updated = dslCode.replace(
        /HEIGHT\s*<=?\s*[0-9.]+mm/,
        `HEIGHT <= ${newValue}mm`,
      );
      setDslCode(updated);
      setRevision((r) => r + 1);
    }
  };

  const handleToggleLock = (paramId: string) => {
    setParameters((prev) =>
      prev.map((p) => {
        if (p.id === paramId) {
          const nextStatus = p.status === "LOCKED" ? "VERIFIED" : "LOCKED";
          return {
            ...p,
            status: nextStatus,
            provenance: [
              ...p.provenance,
              {
                timestamp: new Date().toISOString(),
                actor: "HUMAN_ENGINEER",
                action: `Toggled lock status to ${nextStatus}`,
              },
            ],
          };
        }
        return p;
      }),
    );
  };

  const handleApplyDSL = (newDSL: string) => {
    setIsCompiling(true);
    setDslCode(newDSL);
    setRevision((r) => r + 1);
    setTimeout(() => {
      setIsCompiling(false);
      setActiveTab("cad-viewer");
    }, 400);
  };

  const handleRecompileFromTable = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      setActiveTab("cad-viewer");
    }, 300);
  };

  const handleRunValidation = () => {
    setIsValidationRunning(true);
    setTimeout(() => {
      setIsValidationRunning(false);
      setActiveTab("validation-ladder");
    }, 500);
  };

  const handleTriggerRepair = async () => {
    if (!validation.deltaPayload) return;
    setIsRepairing(true);
    setRepairModalOpen(true);
    setRepairProposal(null);

    try {
      const res = await fetch("/api/ai/repair-delta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deltaPayload: validation.deltaPayload,
          currentDSL: dslCode,
        }),
      });
      const json = await res.json();
      if (json.data) {
        setRepairProposal(json.data);
      }
    } catch (e) {
      console.error("Repair error:", e);
    } finally {
      setIsRepairing(false);
    }
  };

  const handleApplyRepairPatch = (updatedDSL: string) => {
    setDslCode(updatedDSL);
    setRevision((r) => r + 1);
    setRepairModalOpen(false);
    setActiveTab("validation-ladder");
  };

  // Export STEP (ISO 10303-21) file
  const handleExportSTEP = () => {
    const blob = new Blob([geometryResult.stepExportData], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${geometryResult.model.partName}_REV${revision}.step`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Manufacturing DSL (.mfgdsl) file
  const handleExportDSL = () => {
    const blob = new Blob([dslCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${geometryResult.model.partName}_REV${revision}.mfgdsl`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#D1D5DB] flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Universal Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        revision={revision}
        overallPassed={validation.overallPassed}
        onRunValidation={handleRunValidation}
        onExportSTEP={handleExportSTEP}
        onExportDSL={handleExportDSL}
        isValidationRunning={isValidationRunning}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {activeTab === "smart-mode" && (
          <SmartModeView
            onApplyModel={handleApplyDSL}
            onProceedToEngineering={() => setActiveTab("engineering-mode")}
            currentDSL={dslCode}
          />
        )}

        {activeTab === "engineering-mode" && (
          <EngineeringModeView
            parameters={parameters}
            onToggleLock={handleToggleLock}
            onUpdateParamValue={handleUpdateParamValue}
            selectedMaterial={selectedMaterial}
            onChangeMaterial={(mat) => {
              setSelectedMaterial(mat);
              const updated = dslCode.replace(
                /MATERIAL\s+[A-Za-z0-9_]+/,
                `MATERIAL ${mat}`,
              );
              setDslCode(updated);
            }}
            onRecompileCAD={handleRecompileFromTable}
          />
        )}

        {activeTab === "cad-viewer" && (
          <CADViewer3D geometryResult={geometryResult} />
        )}

        {activeTab === "dsl-studio" && (
          <DSLStudioView
            dslCode={dslCode}
            onChangeDSL={setDslCode}
            onCompile={() => {
              setIsCompiling(true);
              setTimeout(() => {
                setIsCompiling(false);
                setActiveTab("cad-viewer");
              }, 300);
            }}
            isCompiling={isCompiling}
          />
        )}

        {activeTab === "validation-ladder" && (
          <section>
            <div className="plan-card">
              <span className="eyebrow">STEP 3 · EXPLORE THE CHECKS</span>
              <h2>A closer look at your design 🔎</h2>
              <p>
                These checks look for possible design issues, such as walls that
                are too thin. Results are estimates in this prototype.
              </p>
              <div className="plan-summary">
                <span>📏 Size & dimensions</span>
                <span>🥤 Wall thickness</span>
                <span>🧩 Shape checks</span>
              </div>
              <button
                className="primary-action"
                onClick={handleRunValidation}
                disabled={isValidationRunning}
              >
                {isValidationRunning
                  ? "Checking your design…"
                  : "Run design checks"}
              </button>
              <p className="quiet-note" style={{ marginTop: 16 }}>
                An engineer still needs to review a design before it can be
                made.
              </p>
            </div>
            <details className="plan-details">
              <summary>Explore detailed check results</summary>
              <div style={{ marginTop: 20 }}>
                <ValidationLadderView
                  gates={validation.gates}
                  overallPassed={validation.overallPassed}
                  deltaPayload={validation.deltaPayload}
                  onTriggerRepair={handleTriggerRepair}
                  onTogglePESignoff={() =>
                    setPeReviewApproved(!peReviewApproved)
                  }
                  isRepairing={isRepairing}
                />
              </div>
            </details>
          </section>
        )}

        {activeTab === "experience-memory" && <ExperienceMemoryView />}

        {activeTab === "open-source-hub" && <OpenSourceHubView />}

        {activeTab === "moldability-v1" && <MoldabilityV1View />}
      </main>

      {/* Delta Repair Modal */}
      <DeltaRepairModal
        isOpen={repairModalOpen}
        onClose={() => setRepairModalOpen(false)}
        deltaPayload={validation.deltaPayload}
        repairProposal={repairProposal}
        onApplyRepair={handleApplyRepairPatch}
        isApplying={isCompiling}
      />

      {/* Geometric Balance Architectural Footer */}
      <footer className="simple-footer">
        Made for exploring ideas · Preview results are estimates, not
        manufacturing approval.
      </footer>
    </div>
  );
}

export default App;
