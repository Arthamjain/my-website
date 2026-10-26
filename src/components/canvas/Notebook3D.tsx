"use client";
/* eslint-disable react-hooks/immutability -- three.js materials, vectors and textures are imperative GPU objects mutated per frame, not React state. */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Html, RoundedBox } from "@react-three/drei";
import { fabricById, type FabricId } from "@/data/fabrics";
import { useKaya, type SectionId } from "@/store/useKaya";
import { htmlPortal, rig } from "@/lib/rig";
import { sound } from "@/lib/soundEngine";
import { smoothstep } from "@/lib/utils";
import {
  createBuckramTexture,
  createLiningTexture,
  createMonogramTexture,
  createPaperEdgeTexture,
  createPaperTexture,
  createProvenanceTagTexture,
  getFabricTextures,
} from "@/lib/proceduralFabricTextures";

/* Dimensions in scene units (1 unit ≈ 100mm, A5 = 148 × 210mm). */
const W = 1.48;
const H = 2.1;
const T = 0.24;
const CT = 0.035; // buckram board
const ST = 0.012; // fabric sleeve
const PW = W - 0.08;
const PH = H - 0.08;
const OPEN_ANGLE = Math.PI * 0.885; // ≈160°
const PAGE_COUNT = 3;
const FLAP = 0.3; // sleeve pocket flap width

type Pose = { p: [number, number, number]; r: [number, number, number]; s: number };

function poseFor(section: SectionId, ledgerStage: number, mobile: boolean): Pose {
  if (mobile) {
    switch (section) {
      case "hero":
        return { p: [0, 1.05, 0], r: [0.14, -0.42, 0.04], s: 0.62 };
      case "anatomy":
        return { p: [0, 0.55, 0], r: [0.12, -0.08, 0], s: 0.56 };
      case "reviews":
        return { p: [0, 5, -2], r: [0.4, -0.6, 0], s: 0.5 };
      default:
        return { p: [0, 1.25, 0], r: [0.12, 0.3 - ledgerStage * 0.2, 0], s: 0.5 };
    }
  }
  switch (section) {
    case "hero":
      return { p: [1.55, 0.02, 0], r: [0.12, -0.44, 0.04], s: 1 };
    case "diagnosis":
      return { p: [-1.75, -0.05, 0], r: [0.1, 0.48, -0.03], s: 0.98 };
    case "anatomy":
      return { p: [0.05, -0.22, 0.2], r: [0.16, -0.12, 0], s: 0.9 };
    case "ledger":
      return { p: [1.85, -0.05, 0], r: [0.12, [-0.5, 0.35, -0.95, -0.2][ledgerStage] ?? -0.4, 0.02], s: 0.92 };
    case "atelier":
      return { p: [-1.75, 0, 0], r: [0.08, 0.36, 0], s: 1 };
    case "reviews":
      return { p: [0.5, 5.2, -2], r: [0.5, -0.8, 0.1], s: 0.8 };
  }
}

/** Damped spring with the "Brass Mechanical Snap" constants. */
function stepSpring(s: { x: number; v: number }, target: number, dt: number) {
  const k = 280;
  const c = 26;
  const m = 0.9;
  const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    const f = -k * (s.x - target) - c * s.v;
    s.v += (f / m) * h;
    s.x += s.v * h;
  }
}

const isUiTarget = (e: { nativeEvent: Event }) => {
  const t = e.nativeEvent.target as HTMLElement | null;
  return !!t?.closest?.("a,button,input,select,textarea,label,[data-ui]");
};

/** Page plane with its hinge on the left edge, kept for per-frame arching. */
function makePageGeometry() {
  const g = new THREE.PlaneGeometry(PW, PH, 24, 1);
  g.translate(PW / 2, 0, 0);
  return g;
}

function Hotspot({ n, title, body }: { n: string; title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      data-ui
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
    >
      <button
        className="grid h-8 w-8 place-items-center rounded-full border border-ink/25 bg-paper/85 font-mono text-[9px] tracking-[0.12em] text-ink backdrop-blur-md"
        aria-label={title}
      >
        <span className="absolute inset-0 animate-[pin_2.4s_cubic-bezier(0.22,1,0.36,1)_infinite] rounded-full border border-brass/70" />
        {n}
      </button>
      <div
        className={`pointer-events-none absolute left-10 top-1/2 w-56 -translate-y-1/2 rounded-[2px] border border-ink/10 bg-paper/95 p-3 backdrop-blur-xl transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
        }`}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-brass">{n} {"//"}</p>
        <p className="mt-1 font-serif text-lg italic leading-tight text-ink">{title}</p>
        <p className="mt-1 text-[12px] leading-snug text-muted">{body}</p>
      </div>
    </div>
  );
}

export default function Notebook3D() {
  const activeFabric = useKaya((s) => s.activeFabric);
  const ruling = useKaya((s) => s.ruling);
  const monogram = useKaya((s) => s.monogram);
  const size = useThree((s) => s.size);
  const mobile = size.width < 768;

  const position = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const center = useRef<THREE.Group>(null);
  const frontPivot = useRef<THREE.Group>(null);
  const sleeveFrontPivot = useRef<THREE.Group>(null);
  const sleeveFront = useRef<THREE.Group>(null);
  const sleeveRest = useRef<THREE.Group>(null);
  const rod = useRef<THREE.Group>(null);
  const pages = useRef<(THREE.Group | null)[]>([]);
  const pageMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const anchor = useRef<THREE.Object3D>(null);
  const [showPins, setShowPins] = useState(false);

  // Animated scalars kept in a ref so the frame loop never re-renders React.
  const anim = useRef({
    open: 0,
    explode: 0,
    yaw: 0,
    pitch: 0,
    swap: { x: 0, v: 0 },
    swapTarget: 0,
    rodBounce: 0,
    pageAngles: [0, 0, 0],
    scale: 1,
  });

  /* ------------------------------ materials ------------------------------ */
  const [displayed, setDisplayed] = useState<FabricId>(activeFabric);
  const fabricMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ sheenRoughness: 0.55, anisotropyRotation: Math.PI / 2 }),
    [],
  );
  const buckram = useMemo(() => {
    const map = createBuckramTexture();
    return new THREE.MeshStandardMaterial({ map, roughness: 0.92, metalness: 0 });
  }, []);
  const brass = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#C5A059", metalness: 0.88, roughness: 0.22 }),
    [],
  );
  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({ map: createPaperEdgeTexture(), roughness: 0.95 }), []);
  const paperMats = useMemo(
    () => Array.from({ length: PAGE_COUNT + 1 }, () => new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide })),
    [],
  );
  const monoMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        transparent: true,
        metalness: 0.75,
        roughness: 0.3,
        alphaTest: 0.05,
        emissive: new THREE.Color("#C5A059"),
        emissiveIntensity: 0.35,
      }),
    [],
  );
  const tagMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.85 }), []);
  const liningMat = useMemo(() => new THREE.MeshStandardMaterial({ map: createLiningTexture(), roughness: 0.95 }), []);
  // Inner pocket flap: a plane whose UVs sample the fore-edge strip of the sleeve texture.
  const flapGeom = useMemo(() => {
    const g = new THREE.PlaneGeometry(FLAP, H + 0.03);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - FLAP / W + uv.getX(i) * (FLAP / W));
    return g;
  }, []);
  const blockMats = useMemo(
    () => [edgeMat, edgeMat, edgeMat, edgeMat, paperMats[PAGE_COUNT], edgeMat],
    [edgeMat, paperMats],
  );
  const pageGeoms = useMemo(() => Array.from({ length: PAGE_COUNT }, makePageGeometry), []);
  const pageBase = useMemo(() => Float32Array.from(pageGeoms[0].attributes.position.array), [pageGeoms]);

  // Fabric material reflects the currently *displayed* sleeve.
  useEffect(() => {
    const f = fabricById[displayed];
    const tex = getFabricTextures(displayed);
    fabricMat.map = tex.map;
    fabricMat.bumpMap = tex.bump;
    fabricMat.bumpScale = f.material.bumpScale * 26;
    fabricMat.roughness = f.material.roughness;
    fabricMat.metalness = tex.metal ? 1 : f.material.metalness;
    fabricMat.metalnessMap = tex.metal;
    if (tex.metal) fabricMat.metalness = f.material.metalness * 2.2;
    fabricMat.sheen = f.material.sheen;
    fabricMat.sheenColor.set(f.color).lerp(new THREE.Color("#FAF7F2"), 0.5);
    fabricMat.anisotropy = f.material.anisotropy;
    fabricMat.needsUpdate = true;

    const tag = createProvenanceTagTexture(f.ngo, f.region, f.coordinates);
    tagMat.map = tag;
    tagMat.needsUpdate = true;
    return () => tag.dispose();
  }, [displayed, fabricMat, tagMat]);

  // Fabric swap choreography: sleeve slides off → swap → springs back → brass click.
  useEffect(() => {
    if (activeFabric === displayed) return;
    const a = anim.current;
    a.swapTarget = 1;
    const t1 = window.setTimeout(() => {
      setDisplayed(activeFabric);
      a.swapTarget = 0;
    }, 300);
    const t2 = window.setTimeout(() => {
      sound.brassClick();
      a.rodBounce = 1;
    }, 640);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [activeFabric, displayed]);

  // Paper ruling on the three loose pages + the block's top leaf.
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      paperMats.forEach((m, i) => {
        const t = createPaperTexture(ruling, i);
        m.map?.dispose();
        m.map = t;
        m.needsUpdate = true;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [ruling, paperMats]);

  // Live gold-foil monogram.
  useEffect(() => {
    let cancelled = false;
    let tex: THREE.Texture | null = null;
    const serif = getComputedStyle(document.documentElement).getPropertyValue("--font-cormorant").trim();
    const ready = serif ? document.fonts.load(`italic 500 100px ${serif}`) : Promise.resolve([]);
    ready.then(() => {
      if (cancelled) return;
      tex = createMonogramTexture(monogram);
      monoMat.map = tex;
      monoMat.emissiveMap = tex;
      monoMat.needsUpdate = true;
    });
    return () => {
      cancelled = true;
      tex?.dispose();
    };
  }, [monogram, monoMat]);

  // Dispose GPU resources on unmount.
  useEffect(
    () => () => {
      [fabricMat, buckram, brass, edgeMat, monoMat, tagMat, liningMat, ...paperMats].forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      pageGeoms.forEach((g) => g.dispose());
      flapGeom.dispose();
    },
    [fabricMat, buckram, brass, edgeMat, monoMat, tagMat, liningMat, paperMats, pageGeoms, flapGeom],
  );

  // Register the loupe anchor.
  useEffect(() => {
    rig.coverAnchor = anchor.current;
    return () => {
      rig.coverAnchor = null;
    };
  }, []);

  /* --------------------------- direct manipulation --------------------------- */
  const drag = useRef<{ x: number; y: number; moved: number; touch: boolean } | null>(null);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (isUiTarget(e)) return;
    e.stopPropagation();
    drag.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, moved: 0, touch: e.nativeEvent.pointerType === "touch" };
    const move = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = ev.clientX - d.x;
      const dy = ev.clientY - d.y;
      d.moved += Math.abs(dx) + Math.abs(dy);
      d.x = ev.clientX;
      d.y = ev.clientY;
      if (d.touch) return;
      const a = anim.current;
      a.yaw = THREE.MathUtils.clamp(a.yaw + dx * 0.009, -1.6, 1.6);
      a.pitch = THREE.MathUtils.clamp(a.pitch + dy * 0.005, -0.6, 0.6);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const d = drag.current;
      drag.current = null;
      if (d && d.moved < 6) {
        const s = useKaya.getState();
        if (!s.loupe && s.section !== "anatomy") s.toggleOpen();
        else if (s.section === "anatomy") s.flipPage();
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    if (isUiTarget(e)) return;
    useKaya.getState().setHover3D(true);
  };
  const onOut = () => useKaya.getState().setHover3D(false);

  /* -------------------------------- frame loop -------------------------------- */
  const tmpQ = useMemo(() => new THREE.Euler(), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const s = useKaya.getState();
    const a = anim.current;
    const damp = THREE.MathUtils.damp;

    // Section pose (with intro glide).
    const pose = poseFor(s.section, s.ledgerStage, mobile);
    const introY = s.introDone ? 0 : -3.4;
    const introRx = s.introDone ? 0 : 0.7;
    const scaleTarget = pose.s * (s.format === "pocket" ? 0.72 : 1);
    if (position.current) {
      const g = position.current;
      g.position.x = damp(g.position.x, pose.p[0], 2.6, dt);
      g.position.y = damp(g.position.y, pose.p[1] + introY, s.introDone ? 2.6 : 20, dt);
      g.position.z = damp(g.position.z, pose.p[2], 2.6, dt);
      a.scale = damp(a.scale, scaleTarget, 3.2, dt);
      g.scale.setScalar(a.scale);
    }

    // Explode choreography (only while the anatomy section is active).
    const explodeTarget = s.section === "anatomy" ? rig.explode : 0;
    a.explode = damp(a.explode, explodeTarget, 6, dt);
    const rodUp = smoothstep(0.05, 0.3, a.explode);
    const sleeveOff = smoothstep(0.3, 0.55, a.explode);
    const explodeOpen = smoothstep(0.55, 0.85, a.explode);

    const openTarget = s.loupe ? 0 : Math.max(s.isOpen ? 1 : 0, explodeOpen);
    a.open = damp(a.open, openTarget, s.section === "anatomy" ? 9 : 3.4, dt);
    const angle = a.open * OPEN_ANGLE;

    // Pointer parallax + drag, both relaxing back to the editorial pose.
    if (!drag.current) {
      a.yaw = damp(a.yaw, 0, 0.9, dt);
      a.pitch = damp(a.pitch, 0, 0.9, dt);
    }
    const parallax = s.loupe || mobile ? 0 : 1;
    if (body.current) {
      const tx = pose.r[0] + introRx - state.pointer.y * 0.08 * parallax + a.pitch;
      const ty = pose.r[1] + state.pointer.x * 0.14 * parallax + a.yaw + (s.loupe ? 0.3 : 0) - a.open * pose.r[1] * 0.6;
      const tz = pose.r[2];
      tmpQ.set(
        damp(body.current.rotation.x, tx, 3, dt),
        damp(body.current.rotation.y, ty, 3, dt),
        damp(body.current.rotation.z, tz, 3, dt),
      );
      body.current.rotation.copy(tmpQ);
      body.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.035 * (1 - a.open);
    }

    // Keep the open spread centred on screen.
    if (center.current) center.current.position.x = -(W / 2) * (1 - a.open);
    if (frontPivot.current) frontPivot.current.rotation.y = -angle;

    // Sleeve: swap spring + exploded slide-off.
    stepSpring(a.swap, a.swapTarget, dt);
    const swap = Math.max(0, a.swap.x);
    if (sleeveFrontPivot.current) sleeveFrontPivot.current.rotation.y = -angle * (1 - sleeveOff);
    // Once the core swings open, the sleeve retreats behind the spread so it never crowds the copy.
    const slideX = sleeveOff * (1.85 - explodeOpen * 1.15) + swap * 0.95;
    const slideY = sleeveOff * (-0.3 + explodeOpen * 0.12);
    const slideZ = sleeveOff * (-0.35 - explodeOpen * 0.75) + swap * 0.32;
    if (sleeveFront.current) sleeveFront.current.position.set(slideX, slideY, slideZ);
    if (sleeveRest.current) {
      sleeveRest.current.position.set(slideX, slideY, slideZ);
      sleeveRest.current.visible = sleeveOff < 0.98;
    }

    // Brass rod lifts 40% during anatomy; bounces when a cover locks.
    a.rodBounce = damp(a.rodBounce, 0, 7, dt);
    if (rod.current) rod.current.position.y = rodUp * H * 0.4 + swap * 0.25 + Math.sin(a.rodBounce * 12) * a.rodBounce * 0.025;

    // Pages: fan, turn and arch organically.
    const pageTop = (T - 2 * CT - 0.012) / 2;
    for (let i = 0; i < PAGE_COUNT; i++) {
      const flipped = i < s.flippedPages;
      const target = a.open < 0.05 ? 0 : flipped ? -(Math.PI * 0.86) + i * 0.02 : -(0.025 + (PAGE_COUNT - i) * 0.018) * a.open;
      const prev = a.pageAngles[i];
      const lambda = 4.2 - i * 0.6; // staggered weight so leaves separate as they turn
      const next = damp(prev, Math.max(target, -angle + 0.01), lambda, dt);
      a.pageAngles[i] = next;
      const g = pages.current[i];
      if (g) {
        g.rotation.y = next;
        g.position.z = pageTop + 0.0015 + i * 0.0012;
      }
      const mesh = pageMeshes.current[i];
      if (mesh) {
        const progress = Math.abs(next) / (Math.PI * 0.86);
        const bend = Math.sin(progress * Math.PI) * 0.22 + a.open * 0.015;
        const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
        for (let v = 0; v < pos.count; v++) {
          const x = pageBase[v * 3];
          const u = x / PW;
          pos.setZ(v, Math.sin(u * Math.PI * 0.9) * bend * (0.6 + 0.4 * u));
        }
        pos.needsUpdate = true;
      }
    }

    const pins = s.section === "anatomy" && a.explode > 0.82;
    if (pins !== showPins) setShowPins(pins);
  });

  const f = fabricById[displayed];
  const frontZ = T / 2 - CT / 2;

  return (
    <group ref={position} position={[1.55, -3.4, 0]}>
      <ContactShadows position={[0, -H / 2 - 0.32, 0]} opacity={0.32} scale={7} blur={2.8} far={3} color="#3b2f22" />
      <group ref={body} onPointerDown={onPointerDown} onPointerOver={onOver} onPointerOut={onOut}>
        <group ref={center}>
          {/* back board */}
          <RoundedBox args={[W, H, CT]} radius={0.008} smoothness={2} position={[W / 2, 0, -T / 2 + CT / 2]} material={buckram} castShadow />

          {/* 120gsm cotton rag text block */}
          <mesh position={[W / 2 + 0.005, 0, 0]} material={blockMats}>
            <boxGeometry args={[W - 0.07, H - 0.07, T - 2 * CT - 0.012]} />
          </mesh>

          {/* loose leaves */}
          {pageGeoms.map((g, i) => (
            <group key={i} ref={(el) => void (pages.current[i] = el)} position={[0.01, 0, 0]}>
              <mesh ref={(el) => void (pageMeshes.current[i] = el)} geometry={g} material={paperMats[i]} />
            </group>
          ))}

          {/* front board on its hinge: khadi lining with the woven provenance tag stitched inside */}
          <group ref={frontPivot} position={[0, 0, frontZ]}>
            <RoundedBox args={[W, H, CT]} radius={0.008} smoothness={2} position={[W / 2, 0, 0]} material={buckram} />
            <mesh position={[W / 2, 0, -CT / 2 - 0.001]} rotation={[0, Math.PI, 0]} material={liningMat}>
              <planeGeometry args={[W - 0.03, H - 0.03]} />
            </mesh>
            <mesh position={[W * 0.42, -H * 0.32, -CT / 2 - 0.0025]} rotation={[0, Math.PI, 0]} material={tagMat}>
              <planeGeometry args={[0.62, 0.31]} />
            </mesh>
          </group>

          {/* brass spine rod + finials */}
          <group ref={rod} position={[-0.045, 0, 0]}>
            <mesh material={brass}>
              <cylinderGeometry args={[0.03, 0.03, H + 0.12, 32]} />
            </mesh>
            {[1, -1].map((dir) => (
              <mesh key={dir} position={[0, dir * (H / 2 + 0.085), 0]} material={brass}>
                <sphereGeometry args={[0.048, 32, 16]} />
              </mesh>
            ))}
          </group>
          {showPins && (
            <Html position={[-0.045, H / 2 + 0.32, 0]} center zIndexRange={[20, 10]} portal={htmlPortal as React.RefObject<HTMLElement>}>
              <Hotspot n="01" title="Solid brass spine rod" body="Hand-rubbed antique brass. Lift it, slide a new cover on, drop it home — under 30 seconds." />
            </Html>
          )}

          {/* tailored heritage sleeve: front panel (hinged) */}
          <group ref={sleeveFrontPivot} position={[0, 0, frontZ]}>
            <group ref={sleeveFront}>
              <mesh position={[W / 2 + 0.008, 0, CT / 2 + ST / 2]} material={fabricMat} castShadow>
                <boxGeometry args={[W + 0.016, H + 0.03, ST]} />
              </mesh>
              <mesh position={[W * 0.8, -H * 0.4, CT / 2 + ST + 0.0015]} material={monoMat} visible={monogram.length > 0}>
                <planeGeometry args={[0.36, 0.18]} />
              </mesh>
              <mesh geometry={flapGeom} position={[W - FLAP / 2 + 0.008, 0, -CT / 2 - 0.004]} rotation={[0, Math.PI, 0]} material={fabricMat} />
              <object3D ref={anchor} position={[W * 0.55, 0.15, CT / 2 + ST]} />
              {showPins && (
                <Html position={[W * 0.7, H * 0.25, CT / 2 + ST]} center zIndexRange={[20, 10]} portal={htmlPortal as React.RefObject<HTMLElement>}>
                  <Hotspot n="02" title={`${f.shortName} sleeve`} body={`Tailored pocket sleeve with spill-shield wax finish. Woven with ${f.ngo}.`} />
                </Html>
              )}
            </group>
          </group>

          {/* sleeve: spine + back panels */}
          <group ref={sleeveRest}>
            <mesh position={[-0.012, 0, 0]} material={fabricMat}>
              <boxGeometry args={[ST, H + 0.03, T + 2 * ST]} />
            </mesh>
            <mesh position={[W / 2 + 0.008, 0, -T / 2 - ST / 2]} material={fabricMat}>
              <boxGeometry args={[W + 0.016, H + 0.03, ST]} />
            </mesh>
          </group>

          {showPins && (
            <Html position={[W * 0.62, -H * 0.18, T / 2]} center zIndexRange={[20, 10]} portal={htmlPortal as React.RefObject<HTMLElement>}>
              <Hotspot n="03" title="120GSM cotton rag" body="Smyth-sewn, lay-flat binding. Fountain-pen safe, deckled fore-edge, refillable." />
            </Html>
          )}
        </group>
      </group>
    </group>
  );
}
