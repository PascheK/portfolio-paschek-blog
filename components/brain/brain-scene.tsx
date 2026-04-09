"use client";

import React, { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { BRAIN_NODES, CATEGORY_COLORS, type BrainNode } from "./brain-data";
import { X, ChevronRight } from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildPositions(nodes: BrainNode[]): Map<string, THREE.Vector3> {
  const map = new Map<string, THREE.Vector3>();
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  nodes.forEach((node, i) => {
    if (node.position) {
      map.set(node.id, new THREE.Vector3(...node.position));
      return;
    }
    // fibonacci sphere distribution for non-fixed nodes
    const y = 1 - (i / (nodes.length - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const radius = 6 + Math.random() * 3;
    map.set(node.id, new THREE.Vector3(
      Math.cos(theta) * r * radius,
      y * radius,
      Math.sin(theta) * r * radius
    ));
  });
  return map;
}

// ─── synapse lines ─────────────────────────────────────────────────────────────

function Synapses({ positions }: { positions: Map<string, THREE.Vector3> }) {
  const geo = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const seen = new Set<string>();

    BRAIN_NODES.forEach(node => {
      const from = positions.get(node.id);
      if (!from) return;
      node.connections.forEach(cid => {
        const key = [node.id, cid].sort().join("--");
        if (seen.has(key)) return;
        seen.add(key);
        const to = positions.get(cid);
        if (!to) return;
        points.push(from.clone(), to.clone());
      });
    });

    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [positions]);

  const mat = useMemo(() => new THREE.LineBasicMaterial({
    color: "#6366f1",
    transparent: true,
    opacity: 0.18,
    linewidth: 1,
  }), []);

  return <lineSegments geometry={geo} material={mat} />;
}

// ─── single node ──────────────────────────────────────────────────────────────

function Node({
  node,
  position,
  onSelect,
  selected,
}: {
  node: BrainNode;
  position: THREE.Vector3;
  onSelect: (node: BrainNode) => void;
  selected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const t = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    t.current += delta * 0.6;

    // gentle floating
    meshRef.current.position.y = position.y + Math.sin(t.current) * 0.12;
    meshRef.current.rotation.y += delta * 0.3;

    // scale
    const target = selected ? 1.35 : hovered ? 1.18 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
  });

  const radius = 0.28 * node.size;
  const color = new THREE.Color(node.color);
  const emissive = new THREE.Color(node.color).multiplyScalar(selected ? 0.6 : hovered ? 0.4 : 0.15);

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      onClick={(e) => { e.stopPropagation(); onSelect(node); }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <icosahedronGeometry args={[radius, 2]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={1}
        roughness={0.3}
        metalness={0.6}
        transparent
        opacity={0.92}
      />
      {/* glow ring for hubs/selected */}
      {(node.size > 1.2 || selected) && (
        <mesh>
          <torusGeometry args={[radius * 1.55, 0.025, 8, 48]} />
          <meshBasicMaterial color={node.color} transparent opacity={selected ? 0.6 : 0.25} />
        </mesh>
      )}
    </mesh>
  );
}

// ─── floating label (HTML overlay) ─────────────────────────────────────────────

function NodeLabel({ node, position, selected, hovered }: {
  node: BrainNode;
  position: THREE.Vector3;
  selected: boolean;
  hovered: boolean;
}) {
  if (!selected && !hovered && node.category !== "core") return null;

  return (
    <Html
      position={[position.x, position.y + 0.55 * node.size, position.z]}
      center
      distanceFactor={14}
      zIndexRange={[10, 20]}
      style={{ pointerEvents: "none" }}
    >
      <div className={`
        px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap backdrop-blur border transition-all
        ${selected
          ? "bg-white/20 border-white/30 text-white shadow-lg shadow-black/40"
          : "bg-black/50 border-white/10 text-white/80"
        }
      `}>
        {node.emoji} {node.label}
      </div>
    </Html>
  );
}

// ─── camera fly-in ─────────────────────────────────────────────────────────────

function CameraFlyIn({ done }: { done: boolean }) {
  const { camera } = useThree();
  const t = useRef(0);
  const started = useRef(false);

  useEffect(() => {
    camera.position.set(0, 0, 60);
  }, [camera]);

  useFrame((_, delta) => {
    if (done) return;
    if (!started.current) { started.current = true; }
    t.current = Math.min(t.current + delta * 0.55, 1);
    const eased = 1 - Math.pow(1 - t.current, 3); // ease-out cubic
    camera.position.z = THREE.MathUtils.lerp(60, 16, eased);
    camera.position.y = THREE.MathUtils.lerp(8, 0, eased);
  });

  return null;
}

// ─── particle field (background stars) ────────────────────────────────────────

function NeuronParticles() {
  const count = 280;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return pos;
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const ref = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.012;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.08} color="#818cf8" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

// ─── scene inner ──────────────────────────────────────────────────────────────

function SceneInner({
  onSelectNode,
  selectedId,
}: {
  onSelectNode: (node: BrainNode | null) => void;
  selectedId: string | null;
}) {
  const [flyDone, setFlyDone] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { gl } = useThree();

  useEffect(() => {
    const timer = setTimeout(() => setFlyDone(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  const positions = useMemo(() => buildPositions(BRAIN_NODES), []);

  const handleSelect = useCallback((node: BrainNode) => {
    onSelectNode(selectedId === node.id ? null : node);
  }, [onSelectNode, selectedId]);

  // cursor style
  useEffect(() => {
    gl.domElement.style.cursor = hoveredId ? "pointer" : "grab";
  }, [hoveredId, gl]);

  return (
    <>
      <CameraFlyIn done={flyDone} />

      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#a78bfa" />
      <pointLight position={[-10, -5, -10]} intensity={0.8} color="#38bdf8" />
      <pointLight position={[0, -10, 5]} intensity={0.6} color="#f472b6" />

      <Stars radius={80} depth={40} count={1800} factor={3} saturation={0.4} fade speed={0.4} />
      <NeuronParticles />

      <Synapses positions={positions} />

      {BRAIN_NODES.map(node => {
        const pos = positions.get(node.id)!;
        return (
          <React.Fragment key={node.id}>
            <Node
              node={node}
              position={pos}
              onSelect={handleSelect}
              selected={selectedId === node.id}
            />
            <NodeLabel
              node={node}
              position={pos}
              selected={selectedId === node.id}
              hovered={hoveredId === node.id}
            />
          </React.Fragment>
        );
      })}

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={6}
        maxDistance={40}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        autoRotate={!selectedId}
        autoRotateSpeed={0.4}
        makeDefault
      />
    </>
  );
}

// ─── detail card ──────────────────────────────────────────────────────────────

function DetailCard({ node, onClose }: { node: BrainNode; onClose: () => void }) {
  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, scale: 0.88, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 8 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm mx-4"
      style={{ zIndex: 30 }}
    >
      <div
        className="rounded-2xl border backdrop-blur-xl p-5 shadow-2xl"
        style={{
          background: `color-mix(in srgb, ${node.color} 8%, rgba(10,10,20,0.85))`,
          borderColor: `color-mix(in srgb, ${node.color} 30%, transparent)`,
          boxShadow: `0 0 40px color-mix(in srgb, ${node.color} 15%, transparent)`,
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{node.emoji}</span>
            <div>
              <p className="font-bold text-white text-base leading-tight">{node.label}</p>
              <p className="text-xs capitalize" style={{ color: node.color }}>{node.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white shrink-0 mt-0.5"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <p className="text-sm text-white/75 mb-3 leading-relaxed">{node.description}</p>

        {node.details && node.details.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {node.details.map((d, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-white/60">
                <ChevronRight className="size-3 shrink-0" style={{ color: node.color }} />
                {d}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

// ─── category legend ──────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  core:    "Core",
  skill:   "Skills",
  passion: "Passions",
  music:   "Music",
  project: "Projects",
  value:   "Values",
};

function Legend() {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-1.5" style={{ zIndex: 20 }}>
      {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
        <div key={cat} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
          <span className="text-[11px] text-white/50 font-medium">{CATEGORY_LABELS[cat]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── hint ─────────────────────────────────────────────────────────────────────

function Hint() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4500);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/35 text-center pointer-events-none"
          style={{ zIndex: 20 }}
        >
          Drag to explore · Scroll to zoom · Click a node to learn more
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── public export ─────────────────────────────────────────────────────────────

export function BrainScene() {
  const [selectedNode, setSelectedNode] = useState<BrainNode | null>(null);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 60], fov: 60, near: 0.1, far: 300 }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneInner
          onSelectNode={setSelectedNode}
          selectedId={selectedNode?.id ?? null}
        />
      </Canvas>

      <Legend />
      <Hint />

      <AnimatePresence mode="wait">
        {selectedNode && (
          <DetailCard
            key={selectedNode.id}
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
