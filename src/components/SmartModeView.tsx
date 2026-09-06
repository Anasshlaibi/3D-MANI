import React, { useState } from "react";
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
} from "lucide-react";

interface SmartModeViewProps {
  onApplyModel: (modelDSL: string) => void;
  onProceedToEngineering: () => void;
  currentDSL: string;
}

export const SmartModeView: React.FC<SmartModeViewProps> = ({
  onApplyModel,
  onProceedToEngineering,
}) => {
  const [prompt, setPrompt] = useState(
    "A stackable 400 ml reusable plastic cup with reinforced rim",
  );
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");

  // Extracted breakdown state
  const [extraction, setExtraction] = useState<{
    partName: string;
    process: string;
    material: string;
    explicitLocked: Array<{
      name: string;
      value: any;
      unit: string;
      reason: string;
    }>;
    inferred: Array<{ name: string; value: any; unit: string; reason: string }>;
    missingCritical: Array<{
      name: string;
      recommendedDefault: any;
      unit: string;
      reason: string;
    }>;
    generatedDSL: string;
  }>({
    partName: "Cup_400ml",
    process: "INJECTION_MOLDING",
    material: "PP",
    explicitLocked: [
      {
        name: "capacity",
        value: 400,
        unit: "ml",
        reason: "Explicit volume target stated in prompt",
      },
      {
        name: "stackable",
        value: true,
        unit: "boolean",
        reason: "Taper nesting required",
      },
    ],
    inferred: [
      {
        name: "process",
        value: "INJECTION_MOLDING",
        unit: "enum",
        reason: "Selected for high-volume thin-wall plastic container",
      },
      {
        name: "material",
        value: "PP (Polypropylene)",
        unit: "enum",
        reason:
          "High fatigue life for reusable beverage cup, chemical resistance",
      },
      {
        name: "wall_thickness",
        value: 1.8,
        unit: "mm",
        reason: "Conforms to SPI PP uniform wall thickness standard",
      },
      {
        name: "draft_angle",
        value: 1.75,
        unit: "deg",
        reason: "Standard core/cavity draft for positive ejection",
      },
    ],
    missingCritical: [
      {
        name: "production_quantity",
        recommendedDefault: 100000,
        unit: "parts",
        reason: "Required to select mold tooling grade (P20 vs H13 hardened)",
      },
      {
        name: "food_contact_certified",
        recommendedDefault: true,
        unit: "boolean",
        reason: "Governs FDA/EU 10/2011 virgin resin selection",
      },
      {
        name: "max_height",
        recommendedDefault: 120,
        unit: "mm",
        reason: "Required to constrain vertical stack envelope",
      },
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
      title: "Reusable 400ml Cup",
      prompt:
        "A stackable 400 ml reusable plastic cup with reinforced rim in polypropylene.",
    },
    {
      title: "Electronics Enclosure Base",
      prompt:
        "A rigid electronics enclosure base in ABS with 42mm height and 2.0mm wall thickness.",
    },
    {
      title: "High-Pressure Fluid Fitting",
      prompt:
        "An injection-molded 80ml fluid connector adapter in glass-filled nylon PA66 with 2.4mm walls.",
    },
  ];

  const handleExtract = async (userPrompt: string = prompt) => {
    setLoading(true);
    setError("");
    setReviewed(false);
    setConfirmed(false);
    try {
      const res = await fetch("/api/smart-mode/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });
      const json = await res.json();
      if (!res.ok || !json.data) throw new Error("Unable to create a plan");
      if (json.data) {
        setReviewed(true);
        setSource(json.source);
        setExtraction(json.data);
      }
    } catch (e) {
      setError("We couldn’t create your plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndCompile = () => {
    setConfirmed(true);
    onApplyModel(extraction.generatedDSL);
  };

  const readable = (value: unknown) =>
    typeof value === "boolean"
      ? value
        ? "Yes"
        : "No"
      : String(value).replaceAll("_", " ").toLowerCase();
  return (
    <div className="idea-page">
      <section className="idea-hero">
        <span className="eyebrow">FROM WORDS TO A SHAPE</span>
        <h1>
          What would you like
          <br />
          to make? <span aria-hidden="true">💭</span>
        </h1>
        <p>
          Start with a simple idea. We’ll help you turn it into a 3D preview you
          can spin, explore, and adjust.
        </p>
      </section>
      <div className="idea-layout">
        <section className="idea-card">
          <label htmlFor="smart-mode-prompt-input">
            Tell us about your idea
          </label>
          <p className="helper">
            What is it? How big should it be? No technical words needed.
          </p>
          <textarea
            id="smart-mode-prompt-input"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setReviewed(false);
            }}
            rows={4}
            placeholder="For example: a reusable cup that holds 400 ml…"
          />
          <div className="prompt-actions">
            <span>Try a starting point</span>
            <button
              className="example-chip"
              disabled={loading}
              onClick={() => {
                setPrompt(presetExamples[0].prompt);
                handleExtract(presetExamples[0].prompt);
              }}
            >
              ☕ Reusable cup
            </button>
          </div>
          <button
            className="primary-action"
            disabled={loading || !prompt.trim()}
            onClick={() => handleExtract(prompt)}
          >
            {loading ? "Working on your idea…" : "Turn my idea into a plan →"}
          </button>
          {error && (
            <p role="alert" className="error-note">
              {error}
            </p>
          )}
        </section>
        <aside className="idea-aside">
          <span className="aside-emoji" aria-hidden="true">
            🌱
          </span>
          <h2>New to 3D? Start here.</h2>
          <p>
            Try the cup example first. This prototype currently previews
            cup-shaped designs.
          </p>
          <ol>
            <li>
              <strong>Describe it</strong>
              <span>Tell us what you have in mind.</span>
            </li>
            <li>
              <strong>Take a look</strong>
              <span>Drag to turn it. Scroll to zoom.</span>
            </li>
            <li>
              <strong>Make it yours</strong>
              <span>Adjust the size and explore the checks.</span>
            </li>
          </ol>
          <p className="quiet-note">
            A concept preview, not a manufacturing-ready model.
          </p>
        </aside>
      </div>
      {reviewed && (
        <section className="plan-card" aria-live="polite">
          <span className="eyebrow">YOUR STARTING PLAN</span>
          <h2>Ready for a first look? 👀</h2>
          <p>
            Explore your starting design now. You can fine-tune the details
            later.
          </p>
          <div className="plan-summary">
            <span>☕ {extraction.partName.replaceAll("_", " ")}</span>
            <span>Material: {extraction.material}</span>
            <span>Editable dimensions</span>
          </div>
          <p className="quiet-note">
            {source === "gemini"
              ? "Generated suggestions — review before use."
              : "Using a built-in example planner. Some details are preset suggestions."}
          </p>
          <div className="plan-actions">
            <button
              id="btn-confirm-and-compile"
              className="primary-action"
              onClick={handleConfirmAndCompile}
            >
              Explore my 3D preview →
            </button>
            <button
              className="secondary-action"
              onClick={onProceedToEngineering}
            >
              Adjust dimensions
            </button>
          </div>
          <details className="plan-details">
            <summary>See requirements & suggestions</summary>
            <div className="detail-columns">
              {[
                {
                  title: "📌 Your requirements",
                  items: extraction.explicitLocked,
                },
                {
                  title: "✨ Starting suggestions",
                  items: extraction.inferred,
                },
                {
                  title: "💬 Details to decide later",
                  items: extraction.missingCritical.map((x) => ({
                    ...x,
                    value: x.recommendedDefault,
                  })),
                },
              ].map((group) => (
                <section key={group.title}>
                  <h3>{group.title}</h3>
                  {group.items.map((item, i) => (
                    <p key={i}>
                      <strong>{readable(item.name)}</strong>
                      <span>
                        {readable(item.value)}{" "}
                        {["boolean", "enum"].includes(item.unit)
                          ? ""
                          : item.unit}
                      </span>
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </details>
        </section>
      )}
    </div>
  );
};
