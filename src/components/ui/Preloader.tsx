"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fabrics } from "@/data/fabrics";
import { useKaya } from "@/store/useKaya";
import { SILK } from "@/lib/utils";

const DURATION = 1100;

/** Weaving-thread preloader: 0→100 thread, a chromatic breath, then the curtain parts. */
export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const start = useRef(0);

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      if (!start.current) start.current = t;
      const p = Math.min(1, (t - start.current) / DURATION);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setDone(true);
        useKaya.getState().setIntroDone();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const hue = fabrics[Math.min(fabrics.length - 1, Math.floor(progress * fabrics.length))];

  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="fixed inset-0 z-[90] flex" exit={{ pointerEvents: "none" }} transition={{ duration: 1 }}>
          {[0, 1].map((side) => (
            <motion.div
              key={side}
              className="h-full w-1/2 bg-paper"
              exit={{ x: side === 0 ? "-100%" : "100%" }}
              transition={{ duration: 0.95, ease: SILK }}
            />
          ))}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-8"
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: SILK }}
          >
            <div className="relative grid h-20 w-20 place-items-center">
              <span
                className="absolute inset-0 rounded-full blur-xl transition-[background-color] duration-300"
                style={{ background: hue.color, opacity: 0.22 + Math.sin(progress * Math.PI) * 0.2 }}
              />
              <span className="font-serif text-4xl font-medium tracking-[0.08em]">KĀYA</span>
            </div>
            <div className="flex w-56 flex-col gap-3">
              <svg viewBox="0 0 224 8" className="h-2 w-full overflow-visible" aria-hidden>
                <line x1="0" y1="4" x2="224" y2="4" stroke="rgba(28,25,23,0.08)" strokeWidth="1" />
                <path
                  d={`M0 4 ${Array.from({ length: 28 }, (_, i) => `Q ${i * 8 + 4} ${i % 2 ? 1 : 7} ${i * 8 + 8} 4`).join(" ")}`}
                  fill="none"
                  stroke="#B8934A"
                  strokeWidth="1"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1 - progress}
                />
              </svg>
              <div className="meta flex justify-between text-muted">
                <span>Weaving the warp</span>
                <span className="tabular-nums text-ink">{String(Math.round(progress * 100)).padStart(3, "0")}%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
