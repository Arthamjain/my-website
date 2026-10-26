"use client";

import * as THREE from "three";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

/** Soft north-window studio: one big key, a warm bounce card, a cool fill. */
export function StudioLights({ shadowY = -1.12, shadowOpacity = 0.42 }: { shadowY?: number; shadowOpacity?: number }) {
  return (
    <>
      <ambientLight intensity={0.25} color="#FFF4E6" />
      <directionalLight
        position={[-3.2, 4.5, 4.5]}
        intensity={2.4}
        color="#FFF1E0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[4, 1.5, 2]} intensity={0.55} color="#DCE6F2" />
      <directionalLight position={[0, 2, -5]} intensity={0.9} color="#FFE2BC" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#FFF3E2" position={[-3, 3, 3]} rotation={[0, Math.PI / 4, 0]} scale={[5, 5, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#FFE6C4" position={[4, 0.5, 1]} rotation-y={-Math.PI / 2} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#E7EEF7" position={[0, 5, -1]} rotation-x={Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="ring" intensity={2} color="#FFE9CC" position={[1.5, 2.5, -3]} scale={1.4} />
      </Environment>
      <ContactShadows position={[0, shadowY, 0]} opacity={shadowOpacity} scale={9} blur={2.4} far={2.6} resolution={1024} color="#3A2C1E" />
    </>
  );
}

export const glSettings = {
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
  toneMapping: THREE.NeutralToneMapping,
  toneMappingExposure: 1.05,
} as const;
