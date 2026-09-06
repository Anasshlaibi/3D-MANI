import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle2,
  HelpCircle,
  Calculator,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { CanonicalParameter, ParameterStatus } from '../types';
import { APPROVED_MATERIALS } from '../core/knowledgeBase';

interface EngineeringModeViewProps {
  parameters: CanonicalParameter[];
  onToggleLock: (paramId: string) => void;
  onUpdateParamValue: (paramId: string, newValue: number | string | boolean) => void;
  selectedMaterial: string;
  onChangeMaterial: (matId: string) => void;
  onRecompileCAD: () => void;
}

export const EngineeringModeView: React.FC<EngineeringModeViewProps> = ({
  parameters,
  onToggleLock,
  onUpdateParamValue,
  selectedMaterial,
  onChangeMaterial,
  onRecompileCAD,
}) => {
  const [selectedParamForAudit, setSelectedParamForAudit] = useState<CanonicalParameter | null>(null);

  const getStatusBadge = (status: ParameterStatus) => {
    switch (status) {
      case 'LOCKED':
        return (
          <span className="inline-flex items-center gap-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 font-bold uppercase">
            <Lock className="w-3 h-3 text-cyan-400" />
            LOCKED
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 font-bold uppercase">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            VERIFIED
          </span>
        );
      case 'CALCULATED':
        return (
          <span className="inline-flex items-center gap-1 bg-white/10 text-white border border-white/20 text-[10px] font-mono px-2 py-0.5 font-bold uppercase">
            <Calculator className="w-3 h-3 text-white/80" />
            CALCULATED
          </span>
        );
      case 'INFERRED':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-[10px] font-mono px-2 py-0.5 font-bold uppercase">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            INFERRED
          </span>
        );
      case 'OPTIMIZED':
        return (
          <span className="inline-flex items-center gap-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 font-bold uppercase">
            <RotateCcw className="w-3 h-3 text-cyan-300" />
            OPTIMIZED
          </span>
        );
      case 'CONFLICT':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono px-2 py-0.5 font-bold uppercase">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            CONFLICT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-white/5 text-white/50 border border-white/10 text-[10px] font-mono px-2 py-0.5 uppercase">
            <HelpCircle className="w-3 h-3 text-white/40" />
            {status}
          </span>
        );
    }
  };

  const mat = APPROVED_MATERIALS[selectedMaterial] || APPROVED_MATERIALS.PP;

  return (
    <div className="space-y-6">
      {/* Material & Process Selection Card */}
      <div className="bg-[#0F1117] border border-white/10 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5">
          <div>
            <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase mb-1">
              MATERIAL_MATRIX_AUDIT
            </div>
            <h2 className="text-xl font-light text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Process & Material Specifications
            </h2>
            <p className="text-xs text-white/60 mt-1 font-mono">
              Select certified engineering polymer and manufacturing process ruleset.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="material-select" className="text-xs text-white/60 font-mono uppercase">Polymer:</label>
              <select
                id="material-select"
                aria-label="Select Approved Polymer"
                value={selectedMaterial}
                onChange={(e) => {
                  onChangeMaterial(e.target.value);
                  onRecompileCAD();
                }}
                className="bg-[#0A0C10] border border-white/15 text-white text-xs font-mono px-3 py-1.5 focus:outline-none focus:border-cyan-500 transition"
              >
                {Object.keys(APPROVED_MATERIALS).map((key) => (
                  <option key={key} value={key}>
                    {APPROVED_MATERIALS[key].id} — {APPROVED_MATERIALS[key].name} ({APPROVED_MATERIALS[key].grade})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Selected Material Key Properties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="bg-[#0A0C10] border border-white/10 p-3.5">
            <span className="text-[10px] text-white/40 uppercase block">Density</span>
            <span className="text-white font-bold text-sm">{mat.density} g/cm³</span>
          </div>
          <div className="bg-[#0A0C10] border border-white/10 p-3.5">
            <span className="text-[10px] text-white/40 uppercase block">Young's Modulus</span>
            <span className="text-white font-bold text-sm">{mat.youngsModulus} MPa</span>
          </div>
          <div className="bg-[#0A0C10] border border-white/10 p-3.5">
            <span className="text-[10px] text-white/40 uppercase block">Yield Strength</span>
            <span className="text-white font-bold text-sm">{mat.yieldStrength} MPa</span>
          </div>
          <div className="bg-[#0A0C10] border border-white/10 p-3.5">
            <span className="text-[10px] text-white/40 uppercase block">Allowable Walls</span>
            <span className="text-cyan-400 font-bold text-sm">
              [{mat.minWallThickness}, {mat.maxWallThickness}] mm
            </span>
          </div>
          <div className="bg-[#0A0C10] border border-white/10 p-3.5">
            <span className="text-[10px] text-white/40 uppercase block">Min Draft Angle</span>
            <span className="text-emerald-400 font-bold text-sm">≥ {mat.recommendedDraftAngle}°</span>
          </div>
          <div className="bg-[#0A0C10] border border-white/10 p-3.5">
            <span className="text-[10px] text-white/40 uppercase block">Shrinkage</span>
            <span className="text-white font-bold text-sm">{mat.thermalShrinkage}%</span>
          </div>
        </div>

        <div className="mt-4 text-[11px] text-white/50 flex items-center gap-2 font-mono">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Provenance: {mat.provenance}</span>
        </div>
      </div>

      {/* Canonical Parameter State Machine Table */}
      <div className="bg-[#0F1117] border border-white/10 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Canonical Parameter State Model</h3>
            <p className="text-xs text-white/60 font-mono mt-0.5">
              Tracks parameter locking, deterministic sources, confidence, and provenance trails.
            </p>
          </div>

          <button
            id="btn-recompile-from-table"
            onClick={onRecompileCAD}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 text-[11px] font-bold tracking-widest uppercase transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Recompile CAD Model
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0A0C10] text-white/50 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Parameter Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Value & Unit</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Source & Ruleset</th>
                <th className="py-3 px-4 text-center">Lock Control</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {parameters.map((param) => (
                <tr key={param.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono">
                    <div className="font-semibold text-white">{param.name}</div>
                    <div className="text-[11px] text-white/40">{param.id}</div>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(param.status)}</td>
                  <td className="py-3 px-4 font-mono">
                    {typeof param.value === 'number' ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          id={`input-${param.id}`}
                          aria-label={`Edit ${param.name}`}
                          type="number"
                          step={param.value < 10 ? '0.1' : '1'}
                          value={param.value}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) onUpdateParamValue(param.id, val);
                          }}
                          className="w-20 bg-[#0A0C10] border border-white/20 px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                        />
                        <span className="text-white/50 font-mono">{param.unit}</span>
                      </div>
                    ) : (
                      <span className="font-mono text-white">
                        {String(param.value)} {param.unit !== 'boolean' ? param.unit : ''}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-white/10 h-1 overflow-hidden">
                        <div
                          className={`h-full ${
                            param.confidence >= 0.95 ? 'bg-cyan-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${param.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-white/70 text-[11px]">
                        {Math.round(param.confidence * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <div className="text-[11px] text-white/80">{param.source}</div>
                    {param.rulesetVersion && (
                      <div className="text-[10px] text-white/40">{param.rulesetVersion}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      id={`btn-toggle-lock-${param.id}`}
                      aria-label={`Toggle lock status for ${param.name}`}
                      onClick={() => onToggleLock(param.id)}
                      className={`p-1.5 transition cursor-pointer ${
                        param.status === 'LOCKED'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30'
                          : 'bg-white/5 text-white/40 border border-white/10 hover:text-white'
                      }`}
                      title={param.status === 'LOCKED' ? 'Unlock parameter' : 'Lock parameter'}
                    >
                      {param.status === 'LOCKED' ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      id={`btn-audit-${param.id}`}
                      aria-label={`View audit trail for ${param.name}`}
                      onClick={() => setSelectedParamForAudit(param)}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      Audit
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Trail Modal */}
      {selectedParamForAudit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1117] border border-white/15 max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="text-[10px] text-cyan-400 uppercase tracking-widest mb-0.5">PROVENANCE_AUDIT</div>
                <h4 className="font-light text-base text-white">
                  {selectedParamForAudit.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedParamForAudit(null)}
                className="text-white/50 hover:text-white text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 bg-[#0A0C10] p-3 border border-white/10">
              <div className="flex justify-between text-white/60">
                <span>ID: {selectedParamForAudit.id}</span>
                <span className="text-cyan-400 font-bold">STATUS: {selectedParamForAudit.status}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>VALUE: {String(selectedParamForAudit.value)} {selectedParamForAudit.unit}</span>
                <span>CONFIDENCE: {Math.round(selectedParamForAudit.confidence * 100)}%</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider block mb-2">Audit History:</span>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedParamForAudit.provenance.map((rec, i) => (
                  <div key={i} className="bg-[#0A0C10] p-3 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-white/40 text-[10px]">
                      <span>{new Date(rec.timestamp).toLocaleString()}</span>
                      <span className="text-cyan-400">ACTOR: {rec.actor}</span>
                    </div>
                    <p className="text-white/90">{rec.action}</p>
                    {rec.ruleReference && (
                      <span className="text-[10px] text-cyan-400/80 block">
                        Rule Ref: {rec.ruleReference}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedParamForAudit(null)}
                className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 text-xs uppercase font-mono tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
