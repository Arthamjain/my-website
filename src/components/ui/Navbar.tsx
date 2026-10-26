"use client";

import { ScanSearch, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useKaya, cartCount } from "@/store/useKaya";
import { fabricById } from "@/data/fabrics";
import { scrollToTarget } from "./SmoothScroll";
import { cn, SILK } from "@/lib/utils";

function Waveform({ on }: { on: boolean }) {
  return (
    <span className="flex h-3 items-center gap-[2px]" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="block h-full w-px origin-center bg-ink"
          style={{
            animation: on ? `wave ${0.9 + i * 0.13}s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s infinite` : "none",
            transform: on ? undefined : "scaleY(0.25)",
          }}
        />
      ))}
    </span>
  );
}

const links = [
  { id: "diagnosis", label: "Diagnosis" },
  { id: "anatomy", label: "Anatomy" },
  { id: "ledger", label: "Provenance" },
  { id: "atelier", label: "Atelier" },
];

export default function Navbar() {
  const fabric = useKaya((s) => fabricById[s.activeFabric]);
  const soundOn = useKaya((s) => s.soundOn);
  const loupe = useKaya((s) => s.loupe);
  const count = useKaya((s) => cartCount(s.cart));
  const introDone = useKaya((s) => s.introDone);
  const { toggleSound, toggleLoupe, setCartOpen } = useKaya.getState();

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={introDone ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 1.1, ease: SILK, delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50 border-b hairline bg-paper/75 backdrop-blur-xl"
    >
      <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[auto_1fr_auto] items-center px-4 md:px-8">
        <button onClick={() => scrollToTarget(0)} className="flex items-baseline gap-2 text-left" aria-label="KĀYA home">
          <span className="font-serif text-2xl font-medium tracking-[0.08em]">KĀYA</span>
          <span className="meta hidden text-muted sm:inline">{"//"} काया</span>
        </button>

        <div className="hidden items-center justify-center gap-8 lg:flex">
          <span className="meta flex items-center gap-2 text-muted">
            <span className="h-2 w-2 rounded-full transition-colors duration-[900ms]" style={{ background: fabric.color }} />
            Mood — <span className="text-ink">{fabric.persona}</span>
          </span>
          <span className="h-4 w-px bg-ink/10" />
          {links.map((l) => (
            <button key={l.id} onClick={() => scrollToTarget(l.id)} className="meta text-muted transition-colors hover:text-ink">
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-1 md:gap-2">
          <button
            onClick={toggleSound}
            className="meta flex h-9 items-center gap-2 px-2 text-muted hover:text-ink md:px-3"
            aria-pressed={soundOn}
            aria-label="Toggle tactile sound"
          >
            <Waveform on={soundOn} />
            <span className="hidden md:inline">Sound: {soundOn ? "On" : "Off"}</span>
          </button>
          <button
            onClick={toggleLoupe}
            className={cn(
              "meta flex h-9 items-center gap-2 border px-2 transition-colors md:px-3",
              loupe ? "border-ink bg-ink text-paper" : "border-transparent text-muted hover:text-ink",
            )}
            aria-pressed={loupe}
          >
            <ScanSearch size={14} strokeWidth={1.25} />
            <span className="hidden md:inline">Macro Loupe</span>
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="meta flex h-9 items-center gap-2 border border-ink/15 px-3 text-ink transition-colors hover:border-ink"
          >
            <ShoppingBag size={14} strokeWidth={1.25} />
            <span className="hidden sm:inline">Ritual Bag</span>[{count}]
          </button>
        </div>
      </div>
    </motion.header>
  );
}
