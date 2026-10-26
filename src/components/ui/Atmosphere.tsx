"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useKaya } from "@/store/useKaya";
import { fabricById } from "@/data/fabrics";
import { SILK } from "@/lib/utils";

/** Mood aura behind the canvas: --aura interpolates over 900ms when the cover changes. */
export function AmbientAura() {
  const color = useKaya((s) => fabricById[s.activeFabric].color);
  useEffect(() => {
    document.documentElement.style.setProperty("--aura", color);
  }, [color]);
  return <div aria-hidden className="aura pointer-events-none fixed inset-0 z-0" />;
}

/** Exposed hairline architectural grid + cotton-rag grain. */
export function PaperOverlay() {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[3] mx-auto hidden max-w-[1440px] grid-cols-12 px-8 md:grid">
        {Array.from({ length: 13 }, (_, i) => (
          <span
            key={i}
            className="absolute top-0 h-full w-px bg-ink/[0.035]"
            style={{ left: `calc(2rem + (100% - 4rem) * ${i / 12})`, display: i % 3 === 0 ? "block" : "none" }}
          />
        ))}
      </div>
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[95]" />
    </>
  );
}

/** Hairline scroll progress rail (replaces the browser scrollbar). */
export function ScrollRail() {
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (bar.current) bar.current.style.transform = `scaleY(${p})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed right-2 top-1/2 z-50 hidden h-40 w-px -translate-y-1/2 bg-ink/10 md:block">
      <span ref={bar} className="absolute inset-0 origin-top bg-brass" style={{ transform: "scaleY(0)" }} />
    </div>
  );
}

export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.1, ease: SILK, delay }}
    >
      {children}
    </motion.div>
  );
}
