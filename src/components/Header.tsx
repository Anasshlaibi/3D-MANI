import React from "react";
interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  revision: number;
  overallPassed: boolean;
  onRunValidation: () => void;
  onExportSTEP: () => void;
  onExportDSL: () => void;
  isValidationRunning: boolean;
}
export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onExportDSL,
  onExportSTEP,
}) => (
  <header className="friendly-header">
    <div className="brand-row">
      <div>
        <strong className="brand">
          mani<span> / design playground</span>
        </strong>
        <p>A little idea. Something you can explore.</p>
      </div>
      <span className="demo-pill">Experimental preview</span>
    </div>
    <div className="navigation-row">
      <nav aria-label="Design steps">
        {[
          ["smart-mode", "💡", "Describe your idea"],
          ["cad-viewer", "🧊", "Explore in 3D"],
          ["validation-ladder", "🔎", "Check your design"],
          ["moldability-v1", "🔥", "Moldability (Real STEP)"],
        ].map(([id, emoji, label], i) => (
          <button
            key={id}
            aria-current={activeTab === id ? "page" : undefined}
            onClick={() => setActiveTab(id)}
            className={activeTab === id ? "step-tab active" : "step-tab"}
          >
            <span aria-hidden="true">{emoji}</span>
            <span>
              <small>Step {i + 1}</small>
              {label}
            </span>
          </button>
        ))}
      </nav>
      <details className="advanced-menu">
        <summary>More tools</summary>
        <div>
          {[
            ["engineering-mode", "Dimensions & materials"],
            ["dsl-studio", "Design code"],
            ["experience-memory", "Example library"],
            ["open-source-hub", "Project references"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}>
              {label}
            </button>
          ))}
          <button onClick={onExportDSL}>Download design code</button>
          <button onClick={onExportSTEP}>Download sample STEP</button>
          <p>Sample exports are not verified for manufacturing.</p>
        </div>
      </details>
    </div>
  </header>
);
