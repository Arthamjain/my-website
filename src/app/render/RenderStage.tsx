"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { BrassRod, Notebook } from "@/components/three/NotebookModel";
import { FABRICS_3D } from "@/lib/fabrics3d";
import { StudioLights, glSettings } from "@/components/three/Studio";

const FABRICS = FABRICS_3D;

const WRITING = ["Tuesday, 6 a.m.", "Finish chapter four before", "anyone else is awake.", "Ask Amma for the dal recipe —", "the real one, with hing."];

function Scene({ scene, fabric }: { scene: string; fabric: string }) {
  const f = FABRICS[fabric] ?? FABRICS.dabu;
  switch (scene) {
    case "front":
      return <Notebook fabric={f} ribbon={f.ribbon} rotation={[0.02, -0.14, 0]} />;
    case "open":
      return <Notebook fabric={f} open={1} ribbon={f.ribbon} writing={WRITING} rotation={[-Math.PI / 2, 0, 0.0]} />;
    case "set-wardrobe":
      return (
        <group position={[0, -0.05, 0]} scale={0.8}>
          <Notebook fabric={FABRICS.tussar} rotation={[0.02, -0.25, 0.0]} position={[1.25, 0.05, -0.9]} ribbon={FABRICS.tussar.ribbon} />
          <Notebook fabric={FABRICS.mashru} rotation={[0.02, -0.4, 0.0]} position={[-1.05, 0.0, -0.6]} ribbon={FABRICS.mashru.ribbon} />
          <Notebook fabric={FABRICS.dabu} rotation={[0.04, -0.3, 0]} position={[0.1, -0.08, 0.4]} ribbon={FABRICS.dabu.ribbon} />
        </group>
      );
    case "set-archive":
      return (
        <group position={[0, -0.1, 0]} scale={0.66}>
          {["jamdani", "chanderi", "tussar", "mashru", "dabu"].map((id, i) => (
            <Notebook key={id} fabric={FABRICS[id]} ribbon={FABRICS[id].ribbon} rotation={[0.02, -0.38, 0]} position={[(i - 2) * 1.05, 0, (i - 2) * 0.55]} />
          ))}
        </group>
      );
    case "refill":
      return <Notebook fabric={f} blockOnly ribbon="#B8934A" rotation={[0.12, -0.85, 0]} />;
    case "rod":
      return <BrassRod rotation={[0.2, 0, -0.95]} scale={1.15} />;
    default:
      return <Notebook fabric={f} ribbon={f.ribbon} rotation={[0.06, -0.52, 0.02]} />;
  }
}

export default function RenderStage({ scene, fabric }: { scene: string; fabric: string }) {
  const camera =
    scene === "open"
      ? { position: [0, 4.6, 2.9] as [number, number, number], fov: 34 }
      : scene.startsWith("set")
        ? { position: [0.4, 1.0, 7.4] as [number, number, number], fov: 30 }
        : { position: [0.2, 0.55, 6.1] as [number, number, number], fov: 30 };
  return (
    <div style={{ position: "fixed", inset: 0, background: "transparent" }}>
      <style>{"html,body{background:transparent!important}"}</style>
      <Canvas shadows dpr={1} camera={camera} gl={glSettings} onCreated={({ camera: c }) => c.lookAt(0, 0, scene === "open" ? 0.15 : 0)}>
        <Suspense fallback={null}>
          <StudioLights shadowY={scene === "open" ? -0.115 : scene.startsWith("set") ? -0.95 : -1.13} />
          <Scene scene={scene} fabric={fabric} />
        </Suspense>
      </Canvas>
    </div>
  );
}
