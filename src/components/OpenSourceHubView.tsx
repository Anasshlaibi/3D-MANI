import React, { useState } from 'react';
import {
  FolderGit2,
  CheckCircle2,
  ShieldCheck,
  GitFork,
  ExternalLink,
  Layers,
  ArrowRight,
  AlertCircle,
  FileCode,
  Lock,
} from 'lucide-react';
import {
  OPEN_SOURCE_REGISTRY,
  DATASET_REGISTRY,
  REPRESENTATIVE_FORK_REGISTRY,
} from '../core/openSourceData';

export const OpenSourceHubView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'packages' | 'datasets' | 'architecture' | 'forks'>('packages');

  return (
    <div className="space-y-6">
      {/* Top Banner: Core Reuse Directive */}
      <div className="bg-[#0F1117] border border-white/10 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 border-2 border-cyan-500 flex items-center justify-center bg-black/40 shrink-0">
              <div className="w-4 h-4 bg-cyan-500"></div>
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase mb-1">
                REPOSITORY_INGESTION_DIRECTIVE
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-light text-white tracking-tight">
                  Open-Source Reuse & Ingestion Hub
                </h2>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 font-mono uppercase font-bold tracking-wider">
                  Zero-Fork Compliant
                </span>
              </div>
              <p className="text-xs text-[#D1D5DB]/70 mt-1 leading-relaxed max-w-4xl font-mono">
                Strict governance boundary: <strong className="text-white font-bold">Do not rebuild solved engineering infrastructure.</strong> Mature CAD kernels (OCCT), parametric wrappers (build123d), and geometric deep learning (PyG) are wrapped behind strict architectural interfaces.
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-cyan-500 text-black text-[10px] font-bold tracking-widest uppercase">
            Audited & Pinned
          </div>
        </div>

        {/* Directory & Registry Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 border border-white/10 bg-[#0A0C10]">
            <div className="flex justify-between items-center text-[10px] font-mono text-white mb-1">
              <span>OPEN_SOURCE_REGISTRY.md</span>
              <span className="text-cyan-400">88%</span>
            </div>
            <div className="w-full bg-white/5 h-1">
              <div className="bg-cyan-500 h-full w-[88%]"></div>
            </div>
          </div>

          <div className="p-3.5 border border-white/10 bg-[#0A0C10]">
            <div className="flex justify-between items-center text-[10px] font-mono text-white mb-1">
              <span>DATASET_REGISTRY.md</span>
              <span className="text-yellow-400">100% APPROVED</span>
            </div>
            <div className="w-full bg-white/5 h-1">
              <div className="bg-yellow-500 h-full w-[100%]"></div>
            </div>
          </div>

          <div className="p-3.5 border border-white/10 bg-[#0A0C10]">
            <div className="flex justify-between items-center text-[10px] font-mono text-white mb-1">
              <span>FORK_REGISTRY.md</span>
              <span className="text-emerald-400">0 HARD FORKS</span>
            </div>
            <div className="w-full bg-white/5 h-1">
              <div className="bg-emerald-500 h-full w-[100%]"></div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/10">
          <button
            id="subtab-packages"
            onClick={() => setActiveSubTab('packages')}
            className={`px-3.5 py-1.5 text-xs font-mono tracking-wider uppercase transition cursor-pointer ${
              activeSubTab === 'packages'
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            Software Registry ({OPEN_SOURCE_REGISTRY.length} Packages)
          </button>
          <button
            id="subtab-datasets"
            onClick={() => setActiveSubTab('datasets')}
            className={`px-3.5 py-1.5 text-xs font-mono tracking-wider uppercase transition cursor-pointer ${
              activeSubTab === 'datasets'
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            Dataset Registry ({DATASET_REGISTRY.length} Datasets)
          </button>
          <button
            id="subtab-architecture"
            onClick={() => setActiveSubTab('architecture')}
            className={`px-3.5 py-1.5 text-xs font-mono tracking-wider uppercase transition cursor-pointer ${
              activeSubTab === 'architecture'
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            CADBackend Architecture Boundary
          </button>
          <button
            id="subtab-forks"
            onClick={() => setActiveSubTab('forks')}
            className={`px-3.5 py-1.5 text-xs font-mono tracking-wider uppercase transition cursor-pointer ${
              activeSubTab === 'forks'
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            Fork Registry & Upstream Policy
          </button>
        </div>
      </div>

      {/* View 1: Software Registry */}
      {activeSubTab === 'packages' && (
        <div className="space-y-6">
          {/* Detailed Audit Spotlight: build123d */}
          <div className="bg-[#0F1117] border border-white/10 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-black italic select-none">
              CORE_CAD
            </div>
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-xs text-cyan-400 font-mono mb-1 tracking-widest uppercase">
                  ANALYSIS_TARGET • PRIMARY CAD WRAPPER
                </h2>
                <h1 className="text-3xl font-light text-white tracking-tight">build123d</h1>
                <p className="text-xs opacity-50 mt-1 font-mono">github.com/gumyr/build123d • v0.6.0</p>
              </div>
              <div className="px-4 py-2 bg-cyan-500 text-black text-[10px] font-bold tracking-widest uppercase">
                Use as Dependency
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 border border-white/10 bg-[#0A0C10]">
                <div className="text-[10px] uppercase tracking-wider opacity-50 font-mono mb-1">
                  Primary Decision
                </div>
                <div className="text-sm font-bold text-white font-mono">WRAP BEHIND ARCHITECTURE</div>
              </div>
              <div className="p-4 border border-white/10 bg-[#0A0C10]">
                <div className="text-[10px] uppercase tracking-wider opacity-50 font-mono mb-1">
                  Wrapper Required
                </div>
                <div className="text-sm font-bold text-emerald-400 font-mono">YES — CADBackendAdapter</div>
              </div>
            </div>

            <h3 className="text-xs uppercase tracking-widest font-mono text-white mb-4 border-b border-white/10 pb-2">
              Capability Audit & Verification
            </h3>
            <ul className="space-y-3 font-mono text-xs mb-6">
              <li className="flex items-center gap-3 text-white">
                <div className="w-4 h-4 border border-cyan-500 flex items-center justify-center p-0.5 shrink-0">
                  <div className="w-full h-full bg-cyan-500"></div>
                </div>
                <div>B-Rep Modeling Abstraction <span className="text-[10px] opacity-40">(Deterministic Python context managers)</span></div>
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="w-4 h-4 border border-cyan-500 flex items-center justify-center p-0.5 shrink-0">
                  <div className="w-full h-full bg-cyan-500"></div>
                </div>
                <div>STEP (ISO 10303-21) and glTF / GLB export pipelines</div>
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="w-4 h-4 border border-cyan-500 flex items-center justify-center p-0.5 shrink-0">
                  <div className="w-full h-full bg-cyan-500"></div>
                </div>
                <div>Algebraic Topological Selectors & Semantic Face Tagging</div>
              </li>
              <li className="flex items-center gap-3 text-white/50">
                <div className="w-4 h-4 border border-white/30 shrink-0"></div>
                <div>Surface Interrogation <span className="text-[10px] italic">(Delegated to isolated OCCT process)</span></div>
              </li>
            </ul>

            <div className="p-4 bg-cyan-500/10 border-l-4 border-cyan-500">
              <div className="text-[10px] font-bold text-cyan-400 uppercase font-mono tracking-wider mb-1">
                Architectural Directive
              </div>
              <p className="text-xs italic leading-relaxed text-white/90 font-mono">
                "Our CAD backend should wrap build123d rather than allow higher application layers to depend directly on it. AI must never call build123d directly."
              </p>
            </div>
          </div>

          {/* Master Table */}
          <div className="bg-[#0F1117] border border-white/10 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Audited Open-Source Repositories (OPEN_SOURCE_REGISTRY.md)
              </h3>
              <span className="text-[11px] font-mono text-cyan-400">
                /references/open_source/
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0A0C10] text-white/50 uppercase text-[10px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Repository</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Decision</th>
                    <th className="py-3 px-4">License</th>
                    <th className="py-3 px-4">Our Usage Role</th>
                    <th className="py-3 px-4">Upstream Tag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {OPEN_SOURCE_REGISTRY.map((pkg, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{pkg.name}</div>
                        <div className="text-[11px] text-white/50 font-mono">{pkg.repository}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-cyan-400">
                        {pkg.category}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                            pkg.decision === 'WRAP_BEHIND_ARCHITECTURE'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                              : pkg.decision === 'USE_DIRECTLY'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          }`}
                        >
                          {pkg.decision}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-white/80 text-[11px]">
                        {pkg.license}
                      </td>
                      <td className="py-3 px-4 text-white/80 text-xs font-mono">
                        {pkg.ourRole}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-white/50">
                        {pkg.upstreamCommit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Dataset Registry */}
      {activeSubTab === 'datasets' && (
        <div className="bg-[#0F1117] border border-white/10 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Audited CAD & Engineering Datasets (DATASET_REGISTRY.md)
              </h3>
              <p className="text-[11px] text-white/50 font-mono mt-0.5">
                Policy Rule: No dataset enters commercial training until license status is explicitly APPROVED.
              </p>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 font-mono uppercase font-bold">
              AUDIT VERIFIED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0A0C10] text-white/50 uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Dataset Name</th>
                  <th className="py-3 px-4">License</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4">Permitted Usage</th>
                  <th className="py-3 px-4">Commercial Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {DATASET_REGISTRY.map((ds, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{ds.name}</div>
                      <div className="text-[11px] text-white/50 font-mono">{ds.sourceUrl}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-white/80 text-[11px]">
                      {ds.license}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                          ds.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {ds.status === 'APPROVED' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                        )}
                        {ds.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-white/80 text-[11px]">
                      {ds.permittedUse}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          ds.commercialTrainingPermitted ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {ds.commercialTrainingPermitted ? 'YES (CLEARED)' : 'PROHIBITED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: CADBackend Architecture Boundary */}
      {activeSubTab === 'architecture' && (
        <div className="bg-[#0F1117] border border-white/10 p-6 space-y-6 shadow-sm text-xs font-mono">
          <div>
            <div className="text-[10px] text-cyan-400 uppercase tracking-widest mb-1">
              CAD_BACKEND_INTERFACE.md
            </div>
            <h3 className="text-base font-light text-white tracking-tight">
              Strict CAD Kernel Architecture Boundary
            </h3>
            <p className="text-white/60 mt-1">
              Enforces architectural insulation between generative AI, our Manufacturing DSL, and the underlying geometry kernels.
            </p>
          </div>

          {/* Boundary Flow Visualization */}
          <div className="bg-[#0A0C10] border border-white/10 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="border border-cyan-500/40 bg-cyan-500/10 p-4 text-center w-full md:w-48">
                <span className="text-[10px] font-mono text-cyan-400 block uppercase">Layer 1</span>
                <span className="font-bold text-white text-xs block mt-0.5">AI REASONING</span>
                <span className="text-[10px] text-white/50 block mt-1">Natural Language & Smart Mode</span>
              </div>

              <ArrowRight className="w-5 h-5 text-cyan-400 rotate-90 md:rotate-0 shrink-0" />

              <div className="border border-white/20 bg-white/5 p-4 text-center w-full md:w-48">
                <span className="text-[10px] font-mono text-white/60 block uppercase">Layer 2</span>
                <span className="font-bold text-white text-xs block mt-0.5">MANUFACTURING DSL</span>
                <span className="text-[10px] text-white/50 block mt-1">Typed AST & Locked Goals</span>
              </div>

              <ArrowRight className="w-5 h-5 text-cyan-400 rotate-90 md:rotate-0 shrink-0" />

              <div className="border border-cyan-500 bg-cyan-500 text-black p-4 text-center w-full md:w-48">
                <span className="text-[10px] font-mono text-black/70 block uppercase font-bold">Layer 3</span>
                <span className="font-black text-black text-xs block mt-0.5">CAD BACKEND ADAPTER</span>
                <span className="text-[10px] text-black/70 block mt-1 font-semibold">Stable Canonical Contract</span>
              </div>

              <ArrowRight className="w-5 h-5 text-cyan-400 rotate-90 md:rotate-0 shrink-0" />

              <div className="border border-white/10 bg-[#0F1117] p-4 text-center w-full md:w-48">
                <span className="text-[10px] font-mono text-white/40 block uppercase">Layer 4 (External)</span>
                <span className="font-bold text-white/80 text-xs block mt-0.5">build123d / OCCT 7.7</span>
                <span className="text-[10px] text-white/40 block mt-1">Open-Source B-Rep Kernel</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-white/80 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-[11px] uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                STRICT ARCHITECTURAL INVARIANT:
              </div>
              <p className="text-white/70 leading-relaxed text-xs font-mono">
                The AI Reasoning Layer is <strong className="text-white">STRICTLY FORBIDDEN</strong> from calling <code className="text-cyan-400">build123d</code> or <code className="text-cyan-400">OCCT</code> directly. All generation must emit valid Manufacturing DSL text, pass through the LALR parser to build a typed AST, undergo Gate 0-2 topological checks, and enter the <code className="text-cyan-400">CADBackendAdapter</code>. Swapping CAD backends requires zero changes to the AI reasoning engine.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View 4: Fork Registry */}
      {activeSubTab === 'forks' && (
        <div className="bg-[#0F1117] border border-white/10 p-6 space-y-4 shadow-sm text-xs font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-light text-white tracking-tight">
                Zero-Fork Policy & Exception Registry (FORK_REGISTRY.md)
              </h3>
              <p className="text-white/50 mt-0.5">
                Upstream contribution preference over internal divergence.
              </p>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 font-mono uppercase font-bold">
              0 HARD FORKS MAINTAINED
            </span>
          </div>

          <div className="space-y-3">
            {REPRESENTATIVE_FORK_REGISTRY.map((item, idx) => (
              <div key={idx} className="bg-[#0A0C10] border border-white/10 p-4 space-y-2.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-white text-xs">{item.package}</span>
                  <span className="bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-cyan-400">
                    Strategy: {item.strategy}
                  </span>
                </div>
                <div className="text-white/80">
                  <span className="text-white/40 font-mono text-[11px]">Justification: </span>
                  {item.justification}
                </div>
                <div className="text-white/50 flex items-center justify-between text-[11px] pt-1">
                  <span>Upstream PR: <code className="text-cyan-400">{item.upstreamPr}</code></span>
                  <span>Exit Condition: <span className="text-white/80">{item.exitCondition}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
