import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Wrench,
  Sparkles,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Zap,
  Info,
} from 'lucide-react';
import { ValidationGateResult, DeltaContextPayload } from '../types';

interface ValidationLadderViewProps {
  gates: ValidationGateResult[];
  overallPassed: boolean;
  deltaPayload: DeltaContextPayload | null;
  onTriggerRepair: () => void;
  onTogglePESignoff: () => void;
  isRepairing: boolean;
}

export const ValidationLadderView: React.FC<ValidationLadderViewProps> = ({
  gates,
  overallPassed,
  deltaPayload,
  onTriggerRepair,
  onTogglePESignoff,
  isRepairing,
}) => {
  const [expandedGate, setExpandedGate] = useState<number | null>(4); // Default expand DFM Gate 4

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'FAIL':
        return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'RUNNING':
        return <Clock className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />;
      case 'PENDING_REVIEW':
        return <UserCheck className="w-4 h-4 text-yellow-400 shrink-0" />;
      default:
        return <Clock className="w-4 h-4 text-white/30 shrink-0" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 font-bold uppercase">
            PASSED
          </span>
        );
      case 'FAIL':
        return (
          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono px-2 py-0.5 font-bold uppercase">
            FAILED
          </span>
        );
      case 'RUNNING':
        return (
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 font-bold uppercase">
            SOLVING
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-[10px] font-mono px-2 py-0.5 font-bold uppercase">
            PENDING REVIEW
          </span>
        );
      default:
        return (
          <span className="bg-white/5 text-white/40 border border-white/10 text-[10px] font-mono px-2 py-0.5 uppercase">
            BYPASSED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F1117] border border-white/10 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 border-2 border-cyan-500 flex items-center justify-center bg-black/40 shrink-0">
              <div className="w-4 h-4 bg-cyan-500"></div>
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase mb-1">
                GATE_AUDIT_PIPELINE
              </div>
              <h2 className="text-xl font-light text-white tracking-tight flex items-center gap-2">
                13-Gate Deterministic Validation Ladder
              </h2>
              <p className="text-xs text-[#D1D5DB]/70 mt-1 max-w-3xl font-mono leading-relaxed">
                Sequenced from cheapest computational checks to expensive multiphysics simulations.
                Designs must pass fast geometric, topological, and DFM gates before triggering costly numerical solvers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right border border-white/10 bg-[#0A0C10] p-3">
              <div className="flex items-center justify-end gap-2 mb-0.5">
                <span className="text-[10px] text-white/40 block font-mono uppercase">Ladder Telemetry</span>
                <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[9px] font-mono px-1.5 py-0.5 font-bold uppercase">
                  {gates.some(g => g.validationType === 'REAL_VALIDATION') ? 'REAL_VALIDATION (OCCT)' : 'DEMO_RESULT'}
                </span>
              </div>
              <span
                className={`font-mono text-xs font-bold ${
                  overallPassed ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {overallPassed ? 'ALL PRIMARY GATES PASSED' : 'CORRECTION REQUIRED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delta Repair Alert Banner if any gate failed */}
      {!overallPassed && deltaPayload && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-5 text-xs font-mono">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-rose-300 uppercase tracking-wider">
                    Deterministic Gate Failure: Gate {deltaPayload.failedGate} ({deltaPayload.errorCode})
                  </h3>
                  <span className="bg-[#0A0C10] text-rose-400 font-mono text-[10px] px-2 py-0.5 border border-rose-500/30 uppercase">
                    Delta Payload Ready
                  </span>
                </div>
                <p className="text-white/80 mt-1">
                  Cause: <strong>{deltaPayload.cause}</strong> at region{' '}
                  <code className="text-rose-400 font-mono bg-[#0A0C10] px-1 py-0.5">{deltaPayload.region}</code>. Current value:{' '}
                  <span className="font-mono text-rose-400 font-bold">{deltaPayload.currentValue}</span> vs required:{' '}
                  <span className="font-mono text-emerald-400 font-bold">{deltaPayload.requiredValue}</span>.
                </p>
                <div className="mt-2 text-white/60 flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-white/40">Immutable Constraints:</span>
                  {deltaPayload.lockedConstraints.map((l, i) => (
                    <span key={i} className="bg-[#0A0C10] border border-white/20 px-2 py-0.5 font-mono text-[10px] text-cyan-400">
                      [LOCKED] {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              id="btn-trigger-ai-delta-repair"
              onClick={onTriggerRepair}
              disabled={isRepairing}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 disabled:bg-rose-900 text-black px-4 py-2.5 font-bold uppercase tracking-widest text-[11px] transition cursor-pointer shrink-0"
            >
              <Sparkles className={`w-3.5 h-3.5 fill-black ${isRepairing ? 'animate-spin' : ''}`} />
              {isRepairing ? 'GENERATING DELTA REPAIR...' : 'TRIGGER AI DELTA REPAIR'}
            </button>
          </div>
        </div>
      )}

      {/* The 13-Gate Interactive List */}
      <div className="bg-[#0F1117] border border-white/10 overflow-hidden shadow-sm">
        <div className="divide-y divide-white/5 font-mono">
          {gates.map((gate) => {
            const isExpanded = expandedGate === gate.gateNumber;
            return (
              <div key={gate.gateNumber} className="hover:bg-white/5 transition-colors">
                <div
                  onClick={() => setExpandedGate(isExpanded ? null : gate.gateNumber)}
                  className="p-4 flex items-center justify-between cursor-pointer gap-4"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(gate.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white/40">
                          GATE {gate.gateNumber}:
                        </span>
                        <span className="text-xs font-semibold text-white">{gate.gateName}</span>
                      </div>
                      <p className="text-[11px] text-white/50 hidden sm:block mt-0.5 font-mono">
                        {gate.purpose}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono">
                    <span className="text-[10px] text-white/40 hidden md:block">
                      Cost: {gate.relativeCost} • {gate.executionTimeMs}ms
                    </span>
                    {getStatusBadge(gate.status)}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 bg-[#0A0C10] border-t border-white/10 text-xs space-y-4">
                    <div className="p-3.5 bg-[#0F1117] border border-white/10 text-white/80">
                      <div className="flex items-center justify-between font-bold text-cyan-400 mb-1 uppercase tracking-wider text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-cyan-400" />
                          Diagnostic Output:
                        </div>
                        {gate.executor && (
                          <span className="text-[10px] text-white/40 font-mono font-normal lowercase">
                            executor: <code className="text-cyan-300 font-bold">{gate.executor}</code> (v{gate.engine_version || '1.0.0'})
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[11px] text-white/90 leading-relaxed">
                        {gate.diagnosticMessage}
                      </p>
                    </div>

                    {/* Metrics Grid */}
                    {gate.metrics && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(gate.metrics).map(([k, v]) => (
                          <div
                            key={k}
                            className="bg-[#0F1117] border border-white/10 p-3 text-[11px]"
                          >
                            <span className="text-white/40 font-mono text-[10px] block uppercase">
                              {k}
                            </span>
                            <span className="font-mono text-white font-bold text-xs mt-0.5 block">
                              {String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Failure Evidence Card if Failed */}
                    {gate.failureEvidence && (
                      <div className="bg-rose-500/10 border border-rose-500/30 p-4 space-y-2">
                        <div className="flex items-center justify-between text-rose-300 font-mono text-[11px]">
                          <span>ERROR_CODE: {gate.failureEvidence.errorCode}</span>
                          <span>REGION: {gate.failureEvidence.region}</span>
                        </div>
                        <div className="flex items-center justify-between text-white font-mono text-[11px]">
                          <span>Measured: {gate.failureEvidence.measuredValue}</span>
                          <span>Required: {gate.failureEvidence.requiredValue}</span>
                        </div>
                        <div className="text-[11px] text-white/60">
                          Permitted Solvers: {gate.failureEvidence.availableActions.join(', ')}
                        </div>
                      </div>
                    )}

                    {/* Special Interaction for Gate 9 (Human Review Sign-off) */}
                    {gate.gateNumber === 9 && (
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
                        <span className="text-white/60 text-xs">
                          Professional Engineer Production Sign-off (PE License Required):
                        </span>
                        <button
                          id="btn-toggle-pe-signoff"
                          onClick={onTogglePESignoff}
                          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider border transition cursor-pointer ${
                            gate.status === 'PASS'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/30'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          {gate.status === 'PASS' ? 'Revoke PE Approval' : 'Authorize Tooling Sign-off'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
