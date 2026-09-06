import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Rotate3d,
  Layers,
  Eye,
  Scissors,
  Flame,
  Compass,
  CheckCircle2,
  Info,
  Maximize2,
} from "lucide-react";
import { CompiledGeometryResult } from "../core/dslEngine";
import { GeometricFaceData, RealInspectorResult } from "../types";

interface CADViewer3DProps {
  geometryResult: CompiledGeometryResult & { realResult?: RealInspectorResult };
  onSelectFace?: (face: GeometricFaceData) => void;
}

export type ViewMode =
  "solid" | "wireframe" | "thickness_heatmap" | "draft_angles";

export const CADViewer3D: React.FC<CADViewer3DProps> = ({
  geometryResult,
  onSelectFace,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.LineSegments | null>(null);
  const clipPlaneRef = useRef<THREE.Plane | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("solid");
  const [enableSectionCut, setEnableSectionCut] = useState(false);
  const [sectionCutPos, setSectionCutPos] = useState(0); // -50 to 50
  const [selectedFace, setSelectedFace] = useState<GeometricFaceData | null>(
    geometryResult.faces[1] || null,
  );

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10); // Geometric Balance Deep Canvas
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 70, 190);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.localClippingEnabled = true;
    rendererRef.current = renderer;

    container.prepend(renderer.domElement);

    // Ambient and Key Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight1.position.set(100, 150, 100);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 0.9); // Electric Cyan Rim Light
    dirLight2.position.set(-100, -50, -100);
    scene.add(dirLight2);

    // Floor Grid
    const grid = new THREE.GridHelper(200, 20, 0x06b6d4, 0x1f293d);
    grid.position.y = -geometryResult.model.geometry.profile.height / 2 - 2;
    scene.add(grid);

    // Clipping plane for section cut
    const clipPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    clipPlaneRef.current = clipPlane;

    // Mouse Interaction (Orbiting & Panning)
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotation = { x: 0.35, y: -0.6 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };

      rotation.y += deltaX * 0.01;
      rotation.x += deltaY * 0.01;
      rotation.x = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, rotation.x),
      );

      const radius = 190;
      camera.position.x = radius * Math.sin(rotation.y) * Math.cos(rotation.x);
      camera.position.z = radius * Math.cos(rotation.y) * Math.cos(rotation.x);
      camera.position.y = radius * Math.sin(rotation.x) + 40;
      camera.lookAt(0, 0, 0);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoom = e.deltaY * 0.15;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      camera.position.addScaledVector(dir, -zoom * 0.3);
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    // Handle Container Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 500;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  // Update Geometry & Mesh when geometryResult or viewMode changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove previous meshes
    if (meshRef.current) {
      scene.remove(meshRef.current);
      if (Array.isArray(meshRef.current)) {
        meshRef.current.forEach(m => {
          m.geometry.dispose();
          scene.remove(m);
        });
      } else {
        meshRef.current.geometry.dispose();
      }
      meshRef.current = null;
    }
    if (wireframeMeshRef.current) {
      scene.remove(wireframeMeshRef.current);
      wireframeMeshRef.current.geometry.dispose();
      wireframeMeshRef.current = null;
    }

    const clipPlanes = enableSectionCut && clipPlaneRef.current ? [clipPlaneRef.current] : [];

    if (geometryResult.realResult) {
      const group = new THREE.Group();
      const real = geometryResult.realResult;
      
      real.faces.forEach((face: any) => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(face.positions, 3));
        geo.setIndex(new THREE.BufferAttribute(new Uint32Array(face.indices), 1));
        geo.computeVertexNormals();

        let color = new THREE.Color(0x06b6d4);
        if (viewMode === 'draft_angles' && face.draft !== null) {
          if (face.draft < 1.0) color.set(0xeab308); // Yellow (Warning)
          if (face.blocked) color.set(0xe11d48); // Red (Undercut)
          if (face.draft >= 1.0) color.set(0x06b6d4); // Cyan (OK)
        } else if (viewMode === 'thickness_heatmap' && face.thickness !== null) {
          if (face.thickness < 1.0) color.set(0xeab308); // Thin
          if (face.thickness > 4.0) color.set(0xf97316); // Thick
        }

        const mat = new THREE.MeshPhysicalMaterial({
          color: color,
          metalness: 0.15,
          roughness: 0.25,
          side: THREE.DoubleSide,
          clippingPlanes: clipPlanes,
          wireframe: viewMode === 'wireframe'
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = { faceId: face.id, faceData: face };
        group.add(mesh);
      });

      scene.add(group);
      meshRef.current = group as any;
    } else {
      // Fallback to DSL-generated geometry
      const meshData = geometryResult.mesh;
      const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(meshData.vertices, 3),
    );
    bufferGeometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(meshData.normals, 3),
    );
    bufferGeometry.setIndex(new THREE.BufferAttribute(meshData.indices, 1));

    // Color generation based on ViewMode
    const colors: number[] = [];
    const count = meshData.vertices.length / 3;

    if (viewMode === "thickness_heatmap") {
      const nominal = geometryResult.nominalWallThicknessMm;
      for (let i = 0; i < count; i++) {
        const y = meshData.vertices[i * 3 + 1];
        const isBase =
          y < -geometryResult.model.geometry.profile.height / 2 + 5;
        const isRim = y > geometryResult.model.geometry.profile.height / 2 - 6;

        if (isBase) {
          // Thick bottom fillet / gate area (sink risk)
          colors.push(0.9, 0.6, 0.1);
        } else if (isRim) {
          // Reinforced rim
          colors.push(0.1, 0.8, 0.5);
        } else {
          // Uniform thin wall
          colors.push(0.05, 0.75, 0.85); // Electric Cyan
        }
      }
      bufferGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3),
      );
    } else if (viewMode === "draft_angles") {
      for (let i = 0; i < count; i++) {
        const ny = meshData.normals[i * 3 + 1];
        if (Math.abs(ny) > 0.85) {
          // Floor / Top horizontal face
          colors.push(0.2, 0.8, 0.5);
        } else {
          // Tapered vertical sidewalls
          colors.push(0.05, 0.75, 0.85);
        }
      }
      bufferGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3),
      );
    }

    // Material selection
    let cadMaterial: THREE.Material;
    const clipPlanes =
      enableSectionCut && clipPlaneRef.current ? [clipPlaneRef.current] : [];

    if (viewMode === "solid") {
      cadMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x06b6d4, // Vibrant Electric Cyan
        metalness: 0.15,
        roughness: 0.25,
        transmission: 0.2,
        thickness: 1.8,
        clearcoat: 0.6,
        clearcoatRoughness: 0.15,
        side: THREE.DoubleSide,
        clippingPlanes: clipPlanes,
        clipShadows: true,
      });
    } else if (viewMode === "wireframe") {
      cadMaterial = new THREE.MeshBasicMaterial({
        color: 0x0f172a,
        wireframe: false,
        side: THREE.DoubleSide,
        clippingPlanes: clipPlanes,
      });
    } else {
      // Heatmap modes
      cadMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.35,
        side: THREE.DoubleSide,
        clippingPlanes: clipPlanes,
      });
    }

    const cadMesh = new THREE.Mesh(bufferGeometry, cadMaterial);
    cadMesh.castShadow = true;
    cadMesh.receiveShadow = true;
    scene.add(cadMesh);
    meshRef.current = cadMesh;

    // Add Wireframe / B-Rep Edges overlay if selected
    if (viewMode === "wireframe") {
      const wireframeGeometry = new THREE.WireframeGeometry(bufferGeometry);
      const wireframeMaterial = new THREE.LineBasicMaterial({
        color: 0x06b6d4,
        linewidth: 1,
        clippingPlanes:
          enableSectionCut && clipPlaneRef.current
            ? [clipPlaneRef.current]
            : [],
      });
      const wireframe = new THREE.LineSegments(
        wireframeGeometry,
        wireframeMaterial,
      );
      scene.add(wireframe);
      wireframeMeshRef.current = wireframe;
    }
  }, [geometryResult, viewMode, enableSectionCut]);

  // Handle section cut plane adjustment
  useEffect(() => {
    if (clipPlaneRef.current) {
      clipPlaneRef.current.constant = sectionCutPos;
    }
  }, [sectionCutPos]);

  return (
    <div className="space-y-6 viewer-friendly">
      <div className="viewer-intro">
        <h2>Meet your first 3D preview 🧊</h2>
        <p>
          Click and drag to turn it. Scroll to look closer. Try “Look inside” to
          reveal the inside of your cup.
        </p>
      </div>
      {/* 3D Canvas Container & HUD */}
      <div className="bg-[#0F1117] border border-white/10 overflow-hidden shadow-lg relative flex flex-col">
        {/* Canvas Toolbar */}
        <div className="bg-[#0A0C10] border-b border-white/10 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-10 font-mono text-xs">
          <div className="flex items-center gap-1 bg-[#0F1117] border border-white/10 p-1">
            <button
              id="view-mode-solid"
              onClick={() => setViewMode("solid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase font-bold tracking-wider transition cursor-pointer ${
                viewMode === "solid"
                  ? "bg-cyan-500 text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Solid view
            </button>
            <button
              id="view-mode-wireframe"
              onClick={() => setViewMode("wireframe")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase font-bold tracking-wider transition cursor-pointer ${
                viewMode === "wireframe"
                  ? "bg-cyan-500 text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Show edges
            </button>
            <button
              id="view-mode-thickness"
              onClick={() => setViewMode("thickness_heatmap")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase font-bold tracking-wider transition cursor-pointer ${
                viewMode === "thickness_heatmap"
                  ? "bg-cyan-500 text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Wall thickness
            </button>
            <button
              id="view-mode-draft"
              onClick={() => setViewMode("draft_angles")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase font-bold tracking-wider transition cursor-pointer ${
                viewMode === "draft_angles"
                  ? "bg-cyan-500 text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Surface angles
            </button>
          </div>

          {/* Section Cut Control */}
          <div className="flex items-center gap-3">
            <button
              id="btn-toggle-section-cut"
              onClick={() => setEnableSectionCut(!enableSectionCut)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider border transition cursor-pointer ${
                enableSectionCut
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              {enableSectionCut ? "Look inside: on" : "Look inside"}
            </button>

            {enableSectionCut && (
              <div className="flex items-center gap-2">
                <input
                  id="slider-section-cut"
                  aria-label="Section Cut Plane Position"
                  type="range"
                  min="-40"
                  max="40"
                  value={sectionCutPos}
                  onChange={(e) => setSectionCutPos(parseFloat(e.target.value))}
                  className="w-24 accent-rose-500 h-1 bg-white/10 cursor-pointer"
                />
                <span className="text-[11px] font-mono text-white/70 w-10 text-right">
                  {sectionCutPos}mm
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3D Viewport */}
        <div
          ref={containerRef}
          className="w-full h-[460px] sm:h-[540px] cursor-grab active:cursor-grabbing relative"
        >
          {/* Overlay CAD Metric HUD (Top Left) */}
          <div className="absolute top-4 left-4 bg-[#0F1117]/95 border border-white/15 p-3.5 text-xs font-mono space-y-1.5 pointer-events-none shadow-xl">
            <div className="text-cyan-400 font-mono text-[10px] uppercase tracking-widest border-b border-white/10 pb-1">
              {geometryResult.model.partName} • CONCEPT PREVIEW
            </div>
            <div className="flex items-center justify-between gap-6 pt-1">
              <span className="text-white/60">Estimated capacity:</span>
              <span className="font-mono text-white font-bold">
                {geometryResult.calculatedVolumeMl} ml
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-white/60">
                Solid Mass ({geometryResult.model.material}):
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {geometryResult.calculatedMassGrams} g
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-white/60">Surface Area:</span>
              <span className="font-mono text-white/80">
                {geometryResult.surfaceAreaCm2} cm²
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-white/60">Pull Draft Angle:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {geometryResult.actualDraftDeg}°
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Illustrative preview · not manufacturing verified
            </div>
          </div>

          {/* Color Legend (Bottom Left) */}
          {viewMode === "thickness_heatmap" && (
            <div className="absolute bottom-4 left-4 bg-[#0F1117]/95 border border-white/15 p-3 text-[11px] font-mono space-y-1.5 shadow-xl">
              <div className="font-bold text-white uppercase text-[10px] tracking-wider mb-1">
                Wall Thickness DFM:
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-cyan-400"></span>
                <span className="text-white/70">
                  Nominal Uniform Shell ({geometryResult.nominalWallThicknessMm}{" "}
                  mm)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500"></span>
                <span className="text-white/70">Reinforced Rim Section</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500"></span>
                <span className="text-white/70">
                  Thick Section (Sink Mark Risk)
                </span>
              </div>
            </div>
          )}

          {viewMode === "draft_angles" && (
            <div className="absolute bottom-4 left-4 bg-[#0F1117]/95 border border-white/15 p-3 text-[11px] font-mono space-y-1.5 shadow-xl">
              <div className="font-bold text-white uppercase text-[10px] tracking-wider mb-1">
                Illustrative surface angles:
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-cyan-400"></span>
                <span className="text-white/70">Adequate Draft (≥ 1.5°)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500"></span>
                <span className="text-white/70">
                  Horizontal Parting Line Faces
                </span>
              </div>
            </div>
          )}

          {/* Orbit Navigation Hint (Bottom Right) */}
          <div className="absolute bottom-4 right-4 text-[10px] text-white/50 font-mono flex items-center gap-1.5 bg-[#0F1117]/80 border border-white/10 px-2.5 py-1 uppercase tracking-wider pointer-events-none">
            <Rotate3d className="w-3.5 h-3.5 text-cyan-400" />
            Drag to Orbit • Scroll to Zoom
          </div>
        </div>
      </div>

      {/* B-Rep Topological Face Inspector */}
      <div className="bg-[#0F1117] border border-white/10 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Explore the parts of your cup
            </h3>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono">
            {geometryResult.faces.length} surfaces
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
          {geometryResult.faces.map((face) => {
            const isSelected = selectedFace?.id === face.id;
            return (
              <div
                key={face.id}
                onClick={() => {
                  setSelectedFace(face);
                  if (onSelectFace) onSelectFace(face);
                }}
                className={`p-3.5 border cursor-pointer transition ${
                  isSelected
                    ? "bg-cyan-500/10 border-cyan-500 text-white shadow-sm"
                    : "bg-[#0A0C10] border-white/10 text-white/70 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-cyan-400 font-bold">
                    {face.semanticTag}
                  </span>
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 font-mono text-white/80">
                    {face.type}
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-white/60">
                  <div className="flex justify-between">
                    <span>Area:</span>
                    <span className="font-mono text-white">
                      {face.areaMm2} mm²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thickness:</span>
                    <span className="font-mono text-white">
                      {face.minThicknessMm} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Draft Angle:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {face.draftAngleDeg}°
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
