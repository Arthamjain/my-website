"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useKaya } from "@/store/useKaya";
import { fabricById, fabrics, type FabricId } from "@/data/fabrics";
import { Reveal } from "@/components/ui/Atmosphere";
import { SILK, cn } from "@/lib/utils";

const order: FabricId[] = ["dabu", "mashru", "tussar", "chanderi", "jamdani"];

const dimensions = [
  {
    id: "cognitive",
    label: "Cognitive state",
    options: ["Overstimulated", "Seeking Spark", "Craving Stillness", "Stepping Into Command", "Lyrical & Open"],
  },
  {
    id: "tactile",
    label: "Tactile craving",
    options: ["Earthy Block-Print Cotton", "Lustrous Silk-Cotton", "Raw Unbleached Slub", "Metallic Zari Brocade", "Featherlight Muslin"],
  },
  {
    id: "signal",
    label: "Signal to the room",
    options: ["Composed", "Magnetic", "Unbothered", "Authoritative", "Tender"],
  },
];

export default function Diagnosis() {
  const activeId = useKaya((s) => s.activeFabric);
  const setFabric = useKaya((s) => s.setFabric);
  const [picks, setPicks] = useState<Record<string, number | undefined>>({});
  const f = fabricById[activeId];

  const choose = (dim: string, i: number) => {
    setPicks((p) => ({ ...p, [dim]: i }));
    setFabric(order[i]);
  };

  return (
    <section id="diagnosis" data-section="diagnosis" className="relative border-b hairline">
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 px-4 pb-32 pt-[42svh] md:px-8 md:py-36">
        <div className="col-span-12 md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7">
          <div className="max-md:glass max-md:p-5">
            <Reveal>
              <p className="meta text-muted">02 // The Chromatic Diagnosis</p>
              <h2 className="display mt-5">
                How are you entering the world <em className="italic">today?</em>
              </h2>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
                Tune three dials. The cover, the light and the room around you shift in real time — a small act of behavioural priming
                before the first word is written.
              </p>
            </Reveal>

            <div className="mt-10 space-y-7">
              {dimensions.map((d, di) => (
                <Reveal key={d.id} delay={di * 0.08}>
                  <p className="meta mb-3 text-[10px] text-muted">
                    0{di + 1} — {d.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {d.options.map((opt, i) => {
                      const selected = picks[d.id] === i;
                      return (
                        <button
                          key={opt}
                          onClick={() => choose(d.id, i)}
                          aria-pressed={selected}
                          className={cn(
                            "group relative flex items-center gap-2 overflow-hidden rounded-[2px] border px-3.5 py-2 text-[13px] transition-colors duration-500",
                            selected ? "border-ink bg-ink text-paper" : "border-ink/15 bg-paper/60 hover:border-ink/50",
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: fabrics[i].color }} />
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="relative mt-12">
              <AnimatePresence mode="wait">
                <motion.article
                  key={f.id}
                  initial={{ opacity: 0, y: 16, clipPath: "inset(0 0 100% 0)" }}
                  animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.9, ease: SILK }}
                  className="glass relative rounded-[2px] p-6 md:p-8"
                >
                  <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: f.color }} />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="meta text-brass">Neuro-Aesthetic Briefing · {f.index}</p>
                    <p className="meta text-[10px] text-muted">{f.region}</p>
                  </div>
                  <h3 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
                    {f.persona.replace(/ \w+$/, "")} <em className="italic">{f.persona.split(" ").at(-1)}</em>
                  </h3>
                  <p className="mt-1 text-[13px] text-muted">{f.name}</p>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="meta text-[9px] text-muted">Colour psychology</p>
                      <p className="mt-2 text-[14px] leading-relaxed">{f.psychology}</p>
                    </div>
                    <div>
                      <p className="meta text-[9px] text-muted">Social signal</p>
                      <p className="mt-2 text-[14px] leading-relaxed">{f.signal}</p>
                      <p className="meta mt-4 text-[9px] text-muted">State</p>
                      <p className="mt-1 text-[13px]">{f.emotion}</p>
                    </div>
                  </div>
                  <p className="mt-6 border-t hairline pt-4 font-serif text-xl italic">“{f.hook}”</p>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
