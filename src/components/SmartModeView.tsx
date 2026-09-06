import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Send,
  Loader2,
} from 'lucide-react';

interface SmartModeViewProps {
  onApplyModel: (modelDSL: string) => void;
  onProceedToEngineering: () => void;
  currentDSL: string;
}

export const SmartModeView: React.FC<SmartModeViewProps> = ({
  onApplyModel,
  onProceedToEngineering,
}) => {
  const [prompt, setPrompt] = useState('A stackable 400 ml reusable plastic cup with reinforced rim');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Extracted breakdown state
  const [extraction, setExtraction] = useState<{
    partName: string;
    process: string;
    material: string;
    explicitLocked: Array<{ name: string; value: any; unit: string; reason: string }>;
    inferred: Array<{ name: string; value: any; unit: string; reason: string }>;
    missingCritical: Array<{ name: string; recommendedDefault: any; unit: string; reason: string }>;
    generatedDSL: string;
  }>({
    partName: 'Cup_400ml',
    process: 'INJECTION_MOLDING',
    material: 'PP',
    explicitLocked: [
      { name: 'capacity', value: 400, unit: 'ml', reason: 'Explicit volume target stated in prompt' },
      { name: 'stackable', value: true, unit: 'boolean', reason: 'Taper nesting required' },
    ],
    inferred: [
      { name: 'process', value: 'INJECTION_MOLDING', unit: 'enum', reason: 'Selected for high-volume thin-wall plastic container' },
      { name: 'material', value: 'PP (Polypropylene)', unit: 'enum', reason: 'High fatigue life for reusable beverage cup, chemical resistance' },
      { name: 'wall_thickness', value: 1.8, unit: 'mm', reason: 'Conforms to SPI PP uniform wall thickness standard' },
      { name: 'draft_angle', value: 1.75, unit: 'deg', reason: 'Standard core/cavity draft for positive ejection' },
    ],
    missingCritical: [
      { name: 'production_quantity', recommendedDefault: 100000, unit: 'parts', reason: 'Required to select mold tooling grade (P20 vs H13 hardened)' },
      { name: 'food_contact_certified', recommendedDefault: true, unit: 'boolean', reason: 'Governs FDA/EU 10/2011 virgin resin selection' },
      { name: 'max_height', recommendedDefault: 120, unit: 'mm', reason: 'Required to constrain vertical stack envelope' },
    ],
    generatedDSL: `PART Cup_400ml {
  PROCESS INJECTION_MOLDING
  MATERIAL PP

  REQUIRE {
    VOLUME >= 400ml
    HEIGHT <= 120mm
    STACKABLE true
    MIN_SAFETY_FACTOR 2.0
  }

  GEOMETRY {
    PROFILE {
      BOTTOM_DIAMETER 64.0mm
      TOP_DIAMETER 82.0mm
      HEIGHT 115.0mm
    }
    SHELL 1.8mm
    DRAFT 1.75deg
    FILLET base 2.0mm
  }

  FEATURES {
    RIM radius=3.0mm
  }

  LOCK {
    VOLUME
    MATERIAL
  }

  OPTIMIZE {
    MINIMIZE mass
    MAINTAIN stiffness
  }
}`,
  });

  const presetExamples = [
    {
      title: 'Reusable 400ml Cup',
      prompt: 'A stackable 400 ml reusable plastic cup with reinforced rim in polypropylene.',
    },
    {
      title: 'Electronics Enclosure Base',
      prompt: 'A rigid electronics enclosure base in ABS with 42mm height and 2.0mm wall thickness.',
    },
    {
      title: 'High-Pressure Fluid Fitting',
      prompt: 'An injection-molded 80ml fluid connector adapter in glass-filled nylon PA66 with 2.4mm walls.',
    },
  ];

  const handleExtract = async (userPrompt: string = prompt) => {
    setLoading(true);
    setConfirmed(false);
    try {
      const res = await fetch('/api/smart-mode/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt }),
      });
      const json = await res.json();
      if (json.data) {
        setExtraction(json.data);
      }
    } catch (e) {
      console.error('Extraction error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndCompile = () => {
    setConfirmed(true);
    onApplyModel(extraction.generatedDSL);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Explaining Smart Mode Contract */}
      <div className="bg-[#0F1117] border border-white/10 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 border-2 border-cyan-500 flex items-center justify-center bg-black/40 shrink-0">
              <div className="w-4 h-4 bg-cyan-500"></div>
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase mb-1">
                INTENT_PARSER_ACTIVE
              </div>
              <h2 className="text-xl font-light text-white tracking-tight">
                Smart Mode Intent Specification
              </h2>
              <p className="text-xs text-[#D1D5DB]/70 mt-1 leading-relaxed max-w-4xl font-mono">
                Describe your component in natural language. The AI extracts explicit functional requirements into{' '}
                <span className="text-cyan-400 font-bold">[LOCKED]</span> state, infers missing manufacturing parameters as{' '}
                <span className="text-yellow-400 font-bold">[INFERRED]</span> proposals, and identifies critical unstated constraints.
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-cyan-500 text-black text-[10px] font-bold tracking-widest uppercase">
            Zero-Leakage Boundary
          </div>
        </div>

        {/* Input Prompt Box */}
        <div className="mt-6">
          <div className="relative">
            <textarea
              id="smart-mode-prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="E.g. A stackable 400 ml reusable plastic cup with reinforced rim in polypropylene..."
              className="w-full bg-[#0A0C10] border border-white/15 p-4 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 font-mono resize-none transition"
            />
            <button
              id="btn-smart-mode-extract"
              onClick={() => handleExtract(prompt)}
              disabled={loading}
              className="absolute right-3 bottom-3 flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-900 text-black px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ANALYZING...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 fill-black" />
                  ANALYZE INTENT
                </>
              )}
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-[10px] text-white/40 uppercase font-mono tracking-wider">Benchmarks:</span>
            {presetExamples.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(ex.prompt);
                  handleExtract(ex.prompt);
                }}
                className="text-[11px] font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white px-3 py-1 transition cursor-pointer"
              >
                {ex.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Extraction Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Explicit & Locked Parameters */}
        <div className="bg-[#0F1117] border border-white/10 p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-cyan-500"></div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Explicit Requirements
              </h3>
            </div>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 font-mono font-bold">
              [LOCKED]
            </span>
          </div>

          <p className="text-[11px] text-white/60 mb-4 font-mono">
            Supplied directly by the user. The AI is strictly forbidden from altering these values.
          </p>

          <div className="space-y-3 flex-1">
            {extraction.explicitLocked.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#0A0C10] border border-cyan-500/30 p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-400 font-bold">{item.name}</span>
                  <span className="font-mono text-white font-bold bg-white/10 px-2 py-0.5">
                    {String(item.value)} {item.unit !== 'boolean' && item.unit !== 'enum' ? item.unit : ''}
                  </span>
                </div>
                <p className="text-white/60 text-[11px] mt-1.5 flex items-center gap-1.5 font-mono">
                  <Lock className="w-3 h-3 text-cyan-400 shrink-0" />
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Inferred Assumptions */}
        <div className="bg-[#0F1117] border border-white/10 p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-yellow-500"></div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Inferred by AI Engine
              </h3>
            </div>
            <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 font-mono font-bold">
              [INFERRED]
            </span>
          </div>

          <p className="text-[11px] text-white/60 mb-4 font-mono">
            Derived from manufacturing standards. Requires user review before becoming locked.
          </p>

          <div className="space-y-3 flex-1">
            {extraction.inferred.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#0A0C10] border border-yellow-500/30 p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-yellow-400 font-bold">{item.name}</span>
                  <span className="font-mono text-white font-semibold bg-white/10 px-2 py-0.5">
                    {String(item.value)} {item.unit !== 'boolean' && item.unit !== 'enum' ? item.unit : ''}
                  </span>
                </div>
                <p className="text-white/60 text-[11px] mt-1.5 flex items-center gap-1.5 font-mono">
                  <HelpCircle className="w-3 h-3 text-yellow-400 shrink-0" />
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Missing Critical Items */}
        <div className="bg-[#0F1117] border border-white/10 p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-rose-500"></div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Missing Critical Constraints
              </h3>
            </div>
            <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 font-mono font-bold">
              [UNKNOWN]
            </span>
          </div>

          <p className="text-[11px] text-white/60 mb-4 font-mono">
            Essential for tooling decisions and regulatory certifications.
          </p>

          <div className="space-y-3 flex-1">
            {extraction.missingCritical.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#0A0C10] border border-rose-500/30 p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-rose-400 font-bold">{item.name}</span>
                  <span className="font-mono text-white/80 text-[11px] bg-white/10 px-2 py-0.5">
                    DEFAULT: {String(item.recommendedDefault)} {item.unit !== 'boolean' ? item.unit : ''}
                  </span>
                </div>
                <p className="text-white/60 text-[11px] mt-1.5 flex items-center gap-1.5 font-mono">
                  <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation & Proceed Action Panel */}
      <div className="bg-[#0F1117] border border-white/10 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-cyan-500 flex items-center justify-center text-cyan-400 bg-cyan-500/10">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Confirmation Action: Lock Inferred Assumptions
            </h4>
            <p className="text-xs text-white/60 font-mono">
              Transform inferred parameters into immutable project state and compile parametric B-Rep.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-confirm-and-compile"
            onClick={handleConfirmAndCompile}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2.5 text-[11px] font-bold tracking-widest uppercase transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {confirmed ? 'RE-COMPILE DSL' : 'CONFIRM & COMPILE CAD'}
          </button>

          <button
            id="btn-open-engineering-spec"
            onClick={onProceedToEngineering}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2.5 text-[11px] font-mono uppercase tracking-wider transition cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            ENGINEERING SPEC TABLE
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
