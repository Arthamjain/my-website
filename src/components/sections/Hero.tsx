"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useKaya } from "@/store/useKaya";
import { fabricById } from "@/data/fabrics";
import CurtainButton from "@/components/ui/CurtainButton";
import { scrollToTarget } from "@/components/ui/SmoothScroll";
import { SILK } from "@/lib/utils";

const line = {
  hidden: { y: "105%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 1.2, ease: SILK, delay: 0.35 + i * 0.09 } }),
};

export default function Hero() {
  const introDone = useKaya((s) => s.introDone);
  const isOpen = useKaya((s) => s.isOpen);
  const f = useKaya((s) => fabricById[s.activeFabric]);
  const toggleOpen = useKaya((s) => s.toggleOpen);
  const state = introDone ? "show" : "hidden";

  const headline = [
    <>Your mind changes</>,
    <>
      every day. <em className="italic text-muted">Why</em>
    </>,
    <>
      shouldn&apos;t the <em className="italic">cover</em>
    </>,
    <>that holds it?</>,
  ];

  return (
    <section id="hero" data-section="hero" className="relative min-h-[100svh] border-b hairline">
      <div className="mx-auto grid min-h-[100svh] max-w-[1440px] grid-cols-12 px-4 pb-28 pt-[52svh] md:px-8 md:pb-32 md:pt-32">
        <div className="col-span-12 flex flex-col justify-center md:col-span-6 lg:col-span-5">
          <motion.p
            className="meta text-muted"
            initial={{ opacity: 0 }}
            animate={introDone ? { opacity: 1 } : {}}
            transition={{ duration: 1, ease: SILK, delay: 0.3 }}
          >
            01 // Chromatic Psychology &amp; Heritage Textiles
          </motion.p>
          <h1 className="display mt-6">
            {headline.map((content, i) => (
              <span key={i} className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" custom={i} variants={line} initial="hidden" animate={state}>
                  {content}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={introDone ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.1, ease: SILK, delay: 0.8 }}
          >
            <p className="mt-7 max-w-md text-[15px] leading-relaxed text-muted md:text-base">
              Handloomed Indian heritage fabric covers engineered to slide onto one timeless refillable brass-spined journal.
              Match your notebook to your nervous system.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <CurtainButton label="Configure Your Ritual" onClick={() => scrollToTarget("atelier")} />
              <CurtainButton label={isOpen ? "Close Book in 3D" : "Open Book in 3D"} variant="ghost" onClick={toggleOpen} />
            </div>
            <p className="meta mt-9 border-l border-brass pl-3 text-[10px] text-muted">
              Batch #{f.batch.number} — {f.cluster} {"//"} <span className="text-ink">{f.batch.remaining} of {f.batch.total} yards</span> remaining
              this monsoon cycle
            </p>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 mx-auto hidden max-w-[1440px] grid-cols-12 border-t hairline px-8 md:grid">
        {[
          ["05", "Heritage weaves, five states of mind"],
          ["01", "Solid brass spine, for a lifetime"],
          ["72%", "Of cover margin to artisan clusters"],
        ].map(([n, t], i) => (
          <div key={n} className={`col-span-3 flex items-baseline gap-3 py-5 ${i ? "border-l hairline pl-6" : ""}`}>
            <span className="font-serif text-2xl">{n}</span>
            <span className="meta text-[10px] text-muted">{t}</span>
          </div>
        ))}
        <button onClick={() => scrollToTarget("diagnosis")} className="meta col-span-3 flex items-center justify-end gap-2 py-5 text-muted hover:text-ink">
          Scroll to diagnose <ArrowDown size={13} strokeWidth={1.25} />
        </button>
      </div>
    </section>
  );
}
