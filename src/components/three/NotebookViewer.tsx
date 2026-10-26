"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Notebook, type Fabric } from "./NotebookModel";
import { StudioLights, glSettings } from "./Studio";

/** Interactive turntable for a product page: drag to turn, button to open. */
export default function NotebookViewer({ fabric, ribbon }: { fabric: Fabric; ribbon?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative h-full w-full">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0.6, 0.5, 5.6], fov: 32 }} gl={glSettings}>
        <Suspense fallback={null}>
          <StudioLights shadowY={-1.2} />
          <Notebook
            fabric={fabric}
            open={open ? 1 : 0}
            animate
            ribbon={ribbon}
            writing={["Monday", "— start with the hard thing", "— call the weavers re: batch 05", "— walk, no phone"]}
            rotation={[open ? -0.9 : 0.05, open ? 0 : -0.35, 0]}
            position={[0, open ? -0.25 : 0, 0]}
          />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={3.6}
          maxDistance={8}
          minPolarAngle={0.35}
          maxPolarAngle={Math.PI / 1.9}
          autoRotate={!open}
          autoRotateSpeed={0.6}
        />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">
        <button
          onClick={() => setOpen((o) => !o)}
          className="pointer-events-auto rounded-full bg-ink px-5 py-2.5 text-[13px] text-paper transition hover:bg-ink/85"
        >
          {open ? "Close the journal" : "Open the journal"}
        </button>
        <span className="pointer-events-none hidden rounded-full bg-paper/80 px-3 py-2 text-[12px] text-muted backdrop-blur sm:block">
          Drag to turn · scroll to zoom
        </span>
      </div>
    </div>
  );
}
