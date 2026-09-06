import React from 'react';
import {
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
} from 'lucide-react';
import { DeltaContextPayload } from '../types';

interface DeltaRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  deltaPayload: DeltaContextPayload | null;
  repairProposal: {
    explanation: string;
    patchOperation: string;
    updatedDSL: string;
  } | null;
  onApplyRepair: (updatedDSL: string) => void;
  isApplying: boolean;
}

export const DeltaRepairModal: React.FC<DeltaRepairModalProps> = ({
  isOpen,
  onClose,
  deltaPayload,
  repairProposal,
  onApplyRepair,
  isApplying,
}) => {
  if (!isOpen || !deltaPayload) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
      <div className="bg-[#0F1117] border border-white/15 max-w-2xl w-full p-6 space-y-4 shadow-2xl text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-cyan-500 flex items-center justify-center bg-cyan-500/10 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 uppercase tracking-widest">DELTA_REPAIR_ENGINE</div>
              <h3 className="font-light text-base text-white tracking-tight">
                Context-Constrained AI Repair
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-base cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Delta Context Card */}
        <div className="bg-[#0A0C10] border border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/50">FAILED GATE:</span>
            <span className="text-rose-400 font-bold">
              GATE {deltaPayload.failedGate} • {deltaPayload.errorCode}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/50">AFFECTED REGION:</span>
            <span className="text-cyan-400 font-bold">{deltaPayload.region}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#0F1117] p-3 border border-rose-500/30">
              <span className="text-white/40 text-[10px] block uppercase">Current Value</span>
              <span className="text-rose-400 font-bold text-xs mt-0.5 block">{deltaPayload.currentValue}</span>
            </div>
            <div className="bg-[#0F1117] p-3 border border-emerald-500/30">
              <span className="text-white/40 text-[10px] block uppercase">Required Spec</span>
              <span className="text-emerald-400 font-bold text-xs mt-0.5 block">{deltaPayload.requiredValue}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center gap-2 flex-wrap">
            <span className="text-white/40 text-[10px] uppercase">LOCKED BOUNDARIES:</span>
            {deltaPayload.lockedConstraints.map((l, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-[#0F1117] border border-cyan-500/30 px-2 py-0.5 text-[10px] text-cyan-400"
              >
                <Lock className="w-2.5 h-2.5 text-cyan-400" />
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* AI Proposal Section */}
        {repairProposal ? (
          <div className="space-y-3">
            <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-[10px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                AI Engineering Rationale:
              </div>
              <p className="text-white text-xs leading-relaxed">
                {repairProposal.explanation}
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] text-white/60">
                <span>Proposed Action:</span>
                <span className="bg-[#0A0C10] border border-cyan-500/40 text-cyan-300 px-2.5 py-0.5 font-bold uppercase">
                  {repairProposal.patchOperation}
                </span>
              </div>
            </div>

            {/* Repaired DSL Diff Preview */}
            <div className="space-y-1.5">
              <span className="text-white/50 text-[10px] uppercase tracking-wider block">
                Repaired Manufacturing DSL Patch Preview:
              </span>
              <div className="bg-[#0A0C10] border border-white/10 p-3.5 max-h-36 overflow-y-auto text-[11px] text-white/80 leading-relaxed">
                <pre>{repairProposal.updatedDSL}</pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-white/40 font-mono">
            Generating minimal delta patch...
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 border border-white/10 text-xs uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-apply-delta-patch"
            disabled={!repairProposal || isApplying}
            onClick={() => {
              if (repairProposal) onApplyRepair(repairProposal.updatedDSL);
            }}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-950 text-black px-4 py-2 text-xs font-bold uppercase tracking-widest transition cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isApplying ? 'APPLYING PATCH...' : 'APPLY PATCH & RE-VALIDATE'}
          </button>
        </div>
      </div>
    </div>
  );
};
