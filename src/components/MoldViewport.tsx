import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
export interface Inspection {
  filename: string;
  revision: string;
  dimensions: number[];
  volume: number;
  area: number;
  edges: number;
  solids: number;
  faces: {
    id: number;
    area: number;
    positions: number[];
    indices: number[];
    draft: number | null;
    thickness: number | null;
    blocked: boolean | null;
  }[];
  provenance: Record<string, unknown>;
  limitations: string[];
}
export function MoldViewport({
  model,
  mode,
  selected,
  onSelect,
}: {
  model: Inspection | null;
  mode: string;
  selected: number | null;
  onSelect: (id: number) => void;
}) {
  const cameraMemory = useRef<{
    revision: string;
    position: THREE.Vector3;
    target: THREE.Vector3;
  } | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const [error, setError] = useState("");
  useEffect(() => {
    if (!host.current || !model) return;
    const el = host.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setError(
        "3D rendering is unavailable. Enable browser hardware acceleration.",
      );
      return;
    }
    setError("");
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#202730");
    const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100000);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    camera.up.set(0, 0, 1);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 2));
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(80, 130, 100);
    scene.add(light);
    const group = new THREE.Group();
    scene.add(group);
    const resources: { dispose: () => void }[] = [];
    for (const face of model.faces) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(face.positions, 3),
      );
      geo.setIndex(face.indices);
      geo.computeVertexNormals();
      let color = 0xb7c8cc;
      if (mode === "draft" && face.draft !== null)
        color =
          Math.abs(face.draft) < 1.5
            ? 0xf6b756
            : face.draft < 0
              ? 0x899ce6
              : 0x56c5a2;
      if (mode === "thickness")
        color =
          face.thickness === null
            ? 0x727982
            : face.thickness < 1
              ? 0xf08075
              : face.thickness > 4
                ? 0xf6b756
                : 0x56c5a2;
      if (mode === "undercut")
        color =
          face.blocked === null ? 0x727982 : face.blocked ? 0xf08075 : 0x56c5a2;
      const mat = new THREE.MeshStandardMaterial({
        color: face.id === selected ? 0x64d5ff : color,
        roughness: 0.5,
        metalness: 0.12,
        side: THREE.DoubleSide,
        wireframe: mode === "edges",
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.face = face.id;
      group.add(mesh);
      resources.push(geo, mat);
    }
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    const size = Math.max(box.getSize(new THREE.Vector3()).length(), 1);
    controls.target.copy(center);
    camera.position
      .copy(center)
      .add(new THREE.Vector3(size * 0.9, size * 0.7, size * 0.9));
    if (cameraMemory.current?.revision === model.revision) {
      camera.position.copy(cameraMemory.current.position);
      controls.target.copy(cameraMemory.current.target);
    }
    camera.near = size / 10000;
    camera.far = size * 100;
    camera.updateProjectionMatrix();
    const grid = new THREE.GridHelper(size * 2, 20, 0x485464, 0x303d4a);
    grid.rotation.x = Math.PI / 2;
    grid.position.set(center.x, center.y, box.min.z - size * 0.03);
    scene.add(grid);
    resources.push(
      grid.geometry,
      ...(Array.isArray(grid.material) ? grid.material : [grid.material]),
    );
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    let down = [0, 0];
    const start = (e: PointerEvent) => {
      down = [e.clientX, e.clientY];
    };
    const pick = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
      const r = el.getBoundingClientRect();
      const ray = new THREE.Raycaster();
      ray.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          (-(e.clientY - r.top) / r.height) * 2 + 1,
        ),
        camera,
      );
      const hit = ray.intersectObjects(group.children)[0];
      if (hit) selectRef.current(hit.object.userData.face);
    };
    el.addEventListener("pointerdown", start);
    el.addEventListener("pointerup", pick);
    let frame = 0;
    const render = () => {
      frame = requestAnimationFrame(render);
      controls.update();
      renderer.render(scene, camera);
    };
    render();
    return () => {
      cameraMemory.current = {
        revision: model.revision,
        position: camera.position.clone(),
        target: controls.target.clone(),
      };
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      el.removeEventListener("pointerdown", start);
      el.removeEventListener("pointerup", pick);
      resources.forEach((r) => r.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [model, mode, selected]);
  return (
    <div className="mold-canvas" ref={host}>
      {!model && (
        <div className="canvas-empty">
          <span>⬡</span>
          <h2>Your product starts here</h2>
          <p>
            Import a STEP solid to inspect its geometry
            <br />
            and explore injection-molding considerations.
          </p>
          <small>No sample geometry is substituted.</small>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      <div className="canvas-hint">
        Drag to orbit · Scroll to zoom · Click a face to inspect
      </div>
    </div>
  );
}
