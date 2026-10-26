"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import type Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const lenisHandle: { current: Lenis | null } = { current: null };

const silkOut = (t: number) => 1 - Math.pow(1 - t, 4);

/** Smoothly scrolls to an element id or an absolute Y position. */
export function scrollToTarget(target: string | number, offset = 0) {
  const lenis = lenisHandle.current;
  if (lenis) {
    lenis.scrollTo(typeof target === "string" ? `#${target}` : target, { offset, duration: 1.6, easing: silkOut });
    return;
  }
  if (typeof target === "string") document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  else window.scrollTo({ top: target, behavior: "smooth" });
}

export function setScrollLocked(locked: boolean) {
  const lenis = lenisHandle.current;
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

function TriggerSync() {
  useLenis(() => ScrollTrigger.update());
  return null;
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<LenisRef>(null);

  useEffect(() => {
    const tick = (time: number) => {
      const lenis = ref.current?.lenis ?? null;
      lenisHandle.current = lenis;
      lenis?.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <ReactLenis root ref={ref} options={{ lerp: 0.075, autoRaf: false }}>
      <TriggerSync />
      {children}
    </ReactLenis>
  );
}
