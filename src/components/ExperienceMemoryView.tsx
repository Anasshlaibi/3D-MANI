import React, { useState } from 'react';
import {
  History,
  Database,
  TrendingUp,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Compass,
  ArrowUpRight,
  Calculator,
} from 'lucide-react';
import {
  HISTORICAL_EXPERIENCE_CASES,
  calculateSolverBias,
  ExperienceCase,
} from '../core/experienceMemory';

export const ExperienceMemoryView: React.FC = () => {
  const [cases, setCases] = useState<ExperienceCase[]>(HISTORICAL_EXPERIENCE_CASES);
  const [selectedFamily, setSelectedFamily] = useState<string>('thin_container');
  const [showAddModal, setShowAddModal] = useState(false);

  // New record form state
  const [newPartName, setNewPartName] = useState('Cup_400ml_Rev17');
  const [newMaterial, setNewMaterial] = useState('PP');
  const [newSimWarpage, setNewSimWarpage] = useState(0.42);
  const [newActualWarpage, setNewActualWarpage] = useState(0.55);
  const [newCycleTime, setNewCycleTime] = useState(8.2);

  const bias = calculateSolverBias(selectedFamily);

  const handleAddRecord = () => {
    const newCase: ExperienceCase = {
      caseId: `CASE_${cases.length + 2000}`,
      partName: newPartName,
      geometryFamily: selectedFamily,
      material: newMaterial,
      process: 'INJECTION_MOLDING',
      dataClass: 'SYNTHETIC_DEMO',
      trainingAllowed: false,
      productionCalibrationAllowed: false,
      simulation: {
        predictedWarpageMm: newSimWarpage,
        predictedCoolingTimeSec: +(newCycleTime * 0.7).toFixed(1),
        predictedCycleTimeSec: newCycleTime,
      },
      production: {
        machineId: 'ENGEL_VICTORY_120T',
        measuredWarpageMm: newActualWarpage,
        measuredWeightGrams: 32.4,
        actualCycleTimeSec: newCycleTime,
        defectRatePercent: 0.3,
        outcome: 'PASS',
      },
      systematicErrorMm: +(newActualWarpage - newSimWarpage).toFixed(2),
    };

    setCases([newCase, ...cases]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header Banner */}
      <div className="bg-[#0F1117] border border-white/10 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 border-2 border-cyan-500 flex items-center justify-center bg-black/40 shrink-0">
              <div className="w-4 h-4 bg-cyan-500"></div>
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 uppercase tracking-widest mb-1">
                EMPIRICAL_FEEDBACK_LOOP
              </div>
              <h2 className="text-xl font-light text-white tracking-tight flex items-center gap-2">
                Experience Memory & Calibration Engine
              </h2>
              <p className="text-xs text-[#D1D5DB]/70 mt-1 max-w-3xl font-mono leading-relaxed">
                Grounds simulation predictions in verified factory CMM scans.
                Calculates systematic solver bias across geometric families to calibrate numerical gates and prevent recurring defects.
              </p>
            </div>
          </div>

          <button
            id="btn-add-production-record"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            LOG CMM SCAN
          </button>
        </div>

        {/* Empirical Solver Calibration Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-white/40 uppercase text-[10px]">Geometric Family:</span>
            <select
              id="family-select"
              aria-label="Active Geometric Family"
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="bg-[#0A0C10] border border-white/15 text-white text-xs px-3 py-1 focus:outline-none focus:border-cyan-500"
            >
              <option value="thin_container">Thin-Wall Containers (Frustums & Cups)</option>
              <option value="shallow_enclosure">Shallow Enclosures (Boxes & Covers)</option>
              <option value="thick_connector">Thick Fluid Connectors & Adapters</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#0A0C10] px-3 py-1.5 border border-white/10 flex items-center gap-2">
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-white/40 text-[10px] uppercase">Mean Solver Bias:</span>
              <span className="text-yellow-400 font-bold">+{bias.meanErrorMm} mm</span>
            </div>
            <div className="bg-[#0A0C10] px-3 py-1.5 border border-white/10 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-white/40 text-[10px] uppercase">Empirical Multiplier:</span>
              <span className="text-emerald-400 font-bold">{bias.factor}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Cases Table */}
      <div className="bg-[#0F1117] border border-white/10 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Verified Production Runs ({cases.length} Ground-Truth Cases)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 font-bold uppercase">
            DATA_CLASS = SYNTHETIC_DEMO (TRAINING_ALLOWED = FALSE)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0A0C10] text-white/50 uppercase text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Part & Material</th>
                <th className="py-3 px-4">Family</th>
                <th className="py-3 px-4">Predicted Warpage</th>
                <th className="py-3 px-4">Measured CMM Actual</th>
                <th className="py-3 px-4">Solver Delta</th>
                <th className="py-3 px-4">Defect Rate</th>
                <th className="py-3 px-4 text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {cases.map((item) => (
                <tr key={item.caseId} className="hover:bg-white/5 transition-colors font-mono text-xs">
                  <td className="py-3 px-4 font-bold text-cyan-400">
                    {item.caseId}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <div className="font-semibold text-white">{item.partName}</div>
                    <div className="text-[11px] text-white/40 font-mono">{item.material}</div>
                  </td>
                  <td className="py-3 px-4 text-white/50 text-[11px]">
                    {item.geometryFamily}
                  </td>
                  <td className="py-3 px-4 text-white/70">
                    {item.simulation.predictedWarpageMm} mm
                  </td>
                  <td className="py-3 px-4 text-white font-bold">
                    {item.production.measuredWarpageMm} mm
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-1.5 py-0.5 border text-[11px] ${
                        item.systematicErrorMm > 0
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          : 'bg-white/5 text-white/70 border-white/10'
                      }`}
                    >
                      {item.systematicErrorMm > 0 ? `+${item.systematicErrorMm}` : item.systematicErrorMm} mm
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/70">
                    {item.production.defectRatePercent}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        item.production.outcome === 'PASS'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {item.production.outcome === 'PASS' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                      )}
                      {item.production.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1117] border border-white/15 max-w-md w-full p-6 space-y-4 shadow-2xl text-xs font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="text-[10px] text-cyan-400 uppercase tracking-widest">CMM_DATA_INGESTION</div>
                <h3 className="font-light text-base text-white">Log Factory Physical Measurement</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white text-base cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-white/60 block mb-1 uppercase text-[10px]">Part Name & Revision</label>
                <input
                  type="text"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-white/15 p-2 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 uppercase text-[10px]">Polymer Resin</label>
                  <select
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    className="w-full bg-[#0A0C10] border border-white/15 p-2 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="PP">PP (Polypropylene)</option>
                    <option value="ABS">ABS (Terpolymer)</option>
                    <option value="PC">PC (Polycarbonate)</option>
                    <option value="PA66_GF30">PA66-GF30 (Glass-filled)</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/60 block mb-1 uppercase text-[10px]">Cycle Time (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCycleTime}
                    onChange={(e) => setNewCycleTime(parseFloat(e.target.value))}
                    className="w-full bg-[#0A0C10] border border-white/15 p-2 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 uppercase text-[10px]">Simulated Warpage (mm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSimWarpage}
                    onChange={(e) => setNewSimWarpage(parseFloat(e.target.value))}
                    className="w-full bg-[#0A0C10] border border-white/15 p-2 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-white/60 block mb-1 uppercase text-[10px]">CMM Warpage (mm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newActualWarpage}
                    onChange={(e) => setNewActualWarpage(parseFloat(e.target.value))}
                    className="w-full bg-[#0A0C10] border border-white/15 p-2 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-white/5 hover:bg-white/10 text-white/70 px-4 py-2 text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecord}
                className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                SAVE RECORD & UPDATE BIAS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
