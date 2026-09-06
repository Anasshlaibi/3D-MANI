import React from 'react';
import {
  Layers,
  Cpu,
  ShieldCheck,
  FileCode,
  Box,
  History,
  FolderGit2,
  Download,
  Play,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

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
  revision,
  overallPassed,
  onRunValidation,
  onExportSTEP,
  onExportDSL,
  isValidationRunning,
}) => {
  const tabs = [
    { id: 'smart-mode', label: 'Smart Mode', icon: Cpu },
    { id: 'engineering-mode', label: 'Engineering Spec', icon: Layers },
    { id: 'cad-viewer', label: '3D CAD & DFM', icon: Box },
    { id: 'dsl-studio', label: 'Manufacturing DSL', icon: FileCode },
    { id: 'validation-ladder', label: '13-Gate Ladder', icon: ShieldCheck },
    { id: 'experience-memory', label: 'Experience Memory', icon: History },
    { id: 'open-source-hub', label: 'Open-Source Hub', icon: FolderGit2 },
  ];

  return (
    <header className="bg-[#0F1117] border-b border-white/10 text-[#D1D5DB] sticky top-0 z-30">
      {/* Top Telemetry Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 text-[11px] font-mono tracking-tighter uppercase opacity-80">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>SYSTEM: OPERATIONAL</span>
          </div>
          <span className="opacity-30">/</span>
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            <span>INTAKE: ACTIVE (OCCT 7.7 + BUILD123D)</span>
          </div>
          <span className="opacity-30">/</span>
          <span className="opacity-70">RULESET: SPI_IM_V4.2</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="p-1 px-2 bg-white/5 border border-white/10 text-white">
            REV: {revision} • JOB_4821
          </span>
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border ${
              overallPassed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
            }`}
          >
            {overallPassed ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                VERIFIED (GATES 0-4)
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3 text-yellow-400" />
                DELTA PENDING
              </>
            )}
          </span>
        </div>
      </div>

      {/* Main Bar: Geometric Brand + Action Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Geometric Balance Logo Box */}
          <div className="w-8 h-8 border-2 border-cyan-500 flex items-center justify-center bg-black/50 shrink-0">
            <div className="w-4 h-4 bg-cyan-500"></div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold tracking-widest text-white text-base sm:text-lg uppercase">
                AI Manufacturing Design Engine
              </span>
              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[9px] font-mono uppercase tracking-widest font-bold">
                B-Rep Master
              </span>
            </div>
            <p className="text-[11px] font-mono text-white/50 tracking-tight hidden sm:block">
              Parametric CAD • Deterministic DFM • 13-Gate Validation • Zero-Fork Open-Source
            </p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-run-validation"
            onClick={onRunValidation}
            disabled={isValidationRunning}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-900 text-black px-4 py-2 text-[11px] font-bold tracking-widest uppercase transition shadow-sm cursor-pointer"
            title="Execute Gates 0 through 11"
          >
            <Play className={`w-3.5 h-3.5 fill-black ${isValidationRunning ? 'animate-spin' : ''}`} />
            {isValidationRunning ? 'VALIDATING...' : 'RUN 13-GATE LADDER'}
          </button>

          <button
            id="btn-export-step"
            onClick={onExportSTEP}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-2 text-[11px] font-mono uppercase tracking-wider transition cursor-pointer"
            title="Download certified STEP AP214 format"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            STEP ISO-10303
          </button>

          <button
            id="btn-export-dsl"
            onClick={onExportDSL}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-2 text-[11px] font-mono uppercase tracking-wider transition cursor-pointer"
            title="Download .mfgdsl source file"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            .MFGDSL
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 overflow-x-auto no-scrollbar">
        <nav className="flex space-x-1 border-t border-white/10 pt-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono tracking-wider uppercase border-b-2 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'border-cyan-500 text-white bg-white/5 font-semibold'
                    : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-white/40'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
