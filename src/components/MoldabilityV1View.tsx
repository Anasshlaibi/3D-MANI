import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  Compass, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Info,
  Loader2,
  Box,
  Move
} from 'lucide-react';
import { RealInspectorResult, GeometricFaceData } from '../types';
import { APPROVED_MATERIALS } from '../core/knowledgeBase';
import { CADViewer3D } from './CADViewer3D';

export const MoldabilityV1View: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [material, setMaterial] = useState('PP');
  const [direction, setDirection] = useState('+Z');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<RealInspectorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFace, setSelectedFace] = useState<GeometricFaceData | null>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.step') || droppedFile.name.endsWith('.stp'))) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a valid .step or .stp file.');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const runAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/m2/inspect?material=${material}&direction=${direction}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Filename': file.name,
        },
        body: await file.arrayBuffer(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze STEP file.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFindings = () => {
    if (!result) return [];
    const findings: any[] = [];
    
    result.faces.forEach((face: any) => {
      if (face.draft !== null && face.draft < 1.0) {
        findings.push({
          type: 'DRAFT',
          severity: 'WARN',
          message: `Insufficient draft (${face.draft.toFixed(2)}°)`,
          faceId: face.id,
          face
        });
      }
      if (face.blocked) {
        findings.push({
          type: 'UNDERCUT',
          severity: 'FAIL',
          message: 'Undercut detected',
          faceId: face.id,
          face
        });
      }
      if (face.thickness !== null && (face.thickness < 1.0 || face.thickness > 4.0)) {
        findings.push({
          type: 'THICKNESS',
          severity: 'WARN',
          message: `Wall thickness out of bounds (${face.thickness.toFixed(2)} mm)`,
          faceId: face.id,
          face
        });
      }
    });
    
    return findings;
  };

  return (
    <div className="space-y-6">
      <div className="plan-card">
        <span className="eyebrow">M2 REAL MOLDABILITY V1</span>
        <h2>High-Fidelity STEP Analysis 🧊</h2>
        <p>
          Upload a production STEP file for real B-Rep analysis using the OCCT engine.
          Deterministic geometry measurements for manufacturing validation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Controls */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-[#0F1117] border border-white/10 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              Upload Geometry
            </h3>
            
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                file ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/10 hover:border-white/20'
              }`}
              onClick={() => document.getElementById('step-upload')?.click()}
            >
              <input 
                id="step-upload"
                type="file"
                accept=".step,.stp"
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="space-y-2">
                  <FileText className="w-8 h-8 text-cyan-400 mx-auto" />
                  <div className="text-xs font-mono text-white truncate">{file.name}</div>
                  <div className="text-[10px] text-white/40 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Box className="w-8 h-8 text-white/20 mx-auto" />
                  <div className="text-xs font-mono text-white/60">Drop STEP file or click to browse</div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Target Material</label>
                <select 
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="bg-[#0A0C10] border border-white/15 text-white text-xs font-mono px-3 py-2 focus:outline-none focus:border-cyan-500"
                >
                  {Object.keys(APPROVED_MATERIALS).map(m => (
                    <option key={m} value={m}>{APPROVED_MATERIALS[m].name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Pull Direction</label>
                <select 
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="bg-[#0A0C10] border border-white/15 text-white text-xs font-mono px-3 py-2 focus:outline-none focus:border-cyan-500"
                >
                  <option value="+Z">+Z (Standard)</option>
                  <option value="-Z">-Z</option>
                  <option value="+Y">+Y</option>
                  <option value="-Y">-Y</option>
                  <option value="+X">+X</option>
                  <option value="-X">-X</option>
                </select>
              </div>
            </div>

            <button
              onClick={runAnalysis}
              disabled={!file || isAnalyzing}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/10 disabled:text-white/40 text-black py-3 text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing B-Rep...
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  Analyze Moldability
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-mono flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {result && (
            <div className="bg-[#0F1117] border border-white/10 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                Engineering Report
              </h3>
              
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-[#0A0C10] p-2 border border-white/5">
                  <div className="text-white/40 uppercase text-[9px]">Solids</div>
                  <div className="text-white">{result.solids}</div>
                </div>
                <div className="bg-[#0A0C10] p-2 border border-white/5">
                  <div className="text-white/40 uppercase text-[9px]">Faces</div>
                  <div className="text-white">{result.faces.length}</div>
                </div>
                <div className="bg-[#0A0C10] p-2 border border-white/5">
                  <div className="text-white/40 uppercase text-[9px]">Volume</div>
                  <div className="text-white">{(result.volume / 1000).toFixed(2)} cm³</div>
                </div>
                <div className="bg-[#0A0C10] p-2 border border-white/5">
                  <div className="text-white/40 uppercase text-[9px]">Area</div>
                  <div className="text-white">{(result.area / 100).toFixed(2)} cm²</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Findings</div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {getFindings().map((finding, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedFace(finding.face)}
                      className={`p-2 border cursor-pointer transition flex items-center justify-between gap-2 ${
                        selectedFace?.id === finding.faceId 
                          ? 'bg-cyan-500/10 border-cyan-500/50' 
                          : 'bg-[#0A0C10] border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {finding.severity === 'FAIL' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                        )}
                        <span className="text-[10px] font-mono text-white/80">{finding.message}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-white/20" />
                    </div>
                  ))}
                  {getFindings().length === 0 && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      No critical DFM violations
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button className="w-full border border-white/10 hover:bg-white/5 text-white/60 hover:text-white py-2 text-[10px] font-mono uppercase tracking-widest transition">
                  Generate PDF Report
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 3D Viewport & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0F1117] border border-white/10 p-1 shadow-sm relative min-h-[500px]">
            {!result ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-white/20">
                <Box className="w-16 h-16 stroke-1" />
                <div className="text-xs font-mono uppercase tracking-widest">Waiting for geometry analysis</div>
              </div>
            ) : (
              <div className="h-[600px]">
                {/* We'll pass result to CADViewer3D after updating it */}
                <CADViewer3D 
                  // @ts-ignore - we'll fix the type mismatch in CADViewer3D
                  geometryResult={{
                    model: { partName: result.filename, material: result.provenance.material },
                    calculatedVolumeMl: +(result.volume / 1000).toFixed(1),
                    calculatedMassGrams: 0,
                    surfaceAreaCm2: +(result.area / 100).toFixed(1),
                    actualDraftDeg: 0,
                    faces: result.faces.map(f => ({
                      id: f.id,
                      semanticTag: `Face ${f.id}`,
                      areaMm2: f.area,
                      draftAngleDeg: f.draft || 0,
                      isUndercut: f.blocked || false,
                      minThicknessMm: f.thickness || 0
                    })),
                    mesh: {
                      vertices: new Float32Array([]), // Placeholder, handled by result
                      normals: new Float32Array([]),
                      indices: new Uint16Array([]),
                    },
                    realResult: result // Custom prop for the updated viewer
                  }}
                  onSelectFace={(face) => setSelectedFace(face)}
                />
              </div>
            )}
          </div>

          {selectedFace && (
            <div className="bg-[#0F1117] border border-white/10 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  Face Detail: #{selectedFace.id}
                </h3>
                <button onClick={() => setSelectedFace(null)} className="text-white/40 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-[#0A0C10] p-3 border border-white/10">
                  <div className="text-white/40 text-[9px] uppercase mb-1">Measured Draft</div>
                  <div className={`text-sm font-bold ${selectedFace.draftAngleDeg! < 1.0 ? 'text-yellow-500' : 'text-emerald-400'}`}>
                    {selectedFace.draftAngleDeg?.toFixed(2)}°
                  </div>
                </div>
                <div className="bg-[#0A0C10] p-3 border border-white/10">
                  <div className="text-white/40 text-[9px] uppercase mb-1">Estimated Thickness</div>
                  <div className="text-sm font-bold text-white">
                    {selectedFace.minThicknessMm?.toFixed(2)} mm
                  </div>
                </div>
                <div className="bg-[#0A0C10] p-3 border border-white/10">
                  <div className="text-white/40 text-[9px] uppercase mb-1">Undercut Status</div>
                  <div className={`text-sm font-bold ${selectedFace.isBlocked ? 'text-rose-500' : 'text-emerald-400'}`}>
                    {selectedFace.isBlocked ? 'BLOCKED' : 'CLEAR'}
                  </div>
                </div>
                <div className="bg-[#0A0C10] p-3 border border-white/10">
                  <div className="text-white/40 text-[9px] uppercase mb-1">Surface Area</div>
                  <div className="text-sm font-bold text-white">
                    {selectedFace.areaMm2.toFixed(2)} mm²
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
