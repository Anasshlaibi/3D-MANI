import { useRef, useState } from "react";
import { MoldViewport, type Inspection } from "./MoldViewport";
import "./mold-workspace.css";
const stages = [
  "Product",
  "Moldability",
  "Mold Design",
  "Tooling",
  "Validation",
  "Manufacturing Package",
];
export default function MoldWorkspace() {
  const [stage, setStage] = useState("Product");
  const [model, setModel] = useState<Inspection | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [material, setMaterial] = useState("PP");
  const [direction, setDirection] = useState("+Z");
  const [mode, setMode] = useState("solid");
  const [selected, setSelected] = useState<number | null>(null);
  const [stale, setStale] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const inspect = async (f: File) => {
    setBusy(true);
    setError("");
    setModel(null);
    setSelected(null);
    try {
      if (!/\.(step|stp)$/i.test(f.name))
        throw new Error(
          "Choose a .step or .stp file. Mesh formats are not supported.",
        );
      if (f.size > 20 * 1024 * 1024)
        throw new Error("The STEP file must be smaller than 20 MB.");
      const res = await fetch(
        "/api/m2/inspect?material=" +
          material +
          "&direction=" +
          encodeURIComponent(direction),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "X-Filename": encodeURIComponent(f.name),
          },
          body: f,
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail || data.error || "Import failed");
      setModel(data);
      setStale(false);
      setFile(f);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  };
  const face = model?.faces.find((f) => f.id === selected);
  const later = ["Mold Design", "Tooling", "Manufacturing Package"].includes(
    stage,
  );
  const exportReport = () => {
    if (!model) return;
    const a = document.createElement("a");
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              ...model,
              faces: model.faces.map(({ positions, indices, ...f }) => f),
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    a.href = url;
    a.download = "mani-inspection.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="mold-app">
      <header className="mold-header">
        <div className="mold-brand">
          <b>⬡ 3D–MANI</b>
          <span>INJECTION MOLD ENGINEERING</span>
        </div>
        <div className="mold-project">
          {model?.filename || "Untitled product"} <span>/ M2 workspace</span>
        </div>
        <button
          className="mold-primary"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          ↑ Import STEP
        </button>
        <input
          ref={input}
          hidden
          type="file"
          accept=".step,.stp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) inspect(f);
            e.target.value = "";
          }}
        />
      </header>
      <nav className="mold-stages" aria-label="Engineering workspaces">
        {stages.map((s, i) => (
          <button
            key={s}
            aria-current={stage === s ? "page" : undefined}
            className={stage === s ? "active" : ""}
            onClick={() => setStage(s)}
          >
            <small>0{i + 1}</small>
            {s}
            {[2, 3, 5].includes(i) && <span>Planned</span>}
          </button>
        ))}
      </nav>
      <div className="mold-layout">
        <aside className="mold-tree">
          <h3>PROJECT EXPLORER</h3>
          <button onClick={() => setStage("Product")} className="tree-item">
            ◇ Product geometry
          </button>
          <p>{model ? model.filename : "No part imported"}</p>
          <div className="tree-divider" />
          <h3>STUDY SETUP</h3>
          <label>
            Polymer family
            <select
              value={material}
              disabled={busy}
              onChange={(e) => {
                setMaterial(e.target.value);
                setStale(true);
              }}
            >
              {["PP", "ABS", "PC", "PA66_GF30", "POM"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            Pull direction
            <select
              value={direction}
              disabled={busy}
              onChange={(e) => {
                setDirection(e.target.value);
                setStale(true);
              }}
            >
              {["+X", "-X", "+Y", "-Y", "+Z", "-Z"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <p>
            Direction in which the mold opens. Family selection is context only;
            grade-specific rules are not yet applied.
          </p>
          <button
            className="mold-primary"
            disabled={!file || busy}
            onClick={() => file && inspect(file)}
          >
            {busy ? "Inspecting…" : "Recalculate study"}
          </button>
          <div className="tree-divider" />
          <h3>ANALYSIS LAYERS</h3>
          {[
            ["solid", "Product surface"],
            ["edges", "Mesh edges"],
            ["draft", "Draft samples"],
            ["thickness", "Thickness samples"],
            ["undercut", "Undercut candidates"],
          ].map(([id, label]) => (
            <button
              key={id}
              disabled={!model || stale}
              className={"tree-item " + (mode === id ? "selected" : "")}
              onClick={() => setMode(id)}
            >
              {label}
            </button>
          ))}
          <p className="scope-note">
            M2 · Import → inspect → analyze.
            <br />
            Mold construction and CAM are outside this milestone.
          </p>
        </aside>
        <main className="mold-main">
          <div className="mold-toolbar">
            <div>
              <strong>{stage}</strong>
              <span>
                {later
                  ? "Future milestone"
                  : model
                    ? "Imported geometry study"
                    : "STEP geometry intake"}
              </span>
            </div>
            <span className="mold-status">
              {later
                ? "UNAVAILABLE"
                : busy
                  ? "PROCESSING"
                  : stale && model
                    ? "STALE ANALYSIS"
                    : model
                      ? ["solid", "edges"].includes(mode)
                        ? "CALCULATED"
                        : "ESTIMATED"
                      : "AWAITING INPUT"}
            </span>
          </div>
          {error && (
            <div role="alert" className="mold-error">
              {error}
            </div>
          )}
          {stale && model && (
            <div className="mold-notice">
              Setup changed. Recalculate before viewing analysis layers or
              exporting this study.
            </div>
          )}
          {later ? (
            <section className="future-stage">
              <span>UNAVAILABLE</span>
              <h1>{stage}</h1>
              <p>
                This workspace will consume the verified geometry and
                moldability foundation. It is not implemented in M2.
              </p>
              <button onClick={() => setStage("Product")}>
                Return to product inspection
              </button>
            </section>
          ) : (
            <>
              <MoldViewport
                model={model}
                mode={stale ? "solid" : mode}
                selected={selected}
                onSelect={setSelected}
              />
              <div className="mold-legend">
                {mode === "solid"
                  ? "OCCT tessellation · millimeters"
                  : mode === "draft"
                    ? "ESTIMATED · amber: |draft| < 1.5° · green/purple: opposite normal directions"
                    : mode === "thickness"
                      ? "ESTIMATED · red: <1 mm · green: 1–4 mm · amber: >4 mm · gray: no sample"
                      : mode === "undercut"
                        ? "ESTIMATED · red: both pull rays blocked · green: a clear ray · gray: unavailable"
                        : "Display triangulation, not B-Rep edges"}{" "}
              </div>
              <section className="mold-findings">
                <div>
                  <h3>Study findings</h3>
                  <span>Evidence before decisions</span>
                </div>
                {!model ? (
                  <p>
                    Import a real STEP solid. Dimensions and analysis results
                    will appear here.
                  </p>
                ) : (
                  <>
                    <p>
                      <b>CALCULATED</b> OCCT accepted one valid solid.{" "}
                      {model.faces.length} faces · {model.edges} edges.
                    </p>
                    <p>
                      <b>ESTIMATED</b> Face-center samples only. These do not
                      prove complete wall coverage or mold release.
                    </p>
                    {model.limitations.map((x) => (
                      <p key={x}>{x}</p>
                    ))}
                  </>
                )}
              </section>
            </>
          )}
        </main>
        <aside className="mold-inspector">
          <h3>GEOMETRY INSPECTOR</h3>
          <h2>{model ? "Imported solid" : "Ready to inspect"}</h2>
          <p>
            {model
              ? "Exact B-Rep measures; approximate analysis samples."
              : "Upload the plastic product, not the mold. STEP preserves surfaces and topology for inspection."}
          </p>
          <dl>
            {[
              [
                "Dimensions",
                model
                  ? model.dimensions.map((x) => x.toFixed(2)).join(" × ") +
                    " mm"
                  : "—",
              ],
              ["Volume", model ? model.volume.toFixed(2) + " mm³" : "—"],
              ["Surface area", model ? model.area.toFixed(2) + " mm²" : "—"],
              ["Solids", model?.solids ?? "—"],
              ["Faces", model?.faces.length ?? "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="tree-divider" />
          <h3>SELECTED FACE</h3>
          {face ? (
            <dl>
              <div>
                <dt>Face ID</dt>
                <dd>{face.id}</dd>
              </div>
              <div>
                <dt>Area</dt>
                <dd>{face.area.toFixed(2)} mm²</dd>
              </div>
              {!stale && (
                <>
                  <div>
                    <dt>Draft sample</dt>
                    <dd>{face.draft?.toFixed(2) ?? "Unavailable"}°</dd>
                  </div>
                  <div>
                    <dt>Thickness sample</dt>
                    <dd>{face.thickness?.toFixed(2) ?? "Unavailable"} mm</dd>
                  </div>
                  <div>
                    <dt>Both pull rays blocked</dt>
                    <dd>
                      {face.blocked === null
                        ? "Unavailable"
                        : face.blocked
                          ? "Yes — candidate"
                          : "No at sample"}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          ) : (
            <p>Click a surface in the viewport to inspect its measurements.</p>
          )}
          <div className="tree-divider" />
          <h3>PROVENANCE</h3>
          <p>
            {model
              ? "Revision " + model.revision.slice(0, 12)
              : "No calculated results yet."}
          </p>
          <p>
            Human approval: UNAVAILABLE
            <br />
            Flow simulation: UNAVAILABLE
            <br />
            CAM / G-code: UNAVAILABLE
          </p>
          <button disabled={!model || stale || busy} onClick={exportReport}>
            Download inspection report
          </button>
        </aside>
      </div>
      <footer className="mold-footer">
        <span>3D-MANI / M2 development</span>
        <span>
          Engineering review required · No manufacturing approval implied
        </span>
      </footer>
    </div>
  );
}
