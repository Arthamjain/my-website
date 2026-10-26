"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "framer-motion";
import { fabricById } from "@/data/fabrics";
import { SILK, cn } from "@/lib/utils";
import { useKaya, type SectionId } from "@/store/useKaya";
import SmoothScroll, { setScrollLocked } from "@/components/ui/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";
import Navbar from "@/components/ui/Navbar";
import MoodDock from "@/components/ui/MoodDock";
import Preloader from "@/components/ui/Preloader";
import BagDrawer from "@/components/ui/BagDrawer";
import CheckoutModal from "@/components/ui/CheckoutModal";
import PassportModal from "@/components/ui/PassportModal";
import { AmbientAura, PaperOverlay, ScrollRail } from "@/components/ui/Atmosphere";
import Hero from "@/components/sections/Hero";
import Diagnosis from "@/components/sections/Diagnosis";
import Anatomy from "@/components/sections/Anatomy";
import Ledger from "@/components/sections/Ledger";
import Atelier from "@/components/sections/Atelier";
import Reviews from "@/components/sections/Reviews";

const Scene = dynamic(() => import("@/components/canvas/Scene"), { ssr: false });

const sectionIds: SectionId[] = ["hero", "diagnosis", "anatomy", "ledger", "atelier", "reviews"];

/** Syncs scroll position → active section (which drives the 3D pose) and global scroll locking. */
function Director() {
  const locked = useKaya((s) => s.cartOpen || s.checkoutOpen || s.passportOpen);

  useEffect(() => {
    const triggers = sectionIds.map((id) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => self.isActive && useKaya.getState().setSection(id),
      }),
    );
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && useKaya.getState().loupe) useKaya.getState().toggleLoupe();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      triggers.forEach((t) => t.kill());
      window.clearTimeout(refresh);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => setScrollLocked(locked), [locked]);
  return null;
}

/** Readout shown while the macro weave loupe is active; the editorial copy steps aside. */
function LoupeHud() {
  const loupe = useKaya((s) => s.loupe);
  const f = useKaya((s) => fabricById[s.activeFabric]);
  const toggleLoupe = useKaya((s) => s.toggleLoupe);
  return (
    <AnimatePresence>
      {loupe && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.8, ease: SILK }}
          className="glass fixed left-4 top-24 z-40 max-w-xs rounded-[2px] p-5 md:left-8"
        >
          <p className="meta text-brass">Macro Weave Loupe</p>
          <p className="mt-2 font-serif text-2xl leading-tight">{f.name}</p>
          <p className="meta mt-3 text-[9px] leading-relaxed text-muted">
            15cm focal distance {"//"} warm raking light {"//"} {f.loomLabel}
          </p>
          <p className="mt-3 text-[13px] leading-snug text-muted">
            Every slub, block-print wobble and float is the mark of a hand — swap moods below to compare weaves.
          </p>
          <button onClick={toggleLoupe} className="meta mt-4 border-b border-ink pb-0.5 text-ink">
            Exit loupe · Esc
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Main({ children }: { children: React.ReactNode }) {
  const loupe = useKaya((s) => s.loupe);
  return (
    <main className={cn("relative z-[2] transition-opacity duration-700", loupe && "pointer-events-none opacity-0")}>{children}</main>
  );
}

export default function Experience() {
  const root = useRef<HTMLDivElement>(null);
  return (
    <SmoothScroll>
      <div ref={root} className="relative">
        <AmbientAura />
        <Scene eventSource={root} />
        <PaperOverlay />
        <ScrollRail />
        <Navbar />
        <Main>
          <Hero />
          <Diagnosis />
          <Anatomy />
          <Ledger />
          <Atelier />
          <Reviews />
        </Main>
        <LoupeHud />
        <MoodDock />
        <BagDrawer />
        <CheckoutModal />
        <PassportModal />
        <CustomCursor />
        <Preloader />
        <Director />
      </div>
    </SmoothScroll>
  );
}
