"use client";
/* eslint-disable react-hooks/immutability -- three.js materials, vectors and textures are imperative GPU objects mutated per frame, not React state. */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import Notebook3D from "./Notebook3D";
import { useKaya } from "@/store/useKaya";
import { htmlPortal, rig } from "@/lib/rig";
import { fabrics } from "@/data/fabrics";
import { getFabricTextures } from "@/lib/proceduralFabricTextures";

function CameraRig() {
  const look = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const aimAt = useMemo(() => new THREE.Vector3(), []);
  const normal = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const rake = useRef<THREE.DirectionalLight>(null);
  const rakeTarget = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const s = useKaya.getState();
    const cam = state.camera as THREE.PerspectiveCamera;
    const mobile = state.size.width < 768;
    const damp = THREE.MathUtils.damp;

    let fov = mobile ? 40 : 32;
    target.set(0, 0, mobile ? 8.8 : 7.2);
    aimAt.set(0, 0, 0);
    if (s.section === "anatomy") target.z = mobile ? 8.2 : 6.5;

    const anchor = rig.coverAnchor;
    if (s.loupe && anchor) {
      anchor.getWorldPosition(aimAt);
      normal.set(0, 0, 1).transformDirection(anchor.matrixWorld);
      tangent.set(1, 0, 0).transformDirection(anchor.matrixWorld);
      // ~15cm-feel macro dolly: hug the cover, slightly off-axis so the weave rakes.
      target.copy(aimAt).addScaledVector(normal, 0.62).addScaledVector(tangent, -0.08);
      target.y += 0.06;
      fov = 22;
    }

    const lambda = s.loupe ? 2.2 : 2.6;
    cam.position.set(
      damp(cam.position.x, target.x, lambda, dt),
      damp(cam.position.y, target.y, lambda, dt),
      damp(cam.position.z, target.z, lambda, dt),
    );
    look.set(damp(look.x, aimAt.x, lambda, dt), damp(look.y, aimAt.y, lambda, dt), damp(look.z, aimAt.z, lambda, dt));
    cam.lookAt(look);
    const nextFov = damp(cam.fov, fov, 3, dt);
    if (Math.abs(nextFov - cam.fov) > 0.001) {
      cam.fov = nextFov;
      cam.updateProjectionMatrix();
    }

    // Warm raking light grazes across the bump relief in loupe mode.
    if (rake.current) {
      if (anchor) {
        anchor.getWorldPosition(rakeTarget.position);
        rake.current.position.copy(rakeTarget.position).addScaledVector(tangent.set(1, 0, 0).transformDirection(anchor.matrixWorld), 2.2);
        rake.current.position.addScaledVector(normal.set(0, 0, 1).transformDirection(anchor.matrixWorld), 0.35);
        rakeTarget.updateMatrixWorld();
      }
      rake.current.intensity = damp(rake.current.intensity, s.loupe ? 4.2 : 0, 3, dt);
    }
  });

  return (
    <>
      <primitive object={rakeTarget} />
      <directionalLight ref={rake} color="#FFD49A" intensity={0} target={rakeTarget} />
    </>
  );
}

function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.35} color="#FFF4E6" />
      <directionalLight position={[3.5, 4.5, 5]} intensity={2.1} color="#FFE6C7" />
      <directionalLight position={[-4.5, 2.5, -3.5]} intensity={1.7} color="#FFD9A8" />
      <directionalLight position={[-3, -1.5, 4]} intensity={0.35} color="#DCE4F0" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#FFF1DE" position={[0, 4, 3]} rotation-x={Math.PI / 2.4} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#FFE3BF" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={1} color="#F3EDE2" position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="ring" intensity={1.6} color="#FFE8C8" position={[2, 2, -4]} scale={2} />
      </Environment>
    </>
  );
}

export default function Scene({ eventSource }: { eventSource: React.RefObject<HTMLElement | null> }) {
  const introDone = useKaya((s) => s.introDone);
  const portal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    htmlPortal.current = portal.current;
  }, []);

  // Pre-weave the remaining fabrics during idle time so swaps never hitch.
  useEffect(() => {
    if (!introDone) return;
    const queue = fabrics.map((f) => f.id);
    let handle = 0;
    const next = () => {
      const id = queue.shift();
      if (!id) return;
      getFabricTextures(id);
      handle = window.setTimeout(next, 180);
    };
    handle = window.setTimeout(next, 600);
    return () => window.clearTimeout(handle);
  }, [introDone]);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[1]">
        <Canvas
          eventSource={eventSource as React.RefObject<HTMLElement>}
          eventPrefix="client"
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 7.2], fov: 32, near: 0.05, far: 60 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ pointerEvents: "none" }}
        >
          <StudioLights />
          <CameraRig />
          <Notebook3D />
        </Canvas>
      </div>
      <div ref={portal} className="pointer-events-none fixed inset-0 z-[30] [&>div]:pointer-events-auto" />
    </>
  );
}
