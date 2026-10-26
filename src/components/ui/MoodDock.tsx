"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useKaya } from "@/store/useKaya";
import { fabricById, fabrics } from "@/data/fabrics";
import Swatch from "./Swatch";
import CurtainButton from "./CurtainButton";
import { formatINR, SILK } from "@/lib/utils";

/** Floating "Mood & Ritual Bar": swatch swap, book toggle and instant add-to-bag at every scroll depth. */
export default function MoodDock() {
  const [collapsed, setCollapsed] = useState(false);
  const activeId = useKaya((s) => s.activeFabric);
  const isOpen = useKaya((s) => s.isOpen);
  const introDone = useKaya((s) => s.introDone);
  const section = useKaya((s) => s.section);
  const f = fabricById[activeId];
  const { setFabric, toggleOpen } = useKaya.getState();

  const addToRitual = () => {
    const s = useKaya.getState();
    s.addItem({
      kind: "ritual",
      title: `The Solo Ritual — ${f.shortName}`,
      subtitle: `Brass-spined journal + ${f.name} cover`,
      fabricIds: [f.id],
      tier: 1,
      format: s.format,
      ruling: s.ruling,
      monogram: s.monogram || undefined,
      unitPrice: f.priceComplete,
    });
    s.setCartOpen(true);
  };

  const hidden = !introDone || section === "atelier";

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.9, ease: SILK }}
          className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 md:bottom-6"
        >
          <div className="flex max-w-full items-stretch rounded-[2px] border border-[#1C1917]/10 bg-[#FAF7F2]/85 backdrop-blur-xl">
            <AnimatePresence initial={false} mode="popLayout">
              {collapsed ? (
                <motion.button
                  key="mini"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setCollapsed(false)}
                  className="meta flex items-center gap-3 px-4 py-3"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: f.color }} />
                  {f.persona} · {formatINR(f.priceComplete)}
                  <ChevronUp size={14} strokeWidth={1.25} />
                </motion.button>
              ) : (
                <motion.div
                  key="full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <div className="flex items-center gap-1.5 border-r hairline px-3 py-2.5 md:gap-2 md:px-4">
                    <span className="meta mr-1 hidden text-muted xl:inline">Mood</span>
                    {fabrics.map((x) => (
                      <Swatch key={x.id} id={x.id} size="sm" active={x.id === activeId} onSelect={setFabric} />
                    ))}
                  </div>
                  <button
                    onClick={toggleOpen}
                    className="meta hidden h-full items-center gap-2 border-r hairline px-4 text-ink transition-colors hover:bg-linen md:flex"
                  >
                    <BookOpen size={14} strokeWidth={1.25} />
                    {isOpen ? "Close Book" : "Open Book"}
                  </button>
                  <div className="hidden flex-col justify-center border-r hairline px-4 sm:flex">
                    <span className="meta text-[9px] text-muted">{f.shortName}</span>
                    <span className="font-serif text-xl leading-none">{formatINR(f.priceComplete)}</span>
                  </div>
                  <div className="p-1.5">
                    <CurtainButton label="Add to Ritual" onClick={addToRitual} className="h-10 px-4 md:px-5" />
                  </div>
                  <button onClick={() => setCollapsed(true)} className="hidden px-2 text-muted hover:text-ink md:block" aria-label="Collapse dock">
                    <ChevronDown size={14} strokeWidth={1.25} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
