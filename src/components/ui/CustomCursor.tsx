"use client";

import { useEffect, useRef, useState } from "react";
import { useKaya } from "@/store/useKaya";
import { getFabricCanvases } from "@/lib/proceduralFabricTextures";
import type { FabricId } from "@/data/fabrics";
import { cn } from "@/lib/utils";

type Mode = "default" | "link" | "cta" | "notebook" | "swatch";

/**
 * Dual-layer tactile cursor: a crisp 6px kajal dot + a lagging 36px hairline ring.
 * Morphs into a frosted label over the notebook and a weave loupe over swatches.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("default");
  const [label, setLabel] = useState("");
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const loupe = useRef<HTMLCanvasElement>(null);
  const state = useRef({ x: -100, y: -100, rx: -100, ry: -100, fabric: null as FabricId | null, rel: { u: 0.5, v: 0.5 }, visible: false });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const apply = () => {
      setEnabled(fine.matches);
      document.documentElement.classList.toggle("has-cursor", fine.matches);
    };
    apply();
    fine.addEventListener("change", apply);
    return () => {
      fine.removeEventListener("change", apply);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const s = state.current;
    let currentMode: Mode = "default";
    let currentLabel = "";
    let raf = 0;

    const resolve = (target: EventTarget | null) => {
      const el = (target as HTMLElement | null)?.closest?.<HTMLElement>("[data-cursor],a,button,input,textarea,select,label");
      let next: Mode = "default";
      let nextLabel = "";
      s.fabric = null;
      if (el) {
        const kind = el.dataset.cursor;
        if (kind === "swatch" && el.dataset.fabric) {
          next = "swatch";
          s.fabric = el.dataset.fabric as FabricId;
          const r = el.getBoundingClientRect();
          s.rel = { u: (s.x - r.left) / r.width, v: (s.y - r.top) / r.height };
        } else if (kind === "cta") next = "cta";
        else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") next = "default";
        else next = "link";
      } else {
        const k = useKaya.getState();
        if (k.hover3D) {
          next = "notebook";
          nextLabel = k.loupe ? "FEEL WEAVE" : k.section === "anatomy" ? "DRAG / FLIP" : "DRAG / OPEN";
        }
      }
      if (next !== currentMode) {
        currentMode = next;
        setMode(next);
      }
      if (nextLabel !== currentLabel) {
        currentLabel = nextLabel;
        setLabel(nextLabel);
      }
    };

    let lastTarget: EventTarget | null = null;
    const onMove = (e: PointerEvent) => {
      s.x = e.clientX;
      s.y = e.clientY;
      if (!s.visible) {
        s.visible = true;
        s.rx = s.x;
        s.ry = s.y;
      }
      lastTarget = e.target;
      resolve(e.target);
    };
    const onLeave = () => {
      s.visible = false;
    };
    const unsub = useKaya.subscribe((k, prev) => {
      if (k.hover3D !== prev.hover3D || k.loupe !== prev.loupe) resolve(lastTarget);
    });

    const loop = () => {
      s.rx += (s.x - s.rx) * 0.16;
      s.ry += (s.y - s.ry) * 0.16;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
        dot.current.style.opacity = s.visible ? "1" : "0";
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${s.rx}px, ${s.ry}px, 0)`;
        ring.current.style.opacity = s.visible ? "1" : "0";
      }
      if (s.fabric && loupe.current) {
        const src = getFabricCanvases(s.fabric).diffuse;
        const c = loupe.current.getContext("2d");
        if (c) {
          const size = 150;
          const sx = Math.max(0, Math.min(src.width - size, s.rel.u * src.width - size / 2));
          const sy = Math.max(0, Math.min(src.height - size, s.rel.v * src.height - size / 2));
          c.filter = "contrast(1.35) saturate(1.1)";
          c.drawImage(src, sx, sy, size, size, 0, 0, loupe.current.width, loupe.current.height);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      unsub();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  const ringSize = { default: 36, link: 54, cta: 18, notebook: 84, swatch: 120 }[mode];

  return (
    <>
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[100]" style={{ opacity: 0 }}>
        <div
          className={cn(
            "grid -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full border transition-[width,height,background-color,border-color,backdrop-filter] duration-[600ms] ease-silk",
            mode === "notebook" ? "border-ink/15 bg-paper/40 backdrop-blur-md" : "border-ink/35",
            mode === "swatch" && "border-brass bg-linen",
            mode === "cta" && "border-transparent",
          )}
          style={{ width: ringSize, height: ringSize }}
        >
          {mode === "notebook" && <span className="meta text-[9px] text-ink">{label}</span>}
          <canvas
            ref={loupe}
            width={240}
            height={240}
            className={cn("absolute inset-0 h-full w-full transition-opacity duration-300", mode === "swatch" ? "opacity-100" : "opacity-0")}
          />
          {mode === "swatch" && <span className="absolute bottom-3 meta text-[8px] text-paper mix-blend-difference">WEAVE ×4</span>}
        </div>
      </div>
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[101]" style={{ opacity: 0 }}>
        <div
          className={cn(
            "-translate-x-1/2 -translate-y-1/2 rounded-full bg-ink transition-[width,height] duration-300 ease-silk",
            mode === "swatch" || mode === "notebook" ? "h-0 w-0" : "h-1.5 w-1.5",
          )}
        />
      </div>
    </>
  );
}
