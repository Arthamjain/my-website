"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";

/* 1 unit ≈ 100 mm. A5 = 148 × 210 mm. */
export const W = 1.48;
export const H = 2.1;
const T = 0.22;
const CT = 0.032;
const BLOCK_T = T - 2 * CT - 0.006;

export type Fabric = {
  texture: string;
  /** Size of one pattern repeat in scene units. */
  tile?: number;
  color2?: string;
  roughness?: number;
  sheen?: number;
};

/* --------------------------------- textures -------------------------------- */

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paperTexture(opts: { ruling?: "dot" | "plain" | "lined"; writing?: string[]; seed?: number; gutter?: "left" | "right" }) {
  const [c, x] = canvas(1024, 1456);
  const r = rng(opts.seed ?? 3);
  x.fillStyle = "#F3EDE1";
  x.fillRect(0, 0, c.width, c.height);
  // cotton rag fibres
  for (let i = 0; i < 2600; i++) {
    x.fillStyle = `rgba(${150 + r() * 40},${130 + r() * 30},${100 + r() * 30},${0.04 + r() * 0.06})`;
    x.fillRect(r() * c.width, r() * c.height, 1 + r() * 3, 1);
  }
  const step = 1024 / 29.6; // 5 mm grid on a 148 mm page
  if (opts.ruling === "dot") {
    x.fillStyle = "rgba(70,60,50,0.32)";
    for (let gx = step; gx < c.width - step / 2; gx += step)
      for (let gy = step * 1.5; gy < c.height - step; gy += step) {
        x.beginPath();
        x.arc(gx, gy, 1.7, 0, Math.PI * 2);
        x.fill();
      }
  } else if (opts.ruling === "lined") {
    x.strokeStyle = "rgba(70,60,50,0.18)";
    x.lineWidth = 1.4;
    for (let gy = step * 3; gy < c.height - step; gy += step * 1.4) {
      x.beginPath();
      x.moveTo(step, gy);
      x.lineTo(c.width - step, gy);
      x.stroke();
    }
  }
  if (opts.writing?.length) {
    const font = getComputedStyle(document.documentElement).getPropertyValue("--font-hand").trim() || "cursive";
    x.fillStyle = "rgba(28,40,92,0.86)";
    x.textBaseline = "alphabetic";
    let y = step * 3.2;
    for (const [i, line] of opts.writing.entries()) {
      x.font = `${i === 0 ? 64 : 50}px ${font}`;
      x.save();
      x.translate(step * 2.2 + (i % 2) * 3, y);
      x.rotate(-0.012 + r() * 0.01);
      x.fillText(line, 0, 0);
      x.restore();
      y += i === 0 ? step * 2.6 : step * 1.9;
    }
  }
  if (opts.gutter) {
    // Soft fall-off into the sewn gutter.
    const left = opts.gutter === "left";
    const g = x.createLinearGradient(left ? 0 : c.width, 0, left ? c.width * 0.16 : c.width * 0.84, 0);
    g.addColorStop(0, "rgba(90,70,50,0.28)");
    g.addColorStop(0.35, "rgba(90,70,50,0.08)");
    g.addColorStop(1, "rgba(90,70,50,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, c.width, c.height);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function edgeTexture() {
  const [c, x] = canvas(64, 1024);
  const r = rng(11);
  x.fillStyle = "#EDE5D5";
  x.fillRect(0, 0, 64, 1024);
  for (let i = 0; i < 64; i += 1) {
    x.fillStyle = `rgba(110,90,70,${0.04 + r() * 0.14})`;
    x.fillRect(i, 0, 1, 1024);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 1);
  return t;
}

/** Pages read as a stack of leaves on the three exposed edges. */
function edgeTextureHorizontal() {
  const t = edgeTexture();
  t.rotation = Math.PI / 2;
  return t;
}

/* ------------------------------- shared materials ------------------------------ */

export function useBrass() {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#C9A25A",
        metalness: 1,
        roughness: 0.26,
        clearcoat: 0.25,
        clearcoatRoughness: 0.35,
      }),
    [],
  );
}

export function useFabricMaterial(f: Fabric) {
  const map = useTexture(f.texture);
  const mat = useMemo(() => {
    const m = map.clone();
    m.colorSpace = THREE.SRGBColorSpace;
    m.wrapS = m.wrapT = THREE.MirroredRepeatWrapping;
    m.anisotropy = 8;
    const tile = f.tile ?? 0.9;
    const aspect = (map.image as HTMLImageElement | undefined)?.width
      ? (map.image as HTMLImageElement).height / (map.image as HTMLImageElement).width
      : 1;
    m.repeat.set(1 / tile, 1 / (tile * aspect));
    // Centre the repeat so a single-tile cover never crosses a mirror seam.
    m.offset.set(0.5, 0.5);
    m.needsUpdate = true;
    return new THREE.MeshPhysicalMaterial({
      map: m,
      bumpMap: m,
      bumpScale: 2.2,
      roughness: f.roughness ?? 0.86,
      metalness: 0,
      sheen: f.sheen ?? 0.45,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color("#FFF6EA"),
    });
  }, [map, f.tile, f.roughness, f.sheen]);
  useEffect(() => () => {
    mat.map?.dispose();
    mat.dispose();
  }, [mat]);
  return mat;
}

/* ---------------------------------- pieces ---------------------------------- */

function Rod({ material, length = H + 0.1 }: { material: THREE.Material; length?: number }) {
  return (
    <group>
      <mesh material={material} castShadow>
        <cylinderGeometry args={[0.026, 0.026, length, 40]} />
      </mesh>
      {[1, -1].map((d) => (
        <group key={d} position={[0, (d * length) / 2, 0]}>
          <mesh material={material} position={[0, d * 0.012, 0]}>
            <cylinderGeometry args={[0.036, 0.036, 0.026, 40]} />
          </mesh>
          <mesh material={material} position={[0, d * 0.05, 0]}>
            <sphereGeometry args={[0.042, 40, 20]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Ribbon({ color, z }: { color: string; z: number }) {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.06, 0.34, 1, 12);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const u = (0.17 - y) / 0.34; // 0 at top, 1 at tail
      p.setZ(i, Math.sin(u * 2.2) * 0.07 * u);
      p.setX(i, p.getX(i) + Math.sin(u * 3.1) * 0.025 * u);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.45, sheen: 1, sheenColor: new THREE.Color("#ffffff"), side: THREE.DoubleSide }),
    [color],
  );
  return <mesh geometry={geom} material={mat} position={[W * 0.32, -H / 2 - 0.1, z]} rotation={[0.05, 0, 0.08]} />;
}

/* --------------------------------- notebook --------------------------------- */

export type NotebookProps = {
  fabric: Fabric;
  /** 0 closed → 1 lying open. */
  open?: number;
  ruling?: "dot" | "plain" | "lined";
  writing?: string[];
  ribbon?: string;
  /** Animate `open` toward this target instead of using it directly. */
  animate?: boolean;
  coverOnly?: boolean;
  blockOnly?: boolean;
} & React.ComponentProps<"group">;

export function Notebook({ fabric, open = 0, ruling = "dot", writing, ribbon, animate, coverOnly, blockOnly, ...group }: NotebookProps) {
  const fabricMat = useFabricMaterial(fabric);
  const brass = useBrass();
  const front = useRef<THREE.Group>(null);
  const leaf = useRef<THREE.Group>(null);
  const centre = useRef<THREE.Group>(null);
  const state = useRef({ open });

  const mats = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ map: edgeTexture(), roughness: 0.95 });
    const edgeH = new THREE.MeshStandardMaterial({ map: edgeTextureHorizontal(), roughness: 0.95 });
    const top = new THREE.MeshStandardMaterial({ map: paperTexture({ ruling, seed: 5, gutter: "left" }), roughness: 0.92 });
    const leafBack = new THREE.MeshStandardMaterial({ map: paperTexture({ ruling, writing, seed: 9, gutter: "right" }), roughness: 0.92, side: THREE.DoubleSide });
    const endpaper = new THREE.MeshStandardMaterial({ color: fabric.color2 ?? "#EDE4D3", roughness: 0.9 });
    return { edge, edgeH, top, leafBack, endpaper, block: [edge, edge, edgeH, edgeH, top, edge] };
  }, [ruling, writing, fabric.color2]);
  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => {
        if (Array.isArray(m)) return;
        m.map?.dispose();
        m.dispose();
      });
    },
    [mats],
  );

  const apply = (o: number) => {
    const angle = o * Math.PI;
    if (front.current) front.current.rotation.y = -angle;
    if (leaf.current) {
      // The first leaf rides up onto the open front board so the left page sits flat on it.
      leaf.current.rotation.y = -o * Math.PI;
      leaf.current.position.z = THREE.MathUtils.lerp(BLOCK_T / 2 + 0.001, T / 2 + 0.004, o);
    }
    if (centre.current) centre.current.position.x = -(W / 2) * (1 - o);
  };

  useFrame((_, dt) => {
    const s = state.current;
    s.open = animate ? THREE.MathUtils.damp(s.open, open, 3.2, Math.min(dt, 1 / 30)) : open;
    apply(s.open);
  });

  const frontZ = T / 2 - CT / 2;

  if (blockOnly) {
    return (
      <group {...group}>
        <mesh material={mats.block} castShadow>
          <boxGeometry args={[W - 0.06, H - 0.06, BLOCK_T + 0.02]} />
        </mesh>
        {ribbon && <Ribbon color={ribbon} z={0} />}
      </group>
    );
  }

  return (
    <group {...group}>
      <group ref={centre} position={[-W / 2, 0, 0]}>
        {/* back board */}
        <RoundedBox args={[W, H, CT]} radius={0.012} smoothness={3} position={[W / 2, 0, -T / 2 + CT / 2]} material={fabricMat} castShadow receiveShadow />
        {!coverOnly && (
          <mesh position={[W / 2, 0, -T / 2 + CT + 0.001]} material={mats.endpaper}>
            <planeGeometry args={[W - 0.04, H - 0.04]} />
          </mesh>
        )}

        {/* spine wrap */}
        <RoundedBox args={[0.06, H, T]} radius={0.025} smoothness={4} position={[0.0, 0, 0]} material={fabricMat} castShadow />

        {/* cotton rag text block */}
        {!coverOnly && (
          <mesh position={[W / 2 + 0.01, 0, 0]} material={mats.block} castShadow receiveShadow>
            <boxGeometry args={[W - 0.06, H - 0.06, BLOCK_T]} />
          </mesh>
        )}

        {/* first leaf: turns with the cover so an open book shows a written page on the left */}
        {!coverOnly && (
          <group ref={leaf} position={[0.02, 0, BLOCK_T / 2 + 0.001]}>
            <mesh position={[(W - 0.06) / 2, 0, 0]} material={mats.leafBack} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[W - 0.06, H - 0.06]} />
            </mesh>
            <mesh position={[(W - 0.06) / 2, 0, 0.0005]} material={mats.top}>
              <planeGeometry args={[W - 0.06, H - 0.06]} />
            </mesh>
          </group>
        )}

        {/* front board on its hinge */}
        <group ref={front} position={[0, 0, frontZ]}>
          <RoundedBox args={[W, H, CT]} radius={0.012} smoothness={3} position={[W / 2, 0, 0]} material={fabricMat} castShadow />
          <mesh position={[W / 2, 0, -CT / 2 - 0.001]} rotation={[0, Math.PI, 0]} material={mats.endpaper}>
            <planeGeometry args={[W - 0.04, H - 0.04]} />
          </mesh>
        </group>

        {/* solid brass spine rod */}
        <group position={[-0.03, 0, 0]}>
          <Rod material={brass} />
        </group>

        {ribbon && !coverOnly && <Ribbon color={ribbon} z={BLOCK_T / 2 - 0.01} />}
      </group>
    </group>
  );
}

export function BrassRod(props: React.ComponentProps<"group">) {
  const brass = useBrass();
  return (
    <group {...props}>
      <Rod material={brass} />
    </group>
  );
}
